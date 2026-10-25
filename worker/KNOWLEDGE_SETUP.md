# Knowledge Worker setup

The public site is a GitHub Pages static export. The Cloudflare Worker and D1 schema in this repository are an implementation draft; they are not deployed from this workspace. The Worker dispatch is authenticated and runs only after a reviewed paper Markdown file changes on `main`. There is no Daily, Weekly, Monthly, or Landmark cron in the repository, and this change adds none.

## Worker boundary

The Worker now serves only the Knowledge API and `KnowledgePaperWorkflow`.
Its Wrangler service name is `minho-knowledge-api`. The retired Talent Radar
`/search` endpoint and GitHub search token are not part of this service; other
non-Knowledge paths return 404. Existing D1, Workflow, authentication, AI budget,
and disabled-by-default generation settings are preserved.

## What runs without AI

The paper workflow normalizes terminology IDs, resolves the known alias map, records every bilingual term and its paper/source context in `knowledge_term_index` and `paper_term_index`, and links papers to existing Briefs. It never waits for Brief generation. Missing Briefs remain in the queue with the reviewed paper event cached. Static Knowledge pages show indexed terms separately from published Briefs. The local LayerEditor sample reuses its reviewed article and indexes all five terms; it does not call an AI model.

One-Pager PDF/DOCX files are rendered from the saved Knowledge JSON. Re-downloading them does not invoke a model. Existing review and Highlighted Paper history remains keyed by canonical arXiv ID. A new Landmark candidate/deep-evaluation pipeline and saved Library/history UI are not implemented yet.

## Cloud setup

1. Install Worker dependencies from `worker/` with `npm install`.
2. Create a D1 database with `npx wrangler d1 create minho-knowledge-registry` and put its ID in `worker/wrangler.toml`.
3. Apply the migration with `npx wrangler d1 migrations apply KNOWLEDGE_DB --remote`.
4. Set `KNOWLEDGE_INGEST_TOKEN` as a Cloudflare secret and deploy with `npm run deploy` from `worker/`.
5. Set the GitHub repository variable `KNOWLEDGE_API_URL` and secret `KNOWLEDGE_INGEST_TOKEN`; set `NEXT_PUBLIC_KNOWLEDGE_API_URL` for the Pages build. The token must never be placed in the frontend.
6. Optionally seed static published Briefs with `KNOWLEDGE_API_URL=... KNOWLEDGE_INGEST_TOKEN=... npm run knowledge:seed-cloud`.

The schema migration has not been applied because this workspace has no real D1 database ID or Cloudflare deployment credentials. Review the schema before applying it to a live database.

## AI and budget controls

AI generation is disabled by default (`KNOWLEDGE_AI_ENABLED=false`). A missing/disabled model binding, zero monthly budget, or zero per-Brief reserve prevents inference while term indexing continues. To opt in later, explicitly configure all of the following in the Worker environment:

```toml
KNOWLEDGE_AI_ENABLED = "true"
KNOWLEDGE_WEEKLY_MAX_NEW_BRIEFS = "2"
KNOWLEDGE_MONTHLY_AI_BUDGET_USD = "1.00"
KNOWLEDGE_MAX_BRIEF_COST_USD = "0.10"
KNOWLEDGE_MAX_RETRIES = "3"
```

The admin-only `POST /knowledge/generate` endpoint selects the highest-ranked queued candidate and starts a separate Workflow. It runs one candidate per call; the Worker enforces the weekly and monthly reservations. The monthly guard reserves the configured maximum per Brief before a call, counts the reservation against the monthly allowance, then records provider usage and reported token counts when available. If usage or per-token rates are unavailable, the reservation is treated as spent for budgeting and actual cost remains unknown. The reservation is a conservative application guard, not a guaranteed provider invoice cap; verify the provider's current pricing and configure a reserve that covers your chosen model and output limit. No setting is turned on by this repository change.

`KNOWLEDGE_MODEL_STANDARD` selects the Technical Brief model; the existing `KNOWLEDGE_MODEL` remains a compatibility fallback. Optional lightweight/deep profile variables are reserved for future task types; those workflows are not currently implemented.

`GET /knowledge/ledger` requires the ingestion bearer token. It records the model, workflow, estimated and provider-reported tokens, cached input tokens if returned, estimated/actual cost where calculable, retry count, and status. Estimated tokens are kept separate from provider-reported usage. Cloudflare Workers AI returns a `usage` object when available; cached-token reporting depends on the selected model/runtime. See [Cloudflare Workers AI run response](https://developers.cloudflare.com/api/resources/ai/methods/run/) and [prompt caching](https://developers.cloudflare.com/workers-ai/features/prompt-caching/).

## Limits and remaining work

- Technical Brief generation is capped at one Brief per paper event and two per UTC week by default. Candidates beyond the cap remain queued; no separate generation cron is installed.
- Failed dispatch retries are bounded by `KNOWLEDGE_MAX_RETRIES` (three retries after the first attempt by default).
- This is not a full daily/weekly/monthly ingestion system. Current automated dispatch only reacts to reviewed paper Markdown changes; the daily sample content is stored in the repository.
- Citation candidate collection, Landmark scoring/history, deep-analysis quotas, and the Library UI still need implementation.
- Worker and D1 cost is separate from ChatGPT Plus. The repository does not read or estimate the user's remaining Plus allowance.
