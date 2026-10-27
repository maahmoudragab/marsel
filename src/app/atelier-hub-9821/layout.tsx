import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { FACTORY_SESSION_COOKIE, verifyFactorySessionToken } from "@/lib/auth";
import FactoryLogin from "./FactoryLogin";
import FactoryShell from "./FactoryShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ATELIER",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function FactoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAuthorized = false;
  try {
    const cookieStore = await cookies();
    const token = typeof cookieStore?.get === "function"
      ? cookieStore.get(FACTORY_SESSION_COOKIE)?.value
      : null;
    isAuthorized = await verifyFactorySessionToken(token);
  } catch (err) {
    console.error("[Factory Layout] Cookie read error:", err);
    isAuthorized = false;
  }

  if (!isAuthorized) {
    return <FactoryLogin />;
  }

  return <FactoryShell>{children}</FactoryShell>;
}
