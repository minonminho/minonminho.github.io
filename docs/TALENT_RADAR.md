# Talent Radar

AI-powered Talent Sourcing & Intelligence Demo

## Problem

Small high-performance organizations do not need thousands of applicants. They need to identify a small number of unusually strong candidates who may be missed by traditional keyword-based sourcing.

For a small HR team, the bottleneck is finding high-signal evidence quickly and making a well-reasoned recruiter decision without sending every raw profile to a model.

## Product Concept

Talent Radar discovers potential candidates from public professional signals and ranks them based on role fit.

Primary sourcing concepts:

- GitHub
- Public web results
- Technical blogs
- Conference speakers
- Open-source communities

Phase 2 uses repository-centered GitHub discovery with public API data. The page also preserves a clearly labeled fictional demo mode. There is no LinkedIn scraping, browser automation, or Google scraping.

## Core Flow

```text
JD / Role Definition
        |
Search Strategy
        |
Candidate Discovery
        |
Rule-based Pre-filter
        |
Compact Candidate Profile
        |
AI Fit Scoring (Phase 3)
        |
Top Candidate Deep Analysis (Phase 3)
        |
Recruiter Decision
```

## Token Efficiency Principle

Do not use LLMs for everything. Deterministic discovery, filtering, and compression happen first. Phase 2 makes zero LLM calls.

The intended funnel is:

```text
1,000 discovered
        |
120 pass rule-based filtering
        |
20 receive compact-profile enrichment
        |
5 receive deep analysis in a future phase
```

| Stage | AI usage |
| --- | --- |
| Discovery | No LLM |
| Rule Filter | No LLM |
| Candidate Compression | No LLM |
| Fit Scoring | Phase 3 lightweight/small AI model |
| Deep Analysis | Phase 3 strong model for finalists only |

## Design Principles

- Public-source only
- Evidence-based recommendation
- Explainable scoring
- Token-efficient AI
- Human-in-the-loop
- No automated hiring decision
- No protected-attribute inference
- GitHub activity is a sourcing signal, not proof of hiring suitability

## Static Site and External API Architecture

```text
GitHub Repository
        |
        +--> Static Next.js UI
        |       |
        |       +--> npm run build -> out/ -> GitHub Pages
        |
        +--> worker/
                |
                +--> Cloudflare Worker: POST /search
                        |
                        +--> GitHub REST API
```

The static resume site and Talent Radar API are separate deployment concerns:

```text
GitHub Pages
Static Next.js UI
      |
      +-- Cross-Origin API Request --> Cloudflare Worker
                                        |
                                        +--> GitHub REST API
```

GitHub Pages cannot execute Next.js Route Handlers, so the Next API route was removed. The Worker keeps `GITHUB_TOKEN` server-side while allowing the resume website to remain a free, simple static deployment.

The root `next.config.ts` keeps `output: "export"`, and the existing Pages workflow continues to build and upload `out/`. The public API URL is injected at build time through the GitHub Actions repository variable `TALENT_RADAR_API_URL`. If that variable is missing, the browser explicitly falls back to Demo Data.

## Phase 2 Experience

The `/lab/talent-radar` route contains:

1. A role definition field defaulted to `Trading Platform Engineer` with optional tags.
2. `Live GitHub Search`, which calls `NEXT_PUBLIC_TALENT_RADAR_API_URL + "/search"`.
3. `Demo Data`, which runs the existing fictional local pipeline without network access.
4. A funnel showing repositories, contributors, deduplication, enrichment, rule filtering, and returned candidates.
5. GitHub candidate cards with avatar, username, location, company, languages, domain signals, evidence, rule score, and a public profile link.
6. A candidate detail panel with observable signals, concerns, repository evidence, and `Why not this candidate?`.
7. An `AI Cost Strategy` panel. Live Phase 2 results show zero LLM calls and prepare compact profiles for a future reasoning layer.

When the live API URL is absent or the Worker is unavailable, the page does not pretend that demo results are live. It reports the issue or explicitly switches to Demo Data.

## External API Contract

The Worker exposes:

```text
POST /search
```

Request:

```json
{
  "role": "Trading Platform Engineer",
  "tags": ["Python", "Rust"]
}
```

The `tags` property is optional for direct API clients. Response:

```ts
{
  candidates: CompactCandidateProfile[];
  metrics: TalentSearchMetrics;
  warning?: string;
  error?: string;
}
```

The API returns only normalized compact profiles, never raw GitHub JSON.

## Shared Lightweight Architecture

The Worker imports the reusable source, query mapping, ecosystem allowlist, GitHub API client, rules, and domain types from `src/lib/talentRadar`. The Worker supplies the runtime-specific token, fetch, CORS, and cache boundary. No Next.js API Route Handler is used.

