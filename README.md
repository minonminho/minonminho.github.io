# Daily Research Reading — Minho Lee

A Next.js 16 static-export site on GitHub Pages. The profile and other projects remain separate from the research-reading experience.

## Daily Brief and Knowledge

- **Daily Brief** (`/daily-brief/`): read one in-depth AI paper per day, with nine research-review chapters and links to primary sources.
- **Knowledge** (`/knowledge/`): understand the technical terms used in the paper, including definitions, prerequisites, examples, and paper context.
- **Bilingual**: English by default, Korean toggle; both article content and learning concepts are translated.
- **Context help**: tap an underlined term in the paper to open a learning panel; optionally ask ChatGPT a question prefilled with the relevant paper context.

## Workflow

- `scripts/research/discover.py`: gather *candidate* papers using public research-community signals. No platform is authoritative; community popularity alone does not establish quality. Scheduled at 05:50 Asia/Seoul by `.github/workflows/research-discovery.yml`.
- The Daily AI Paper Deep Dive ChatGPT automation is scheduled for 06:30 Asia/Seoul. It reads primary papers and may publish one bilingual reviewed article per day **only after evidence verification**. A Hugging Face abstract or automatic candidate score cannot be published as a completed review.
- A published review is stored at `content/research/reviews/YYYY-MM-DD-paper-slug.json`; concepts are embedded in and traceable to each review.
- `npm run research:validate` checks the review structure, bilingual content, source URLs and inline concept references.
- `.github/workflows/deploy.yml` validates, builds and deploys to GitHub Pages.

## Local development

```bash
npm ci
npm run research:validate
npm run dev
```

See [research editorial and publication rules](docs/RESEARCH_READING.md).

Legacy multi-story AI newsletters, auto-translated Hugging Face digests, and the separate Knowledge Worker and exported one-pager files have been retired. Removed files remain in Git history if recovery is required.
