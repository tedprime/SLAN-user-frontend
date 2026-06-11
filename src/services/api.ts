import { getAccessToken } from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

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
    console.error("API Error:", data);
    throw data;
  }

  return data as T;
}