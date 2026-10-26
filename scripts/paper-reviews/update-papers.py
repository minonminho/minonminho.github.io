#!/usr/bin/env python3
"""Create bilingual paper briefs from the public Hugging Face Papers API."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[2]
REVIEWS = ROOT / "content/paper-reviews"
HIGHLIGHTS = ROOT / "content/daily-brief/highlights"
HF_API = "https://huggingface.co/api/daily_papers"
HF_PAGE = "https://huggingface.co/papers/{paper_id}"
ARXIV_PAGE = "https://arxiv.org/abs/{paper_id}"
TRANSLATION_MODEL = "Neurora/opus-hplt-en-ko-v2.0"
TRANSLATION_REVISION = "06f3f7b03a97728560826d7387e1ea25224c65a9"
TRANSLATION_MODEL_TAG = f"{TRANSLATION_MODEL}@{TRANSLATION_REVISION}"
KOREA = ZoneInfo("Asia/Seoul")


def clean(value: object) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalized_id(value: object) -> str:
    return re.sub(r"v\d+$", "", re.sub(r"^arxiv:", "", clean(value).lower()))


def request_text(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "DailyBriefPapers/1.0 (public research summaries)"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_feed(cadence: str, period: str, limit: int) -> list[dict]:
    params = {"p": 0, "limit": limit, "sort": "trending"}
    if period:
        params[cadence if cadence != "daily" else "date"] = period
    url = f"{HF_API}?{urllib.parse.urlencode(params)}"
    try:
        payload = json.loads(request_text(url))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Could not retrieve Hugging Face Papers: {error}") from error
    if not isinstance(payload, list):
        raise RuntimeError("Hugging Face Papers API returned an unexpected response.")
    return payload


def available_feed(cadence: str, run_date: date, limit: int) -> tuple[list[dict], str]:
    if cadence == "weekly":
        period = run_date.strftime("%G-W%V")
        return fetch_feed("week", period, limit), period
    if cadence == "monthly":
        period = run_date.strftime("%Y-%m")
        return fetch_feed("month", period, limit), period

    # HF Daily Papers may not publish a new list on weekends or early in the morning.
    for offset in range(8):
        period_date = run_date - timedelta(days=offset)
        period = period_date.isoformat()
        papers = fetch_feed("daily", period, limit)
        if papers:
            return papers, period
    papers = fetch_feed("daily", "", limit)
    if papers:
        submitted = first(papers[0], "publishedAt", "submittedAt")
        period = clean(submitted)[:10] if submitted else run_date.isoformat()
        return papers, period
    raise RuntimeError("Hugging Face returned no Daily Papers for the last eight days.")


def first(item: dict, *keys: str, default: object = None) -> object:
    for key in keys:
        value = item.get(key)
        if value not in (None, "", [], {}):
            return value
    return default


def paper_value(raw: dict, *keys: str, default: object = None) -> object:
    paper = raw.get("paper") if isinstance(raw.get("paper"), dict) else {}
    for source in (raw, paper):
        value = first(source, *keys)
        if value not in (None, "", [], {}):
            return value
    return default


def normalize_paper(raw: dict, rank: int, period: str) -> dict | None:
    paper_obj = raw.get("paper") if isinstance(raw.get("paper"), dict) else {}
    paper_id = clean(paper_value(raw, "id", "paperId"))
    paper_id = normalized_id(paper_id)
    if not paper_id:
        return None
    title = clean(paper_value(raw, "title"))
    summary = clean(paper_value(raw, "ai_summary", "aiSummary"))
    abstract = clean(paper_value(raw, "summary", "abstract"))
    if not summary:
        summary = abstract
    if not abstract:
        abstract = summary
    if not title or not summary:
        return None
    authors_value = paper_value(raw, "authors", default=[])
    authors = []
    if isinstance(authors_value, list):
        for author in authors_value:
            name = clean(author.get("name") or author.get("fullname") or author.get("fullName")) if isinstance(author, dict) else clean(author)
            if name:
                authors.append(name)
    if not authors:
        authors = ["Hugging Face paper entry"]
    keywords_value = paper_value(raw, "ai_keywords", "aiKeywords", default=[])
    keywords = [clean(value) for value in keywords_value if clean(value)] if isinstance(keywords_value, list) else []
    paper_published = clean(first(paper_obj, "publishedAt", "published_at", default=first(raw, "paperDate", "publishedAt", default=period)))[:10]
    submitted = clean(first(raw, "submittedAt", "publishedAt", default=period))[:10]
    upvotes = paper_value(raw, "upvotes", default=0)
    try:
        upvotes = int(upvotes or 0)
    except (TypeError, ValueError):
        upvotes = 0
    return {
        "id": paper_id,
        "title": title,
        "summary": summary,
        "abstract": abstract,
        "authors": ", ".join(authors),
        "keywords": keywords[:6],
        "published": paper_published,
        "submitted": submitted,
        "rank": rank,
        "upvotes": upvotes,
        "raw": raw,
    }


def slug_for(paper_id: str) -> str:
    return f"hf-{re.sub(r'[^a-z0-9]+', '-', paper_id.lower()).strip('-')}"


def review_translation_models() -> dict[str, str]:
    models: dict[str, str] = {}
    for path in REVIEWS.glob("*.md"):
        content = path.read_text(encoding="utf-8")
        match = re.match(r"^---\n([\s\S]*?)\n---", content)
        if not match:
            continue
        try:
            metadata = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        canonical_id = metadata.get("canonicalId")
        if canonical_id:
            models[normalized_id(canonical_id)] = clean(metadata.get("translationModel"))
    return models


def highlight_history() -> set[str]:
    ids: set[str] = set()
    for path in HIGHLIGHTS.glob("????-??-??.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("paperId"):
            ids.add(normalized_id(data["paperId"]))
    return ids


def html_figure_url(page_url: str) -> str | None:
    try:
        page = request_text(page_url)
    except (urllib.error.URLError, TimeoutError):
        return None
    for pattern in (
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
        r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)',
    ):
        match = re.search(pattern, page, re.IGNORECASE)
        if match:
            return html.unescape(match.group(1))
    return None


def arxiv_figure_url(paper_id: str) -> str | None:
    base = f"https://arxiv.org/html/{paper_id}"
    try:
        page = request_text(base)
    except (urllib.error.URLError, TimeoutError):
        return None
    candidates = re.findall(r'<img[^>]+src=["\']([^"\']+)', page, re.IGNORECASE)
    for candidate in candidates:
        if candidate.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
            return urllib.parse.urljoin(base + "/", html.unescape(candidate))
    return None


def image_for(paper: dict) -> tuple[str | None, int, int]:
    raw = paper["raw"]
    nested = raw.get("paper") if isinstance(raw.get("paper"), dict) else {}
    candidate = None
    for source in (raw, nested):
        for key in ("thumbnail", "thumbnailUrl", "thumbnail_url", "image", "imageUrl", "image_url", "figure", "figureUrl"):
            value = source.get(key)
            if isinstance(value, str) and value.startswith("https://"):
                candidate = value
                break
            if isinstance(value, dict):
                candidate = first(value, "url", "src")
                if candidate:
                    break
        if candidate:
            break
    if not candidate:
        candidate = html_figure_url(HF_PAGE.format(paper_id=paper["id"]))
    if not candidate:
        candidate = arxiv_figure_url(paper["id"])
    if not candidate:
        return None, 1600, 900
    dimensions = raw.get("thumbnail") if isinstance(raw.get("thumbnail"), dict) else nested.get("thumbnail")
    width = first(dimensions, "width", default=1600) if isinstance(dimensions, dict) else 1600
    height = first(dimensions, "height", default=900) if isinstance(dimensions, dict) else 900
    try:
        width, height = max(1, int(width)), max(1, int(height))
    except (TypeError, ValueError):
        width, height = 1600, 900
    return str(candidate), width, height


class Translator:
    def __init__(self) -> None:
        try:
            import torch
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        except ImportError as error:
            raise RuntimeError("Install torch, transformers, and sentencepiece to translate paper briefs.") from error
        torch.set_num_threads(2)
        self.tokenizer = AutoTokenizer.from_pretrained(TRANSLATION_MODEL, revision=TRANSLATION_REVISION)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            TRANSLATION_MODEL,
            revision=TRANSLATION_REVISION,
            torch_dtype=torch.float32,
        )
        self.model.eval()
        self.cache: dict[str, str] = {}
        sanity_translation = self.translate_many(["The weather is really nice today."])[0]
        if not all(token in sanity_translation for token in ("오늘", "날씨", "좋")):
            raise RuntimeError(f"Translation sanity check failed for {TRANSLATION_MODEL}: {sanity_translation!r}")

    @staticmethod
    def split(text: str, max_chars: int = 420) -> list[str]:
        text = clean(text)
        if not text:
            return [""]
        sentences = re.split(r"(?<=[.!?])\s+", text)
        chunks: list[str] = []
        current = ""
        for sentence in sentences:
            while len(sentence) > max_chars:
                if current:
                    chunks.append(current)
                    current = ""
                chunks.append(sentence[:max_chars])
                sentence = sentence[max_chars:]
            if current and len(current) + len(sentence) + 1 > max_chars:
                chunks.append(current)
                current = sentence
            else:
                current = f"{current} {sentence}".strip()
        if current:
            chunks.append(current)
        return chunks

    def translate_many(self, texts: list[str]) -> list[str]:
        import torch

        needed: list[str] = []
        for text in texts:
            for chunk in self.split(text):
                if chunk and chunk not in self.cache and chunk not in needed:
                    needed.append(chunk)
        for start in range(0, len(needed), 8):
            batch = needed[start : start + 8]
            encoded = self.tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=512)
            with torch.inference_mode():
                generated = self.model.generate(**encoded, max_new_tokens=512)
            outputs = self.tokenizer.batch_decode(generated, skip_special_tokens=True)
            self.cache.update({source: target.strip() for source, target in zip(batch, outputs)})
        translated: list[str] = []
        for text in texts:
            translated.append(" ".join(self.cache.get(chunk, chunk) for chunk in self.split(text) if chunk).strip())
        return translated


def markdown_table(rows: list[tuple[str, str, str]], korean: bool = False) -> str:
    term_header = "용어" if korean else "Term"
    context_header = "논문 속 맥락" if korean else "Context in this paper"
    if not rows:
        no_keywords = "이 논문에는 Hugging Face AI 핵심어가 제공되지 않았습니다." if korean else "No keyword data was supplied for this paper."
        return f"| {term_header} | {context_header} |\n| --- | --- |\n| {('Hugging Face AI 핵심어' if korean else 'Hugging Face AI keywords')} | {no_keywords} |"
    escaped_rows = []
    for term, _ko, context in rows:
        escaped_rows.append("| " + term.replace("|", "\\|") + " | " + context.replace("|", "\\|") + " |")
    return f"| {term_header} | {context_header} |\n| --- | --- |\n" + "\n".join(escaped_rows)


def source_lines(paper: dict) -> str:
    lines = [
        f"- [Hugging Face paper entry]({HF_PAGE.format(paper_id=paper['id'])}).",
        f"- [Original arXiv paper]({ARXIV_PAGE.format(paper_id=paper['id'])}).",
    ]
    project = paper_value(paper["raw"], "projectPage", "project_page")
    repo = paper_value(paper["raw"], "githubRepo", "github_repo")
    if isinstance(project, str) and project.startswith("https://"):
        lines.append(f"- [Project page]({project}).")
    if isinstance(repo, str) and repo.startswith("https://"):
        lines.append(f"- [Code repository]({repo}).")
    return "\n".join(lines)


def review_markdown(paper: dict, cadence: str, period: str, period_rank: int, run_date: date, translated: dict[str, str], figure_url: str) -> str:
    slug = slug_for(paper["id"])
    label_en, label_ko = {
        "daily": ("Daily", "Daily"),
        "weekly": ("Weekly", "Weekly"),
        "monthly": ("Monthly", "Monthly"),
    }[cadence]
    summary_en = paper["summary"]
    abstract_en = paper["abstract"] or paper["summary"]
    dek_en = summary_en.split(". ", 1)[0].strip()
    if dek_en and not dek_en.endswith((".", "!", "?")):
        dek_en += "."
    keywords = paper["keywords"]
    terms = []
    for keyword in keywords:
        context = next((s.strip() for s in re.split(r"(?<=[.!?])\s+", abstract_en) if keyword.lower() in s.lower()), "")
        if not context:
            context = f"{keyword} is identified as a key term in the Hugging Face paper metadata."
        terms.append((keyword, translated.get(f"term:{keyword}", keyword), context))
    english_limit = "This brief is based on Hugging Face Papers metadata and its existing AI summary. Check the original paper for the full experimental setup, baselines, and limitations before relying on a result."
    korean_limit = translated["generic-limit"]
    title_ko = translated[f"title:{paper['id']}"]
    dek_ko = translated[f"dek:{paper['id']}"]
    summary_ko = translated[f"summary:{paper['id']}"]
    abstract_ko = translated[f"abstract:{paper['id']}"]
    english_terms = markdown_table(terms)
    korean_terms = markdown_table([
        (f"{term} ({ko})", ko, translated.get(f"context:{paper['id']}:{term}", context))
        for term, ko, context in terms
    ], korean=True)
    meta = {
        "canonicalId": f"arxiv:{paper['id']}",
        "version": paper["id"],
        "reviewStatus": "published",
        "editorialStatus": "metadata-digest",
        "sourceType": f"huggingface-{cadence}",
        "translationModel": TRANSLATION_MODEL_TAG,
        "publishedDate": run_date.isoformat(),
        "dailyDate": period if cadence == "daily" else None,
        "dailyRank": period_rank if cadence == "daily" else None,
        "periodLabel": period,
        "periodRank": period_rank,
        "upvotesAtSelection": paper["upvotes"],
        "authors": paper["authors"],
        "slug": slug,
        "title": {"en": paper["title"], "ko": title_ko},
        "dek": {"en": dek_en, "ko": dek_ko},
        "hero": {
            "url": figure_url,
            "alt": {"en": f"Original paper figure for {paper['title']}", "ko": translated[f"alt:{paper['id']}"]},
            "caption": {
                "en": "Original figure linked from the Hugging Face paper entry or arXiv HTML. Open the source page for attribution and reuse terms.",
                "ko": translated["figure-caption"],
            },
            "license": "Original paper figure; attribution and reuse terms are on the linked source page.",
        },
    }
    references_en = source_lines(paper)
    references_ko = references_en.replace("Hugging Face paper entry", "Hugging Face 논문 페이지").replace("Original arXiv paper", "arXiv 논문 원문").replace("Project page", "프로젝트 페이지").replace("Code repository", "코드 저장소")
    # HF supplies an AI summary and an author abstract, NOT a reviewed full paper.
    # Never invent experiments or critical analysis from these two text fields.
    en_parts = re.split(r"(?<=[.!?])\s+", abstract_en)
    ko_parts = re.split(r"(?<=[.!?])\s+", abstract_ko)
    def part(parts: list[str], begin: int, end: int | None, fallback: str) -> str:
        return " ".join(parts[begin:end]).strip() or fallback

    problem_en = part(en_parts, 0, 2, summary_en)
    problem_ko = part(ko_parts, 0, 2, summary_ko)
    contributions_en = part(en_parts, 2, 4, "The author abstract does not provide a separately checked contribution list. Read the paper for details.")
    contributions_ko = part(ko_parts, 2, 4, "저자 초록에 독립적으로 확인된 기여 목록은 없습니다. 논문 원문 확인이 필요합니다.")
    method_en = part(en_parts, 4, max(5, len(en_parts) - 2), "Method details have not been verified from the full original paper.")
    method_ko = part(ko_parts, 4, max(5, len(ko_parts) - 2), "논문 원문을 바탕으로 방법론을 아직 검증하지 않았습니다.")
    results_en = part(en_parts, max(4, len(en_parts) - 2), None, "No benchmark table or comparison has been independently verified.")
    results_ko = part(ko_parts, max(4, len(ko_parts) - 2), None, "벤치마크 표나 비교 결과를 독립적으로 검증하지 않았습니다.")

    body = f"""---
{json.dumps(meta, ensure_ascii=False, indent=2)}
---
<!-- locale: en -->

