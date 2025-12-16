let accessToken: string | null = null;

const STORAGE_KEY = "zmanculator_access_token";

export function loadAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  accessToken = stored;
  return accessToken;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  if (token) {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}




