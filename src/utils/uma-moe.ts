import { config } from "../config";

export const UMA_MOE_BASE_URL = "https://uma.moe/";

export interface UmaMoeFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
}

export interface UmaMoeResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  headers: Headers;
}

export async function umaMoeFetch<T = unknown>(
  endpoint: string,
  options: UmaMoeFetchOptions = {},
): Promise<UmaMoeResponse<T>> {
  const { params, headers, ...init } = options;
  const apiKey = config.umaMoeApiKey || process.env.UMA_MOE_API_KEY || "";

  const url = new URL(endpoint.replace(/^\/+/, ""), UMA_MOE_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const reqHeaders = new Headers(headers);
  if (apiKey) {
    reqHeaders.set("X-Api-Key", apiKey);
  }
  if (!reqHeaders.has("Accept")) {
    reqHeaders.set("Accept", "application/json");
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: reqHeaders,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? ((await response.json()) as T)
    : ((await response.text()) as unknown as T);

  return {
    status: response.status,
    ok: response.ok,
    data,
    headers: response.headers,
  };
}
