import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: { "@": import.meta.dirname },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "icon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Tally — Tenant billing",
        short_name: "Tally",
        description:
          "Configure your fees, add tenants, and generate clean utility invoices in seconds — works offline.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f7f8fc",
        theme_color: "#ffffff",
        categories: ["finance", "productivity", "business"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // SPA: serve the app shell for any uncached navigation, so deep links
        // and refreshes work offline.
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
      },
      devOptions: { enabled: false },
    }),
  ],
});
