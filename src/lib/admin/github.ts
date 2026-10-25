export const repository = {
  owner: "minonminho",
  name: "minonminho.github.io",
  branch: "main",
} as const;

const apiRoot = `https://api.github.com/repos/${repository.owner}/${repository.name}`;

export type GitTreeEntry = {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
};

export type GitFile = {
  path: string;
  sha: string;
  content: string;
};

export type FileChange = {
  path: string;
  content: string | null;
  expectedSha: string | null;
};

async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiRoot}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : `GitHub returned ${response.status}.`;
    throw new Error(response.status === 401 ? "Token을 확인할 수 없습니다. Fine-grained token 권한과 만료 여부를 확인해 주세요." : message);
  }
  return payload as T;
}

function decodeBase64(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export async function loadRepositoryFiles(token: string) {
  const reference = await request<{ object: { sha: string } }>(token, `/git/ref/heads/${repository.branch}`);
  const commit = await request<{ tree: { sha: string } }>(token, `/git/commits/${reference.object.sha}`);
  const tree = await request<{ truncated: boolean; tree: GitTreeEntry[] }>(token, `/git/trees/${commit.tree.sha}?recursive=1`);
  if (tree.truncated) throw new Error("Repository tree가 너무 커서 게시물 목록을 안전하게 불러오지 못했습니다.");

  const managed = tree.tree.filter((entry) => entry.type === "blob" && isManagedPath(entry.path));
  const files: GitFile[] = [];
  for (let offset = 0; offset < managed.length; offset += 6) {
    const batch = managed.slice(offset, offset + 6);
    const loaded = await Promise.all(batch.map(async (entry) => {
      const blob = await request<{ content: string; encoding: string }>(token, `/git/blobs/${entry.sha}`);
      if (blob.encoding !== "base64") throw new Error(`GitHub가 ${entry.path} 파일을 Base64로 반환하지 않았습니다.`);
      return { path: entry.path, sha: entry.sha, content: decodeBase64(blob.content) };
    }));
    files.push(...loaded);
  }

  return { files, headSha: reference.object.sha };
}

function isManagedPath(path: string) {
  return /^content\/daily-brief\/\d{4}-\d{2}-\d{2}\.json$/.test(path)
    || /^content\/daily-brief\/highlights\/\d{4}-\d{2}-\d{2}\.json$/.test(path)
    || /^content\/paper-reviews\/[a-z0-9-]+\.md$/.test(path)
    || /^content\/knowledge\/[a-z0-9-]+\.json$/.test(path);
}

export async function createContentPullRequest(token: string, changes: FileChange[], title: string) {
  if (!changes.length) throw new Error("저장할 변경 사항이 없습니다.");

  const reference = await request<{ object: { sha: string } }>(token, `/git/ref/heads/${repository.branch}`);
  const baseSha = reference.object.sha;
  const commit = await request<{ tree: { sha: string } }>(token, `/git/commits/${baseSha}`);
  const baseTree = await request<{ tree: GitTreeEntry[] }>(token, `/git/trees/${commit.tree.sha}?recursive=1`);
  const currentFiles = new Map(baseTree.tree.map((entry) => [entry.path, entry.sha]));

  for (const change of changes) {
    const currentSha = currentFiles.get(change.path) ?? null;
    if (currentSha !== change.expectedSha) {
      throw new Error(`${change.path} 파일이 main에서 바뀌었습니다. 최신 목록을 다시 불러와 편집 내용을 확인해 주세요.`);
    }
  }

  const treeEntries = await Promise.all(changes.map(async (change) => {
    if (change.content === null) return { path: change.path, mode: "100644", type: "blob", sha: null };
    const blob = await request<{ sha: string }>(token, "/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: encodeBase64(change.content), encoding: "base64" }),
    });
    return { path: change.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const tree = await request<{ sha: string }>(token, "/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeEntries }),
  });
  const branch = `admin/posts-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 7)}`;
  const newCommit = await request<{ sha: string }>(token, "/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: title, tree: tree.sha, parents: [baseSha] }),
  });
  await request(token, "/git/refs", {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommit.sha }),
  });

  const pullRequest = await request<{ html_url: string; number: number }>(token, "/pulls", {
    method: "POST",
    body: JSON.stringify({
      title,
      head: branch,
      base: repository.branch,
      body: [
        "Created from the Daily Brief admin page.",
        "",
        ...changes.map((change) => `- ${change.content === null ? "Delete" : "Update"} \`${change.path}\``),
        "",
        "The standard content validation and GitHub Pages build will run before this change can be published.",
      ].join("\n"),
    }),
  });
  return pullRequest;
}
