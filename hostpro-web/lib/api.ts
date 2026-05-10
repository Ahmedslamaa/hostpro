import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
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
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem("access_token", res.data.access_token);
          localStorage.setItem("refresh_token", res.data.refresh_token);
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Properties
export const propertiesApi = {
  list: (params?: any) => api.get("/properties", { params }),
  get: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post("/properties", data),
  update: (id: string, data: any) => api.patch(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  listOwners: () => api.get("/properties/owners/list"),
  createOwner: (data: any) => api.post("/properties/owners", data),
};

// Reservations
export const reservationsApi = {
  list: (params?: any) => api.get("/reservations", { params }),
  get: (id: string) => api.get(`/reservations/${id}`),
  create: (data: any) => api.post("/reservations", data),
  update: (id: string, data: any) => api.patch(`/reservations/${id}`, data),
  checkin: (id: string) => api.post(`/reservations/${id}/checkin`),
  checkout: (id: string) => api.post(`/reservations/${id}/checkout`),
  listGuests: () => api.get("/reservations/guests/list"),
};

// Calendar
export const calendarApi = {
  get: (params: { start: string; end: string; property_ids?: string }) => api.get("/calendar", { params }),
  block: (data: any) => api.post("/calendar/block", data),
  deleteEvent: (id: string) => api.delete(`/calendar/events/${id}`),
  createFeed: (data: any) => api.post("/calendar/ical-feeds", data),
  syncFeed: (id: string) => api.post(`/calendar/ical-feeds/${id}/sync`),
};

// Tasks
export const tasksApi = {
  list: (params?: any) => api.get("/tasks", { params }),
  get: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post("/tasks", data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  complete: (id: string) => api.post(`/tasks/${id}/complete`),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Messages
export const messagesApi = {
  listThreads: (params?: any) => api.get("/messages/threads", { params }),
  getThread: (id: string) => api.get(`/messages/threads/${id}`),
  createThread: (data: any) => api.post("/messages/threads", data),
  sendMessage: (threadId: string, data: any) => api.post(`/messages/threads/${threadId}/messages`, data),
  listTemplates: () => api.get("/messages/templates"),
  createTemplate: (data: any) => api.post("/messages/templates", data),
};

// Compliance
export const complianceApi = {
  list: () => api.get("/compliance"),
  get: (propertyId: string) => api.get(`/compliance/${propertyId}`),
  update: (propertyId: string, data: any) => api.patch(`/compliance/${propertyId}`, data),
  nuitees: (propertyId: string, year?: number) => api.get(`/compliance/${propertyId}/nuitees`, { params: { year } }),
  alerts: () => api.get("/compliance/alerts"),
};

// Dashboard
export const dashboardApi = {
  kpis: (period?: string) => api.get("/dashboard/kpis", { params: { period } }),
  upcoming: (days?: number) => api.get("/dashboard/upcoming", { params: { days } }),
  alerts: () => api.get("/dashboard/alerts"),
  revenue: (months?: number) => api.get("/dashboard/revenue", { params: { months } }),
};

// Team
export const teamApi = {
  list: () => api.get("/team"),
  invite: (data: any) => api.post("/team/invite", data),
  updateRole: (memberId: string, role: string) => api.patch(`/team/${memberId}/role`, { role }),
  remove: (memberId: string) => api.delete(`/team/${memberId}`),
};

// Profile
export const profileApi = {
  update: (data: any) => api.patch("/auth/profile", data),
  changePassword: (data: any) => api.post("/auth/change-password", data),
};
