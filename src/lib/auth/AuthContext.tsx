"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loadAccessTokenFromStorage, setAccessToken } from "./tokenStore";
import { apiFetch, type ApiError } from "../apiClient";

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from storage on mount
    const initial = loadAccessTokenFromStorage();
    setAccessTokenState(initial);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);

    try {
      const token = await apiFetch<TokenResponse>("/auth/login", {
        method: "POST",
        body: body.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setAccessToken(token.access_token);
      setAccessTokenState(token.access_token);
    } catch (error) {
      throw error as ApiError;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setAccessTokenState(null);
    if (typeof window !== "undefined") {
      // Simple non-locale redirect to login page
      window.location.href = "/auth/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: accessTokenState,
        isAuthenticated: Boolean(accessTokenState),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}





