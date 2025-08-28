import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (_proxyReq, req) => {
            // eslint-disable-next-line no-console
            console.log(`[proxy] ${req.method} ${req.url}`);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            // eslint-disable-next-line no-console
            console.log(`[proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
          proxy.on("error", (err, req) => {
            // eslint-disable-next-line no-console
            console.error(`[proxy] error on ${req.method} ${req.url}:`, err.message);
          });
        },
      },
    },
  },
});
