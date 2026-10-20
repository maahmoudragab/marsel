import type { Metadata, Viewport } from "next";
import { supreme, cairo } from "./fonts";
import "./globals.css";
import Providers from "@/components/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  SITE_URL,
  BRAND_KEYWORDS,
  getOrganizationSchema,
  getWebSiteSchema,
} from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#f4f3f0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MARSEL (مارسيل) | Made to Be Different — Independent Streetwear",
    template: "%s | MARSEL",
  },
  description:
    "MARSEL (مارسيل) is an independent streetwear brand founded by Mahmoud Ragab in Cairo, Egypt. Discover premium heavyweight hoodies, oversized crewnecks, and distinctive graphic apparel. Made to be different.",
  applicationName: "MARSEL Store",
  authors: [{ name: "Mahmoud Ragab (محمود رجب)", url: SITE_URL }],
  creator: "Mahmoud Ragab",
  publisher: "MARSEL",
  keywords: BRAND_KEYWORDS,
  category: "Fashion & Streetwear",
  classification: "Clothing Brand, Streetwear Label, E-commerce Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-EG": "/",
      "ar-EG": "/",
      "x-default": "/",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=3", sizes: "any" },
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/logo/favicon.png?v=3", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.png?v=3" },
      { url: "/logo/favicon.png?v=3" },
    ],
  },
  openGraph: {
    title: "MARSEL (مارسيل) | Made to Be Different — Independent Streetwear",
    description:
      "Independent streetwear brand founded by Mahmoud Ragab in Cairo. Premium heavyweight fleece, oversized cuts, and distinctive graphics. Fast delivery across Egypt.",
    url: SITE_URL,
    siteName: "MARSEL",
    images: [
      {
        url: "/opengraph-image.png",
        width: 2048,
        height: 2048,
        alt: "MARSEL (مارسيل) — Made to Be Different",
      },
    ],
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARSEL (مارسيل) | Made to Be Different",
    description:
      "Independent streetwear brand in Cairo by Mahmoud Ragab. Premium heavyweight hoodies and oversized essentials.",
    images: ["/opengraph-image.png"],
    creator: "@marsel.studio",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-placeholder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html lang="en" dir="ltr" className={`${supreme.variable} ${cairo.variable}`}>
      <head>
        {/* Google Structured Data / Rich Snippets (Organization & WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="antialiased bg-[#f4f3f0] text-black">
        <Providers>{children}</Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
