import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: "public-akeyless-hero",
  resolve: {
    // Swap React for Preact (preact/compat). Drops ~30 KB gzipped vs React.
    // Aliases are scoped to this widget build only — the main dev app still uses React.
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/client": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-dev-runtime",
    },
  },
  // No PostCSS prefix plugin needed — Shadow DOM provides full CSS isolation.
  build: {
    outDir: "dist-akeyless-hero",
    // Inline ALL assets (SVGs, etc.) as data URLs into the JS — produces
    // a single self-contained file the customer can drop anywhere.
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      input: "src/akeyless-hero.tsx",
      output: {
        format: "iife",
        name: "AkeylessHeroBundle",
        inlineDynamicImports: true,
        entryFileNames: "akeyless-hero.js",
        assetFileNames: "akeyless-hero.[ext]",
      },
    },
  },
});
