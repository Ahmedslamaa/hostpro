import axios from "axios";

// Toutes les routes API sont désormais des routes Next.js — pas de backend externe
const BASE = "/api/v1";

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    const tenantId = localStorage.getItem("tenant_id");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers["X-Tenant-Id"] = tenantId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      try {
        const res = await axios.post("/api/v1/auth/refresh");
        const { access_token, refresh_token } = res.data;
        if (access_token) {
          localStorage.setItem("access_token", access_token);
          if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api.request(error.config);
        }
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get("/auth/me"),
  update: (data: any) => api.patch("/auth/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/auth/change-password", data),
};

// ── Properties ────────────────────────────────────────────────────────────────
export const propertiesApi = {
  list: (params?: any) => api.get("/properties", { params }),
  get: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post("/properties", data),
  update: (id: string, data: any) => api.patch(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};

// ── Reservations ──────────────────────────────────────────────────────────────
export const reservationsApi = {
  list: (params?: any) => api.get("/reservations", { params }),
  get: (id: string) => api.get(`/reservations/${id}`),
  create: (data: any) => api.post("/reservations", data),
  update: (id: string, data: any) => api.patch(`/reservations/${id}`, data),
  delete: (id: string) => api.delete(`/reservations/${id}`),
  checkin: (id: string) => api.post(`/reservations/${id}/checkin`),
  checkout: (id: string) => api.post(`/reservations/${id}/checkout`),
};

// ── Calendar ──────────────────────────────────────────────────────────────────
export const calendarApi = {
  get: (params: { start: string; end: string; property_ids?: string }) =>
    api.get("/calendar", { params }),
  block: (data: any) => api.post("/calendar/block", data),
  createFeed: (data: any) => api.post("/ical/feeds", { ...data, url: data.feed_url ?? data.url }),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: any) => api.get("/tasks", { params }),
  get: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post("/tasks", data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  complete: (id: string) => api.post(`/tasks/${id}/complete`),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  listThreads: (params?: any) => api.get("/messages/threads", { params }),
  getThread: (id: string) => api.get(`/messages/threads/${id}`),
  createThread: (data: any) => api.post("/messages/threads", data),
  sendMessage: (threadId: string, data: any) =>
    api.post(`/messages/threads/${threadId}/messages`, data),
  // Message templates (stored locally for now)
  listTemplates: () => Promise.resolve({ data: [] as any[] }),
  createTemplate: (_data: any) => Promise.resolve({ data: {} }),
};

// ── Compliance ────────────────────────────────────────────────────────────────
export const complianceApi = {
  list: () => api.get("/compliance"),
  get: (propertyId: string) => api.get(`/compliance/${propertyId}`),
  update: (propertyId: string, data: any) => api.patch(`/compliance/${propertyId}`, data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  kpis: (period?: string) => api.get("/dashboard/kpis", { params: { period } }),
  upcoming: (days?: number) => api.get("/dashboard/upcoming", { params: { days } }),
  alerts: () => api.get("/dashboard/alerts"),
  revenue: (months?: number) => api.get("/dashboard/revenue", { params: { months } }),
};

// ── Team ──────────────────────────────────────────────────────────────────────
export const teamApi = {
  list: () => api.get("/team"),
  invite: (data: any) => api.post("/team/invite", data),
  updateRole: (memberId: string, role: string) =>
    api.patch(`/team/${memberId}/role`, { role }),
  remove: (memberId: string) => api.delete(`/team/${memberId}`),
};

// ── iCal / Intégrations ───────────────────────────────────────────────────────
export const syncApi = {
  listFeeds: (propertyId?: string) =>
    api.get("/ical/feeds", { params: propertyId ? { property_id: propertyId } : {} }),
  createFeed: (data: { property_id: string; platform: string; url: string; direction?: string }) =>
    api.post("/ical/feeds", data),
  deleteFeed: (feedId: string) => api.delete(`/ical/feeds/${feedId}`),
  syncFeed: (feedId: string) => api.post(`/ical/feeds/${feedId}/sync`),
  syncAll: () => api.post("/ical/sync-all"),
  exportUrl: (propertyId: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/ical/export/${propertyId}`,
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (messages: { role: string; content: string }[], context?: string) =>
    api.post("/ai/chat", { messages, context }),
};

// ── Notifications ──────────────────────────────────────────────────────────────
export const notificationsApi = {
  subscribe: (subscription: PushSubscriptionJSON) =>
    api.post("/notifications/subscribe", subscription),
  getVapidKey: () => api.get("/notifications/vapid-key"),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadApi = {
  photo: (propertyId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("property_id", propertyId);
    return api.post("/upload/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ── withMock helper (fallback démo si API non disponible) ─────────────────────
export async function withMock<T>(
  apiFn: () => Promise<{ data: T }>,
  mockData: T
): Promise<T> {
  try {
    const res = await apiFn();
    return res.data ?? mockData;
  } catch {
    return mockData;
  }
}
