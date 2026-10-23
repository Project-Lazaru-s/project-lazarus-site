import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // partialPrefetching off on purpose: with it, unknown /mods/[slug] and /blog/[slug]
  // stream the app shell first and notFound() can only answer 200 (e2e "404" test).
  // ponytail: Next 17 forces it on; then check slugs in src/proxy.ts and return 404 there.
  // Arquivos lidos do disco em tempo de requisição (com turbopackIgnore, não são rastreados sozinhos).
  outputFileTracingIncludes: {
    "/dossie/**": ["./assets/og/**/*"],
    "/servidor/**": ["./assets/og/**/*", "./public/images/servidor/**/*"],
    "/blog/**": ["./content/blog/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
