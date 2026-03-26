import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-widget",
    rollupOptions: {
      input: "src/widget.jsx",
      output: {
        entryFileNames: "akeyless-hero-widget.js",
        assetFileNames: "akeyless-hero-widget.[ext]",
        format: "iife",
        name: "AkeylessHeroWidget",
      },
    },
  },
});
