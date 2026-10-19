import type { Metadata } from "next";
import { supreme, cairo } from "./fonts";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://themarsel.vercel.app"),
  title: "MARSEL | Made to Be Different",
  description: "Independent clothing brand built around one simple idea: clothing should feel personal.",
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
    title: "MARSEL | Made to Be Different",
    description: "Independent clothing brand built around one simple idea: clothing should feel personal.",
    url: "/",
    siteName: "MARSEL",
    images: [
      {
        url: "/opengraph-image.png",
        width: 2048,
        height: 2048,
        alt: "MARSEL",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARSEL | Made to Be Different",
    description: "Independent clothing brand built around one simple idea: clothing should feel personal.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${supreme.variable} ${cairo.variable}`}>
      <body className="antialiased bg-[#e7ecea] text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
