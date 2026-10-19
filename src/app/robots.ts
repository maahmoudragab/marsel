import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themarsel.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/atelier-hub-9821", "/atelier-hub-9821/*", "/api/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}