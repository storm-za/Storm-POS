import { build } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Building SSR entry...");

await build({
  configFile: false,
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  build: {
    ssr: "src/entry-server.tsx",
    outDir: path.resolve(__dirname, "dist/server"),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  ssr: {
    noExternal: [
      "@phosphor-icons/react",
      "framer-motion",
      "wouter",
      "wouter/memory-location",
    ],
  },
});

console.log("SSR build complete.");
