import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CookieBanner } from "@/components/ui/CookieBanner";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={font.className}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
