import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthorized = await verifySessionToken(token);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderedIds } = body as { orderedIds: string[] };

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds array is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Assign high temporary offset to avoid unique constraint collisions
    const tempUpdates = orderedIds.map((id, idx) =>
      supabase.from("products").update({ index: 500000 + idx }).eq("id", id)
    );
    await Promise.all(tempUpdates);

    // Step 2: Assign final sequential indexes (1, 2, 3...)
    const finalUpdates = orderedIds.map((id, idx) =>
      supabase.from("products").update({ index: idx + 1 }).eq("id", id)
    );
    const results = await Promise.all(finalUpdates);

    const failure = results.find((r) => r.error);
    if (failure && failure.error) {
      console.error("Reorder error:", failure.error);
      return NextResponse.json(
        { error: failure.error.message },
        { status: 500 }
      );
    }

    // Purge ISR caches so new order shows up immediately across the store
    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/products", "page");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, count: orderedIds.length });
  } catch (error: any) {
    console.error("Reorder route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
