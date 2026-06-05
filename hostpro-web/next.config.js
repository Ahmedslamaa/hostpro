/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// ── Content Security Policy ──────────────────────────────────────────────────
const CSP_DIRECTIVES = [
  "default-src 'self'",

  // Scripts: no unsafe-eval in production; unsafe-inline needed for Next.js inline scripts
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",

  // Styles: Google Fonts allowed
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

  // Fonts
  "font-src 'self' https://fonts.gstatic.com data:",

  // Images: removed broad `data:` — only allow specific trusted sources
  isDev
    ? "img-src 'self' data: blob: https://images.unsplash.com"
    : "img-src 'self' blob: https://*.blob.core.windows.net https://images.unsplash.com https://*.vercel.app",

  // API connections
  isDev
    ? "connect-src 'self' ws://localhost:3000 wss://localhost:3000"
    : "connect-src 'self' https://*.neon.tech https://api.resend.com https://*.vercel.app wss://*.vercel.app",

  // Service Worker
  "worker-src 'self'",

  // PWA manifest
  "manifest-src 'self'",

  // Frame / embed protection
  "frame-ancestors 'none'",
  "frame-src 'none'",

  // Form submissions only to self
  "form-action 'self'",

  // No plugins
  "object-src 'none'",

  // Force HTTPS
  "upgrade-insecure-requests",
].join("; ");

// ── Security headers ──────────────────────────────────────────────────────────
const SECURITY_HEADERS = [
  { key: "X-Frame-Options",              value: "DENY" },
  { key: "X-Content-Type-Options",       value: "nosniff" },
  { key: "X-XSS-Protection",             value: "1; mode=block" },
  { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "Content-Security-Policy",      value: CSP_DIRECTIVES },
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

// Production-only headers
const PROD_ONLY_HEADERS = [
  { key: "Strict-Transport-Security",    value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
];

const nextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.blob.core.windows.net" },
      { protocol: "https", hostname: "*.azurewebsites.net" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.vercel.app" },
      ...(isDev ? [{ protocol: "http", hostname: "localhost" }] : []),
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  compress: true,

  async headers() {
    return [
      // Apply security headers to ALL routes (including dev)
      {
        source: "/(.*)",
        headers: [
          ...SECURITY_HEADERS,
          ...(!isDev ? PROD_ONLY_HEADERS : []),
        ],
      },
      // Immutable cache for static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Service Worker must not be cached
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      // PWA icons — long cache
      {
        source: "/icon-(.*)\\.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      // No caching for HTML pages and API responses
      {
        source: "/((?!_next/static|_next/image|favicon\\.ico|icon-|apple-splash).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
