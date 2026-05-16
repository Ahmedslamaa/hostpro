import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HOST PRO — Gestion locative saisonnière",
  description: "PMS premium pour gestionnaires locatifs saisonniers",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://app.hostpro.fr"),
  robots: { index: false, follow: false }, // SaaS privé — ne pas indexer
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HostPro",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#FF5A5F" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${font.className} bg-neutral-50 text-neutral-900 antialiased`}>
        <ServiceWorkerRegister />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
