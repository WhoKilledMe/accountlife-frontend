import axios from "axios";

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "/api";

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// Add simple timing instrumentation
http.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: performance.now() };
  // attach required headers
  config.headers = config.headers || {};
  // attach auth token if exists
  try {
    const token = localStorage.getItem("token");
    if (token) {
      (config.headers as any)["token"] = `${token}`;
      //(config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  } catch (_) {
    // SSR or storage not available
  }
  return config;
});

http.interceptors.response.use(
  (resp) => {
    const start = (resp.config as any)?.metadata?.startTime ?? performance.now();
    const durationMs = Math.max(0, performance.now() - start);
    const url = `${resp.config?.baseURL || ""}${resp.config?.url || ""}`;
    // eslint-disable-next-line no-console
    console.log(`HTTP ${resp.status} ${resp.config?.method?.toUpperCase()} ${url} in ${durationMs.toFixed(0)}ms`);
    return resp;
  },
  (error) => {
    try {
      const start = (error.config as any)?.metadata?.startTime ?? performance.now();
      const durationMs = Math.max(0, performance.now() - start);
      const url = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
      const status = error.response?.status ?? "ERR";
      // eslint-disable-next-line no-console
      console.warn(`HTTP ${status} ${error.config?.method?.toUpperCase()} ${url} failed in ${durationMs.toFixed(0)}ms`);
      if (status === 401) {
        try {
          localStorage.removeItem("token");
        } catch (_) {}
        // redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (_) {
      // noop
    }
    console.error("API error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
