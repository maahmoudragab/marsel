import type { Metadata } from "next";
import { supreme, cairo } from "./fonts";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "MARSEL | Made to Be Different",
  description: "Independent clothing brand built around one simple idea: clothing should feel personal.",
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
