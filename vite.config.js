import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  envDir: "../",
  publicDir: "../public",
  appType: "mpa",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        mapa: resolve(__dirname, "src/pages/mapa/index.html"),
        auth: resolve(__dirname, "src/pages/auth/index.html"),
        admin: resolve(__dirname, "src/pages/admin/index.html"),
        passwordreset: resolve(
          __dirname,
          "src/pages/admin/password-reset/index.html"
        ),
      },
    },
  },
  server: {
    open: true,
  },
});
