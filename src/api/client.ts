const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiAuthToken = (import.meta.env.VITE_API_AUTH_TOKEN ?? "").trim();

function createApiUrl(endpoint: string) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${apiBaseUrl}${normalizedEndpoint}`;
}

function createAuthorizationValue(token: string) {
  return token.toLowerCase().startsWith("bearer ")
    ? token
    : `Bearer ${token}`;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (apiAuthToken && !headers.has("Authorization")) {
    headers.set("Authorization", createAuthorizationValue(apiAuthToken));
  }

  const response = await fetch(createApiUrl(endpoint), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}).`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

