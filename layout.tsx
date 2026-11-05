import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LocaleProvider } from "@/i18n/provider";
import { getLocale, getT } from "@/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "A-MATH ARENA", template: "%s · A-MATH ARENA" },
  description: "Think Strategically. Calculate Precisely. Compete Globally. The international competitive mathematical strategy game.",
  applicationName: "A-MATH ARENA",
};

export const viewport: Viewport = {
  themeColor: "#101827",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const { t } = await getT();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">
        <LocaleProvider locale={locale}>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-gold focus:px-4 focus:py-2 focus:text-midnight"
          >
            {t("nav.skip")}
          </a>
          <Navbar />
          <main id="content">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
