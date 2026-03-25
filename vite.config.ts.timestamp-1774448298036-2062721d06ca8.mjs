// vite.config.ts
import { defineConfig } from "file:///D:/SNUC/SEM4/SNUC%20HACK/FIN%20GUARD/Fintech-Finguard/node_modules/.pnpm/vite@5.4.21_@types+node@25.3.5_lightningcss@1.31.1/node_modules/vite/dist/node/index.js";
import react from "file:///D:/SNUC/SEM4/SNUC%20HACK/FIN%20GUARD/Fintech-Finguard/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__fa73262e6718220f4e882b8152ad6d4b/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/SNUC/SEM4/SNUC%20HACK/FIN%20GUARD/Fintech-Finguard/node_modules/.pnpm/@tailwindcss+vite@4.2.1_vit_7cc9c54597a92841fbd5176b4011a153/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
import runtimeErrorOverlay from "file:///D:/SNUC/SEM4/SNUC%20HACK/FIN%20GUARD/Fintech-Finguard/node_modules/.pnpm/@replit+vite-plugin-runtime-error-modal@0.0.6/node_modules/@replit/vite-plugin-runtime-error-modal/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\SNUC\\SEM4\\SNUC HACK\\FIN GUARD\\Fintech-Finguard\\artifacts\\finguard";
var rawPort = process.env.PORT || "5173";
var port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}
var basePath = process.env.BASE_PATH || "/";
var vite_config_default = defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("file:///D:/SNUC/SEM4/SNUC%20HACK/FIN%20GUARD/Fintech-Finguard/node_modules/.pnpm/@replit+vite-plugin-cartographer@0.5.1/node_modules/@replit/vite-plugin-cartographer/dist/index.mjs").then(
        (m) => m.cartographer({
          root: path.resolve(__vite_injected_original_dirname, "..")
        })
      ),
      await import("file:///D:/SNUC/SEM4/SNUC%20HACK/FIN%20GUARD/Fintech-Finguard/node_modules/.pnpm/@replit+vite-plugin-dev-banner@0.1.2/node_modules/@replit/vite-plugin-dev-banner/dist/index.mjs").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "@assets": path.resolve(__vite_injected_original_dirname, "..", "..", "attached_assets")
    },
    dedupe: ["react", "react-dom"]
  },
  root: path.resolve(__vite_injected_original_dirname),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxTTlVDXFxcXFNFTTRcXFxcU05VQyBIQUNLXFxcXEZJTiBHVUFSRFxcXFxGaW50ZWNoLUZpbmd1YXJkXFxcXGFydGlmYWN0c1xcXFxmaW5ndWFyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcU05VQ1xcXFxTRU00XFxcXFNOVUMgSEFDS1xcXFxGSU4gR1VBUkRcXFxcRmludGVjaC1GaW5ndWFyZFxcXFxhcnRpZmFjdHNcXFxcZmluZ3VhcmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1NOVUMvU0VNNC9TTlVDJTIwSEFDSy9GSU4lMjBHVUFSRC9GaW50ZWNoLUZpbmd1YXJkL2FydGlmYWN0cy9maW5ndWFyZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgcnVudGltZUVycm9yT3ZlcmxheSBmcm9tIFwiQHJlcGxpdC92aXRlLXBsdWdpbi1ydW50aW1lLWVycm9yLW1vZGFsXCI7XHJcblxyXG5jb25zdCByYXdQb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCBcIjUxNzNcIjtcclxuXHJcbmNvbnN0IHBvcnQgPSBOdW1iZXIocmF3UG9ydCk7XHJcblxyXG5pZiAoTnVtYmVyLmlzTmFOKHBvcnQpIHx8IHBvcnQgPD0gMCkge1xyXG4gIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQT1JUIHZhbHVlOiBcIiR7cmF3UG9ydH1cImApO1xyXG59XHJcblxyXG5jb25zdCBiYXNlUGF0aCA9IHByb2Nlc3MuZW52LkJBU0VfUEFUSCB8fCBcIi9cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogYmFzZVBhdGgsXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICBydW50aW1lRXJyb3JPdmVybGF5KCksXHJcbiAgICAuLi4ocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmXHJcbiAgICBwcm9jZXNzLmVudi5SRVBMX0lEICE9PSB1bmRlZmluZWRcclxuICAgICAgPyBbXHJcbiAgICAgICAgICBhd2FpdCBpbXBvcnQoXCJAcmVwbGl0L3ZpdGUtcGx1Z2luLWNhcnRvZ3JhcGhlclwiKS50aGVuKChtKSA9PlxyXG4gICAgICAgICAgICBtLmNhcnRvZ3JhcGhlcih7XHJcbiAgICAgICAgICAgICAgcm9vdDogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwiLi5cIiksXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIGF3YWl0IGltcG9ydChcIkByZXBsaXQvdml0ZS1wbHVnaW4tZGV2LWJhbm5lclwiKS50aGVuKChtKSA9PlxyXG4gICAgICAgICAgICBtLmRldkJhbm5lcigpLFxyXG4gICAgICAgICAgKSxcclxuICAgICAgICBdXHJcbiAgICAgIDogW10pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcInNyY1wiKSxcclxuICAgICAgXCJAYXNzZXRzXCI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcIi4uXCIsIFwiLi5cIiwgXCJhdHRhY2hlZF9hc3NldHNcIiksXHJcbiAgICB9LFxyXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcclxuICB9LFxyXG4gIHJvb3Q6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lKSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJkaXN0L3B1YmxpY1wiKSxcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0LFxyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXHJcbiAgICBmczoge1xyXG4gICAgICBzdHJpY3Q6IHRydWUsXHJcbiAgICAgIGRlbnk6IFtcIioqLy4qXCJdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHByZXZpZXc6IHtcclxuICAgIHBvcnQsXHJcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrWixTQUFTLG9CQUFvQjtBQUMvYSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8seUJBQXlCO0FBSmhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sVUFBVSxRQUFRLElBQUksUUFBUTtBQUVwQyxJQUFNLE9BQU8sT0FBTyxPQUFPO0FBRTNCLElBQUksT0FBTyxNQUFNLElBQUksS0FBSyxRQUFRLEdBQUc7QUFDbkMsUUFBTSxJQUFJLE1BQU0sd0JBQXdCLE9BQU8sR0FBRztBQUNwRDtBQUVBLElBQU0sV0FBVyxRQUFRLElBQUksYUFBYTtBQUUxQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixvQkFBb0I7QUFBQSxJQUNwQixHQUFJLFFBQVEsSUFBSSxhQUFhLGdCQUM3QixRQUFRLElBQUksWUFBWSxTQUNwQjtBQUFBLE1BQ0UsTUFBTSxPQUFPLHNMQUFrQyxFQUFFO0FBQUEsUUFBSyxDQUFDLE1BQ3JELEVBQUUsYUFBYTtBQUFBLFVBQ2IsTUFBTSxLQUFLLFFBQVEsa0NBQXFCLElBQUk7QUFBQSxRQUM5QyxDQUFDO0FBQUEsTUFDSDtBQUFBLE1BQ0EsTUFBTSxPQUFPLGtMQUFnQyxFQUFFO0FBQUEsUUFBSyxDQUFDLE1BQ25ELEVBQUUsVUFBVTtBQUFBLE1BQ2Q7QUFBQSxJQUNGLElBQ0EsQ0FBQztBQUFBLEVBQ1A7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFxQixLQUFLO0FBQUEsTUFDNUMsV0FBVyxLQUFLLFFBQVEsa0NBQXFCLE1BQU0sTUFBTSxpQkFBaUI7QUFBQSxJQUM1RTtBQUFBLElBQ0EsUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLEVBQy9CO0FBQUEsRUFDQSxNQUFNLEtBQUssUUFBUSxnQ0FBbUI7QUFBQSxFQUN0QyxPQUFPO0FBQUEsSUFDTCxRQUFRLEtBQUssUUFBUSxrQ0FBcUIsYUFBYTtBQUFBLElBQ3ZELGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTjtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBLE1BQ1IsTUFBTSxDQUFDLE9BQU87QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQO0FBQUEsSUFDQSxNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUEsRUFDaEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
