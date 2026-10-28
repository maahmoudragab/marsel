import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { supreme, alexandria } from "./fonts";
import "./globals.css";
import Providers from "@/components/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  SITE_URL,
  BRAND_KEYWORDS,
  getOrganizationSchema,
  getWebSiteSchema,
  safeJsonLd,
} from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#f6f5f2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MARSEL | STORE",
    template: "MARSEL | %s",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("marsel_lang")?.value;
  const initialLang: "en" | "ar" = langCookie === "ar" ? "ar" : "en";
  const isArabic = initialLang === "ar";

  const orgSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html
      lang={initialLang}
      dir={isArabic ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${supreme.variable} ${alexandria.variable}`}
    >
      <head>
        {/* Performance Optimization: Preconnect & DNS-Prefetch for image assets */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}

        {/* Synchronously apply stored language, direction & page title before paint to prevent any FOUC or Title Flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('marsel_lang');var isAr=(l==='ar');if(isAr){document.documentElement.lang='ar';document.documentElement.dir='rtl';}else{document.documentElement.lang='en';document.documentElement.dir='ltr';}var p=window.location.pathname;if(p.indexOf('/products/')!==0){var b=isAr?'\\u0645\\u0627\\u0631\\u0633\\u064A\\u0644':'MARSEL';var s='';if(p==='/')s=isAr?'\\u0627\\u0644\\u0645\\u062A\\u062C\\u0631':'STORE';else if(p==='/bag')s=isAr?'\\u062D\\u0642\\u064A\\u0628\\u0629 \\u0627\\u0644\\u062A\\u0633\\u0648\\u0642':'BAG';else if(p==='/checkout')s=isAr?'\\u0625\\u062A\\u0645\\u0627\\u0645 \\u0627\\u0644\\u0637\\u0644\\u0628':'CHECKOUT';else if(p.indexOf('/checkout/')===0){var n=p.replace('/checkout/','').replace(/^#+/,'');s=isAr?('\\u0637\\u0644\\u0628 #'+n):('ORDER #'+n);}else if(p.indexOf('/confirm')===0){var n2=p.split('/').pop().replace(/^#+/,'');s=isAr?('\\u062A\\u0623\\u0643\\u064A\\u062F \\u0637\\u0644\\u0628 #'+n2):('CONFIRM #'+n2);}else if(p==='/track')s=isAr?'\\u062A\\u062A\\u0628\\u0639 \\u0627\\u0644\\u0637\\u0644\\u0628':'TRACK ORDER';else if(p==='/about')s=isAr?'\\u0639\\u0646 \\u0645\\u0627\\u0631\\u0633\\u064A\\u0644':'ABOUT';else if(p==='/faq')s=isAr?'\\u0627\\u0644\\u0623\\u0633\\u0626\\u0644\\u0629 \\u0627\\u0644\\u0634\\u0627\\u0626\\u0639\\u0629':'FAQ';else if(p==='/returns')s=isAr?'\\u0627\\u0644\\u0627\\u0633\\u062A\\u0628\\u062F\\u0627\\u0644 \\u0648\\u0627\\u0644\\u0627\\u0633\\u062A\\u0631\\u062C\\u0627\\u0639':'RETURNS';else if(p==='/terms')s=isAr?'\\u0627\\u0644\\u0634\\u0631\\u0648\\u0637 \\u0648\\u0627\\u0644\\u0623\\u062D\\u0643\\u0627\\u0645':'TERMS';else if(p==='/privacy')s=isAr?'\\u0627\\u0644\\u062E\\u0635\\u0648\\u0635\\u064A\\u0629':'PRIVACY';else if(p.indexOf('/admin')===0)s=isAr?'\\u0644\\u0648\\u062D\\u0629 \\u0627\\u0644\\u062A\\u062D\\u0643\\u0645':'DASHBOARD';else if(p.indexOf('/atelier')===0)s=isAr?'\\u0627\\u0644\\u0627\\u0633\\u062A\\u0648\\u062F\\u064A\\u0648':'ATELIER';if(s)document.title=b+' | '+s;}}catch(e){}})();`,
          }}
        />


        {/* Google Structured Data / Rich Snippets (Organization & WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(webSiteSchema) }}
        />
      </head>
      <body className="antialiased bg-[#f6f5f2] text-black">
        <Providers initialLanguage={initialLang}>{children}</Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
