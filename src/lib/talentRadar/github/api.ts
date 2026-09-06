const GITHUB_API_BASE = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 8_000;

export type GitHubClientOptions = {
  token?: string;
  fetcher?: typeof fetch;
  cacheSeconds?: number;
};

export type GitHubRepositoryResponse = {
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
  topics?: string[];
};

export type GitHubContributorResponse = {
  login?: string;
  type?: string;
  contributions?: number;
  avatar_url?: string;
  html_url?: string;
};

export type GitHubUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
};

export class GitHubApiError extends Error {
  readonly status: number;
  readonly rateLimited: boolean;

  constructor(message: string, status: number, rateLimited = false) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.rateLimited = rateLimited;
  }
}

function encodePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export class GitHubClient {
  private readonly token?: string;
  private readonly fetcher: typeof fetch;
  private readonly cacheSeconds: number;
  private requestCount = 0;

  constructor(options: GitHubClientOptions = {}) {
    this.token = options.token?.trim() || undefined;
    this.fetcher = options.fetcher ?? fetch;
    this.cacheSeconds = options.cacheSeconds ?? 0;
  }

  get hasToken() {
    return Boolean(this.token);
  }

  get requestsPerformed() {
    return this.requestCount;
  }

  async getRepository(fullName: string) {
    return this.get<GitHubRepositoryResponse>(`/repos/${encodePath(fullName)}`);
  }

  async getContributors(fullName: string, limit: number) {
    return this.get<GitHubContributorResponse[]>(
      `/repos/${encodePath(fullName)}/contributors?per_page=${limit}&anon=false`,
    );
  }

  async getUser(login: string) {
    return this.get<GitHubUserResponse>(`/users/${encodeURIComponent(login)}`);
  }

  async getUserRepositories(login: string, limit: number) {
    return this.get<GitHubRepositoryResponse[]>(
      `/users/${encodeURIComponent(login)}/repos?type=public&sort=updated&per_page=${limit}`,
    );
  }

  private async get<T>(path: string): Promise<T> {
    this.requestCount += 1;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      const requestInit: RequestInit & { next?: { revalidate: number } } = {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      };
      if (this.cacheSeconds > 0) {
        requestInit.next = { revalidate: this.cacheSeconds };
      }
      response = await this.fetcher(`${GITHUB_API_BASE}${path}`, requestInit);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      throw new GitHubApiError(`GitHub request failed: ${message}`, 502);
    }

    const remaining = response.headers.get("x-ratelimit-remaining");
    const rateLimited =
      response.status === 429 ||
      (response.status === 403 && remaining === "0");

    if (rateLimited) {
      console.warn("[talent-radar] GitHub rate limit", {
        remaining,
        reset: response.headers.get("x-ratelimit-reset"),
      });
    }

    if (!response.ok) {
      throw new GitHubApiError(
        rateLimited
          ? "GitHub API rate limit reached."
          : `GitHub API returned status ${response.status}.`,
        response.status,
        rateLimited,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new GitHubApiError("GitHub API returned malformed data.", 502);
    }
  }
}
