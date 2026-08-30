/** @type {import('next').NextConfig} */
const nextConfig = {
  // Card art + content live under ./deck and are read/written at runtime by the
  // API routes. That puts runtime writes inside the project the dev server is
  // watching: every regenerate rewrote card.json (or image.png), the watcher
  // fired, Fast Refresh remounted the studio, and the fresh card was wiped from
  // React state before it could render — the write landed on disk but the UI
  // looked like nothing had happened. The deck is data, not source, so keep it
  // out of the watcher.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/deck/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
