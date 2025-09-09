import axios from "axios";
import { message } from "antd";

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
  // allow custom flags via config as any
  (config as any).flags = (config as any).flags || {};
  // attach auth token if exists
  try {
    const token = localStorage.getItem("token");
    if (token) {
      (config.headers as any)["token"] = `${token}`;
      // Also attach standard Authorization header for backends expecting it
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
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
    try {
      const method = (resp.config?.method || "").toUpperCase();
      const autoToast = (resp.config as any)?.flags?.autoToast as boolean | undefined;
      if (autoToast && (method === "POST" || method === "PUT" || method === "DELETE")) {
        message.success("操作成功");
      }
    } catch (_) {}
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
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error || error.message;
      message.error(serverMsg || "请求失败");
    } catch (_) {
      // noop
    }
    console.error("API error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