## TL;DR

> **Automated discovery digest — not an independent paper review.** Based on the Hugging Face AI summary and author abstract.

{summary_en}

## Research Problem

**From author abstract.** {problem_en}

## Key Contributions

**Author-reported contributions.** {contributions_en}

## Method Overview

**Abstract-level description; not independently verified.** {method_en}

## Key Results

**Author-reported claims, not reproduced results.** {results_en}

## Limitations & Implications

{english_limit}

**Review status:** Original-paper analysis, baseline verification, and independent engineering conclusions are pending.

## References

{references_en}

### Terminology for Knowledge

{english_terms}

<!-- locale: ko -->

## 핵심 요약 (TL;DR)

> **자동 수집 요약 — 독립적인 논문 리뷰가 아닙니다.** Hugging Face AI 요약과 저자 초록을 기반으로 합니다.

{summary_ko}

## 연구 문제

**저자 초록 기반.** {problem_ko}

## 핵심 기여

**저자가 보고한 기여.** {contributions_ko}

## 방법론 개요

**초록 수준의 설명으로, 독립 검증하지 않았습니다.** {method_ko}

## 주요 실험 결과

**저자가 보고한 주장으로, 재현 결과가 아닙니다.** {results_ko}

## 한계와 시사점

{korean_limit}

