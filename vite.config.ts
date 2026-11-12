import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: process.env["NITRO_PRESET"] || "vercel",
    compressPublicAssets: true,
    routeRules: {
      "/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      "/fonts/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      "/__l5e/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      "/brand/**": { headers: { "cache-control": "public, max-age=604800, stale-while-revalidate=86400" } },
      "/videos/**": { headers: { "cache-control": "public, max-age=604800, stale-while-revalidate=86400" } },
      "/favicon*": { headers: { "cache-control": "public, max-age=604800" } },
      "/apple-touch-icon.png": { headers: { "cache-control": "public, max-age=604800" } },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: {
      entry: "server",
      build: {
        inlineCss: true,
      },
    },
  },
});
