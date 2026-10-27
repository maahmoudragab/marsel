import { Suspense } from "react";
import ProductEditor from "@/components/admin/ProductEditor";

export const metadata = {
  title: "New Product | Marsel Admin",
};

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono uppercase text-black/60">Loading editor...</div>}>
      <ProductEditor mode="create" />
    </Suspense>
  );
}
