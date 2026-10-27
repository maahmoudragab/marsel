import React from "react";
import { cookies } from "next/headers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminProviders from "@/components/admin/AdminProviders";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const metadata = {
  title: "DASHBOARD",
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthorized = await verifySessionToken(token);

  if (!isAuthorized) {
    // Unauthenticated: render children (login screen) cleanly without sidebar
    return (
      <AdminProviders>
        <div className="min-h-screen bg-[#e7ecea] text-black font-sans" dir="ltr">
          {children}
        </div>
      </AdminProviders>
    );
  }

  // Authenticated: full studio workspace with sidebar
  return (
    <AdminProviders>
      <div className="min-h-screen flex bg-[#e7ecea] text-black font-sans" dir="ltr">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 pt-20 sm:p-10 sm:pt-20 lg:p-12 max-w-[1700px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}