import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Optional local-development proxy. The browser talks to Vite (same origin)
  // and Vite forwards /v1/* to the real API, avoiding CORS allowlist issues.
  const proxyTarget = env.VITE_DEV_API_TARGET?.trim();
  const useProxy = env.VITE_DEV_USE_PROXY === "true" && Boolean(proxyTarget);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: useProxy
      ? {
          proxy: {
            "/v1": {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
            "/healthz": {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
    build: {
      target: "es2022",
      cssMinify: true,
      sourcemap: false,
    },
  };
});
