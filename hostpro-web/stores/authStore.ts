import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  setAuth: (user: User, access: string, refresh: string, tenantId: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      setAuth: (user, accessToken, refreshToken, tenantId) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);
          localStorage.setItem("tenant_id", tenantId);
        }
        set({ user, accessToken, refreshToken, tenantId });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("tenant_id");
        }
        set({ user: null, accessToken: null, refreshToken: null, tenantId: null });
      },
      isAuthenticated: () => !!get().accessToken,
    }),
    { name: "hostpro-auth", partialize: (s) => ({ user: s.user, tenantId: s.tenantId }) }
  )
);
