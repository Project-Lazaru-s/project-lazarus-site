import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Saira_Stencil } from "next/font/google";
import { bootScript } from "@/components/layout/boot";
import { BootScreen } from "@/components/layout/BootScreen";
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
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${sairaStencil.variable} h-full antialiased`}
      // O bootScript liga data-boot antes da hidratação.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <BootScreen />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        {/* Granulação de filme e vinheta leve no site inteiro. */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
          <div className="grain absolute inset-0 opacity-[0.05]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(0_0_0/0.35)_100%)]" />
        </div>
      </body>
    </html>
  );
}