**리뷰 상태:** 원문 분석, Baseline 검증 및 독립적인 엔지니어링 검토는 아직 진행되지 않았습니다.

## 참고 자료

{references_ko}

### Knowledge 용어 정리

{korean_terms}
"""
    return body


def make_highlight(paper: dict, date_text: str, feed_date: str, translated: dict[str, str], image_url: str, width: int, height: int) -> dict:
    abstract = paper["abstract"] or paper["summary"]
    abstract_sentences = re.split(r"(?<=[.!?])\s+", abstract)
    problem = " ".join(abstract_sentences[:2]).strip() or paper["summary"]
    idea = paper["summary"]
    read_note = "Use the original paper to check its evaluation data, baselines, and limitations. The Hugging Face summary is a starting point, not a replacement for the paper."
    title_ko = translated[f"title:{paper['id']}"]
    dek_en = paper["summary"].split(". ", 1)[0].strip()
    if dek_en and not dek_en.endswith((".", "!", "?")):
        dek_en += "."
    dek_ko = translated[f"dek:{paper['id']}"]
    terminology = []
    for term in paper["keywords"]:
        context = next((s.strip() for s in abstract_sentences if term.lower() in s.lower()), "")
        if not context:
            context = f"{term} is listed among the Hugging Face AI keywords for this paper."
        ko_term = translated.get(f"term:{term}", term)
        ko_context = translated.get(f"context:{paper['id']}:{term}", context)
        terminology.append({
            "term": term,
            "koTerm": ko_term,
            "description": {"en": context, "ko": ko_context},
            "example": {
                "en": f"In this paper: {context}",
                "ko": translated.get(f"example:{paper['id']}:{term}", f"논문에서: {ko_context}"),
            },
        })
    if not terminology:
        terminology.append({
            "term": "Paper keywords",
            "koTerm": "논문 핵심어",
            "description": {"en": "Hugging Face did not provide AI keywords for this paper.", "ko": "Hugging Face가 이 논문의 AI 핵심어를 제공하지 않았습니다."},
            "example": {"en": paper["summary"], "ko": translated[f"summary:{paper['id']}"]},
        })
    return {
        "date": date_text,
        "paperId": paper["id"],
        "paperDate": paper["published"],
        "dailyDate": feed_date,
        "dailyRank": paper["rank"],
        "upvotesAtSelection": paper["upvotes"],
        "title": {"en": paper["title"], "ko": title_ko},
        "dek": {"en": dek_en, "ko": dek_ko},
        "selectionReason": {
            "en": f"Ranked #{paper['rank']} on Hugging Face Daily Papers for {feed_date}, with {paper['upvotes']} upvotes when selected. Upvotes show community attention, not paper quality.",
            "ko": translated[f"selection:{paper['id']}"]
        },
        "summary": {"en": paper["summary"], "ko": translated[f"summary:{paper['id']}"]},
        "summaryAttribution": {
            "en": "The English summary and keywords come from the Hugging Face Papers API. Korean text is translated locally from the source summary.",
            "ko": "영문 요약과 핵심어는 Hugging Face Papers API가 제공하며, 한국어는 원문 요약을 로컬 번역 모델로 옮겼습니다."
        },
        "figure": {
            "url": image_url,
            "width": width,
            "height": height,
            "alt": {"en": f"Original paper figure for {paper['title']}", "ko": translated[f"alt:{paper['id']}"]},
            "caption": {
                "en": "Original figure linked from the Hugging Face paper entry or arXiv HTML; see the source page for attribution and reuse terms.",
                "ko": translated["figure-caption"]
            }
        },
        "sections": [
            {"id": "problem", "heading": {"en": "The question behind the paper", "ko": translated["highlight-problem-heading"]}, "paragraphs": [{"en": problem, "ko": translated[f"problem:{paper['id']}"]}]},
            {"id": "mechanism", "heading": {"en": "The central idea", "ko": translated["highlight-idea-heading"]}, "paragraphs": [{"en": idea, "ko": translated[f"summary:{paper['id']}"]}]},
            {"id": "engineering", "heading": {"en": "What to check in a first read", "ko": translated["highlight-read-heading"]}, "paragraphs": [{"en": read_note, "ko": translated["highlight-read-note"]}]},
        ],
        "takeaway": {"en": idea, "ko": translated[f"summary:{paper['id']}"]},
        "terminology": terminology,
        "sources": [
            {"label": {"en": "Hugging Face paper page", "ko": "Hugging Face 논문 페이지"}, "url": HF_PAGE.format(paper_id=paper["id"]), "publisher": "Hugging Face"},
            {"label": {"en": "Original arXiv paper", "ko": "arXiv 논문 원문"}, "url": ARXIV_PAGE.format(paper_id=paper["id"]), "publisher": "arXiv"},
        ]
    }


def translation_inputs(paper: dict, include_highlight: bool) -> dict[str, str]:
    values: dict[str, str] = {
        f"title:{paper['id']}": paper["title"],
        f"dek:{paper['id']}": paper["summary"].split(". ", 1)[0].strip(),
        f"summary:{paper['id']}": paper["summary"],
        f"abstract:{paper['id']}": paper["abstract"] or paper["summary"],
        f"alt:{paper['id']}": f"Original paper figure for {paper['title']}",
        f"selection:{paper['id']}": f"Ranked #{paper['rank']} on Hugging Face Daily Papers for {paper['submitted']}, with {paper['upvotes']} upvotes when selected. Upvotes show community attention, not paper quality.",
    }
    for keyword in paper["keywords"]:
        values[f"term:{keyword}"] = keyword
        context = next((s.strip() for s in re.split(r"(?<=[.!?])\s+", paper["abstract"]) if keyword.lower() in s.lower()), "")
        if not context:
            context = f"{keyword} is identified as a key term in the Hugging Face paper metadata."
        values[f"context:{paper['id']}:{keyword}"] = context
        values[f"example:{paper['id']}:{keyword}"] = f"In this paper: {context}"
    if include_highlight:
        abstract = paper["abstract"] or paper["summary"]
        problem = " ".join(re.split(r"(?<=[.!?])\s+", abstract)[:2]).strip() or paper["summary"]
        values[f"problem:{paper['id']}"] = problem
    return values


def publish(cadence: str, requested_date: str | None) -> None:
    run_date = date.fromisoformat(requested_date) if requested_date else datetime.now(KOREA).date()
    limit = {"daily": 5, "weekly": 10, "monthly": 20}[cadence]
    raw_papers, period = available_feed(cadence, run_date, 50)
    papers = [paper for rank, raw in enumerate(raw_papers, 1) if (paper := normalize_paper(raw, rank, period))][:limit]
    if not papers:
        raise RuntimeError(f"Hugging Face returned no usable {cadence} papers for {period}.")

    review_models = review_translation_models()
    up_to_date = {
        paper_id
        for paper_id, model_tag in review_models.items()
        if model_tag == TRANSLATION_MODEL_TAG
    }
    papers_to_update = [paper for paper in papers if paper["id"] not in up_to_date]
    feed_date = period if cadence == "daily" else ""
    highlight_path = HIGHLIGHTS / f"{run_date.isoformat()}.json"
    used_highlights = highlight_history()
    # Do not auto-publish a "deep review" from a Hugging Face AI summary alone.
    # Selection/discovery remains enabled; a reviewed highlight must be authored from the full paper.
    candidate = None

    prepared: list[tuple[dict, str, int, str, int, int]] = []
    for paper in papers_to_update:
        image_url, width, height = image_for(paper)
        if not image_url:
            print(f"Skipping {paper['id']}: no original paper figure found.", file=sys.stderr)
            continue
        prepared.append((paper, period, paper["rank"], image_url, width, height))

    if candidate and all(item[0]["id"] != candidate["id"] for item in prepared):
        image_url, width, height = image_for(candidate)
        if image_url:
            prepared.append((candidate, period, candidate["rank"], image_url, width, height))
        else:
            candidate = None

    if not prepared:
        print(json.dumps({"cadence": cadence, "period": period, "papers_seen": len(papers), "updated_summaries": 0, "highlight": "skipped" if cadence == "daily" else "not-applicable"}))
        return

    all_inputs: dict[str, str] = {
        "generic-limit": "This brief is based on Hugging Face Papers metadata and its existing AI summary. Check the original paper for the full experimental setup, baselines, and limitations before relying on a result.",
        "figure-caption": "Original figure linked from the Hugging Face paper entry or arXiv HTML. Open the source page for attribution and reuse terms.",
    }
    if candidate:
        all_inputs.update({
            "highlight-problem-heading": "The question behind the paper",
            "highlight-idea-heading": "The central idea",
            "highlight-read-heading": "What to check in a first read",
            "highlight-read-note": "Use the original paper to check its evaluation data, baselines, and limitations. The Hugging Face summary is a starting point, not a replacement for the paper.",
        })
    for paper, *_ in prepared:
        all_inputs.update(translation_inputs(paper, bool(candidate and paper["id"] == candidate["id"])))
    translator = Translator()
    source_texts = list(all_inputs.values())
    translated_texts = translator.translate_many(source_texts)
    translated = dict(zip(all_inputs.keys(), translated_texts))

    created = 0
    for paper, _, rank, image_url, _width, _height in prepared:
        if paper["id"] in up_to_date:
            continue
        destination = REVIEWS / f"{slug_for(paper['id'])}.md"
        metadata = review_markdown(paper, cadence, period, rank, run_date, translated, image_url)
        destination.write_text(metadata, encoding="utf-8")
        up_to_date.add(paper["id"])
        created += 1

    highlight_status = "not-applicable"
    if cadence == "daily":
        if highlight_path.exists():
            highlight_status = "already-published-for-date"
        elif candidate:
            image_url, width, height = image_for(candidate)
            highlight = make_highlight(candidate, run_date.isoformat(), period, translated, image_url, width, height)
            highlight_path.write_text(json.dumps(highlight, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            highlight_status = candidate["id"]
        else:
            highlight_status = "no-eligible-paper"

    print(json.dumps({"cadence": cadence, "period": period, "papers_seen": len(papers), "updated_summaries": created, "highlight": highlight_status}))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cadence", choices=("daily", "weekly", "monthly"), default="daily")
    parser.add_argument("--date", help="Korea-local date in YYYY-MM-DD format; defaults to today in Asia/Seoul.")
    args = parser.parse_args()
    publish(args.cadence, args.date)


if __name__ == "__main__":
    main()
