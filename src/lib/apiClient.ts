import { API_BASE_URL } from "./config";
import { getAccessToken } from "./auth/tokenStore";

export type ApiError = {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
};

async function parseError(response: Response): Promise<ApiError> {
  let message = response.statusText || "Request failed";
  let fieldErrors: Record<string, string> | undefined;

  try {
    const data = (await response.json()) as any;
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (data?.detail && typeof data.detail === "object") {
      if (typeof data.detail.message === "string") {
        message = data.detail.message;
      }
      if (data.detail.field_errors && typeof data.detail.field_errors === "object") {
        fieldErrors = data.detail.field_errors as Record<string, string>;
      }
    }
  } catch {
    // ignore JSON parse errors, use default message
  }

  return {
    status: response.status,
    message,
    fieldErrors,
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  // Don't override Content-Type if it's already set (for FormData, URLSearchParams, or form-urlencoded)
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token and redirect to login
      const { setAccessToken } = await import("./auth/tokenStore");
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    throw await parseError(response);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}











