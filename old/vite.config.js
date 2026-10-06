import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: ".",
  base: "/",
  server: { open: "/index.html", port: 3000 },
  esbuild: {
    legalComments: "none",
    drop: ["console", "debugger"],
  },
  build: {
    outDir: "dist",
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        shop: resolve(__dirname, "src/pages/shop.html"),
      },
    },
  },
});
