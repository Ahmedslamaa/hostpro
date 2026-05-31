import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hostpro-web-phi.vercel.app";

// ── Viewport (separate export required in Next.js 14) ─────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A0E12" },
    { media: "(prefers-color-scheme: dark)",  color: "#1A0E12" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "HostPro",
    template: "%s — HostPro",
  },
  description: "PMS premium pour gestionnaires locatifs saisonniers — propriétés, réservations, messages unifiés.",
  applicationName: "HostPro",
  authors: [{ name: "HostPro" }],
  keywords: ["gestion locative", "airbnb", "booking", "pms", "property management"],
  metadataBase: new URL(APP_URL),
  robots: { index: false, follow: false },
  manifest: "/manifest.json",

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/icon-16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/icon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icon-48.png",  sizes: "48x48",  type: "image/png" },
      { url: "/icon-96.png",  sizes: "96x96",  type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192",type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512",type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon-180.png",  sizes: "180x180",  type: "image/png" },
      { url: "/icon-167.png",  sizes: "167x167",  type: "image/png" },
      { url: "/icon-152.png",  sizes: "152x152",  type: "image/png" },
      { url: "/icon-144.png",  sizes: "144x144",  type: "image/png" },
      { url: "/icon-128.png",  sizes: "128x128",  type: "image/png" },
      { url: "/icon-96.png",   sizes: "96x96",    type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon-maskable-192.png", color: "#1A0E12" },
    ],
  },

  // ── Apple Web App ──────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    title: "HostPro",
    statusBarStyle: "black-translucent",
    startupImage: [
      { url: "/apple-splash-2048-2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/apple-splash-1668-2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/apple-splash-1536-2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/apple-splash-1242-2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/apple-splash-1125-2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/apple-splash-828-1792.png",  media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/apple-splash-750-1334.png",  media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: "HostPro",
    title: "HostPro — Gestion Locative",
    description: "PMS premium pour gestionnaires locatifs saisonniers.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "HostPro" }],
  },

  // ── Twitter ────────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "HostPro — Gestion Locative",
    description: "PMS premium pour gestionnaires locatifs saisonniers.",
    images: ["/og-image.png"],
  },

  // ── MS Tiles ───────────────────────────────────────────────────────────────
  other: {
    "mobile-web-app-capable":           "yes",
    "msapplication-TileColor":          "#1A0E12",
    "msapplication-TileImage":          "/icon-144.png",
    "msapplication-config":             "/browserconfig.xml",
    "msapplication-tap-highlight":      "no",
    "format-detection":                 "telephone=no",
  },
};

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${font.className} bg-neutral-50 text-neutral-900 antialiased`}
            style={{ WebkitTapHighlightColor: "transparent" }}>
        <ServiceWorkerRegister />
        {children}
        <PWAInstallPrompt />
        <CookieBanner />
      </body>
    </html>
  );
}