```text
Browser
  |
Cloudflare Worker /search
  |
GitHubTalentSource
  |
Curated repository contributors
  |
Noise filter and deduplication
  |
GitHub profile enrichment (bounded)
  |
CompactCandidateProfile
  |
Deterministic rule score
  |
JSON response
```

### Source abstraction

`src/lib/talentRadar/types.ts` defines `TalentSource`. `MockTalentSource` remains available to the static UI, and `GitHubTalentSource` adds a detailed result with funnel metrics and compact profiles. The Worker is the only runtime that imports the GitHub source.

The source uses a curated ecosystem allowlist. A role such as `Trading Platform Engineer` selects `trading-infrastructure`, which currently scans a bounded set of public repositories including `hummingbot/hummingbot`, `freqtrade/freqtrade`, and `ccxt/ccxt`. Free text only selects among configured ecosystems; it cannot become an arbitrary GitHub URL or API path.

### Request budget and caching

```ts
const TALENT_RADAR_LIMITS = {
  maxRepositories: 3,
  contributorsPerRepository: 25,
  maxUniqueCandidates: 50,
  maxEnrichedCandidates: 20,
  maxResults: 10,
};
```

The typical request performs three repository requests, three contributor requests, and up to two bounded requests per enriched user: one profile and one recent public repository listing. The Worker keeps a best-effort 15-minute in-memory cache per isolate, capped at 32 search keys. Repeated requests may be served without new GitHub calls; the cache is intentionally not a durable database.

### Compact candidate profile

The future reasoning boundary receives only this normalized structure:

```ts
type CompactCandidateProfile = {
  id: string;
  source: "github";
  name: string;
  username: string;
  headline?: string;
  company?: string;
  location?: string;
  profileUrl: string;
  primaryLanguages: string[];
  domainSignals: string[];
  repositorySignals: {
    name: string;
    description?: string;
    language?: string;
    stars?: number;
  }[];
  activitySignals: {
    publicRepos: number;
    followers: number;
    recentActivity: boolean;
  };
  ruleScore: number;
  ruleReasons?: string[];
  evidence: string[];
};
```

### Deterministic GitHub scoring

`src/lib/talentRadar/github/rules.ts` detects case-insensitive trading, crypto, and infrastructure keywords in public repository metadata and bios. It counts repository languages and awards transparent points for relevant languages, multiple relevant repositories, target-repository contribution, domain signals, and recent activity. Scores are capped at 100 and return reason codes such as `TRADING_SIGNAL` and `TARGET_REPO_CONTRIBUTOR`.

Bots, automation accounts, missing-logins, and contributor records without public profile links are removed before profile enrichment. Failed repositories or individual user lookups do not discard successful results.

## Environment and Local Development

Static Next.js site:

```text
NEXT_PUBLIC_TALENT_RADAR_API_URL=http://localhost:8787
```

Worker local variables belong in the uncommitted `worker/.dev.vars` file. Start the Worker in one terminal:

```bash
cd worker
npm install
copy .dev.vars.example .dev.vars  # Windows
npm run dev
```

Start the static site's dev server in another terminal with `NEXT_PUBLIC_TALENT_RADAR_API_URL=http://localhost:8787` in the root `.env.local`:

```bash
npm run dev
```

For deployment, authenticate Wrangler and add the server-side secret without committing it:

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npm run deploy
```

Then set the GitHub repository variable `TALENT_RADAR_API_URL` to the deployed Worker URL. The existing GitHub Pages workflow passes that value to the static build.

## Security and CORS

- `GITHUB_TOKEN` exists only as a Cloudflare Worker secret or local `worker/.dev.vars` value.
- The static site receives only the public Worker URL; it never receives the GitHub token.
- The Worker allows `https://minonminho.github.io` and `http://localhost:3000` by default and handles `OPTIONS` preflight requests.
- Arbitrary GitHub URLs are not accepted; user input selects from a predefined ecosystem allowlist.
- API logs contain counts, status, and cache events, never tokens or raw candidate JSON.

## Phase 3 Integration Point

```text
CompactCandidateProfile[]
        |
Lightweight LLM scoring
        |
Top candidates
        |
Deep analysis
```

The implementation boundary remains `src/lib/talentRadar/aiScoring.ts`. It remains a simulated adapter for the fictional Demo Data mode only; no AI SDK or provider is installed in Phase 2.

## Non-goals

- Full ATS or recruiting platform
- LinkedIn scraping
- Browser automation
- Google scraping
- OpenAI, Anthropic, Gemini, embeddings, or vector databases
- Automated outreach or hiring decisions
- Protected-attribute inference
- Downloading source code, READMEs, or commit histories
