import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

// The header mark, from the brand's own glyph (copied in by `npm run sync`),
// dropped into both pages wherever they say <!-- glyph -->.
const glyph = () =>
  readFileSync(new URL("./src/brand/glyph.svg", import.meta.url), "utf8")
    .replace(/<!--[\s\S]*?-->\s*/g, "")
    .replace(' role="img" aria-label="Vibe Corp"', ' aria-hidden="true" focusable="false"')
    .trim();

// Two pages: the channel itself, and the in-world 404 Vercel serves for unknown paths.
export default defineConfig({
  plugins: [{ name: "brand-glyph", transformIndexHtml: (html) => html.replace("<!-- glyph -->", glyph()) }],
  build: {
    target: "es2022",
    rollupOptions: { input: { main: "index.html", notFound: "404.html" } },
  },
});
