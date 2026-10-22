import type { Metadata } from "next";
import { Inter, Saira_Stencil } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const sairaStencil = Saira_Stencil({
  variable: "--font-saira-stencil",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

// Base das URLs absolutas (imagens OpenGraph). Na Vercel vem do domínio de produção.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sairaStencil.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
