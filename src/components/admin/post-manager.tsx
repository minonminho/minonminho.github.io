"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CircleHelp,
  FilePlus2,
  FileText,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBriefLanguage } from "@/components/daily-brief/language";
import {
  buildFileChanges,
  canDeletePost,
  kindLabels,
  makeStarterDaily,
  makeStarterHighlight,
  postFromFile,
  prepareDeletion,
  validatePost,
  type AdminPost,
  type PostKind,
} from "@/lib/admin/content";
import {
  createContentPullRequest,
  loadRepositoryFiles,
  type GitFile,
} from "@/lib/admin/github";

type Copy = (en: string, ko: string) => string;

const filters: ({ id: "all" } | { id: PostKind })[] = [
  { id: "all" }, { id: "daily" }, { id: "highlight" }, { id: "paper" }, { id: "knowledge" },
];

function koreaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function localizeKind(kind: PostKind, copy: Copy) {
  return copy(kindLabels[kind].en, kindLabels[kind].ko);
}

function kindColor(kind: PostKind) {
  if (kind === "daily") return "border-signal-ice text-signal-ice";
  if (kind === "highlight") return "border-signal-orbit text-signal-orbit";
  if (kind === "paper") return "border-signal-mint text-signal-mint";
  return "border-signal-dust text-signal-dust";
}

function prettyDate(value: string, language: "ko" | "en") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
  return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
    timeZone: "Asia/Seoul", year: "numeric", month: "short", day: "numeric",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function postCountLabel(count: number, copy: Copy) {
  return copy(`${count} posts`, `게시물 ${count}개`);
}

