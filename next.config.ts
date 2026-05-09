import type { NextConfig } from "next";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// next.config.ts — Next.js Configuration
// Works for both: local development AND Cloudflare Workers deployment.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ CLOUDFLARE DEV SETUP: This line makes Cloudflare bindings (like image
// optimization, caching) available during LOCAL development with `npm run dev`.
// It only activates in dev mode — does nothing in production.
import("@opennextjs/cloudflare").then((m) =>
  m.initOpenNextCloudflareForDev()
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Allow images from Sanity's CDN (your CMS images)
      { protocol: "https", hostname: "cdn.sanity.io" },
      // Allow images from Unsplash (if used anywhere)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // Tree-shake these large packages to reduce bundle size
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Apply these headers to ALL pages
        headers: [
          // Prevents browsers from guessing the file type (security)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevents your site from being embedded in iframes (anti-clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Controls how much info is sent when clicking links to other sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disables camera/mic/location access from your pages
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
