"use client";

import { createClient } from "@/utils/supabase/client";
import { prepareProductImage } from "@/lib/product";

export async function uploadProductImageFile(file: File): Promise<string> {
  const supabase = createClient();
  return prepareProductImage(file, async (blob, fileName) => {
    const { error } = await supabase.storage.from("product-images").upload(fileName, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  });
}
