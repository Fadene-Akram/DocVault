import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3001",
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ""),
    //   },
    //   "/spring": {
    //     target: "http://localhost:8082", // Spring Boot (your port)
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/spring/, ""),
    //   },
    //   "/comments": {
    //     target: "http://localhost:8083", // comments service directly
    //     changeOrigin: true,
    //     // no rewrite — /comments/list/{id} and /comments/add match the controller exactly
    //   },
    // },
    proxy: {
      // Everything goes through the gateway now
      "/gateway": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway/, ""),
      },
      // json-server stays separate (users, categories, departments, versions)
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
