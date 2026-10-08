const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

const ACCESS_TOKEN_KEY = "labtracker-access-token";
const REFRESH_TOKEN_KEY = "labtracker-refresh-token";

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function saveTokens(tokens: TokenPair) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

async function readError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { detail?: string | Array<{ msg?: string }> }
    | null;
  if (typeof data?.detail === "string") {
    return data.detail;
  }
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join("; ");
  }
  return "Не удалось выполнить запрос";
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) {
    clearTokens();
    return false;
  }

  saveTokens((await response.json()) as TokenPair);
  return true;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retryAfterRefresh = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retryAfterRefresh && (await refreshAccessToken())) {
    return apiRequest<T>(path, options, false);
  }
  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
