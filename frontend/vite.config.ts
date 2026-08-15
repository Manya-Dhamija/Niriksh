import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // keep all built asset paths relative, so this works from any
              // subpath (e.g. GitHub Pages at /Niriksh/app/) with no config.
  server: {
    port: 5173,
  },
});
