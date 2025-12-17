let accessToken: string | null = null;

const STORAGE_KEY = "zmanculator_access_token";

export function loadAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    accessToken = stored;
    return accessToken;
  } catch (error) {
    console.error("Failed to load token from storage:", error);
    return null;
  }
}

export function getAccessToken(): string | null {
  // Always check storage in case token was updated elsewhere
  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored !== accessToken) {
      accessToken = stored;
    }
  }
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to save token to storage:", error);
  }
}





