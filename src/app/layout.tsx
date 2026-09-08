import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site, themeColor } from "@/lib/site";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkyBackdrop } from "@/components/site/SkyBackdrop";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { ConnectDialog } from "@/components/wallet/ConnectDialog";

/*
 * Fonts arrive through a runtime <link> rather than next/font/google, which
 * fetches and self-hosts at BUILD time and so needs outbound access from
 * wherever `next build` runs. Inter carries the interface, Inter Tight the
 * display headings (it is the same skeleton drawn tighter, so the two sit
 * together without a seam), and Baloo 2 exists only to be inflated by the
 * wordmark renderer — nothing on the page is actually set in it.
 */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400..900&family=Inter+Tight:wght@700..900&family=Baloo+2:wght@800&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "KOL",
    "trader shares",
    "Robinhood Chain",
    "pons",
    "Fomo leaderboard",
    "crypto traders",
    site.domain,
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: `@${site.xHandle}`,
    creator: `@${site.xHandle}`,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={FONT_HREF} rel="stylesheet" />
      </head>
      <body className="min-h-full">
        <WalletProvider>
          <div className="relative flex min-h-svh flex-col bg-page">
            <SkyBackdrop />
            <div className="relative">
              <SiteHeader />
            </div>
            {children}
            <SiteFooter />
          </div>
          <ConnectDialog />
        </WalletProvider>
      </body>
    </html>
  );
}
