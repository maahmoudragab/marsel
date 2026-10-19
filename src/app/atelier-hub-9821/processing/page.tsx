import React from "react";
import StageOrdersView from "../StageOrdersView";

export const dynamic = "force-dynamic";

export default function ProcessingPage() {
  return (
    <StageOrdersView
      stage="processing"
      title="2. الأوردرات قيد التجهيز والطباعة"
      subtitle="قطع مسحوبة ويجري الآن تقطيعها وتجهيزها وطباعتها على خط الإنتاج"
    />
  );
}
