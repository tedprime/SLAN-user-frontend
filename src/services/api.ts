import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  token?: string;
  /** Internal — marks a call as already-retried, so we never refresh twice for one request. */
  _isRetry?: boolean;
}

// Shared across concurrent requests so two 401s at once don't trigger two refresh calls.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn("[Auth] No refresh token found — user is logged out.");
    return null;
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        console.log("[Auth] Attempting token refresh...");
        const response = await fetch(`${BASE_URL}/auth/token/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[Auth] Refresh failed:", response.status, errorData);
          return null;
        }

        const data = await response.json();
        // Handle both shapes: { accessToken } and { data: { accessToken } }
        const newAccessToken = data?.accessToken ?? data?.data?.accessToken;

        if (!newAccessToken) {
          console.error("[Auth] Refresh response missing accessToken:", data);
          return null;
        }

        console.log("[Auth] Token refreshed successfully.");
        setAccessToken(newAccessToken);
        return newAccessToken;
      } catch (err) {
        console.error("[Auth] Refresh network error:", err);
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token, _isRetry = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const resolvedToken = token ?? getAccessToken();
  if (resolvedToken) {
    headers["Authorization"] = `Bearer ${resolvedToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    // One silent refresh-and-retry per request. Never for the refresh
    // endpoint itself, never twice, and never for requests that had no
    // token to begin with (those 401s aren't a stale-token problem).
    if (response.status === 401 && !_isRetry && resolvedToken && endpoint !== "/auth/token/refresh") {
      console.warn(`[Auth] 401 on ${endpoint} — attempting silent refresh...`);
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        console.log(`[Auth] Retry ${endpoint} with new token.`);
        return apiRequest<T>(endpoint, { ...options, token: newAccessToken, _isRetry: true });
      }
      // Refresh token is also dead — this really is a logged-out session.
      console.error("[Auth] Refresh failed — clearing session and redirecting to login.");
      clearTokens();
      window.location.href = "/login";
    }

    console.error("API Error:", data);
    throw {
      ...(typeof data === "object" && data !== null ? data : {}),
      status: response.status,
    };
  }

  return data as T;
}