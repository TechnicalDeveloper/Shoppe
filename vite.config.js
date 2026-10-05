import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: ".",
  base: "/",
  server: { open: "/index.html", port: 3000 },
  esbuild: {
    // This entirely removes all comments and console logs from the built code
    legalComments: "none",
    drop: ["console", "debugger"],
  },
  build: {
    outDir: "dist",
    minify: "esbuild", // Minifies the code for the server
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        shop: resolve(__dirname, "src/pages/shop.html"),
      },
    },
  },
});
