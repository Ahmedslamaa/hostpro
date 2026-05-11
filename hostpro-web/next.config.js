/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// ── Content Security Policy ──────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.blob.core.windows.net https://*.azurewebsites.net https://images.unsplash.com",
  isDev
    ? "connect-src 'self' ws://localhost:3000 wss://localhost:3000 https://*.azure.com"
    : "connect-src 'self' https://*.azure.com https://*.applicationinsights.azure.com https://api.resend.com",
  // Service Worker support
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "X-XSS-Protection",         value: "1; mode=block" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "Content-Security-Policy",  value: CSP },
  { key: "Cross-Origin-Opener-Policy",    value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy",  value: "same-origin" },
  ...(isDev ? [] : [{ key: "Cross-Origin-Embedder-Policy", value: "require-corp" }]),
  ...(isDev ? [] : [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ]),
];

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.blob.core.windows.net" },
      { protocol: "https", hostname: "*.azurewebsites.net" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http",  hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  compress: true,

  async headers() {
    return [
      ...(isDev ? [] : [{
        source: "/(.*)",
        headers: securityHeaders,
      }]),
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Service Worker must be served with no-store to allow updates
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/((?!_next/static|_next/image|favicon\\.ico).*)",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate" }],
      },
    ];
  },

  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
