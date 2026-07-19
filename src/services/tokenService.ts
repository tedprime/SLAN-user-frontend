import type { AuthTokenResponse } from "./types/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// ── Cookie Helpers (native, no dependency) ───────────────────────────────

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict${secure}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

// ── Token Service ─────────────────────────────────────────────────────────

export function setAccessToken(accessToken: string): void {
  setCookie(ACCESS_TOKEN_KEY, accessToken, 1); // 1 day
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function setTokens(
  tokens: Pick<AuthTokenResponse["data"], "accessToken" | "refreshToken">
): void {
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, 1);   // 1 day
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, 7);  // 7 days
}

// Some backend responses (notably Google OAuth) send `name` instead of
// `fullName`. Every caller (App.tsx's query-param handler, GoogleCompletePage,
// authService, etc.) funnels through here, so normalizing once in this one
// place guarantees `fullName` is always populated no matter which caller
// or code path stored the user.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeUser(user: any): AuthTokenResponse["data"]["user"] {
  return {
    id: user?.id ?? "",
    fullName: user?.fullName || user?.name || "User",
    email: user?.email ?? "",
    role: user?.role ?? "teacher",
  };
}

export function setUser(user: AuthTokenResponse["data"]["user"]): void {
  setCookie(USER_KEY, JSON.stringify(normalizeUser(user)), 7); // 7 days
}

export function getUser(): AuthTokenResponse["data"]["user"] | null {
  try {
    const raw = getCookie(USER_KEY);
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
  deleteCookie(USER_KEY);
}
