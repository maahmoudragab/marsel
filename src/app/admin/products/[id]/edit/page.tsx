import { Suspense } from "react";
import ProductEditor from "@/components/admin/ProductEditor";

export const metadata = {
  title: "Edit Product | Marsel Admin",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono uppercase text-black/60">Loading editor...</div>}>
      <ProductEditor mode="edit" productId={id} />
    </Suspense>
  );
}
