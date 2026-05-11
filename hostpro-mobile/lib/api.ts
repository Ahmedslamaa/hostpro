import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "https://app.hostpro.fr";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Intercepteur : injecter le token ─────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Intercepteur : refresh automatique ──────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const { access_token } = res.data;
        await SecureStore.setItemAsync("access_token", access_token);
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        // Refresh échoué — déconnecter
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        // L'app redirigera vers login via le store
      }
    }
    return Promise.reject(error);
  }
);

// ── Endpoints ────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
};

export const dashboardApi = {
  kpis: (period = "month") => api.get(`/api/dashboard/kpis?period=${period}`),
  upcoming: (days = 14) => api.get(`/api/dashboard/upcoming?days=${days}`),
  alerts: () => api.get("/api/dashboard/alerts"),
};

export const propertiesApi = {
  list: () => api.get("/api/properties"),
  get: (id: string) => api.get(`/api/properties/${id}`),
};

export const reservationsApi = {
  list: (params?: any) => api.get("/api/reservations", { params }),
  get: (id: string) => api.get(`/api/reservations/${id}`),
};

export const tasksApi = {
  list: (params?: any) => api.get("/api/tasks", { params }),
};
