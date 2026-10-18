import React from "react";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminOverviewDashboard from "@/components/admin/AdminOverviewDashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthorized = await verifySessionToken(token);

  if (!isAuthorized) {
    return <AdminLoginForm />;
  }

  return <AdminOverviewDashboard />;
}