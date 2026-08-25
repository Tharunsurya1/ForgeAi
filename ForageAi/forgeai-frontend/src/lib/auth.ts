import { TokenResponse, User } from "@/types";

const ACCESS_TOKEN_KEY = "forgeai_access_token";
const REFRESH_TOKEN_KEY = "forgeai_refresh_token";
const USER_KEY = "forgeai_user";

export const authStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setUser(user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setAuth(data: TokenResponse) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
