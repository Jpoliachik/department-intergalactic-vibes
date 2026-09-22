import { defineConfig } from "vite";

// Two pages: the channel itself, and the in-world 404 Vercel serves for unknown paths.
export default defineConfig({
  build: {
    target: "es2022",
    rollupOptions: { input: { main: "index.html", notFound: "404.html" } },
  },
});