export function PostManager() {
  const { language, copy } = useBriefLanguage();
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState<GitFile[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [activePath, setActivePath] = useState("");
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [search, setSearch] = useState("");
  const [newDate, setNewDate] = useState(koreaToday());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pullRequest, setPullRequest] = useState<{ html_url: string; number: number } | null>(null);
  const [pendingByPath, setPendingByPath] = useState<Record<string, { html_url: string; number: number }>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activePost = posts.find((post) => post.path === activePath) ?? null;
  const dirty = Boolean(activePost && draft !== activePost.content);
  const validationError = useMemo(() => {
    if (!activePost || !draft) return "";
    try {
      validatePost(activePost, draft, posts);
      buildFileChanges(activePost, draft, files);
      return "";
    } catch (reason) {
      return reason instanceof Error ? reason.message : copy("Could not validate this post.", "게시물 내용을 검증하지 못했습니다.");
    }
  }, [activePost, copy, draft, files, posts]);
  const deletion = activePost ? canDeletePost(activePost, files) : { allowed: false, reason: "" };

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === "all" || post.kind === filter;
      const matchesSearch = !query || `${post.title} ${post.subtitle} ${post.path} ${post.date}`.toLocaleLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, posts, search]);

  const countByKind = useMemo(() => ({
    daily: posts.filter((post) => post.kind === "daily").length,
    highlight: posts.filter((post) => post.kind === "highlight").length,
    paper: posts.filter((post) => post.kind === "paper").length,
    knowledge: posts.filter((post) => post.kind === "knowledge").length,
  }), [posts]);

  async function connect() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const loaded = await loadRepositoryFiles(token.trim());
      const managed = loaded.files.flatMap((file) => {
        const post = postFromFile(file);
        return post ? [post] : [];
      }).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
      setFiles(loaded.files);
      setPosts(managed);
      setConnected(true);
      setActivePath("");
      setDraft("");
      setNotice(copy("Repository connected. Select a post to edit.", "저장소에 연결했습니다. 게시물을 골라 편집하세요."));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy("Could not connect to GitHub.", "GitHub에 연결하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const loaded = await loadRepositoryFiles(token.trim());
      const managed = loaded.files.flatMap((file) => {
        const post = postFromFile(file);
        return post ? [post] : [];
      }).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
      setFiles(loaded.files);
      setPosts(managed);
      setActivePath("");
      setDraft("");
      setPullRequest(null);
      setPendingByPath({});
      setNotice(copy("The latest content from main is loaded.", "main의 최신 게시물을 불러왔습니다."));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy("Could not reload the repository.", "저장소를 다시 불러오지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  function selectPost(post: AdminPost) {
    if (dirty && !window.confirm(copy("Discard the unsaved editor changes?", "저장하지 않은 편집 내용을 버릴까요?"))) return;
    setActivePath(post.path);
    setDraft(post.content);
    setPullRequest(pendingByPath[post.path] ?? null);
    setConfirmDelete(false);
    setError("");
    setNotice("");
  }

  function createPost(kind: "daily" | "highlight") {
    setError("");
    setNotice("");
    setPullRequest(null);
    const path = kind === "daily"
      ? `content/daily-brief/${newDate}.json`
      : `content/daily-brief/highlights/${newDate}.json`;
    const existing = posts.find((post) => post.path === path);
    if (existing) {
      selectPost(existing);
      setNotice(copy("That date already has a post. You can edit it here.", "해당 날짜의 게시물이 이미 있어 편집 화면을 열었습니다."));
      return;
    }
    const starter = kind === "daily" ? makeStarterDaily(newDate) : makeStarterHighlight(newDate);
    const post: AdminPost = {
      path,
      sha: null,
      kind,
      date: newDate,
      title: kind === "daily" ? copy("New Daily Brief", "새 Daily Brief") : copy("New Highlight", "새 Highlight"),
      subtitle: copy("Complete the template before submitting it for review.", "검토 요청 전에 템플릿을 채워 주세요."),
      status: "draft",
      href: kind === "daily" ? `/daily-brief/${newDate}/` : `/daily-brief/highlight/${newDate}/`,
      content: `${JSON.stringify(starter, null, 2)}\n`,
      isNew: true,
    };
    setPosts((current) => [post, ...current]);
    setActivePath(post.path);
    setDraft(post.content);
    setConfirmDelete(false);
  }

  async function submitPost() {
    if (!activePost) return;
    setError("");
    setNotice("");
    setPullRequest(null);
    setBusy(true);
    try {
      validatePost(activePost, draft, posts);
      const changes = buildFileChanges(activePost, draft, files);
      const verb = activePost.isNew ? "add" : "update";
      const result = await createContentPullRequest(
        token.trim(),
        changes,
        `content: ${verb} ${activePost.title.slice(0, 60)}`,
      );
      setPullRequest(result);
      setPendingByPath((current) => ({ ...current, [activePost.path]: result }));
      setPosts((current) => current.map((post) => post.path === activePost.path
        ? { ...post, content: draft, title: postFromFile({ path: post.path, sha: post.sha ?? "", content: draft })?.title ?? post.title }
        : post));
      setNotice(copy(`PR #${result.number} is ready for review. Merge it to publish the post.`, `PR #${result.number}을 검토할 수 있습니다. 게시하려면 PR을 병합하세요.`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy("Could not create a pull request.", "Pull Request를 만들지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  async function submitDelete() {
    if (!activePost || !deletion.allowed) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const changes = prepareDeletion(activePost, files);
      const result = await createContentPullRequest(token.trim(), changes, `content: delete ${activePost.title.slice(0, 60)}`);
      setPullRequest(result);
      setPendingByPath((current) => ({ ...current, [activePost.path]: result }));
      setConfirmDelete(false);
      setNotice(copy(`PR #${result.number} contains the removal. The post stays live until you merge it.`, `삭제 변경을 담은 PR #${result.number}을 만들었습니다. 병합 전까지 게시물은 계속 공개됩니다.`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy("Could not create the deletion pull request.", "삭제 Pull Request를 만들지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    if (dirty && !window.confirm(copy("Discard the unsaved editor changes and disconnect?", "저장하지 않은 편집 내용을 버리고 연결을 해제할까요?"))) return;
    setToken("");
    setConnected(false);
    setFiles([]);
    setPosts([]);
    setActivePath("");
    setDraft("");
    setPullRequest(null);
    setPendingByPath({});
    setError("");
    setNotice("");
  }

  const counts = [
    { id: "daily" as const, count: countByKind.daily },
    { id: "highlight" as const, count: countByKind.highlight },
    { id: "paper" as const, count: countByKind.paper },
    { id: "knowledge" as const, count: countByKind.knowledge },
  ];

  return <main className="site-shell flex-1 pb-20 pt-8 md:pb-28 md:pt-12">
    <header className="border-b-2 border-border-strong pb-8 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-eyebrow text-signal-mint">DAILY BRIEF / CONTENT DESK</p>
          <h1 className="text-display-xl mt-4">{copy("Post management", "게시물 관리")}<span className="text-signal-ice">.</span></h1>
          <p className="mt-4 max-w-2xl text-subhead">{copy("Edit editions, paper reviews, Highlights, and Knowledge entries. Every change opens a reviewable pull request.", "에디션, 논문 리뷰, Highlight, Knowledge 게시물을 편집합니다. 변경 사항은 검토 가능한 Pull Request로 올라갑니다.")}</p>
        </div>
        <div className="flex items-center gap-2 border border-border-default bg-surface-01 px-3 py-2 text-xs text-text-secondary">
          <ShieldCheck className="size-4 text-signal-mint" aria-hidden="true" />
          {copy("Changes publish after PR merge", "PR 병합 후 게시")}
        </div>
      </div>
    </header>

    {!connected ? <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
      <div className="border border-border-default bg-surface-01 p-5 md:p-7">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center border border-signal-ice/50 bg-signal-ice/10 text-signal-ice"><LockKeyhole className="size-5" aria-hidden="true" /></div>
          <div>
            <h2 className="text-xl font-semibold">{copy("Connect to GitHub", "GitHub 연결")}</h2>
            <p className="mt-1 text-sm text-text-secondary">{copy("Use a fine-grained token scoped to this repository.", "이 저장소에만 권한을 주는 Fine-grained token을 사용하세요.")}</p>
          </div>
        </div>
        <label htmlFor="admin-token" className="mt-7 block text-xs font-semibold uppercase tracking-wide text-text-secondary">GitHub token</label>
        <input id="admin-token" type="password" autoComplete="off" spellCheck={false} value={token} onChange={(event) => setToken(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && token.trim()) void connect(); }} placeholder="github_pat_…" className="mt-2 min-h-12 w-full border border-border-default bg-background px-4 font-mono text-sm outline-none transition focus:border-signal-ice focus:ring-2 focus:ring-signal-ice/20" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" disabled={!token.trim() || busy} onClick={() => void connect()}>
            {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
            {copy("Connect", "연결")}
          </Button>
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 px-2 text-sm text-signal-ice underline-offset-4 hover:underline">
            {copy("Create a token", "Token 만들기")}<ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-5 border-l-2 border-signal-ice pl-3 text-xs leading-6 text-text-secondary">
          {copy("Grant access to minonminho.github.io only, with Contents: Read and write and Pull requests: Read and write. The token stays in this page’s memory and is cleared when you disconnect or reload.", "minonminho.github.io 저장소만 선택하고 Contents: Read and write, Pull requests: Read and write 권한을 주세요. Token은 이 페이지 메모리에만 있으며 연결 해제나 새로고침 시 지워집니다.")}
        </p>
      </div>
      <aside className="border border-border-subtle bg-surface-02 p-5 md:p-7">
        <p className="text-eyebrow text-signal-orbit">SAFE PUBLISHING</p>
        <h2 className="mt-3 text-xl font-semibold">{copy("A review step before the live site", "게시 전에 변경 내용을 확인")}</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{copy("The admin creates a branch and pull request. Existing validation and the Pages build run on that PR; the public site changes only after it is merged.", "관리자 화면은 브랜치와 Pull Request를 만듭니다. 기존 콘텐츠 검증과 Pages 빌드가 PR에서 실행되고, 병합하면 사이트에 반영됩니다.")}</p>
        <a href="https://github.com/minonminho/minonminho.github.io" target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm text-text-primary underline-offset-4 hover:text-signal-ice hover:underline">
          {copy("Open the repository", "저장소 열기")}<ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </aside>
    </section> : <>
      <section aria-label={copy("Post counts", "게시물 수")} className="mt-7 grid grid-cols-2 border-l border-t border-border-default sm:grid-cols-4">
        {counts.map(({ id, count }) => <div key={id} className="border-b border-r border-border-default bg-surface-01 p-4 md:p-5">
          <p className="text-xs text-text-secondary">{localizeKind(id, copy)}</p>
          <p className="mt-2 font-mono text-3xl text-text-primary">{String(count).padStart(2, "0")}</p>
        </div>)}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="post-date">{copy("Post date", "게시 날짜")}</label>
          <input id="post-date" type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} className="min-h-10 border border-border-default bg-surface-01 px-3 text-sm" />
          <Button type="button" variant="outline" size="sm" onClick={() => createPost("daily")}><Plus className="size-4" aria-hidden="true" />{copy("New Daily", "새 Daily")}</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => createPost("highlight")}><FilePlus2 className="size-4" aria-hidden="true" />{copy("New Highlight", "새 Highlight")}</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={busy || dirty} onClick={() => void reload()}><RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" />{copy("Reload main", "main 새로고침")}</Button>
          <Button type="button" variant="outline" size="sm" onClick={disconnect}><X className="size-4" aria-hidden="true" />{copy("Disconnect", "연결 해제")}</Button>
        </div>
      </div>

      <section className="mt-4 grid min-h-[680px] overflow-hidden border border-border-default bg-surface-01 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.5fr)]">
        <aside className="flex min-h-[360px] flex-col border-b border-border-default lg:border-b-0 lg:border-r">
          <div className="border-b border-border-subtle p-4">
            <label className="flex min-h-10 items-center gap-2 border border-border-default bg-background px-3">
              <Search className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
              <span className="sr-only">{copy("Search posts", "게시물 검색")}</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy("Search title, date, or file…", "제목, 날짜, 파일 검색…")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-tertiary" />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={copy("Filter posts", "게시물 필터")}>
              {filters.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-8 border px-2.5 text-xs transition-colors ${filter === item.id ? "border-text-primary bg-text-primary text-background" : "border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"}`}>
                {item.id === "all" ? copy("All", "전체") : localizeKind(item.id, copy)}
              </button>)}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">{postCountLabel(visiblePosts.length, copy)}</p>
          </div>
          <div className="max-h-[610px] flex-1 overflow-y-auto">
            {visiblePosts.map((post) => <button key={post.path} type="button" onClick={() => selectPost(post)} className={`block w-full border-b border-border-subtle p-4 text-left transition-colors hover:bg-surface-02 ${activePath === post.path ? "bg-surface-02 shadow-[inset_3px_0_0_var(--signal-ice)]" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${kindColor(post.kind)}`}>{localizeKind(post.kind, copy)}</span>
                <span className="font-mono text-[10px] text-text-tertiary">{prettyDate(post.date, language)}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-text-primary">{post.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{post.subtitle}</p>
            </button>)}
            {visiblePosts.length === 0 && <p className="p-6 text-sm text-text-tertiary">{copy("No posts match this filter.", "조건에 맞는 게시물이 없습니다.")}</p>}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col" aria-label={copy("Post editor", "게시물 편집기")}>
          {!activePost ? <div className="grid flex-1 place-items-center p-8 text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid size-12 place-items-center border border-border-default bg-surface-02 text-text-secondary"><FileText className="size-5" aria-hidden="true" /></div>
              <h2 className="mt-4 text-lg font-semibold">{copy("Choose a post", "게시물을 선택하세요")}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{copy("Select a post from the list, or start a Daily Brief or Highlight with the date above.", "목록에서 게시물을 선택하거나 위 날짜로 Daily Brief 또는 Highlight를 시작하세요.")}</p>
            </div>
          </div> : <>
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle p-4 md:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${kindColor(activePost.kind)}`}>{localizeKind(activePost.kind, copy)}</span>
                  {dirty && <span className="border border-signal-dust/50 bg-signal-dust/10 px-2 py-0.5 text-[10px] text-signal-dust">{copy("Unsaved changes", "저장하지 않은 변경")}</span>}
                  {activePost.isNew && <span className="border border-signal-orbit/50 bg-signal-orbit/10 px-2 py-0.5 text-[10px] text-signal-orbit">{copy("New draft", "새 초안")}</span>}
                </div>
                <h2 className="mt-3 break-words text-lg font-semibold leading-7">{activePost.title}</h2>
                <p className="mt-1 break-all font-mono text-[10px] text-text-tertiary">{activePost.path}</p>
              </div>
              <a href={activePost.href} target="_blank" rel="noreferrer" className="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-border-default px-3 text-xs text-text-secondary transition-colors hover:bg-surface-02 hover:text-text-primary">
                {copy("View page", "페이지 보기")}<ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-02/60 px-4 py-3 md:px-5">
              <p className="flex items-center gap-2 text-xs text-text-secondary">
                <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
                {copy("Edit the source file. Daily Briefs are schema-checked before a PR is created.", "원본 파일을 편집합니다. Daily Brief는 PR 생성 전에 스키마를 검사합니다.")}
              </p>
              <div className="flex items-center gap-2">
                {activePost.sha && <Button type="button" variant="destructive" size="sm" disabled={busy || !deletion.allowed || Boolean(pullRequest)} title={!deletion.allowed ? deletion.reason : undefined} onClick={() => setConfirmDelete((value) => !value)}><Trash2 className="size-4" aria-hidden="true" />{copy("Delete", "삭제")}</Button>}
                <Button type="button" size="sm" disabled={busy || !dirty || Boolean(validationError) || Boolean(pullRequest)} onClick={() => void submitPost()}>
                  {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : pullRequest ? <Check className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                  {pullRequest ? copy("PR created", "PR 생성됨") : copy("Create review PR", "검토 PR 만들기")}
                </Button>
              </div>
            </div>

            {confirmDelete && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-signal-dust/50 bg-signal-dust/10 px-4 py-3 md:px-5">
              <p className="text-sm text-text-primary">{deletion.allowed ? copy(`Create a PR to remove “${activePost.title}”? It remains live until that PR is merged.`, `“${activePost.title}” 삭제 PR을 만들까요? 병합 전까지 계속 공개됩니다.`) : deletion.reason}</p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>{copy("Cancel", "취소")}</Button>
                {deletion.allowed && <Button type="button" variant="destructive" size="sm" disabled={busy || Boolean(pullRequest)} onClick={() => void submitDelete()}>{busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}{copy("Create delete PR", "삭제 PR 만들기")}</Button>}
              </div>
            </div>}

            {validationError && dirty && <p role="alert" className="flex items-start gap-2 border-b border-signal-dust/40 bg-signal-dust/10 px-4 py-3 text-xs leading-5 text-text-primary md:px-5"><AlertCircle className="mt-0.5 size-4 shrink-0 text-signal-dust" aria-hidden="true" />{validationError}</p>}
            {notice && <div role="status" className="flex flex-wrap items-center justify-between gap-2 border-b border-signal-mint/40 bg-signal-mint/10 px-4 py-3 text-xs leading-5 text-text-primary md:px-5"><span className="flex items-center gap-2"><Check className="size-4 shrink-0 text-signal-mint" aria-hidden="true" />{notice}</span>{pullRequest && <a className="inline-flex min-h-8 items-center gap-1 text-signal-ice underline-offset-4 hover:underline" href={pullRequest.html_url} target="_blank" rel="noreferrer">{copy("Open PR", "PR 열기")}<ArrowUpRight className="size-3.5" aria-hidden="true" /></a>}</div>}
            {error && <p role="alert" className="flex items-start gap-2 border-b border-signal-dust/40 bg-signal-dust/10 px-4 py-3 text-xs leading-5 text-text-primary md:px-5"><AlertCircle className="mt-0.5 size-4 shrink-0 text-signal-dust" aria-hidden="true" />{error}</p>}
            <label htmlFor="post-content" className="sr-only">{copy("Post source", "게시물 원본")}</label>
            <textarea id="post-content" spellCheck={false} value={draft} onChange={(event) => { setDraft(event.target.value); setPullRequest(null); setNotice(""); }} disabled={Boolean(pullRequest)} className="min-h-[560px] w-full flex-1 resize-y bg-background p-4 font-mono text-[11px] leading-6 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal-ice md:p-5" />
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-4 py-3 text-[10px] text-text-tertiary md:px-5">
              <span>{dirty ? copy("Changes are local until you create a PR.", "PR을 만들기 전까지 변경 내용은 이 브라우저에만 있습니다.") : copy("Source content from main.", "main에 있는 원본 콘텐츠입니다.")}</span>
              <span className="font-mono">{draft.length.toLocaleString()} {copy("characters", "자")}</span>
            </footer>
          </>}
        </section>
      </section>
    </>}

    {(error || notice) && !connected && <p role={error ? "alert" : "status"} className={`mt-4 flex items-start gap-2 border px-4 py-3 text-sm ${error ? "border-signal-dust/50 bg-signal-dust/10" : "border-signal-mint/40 bg-signal-mint/10"}`}>
      {error ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-signal-dust" aria-hidden="true" /> : <Check className="mt-0.5 size-4 shrink-0 text-signal-mint" aria-hidden="true" />}{error || notice}
    </p>}
  </main>;
}
