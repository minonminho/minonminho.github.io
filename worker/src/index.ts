import { parseTalentSearchQuery } from "../../src/lib/talentRadar/query";
import {
  GitHubApiError,
  GitHubTalentSource,
} from "../../src/lib/talentRadar/sources/github";
import type {
  CompactCandidateProfile,
  TalentRadarApiResponse,
  TalentSearchMetrics,
} from "../../src/lib/talentRadar/types";

type Env = {
  GITHUB_TOKEN?: string;
  ALLOWED_ORIGINS?: string;
};

type CacheEntry = {
  expiresAt: number;
  value: TalentRadarApiResponse;
};

const DEFAULT_ALLOWED_ORIGINS = [
  "https://minonminho.github.io",
  "http://localhost:3000",
];
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 32;
const searchCache = new Map<string, CacheEntry>();
const EMPTY_METRICS: TalentSearchMetrics = {
  repositoriesScanned: 0,
  contributorsDiscovered: 0,
  uniqueCandidates: 0,
  candidatesAfterRules: 0,
  enrichedCandidates: 0,
  returnedCandidates: 0,
};

function allowedOrigins(env: Env) {
  return new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...(env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);
}

function isAllowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  return !origin || allowedOrigins(env).has(origin);
}

function corsHeaders(request: Request, env: Env) {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  });
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins(env).has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}

function json(
  value: unknown,
  request: Request,
  env: Env,
  status = 200,
) {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(value), { status, headers });
}

function cacheKey(query: { role: string; tags: readonly string[] }) {
  return JSON.stringify({ role: query.role, tags: [...query.tags].sort() });
}

function getCached(key: string) {
  const entry = searchCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCached(key: string, value: TalentRadarApiResponse) {
  if (searchCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

async function handleSearch(request: Request, env: Env) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, request, env, 400);
  }

  const query = parseTalentSearchQuery(body);
  if (!query) {
    return json(
      { error: "Provide a role and an optional array of tags." },
      request,
      env,
      400,
    );
  }

  const key = cacheKey(query);
  const cached = getCached(key);
  if (cached) {
    console.info("[talent-radar-worker] cache hit", { role: query.role });
    return json(cached, request, env);
  }
  console.info("[talent-radar-worker] cache miss", { role: query.role });

  try {
    const result = await new GitHubTalentSource({
      token: env.GITHUB_TOKEN,
      fetcher: fetch,
      cacheSeconds: 0,
    }).searchDetailed(query);
    const response: TalentRadarApiResponse = {
      candidates: result.compactProfiles as readonly CompactCandidateProfile[],
      metrics: result.metrics,
      ...(result.warning ? { warning: result.warning } : {}),
    };
    setCached(key, response);
    console.info("[talent-radar-worker] search complete", {
      repositoriesScanned: result.metrics.repositoriesScanned,
      contributorsDiscovered: result.metrics.contributorsDiscovered,
      enrichedCandidates: result.metrics.enrichedCandidates,
      returnedCandidates: result.metrics.returnedCandidates,
    });
    return json(response, request, env);
  } catch (error) {
    const rateLimited = error instanceof GitHubApiError && error.rateLimited;
    const message = rateLimited
      ? "GitHub API rate limit reached. Try again later or configure the Worker GITHUB_TOKEN secret."
      : error instanceof GitHubApiError
        ? error.message
        : "GitHub search is temporarily unavailable.";
    console.error("[talent-radar-worker] search failed", {
      message,
      status: error instanceof GitHubApiError ? error.status : undefined,
    });
    return json(
      {
        candidates: [],
        metrics: EMPTY_METRICS,
        error: message,
      },
      request,
      env,
      rateLimited ? 429 : 502,
    );
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/search" && url.pathname !== "/search/") {
      return json({ error: "Not found." }, request, env, 404);
    }

    if (!isAllowedOrigin(request, env)) {
      return new Response("Origin not allowed.", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, request, env, 405);
    }

    return handleSearch(request, env);
  },
};

export default worker satisfies {
  fetch(request: Request, env: Env): Promise<Response>;
};
