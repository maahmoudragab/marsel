import React from "react";
import StageOrdersView from "../StageOrdersView";

export const dynamic = "force-dynamic";

export default function ReadyPage() {
  return (
    <StageOrdersView
      stage="out_for_delivery"
      title="3. الأوردرات الجاهزة للتسليم"
      subtitle="قطع اكتمل تجهيزها وطباعتها وجاهزة للفاتورة والتسليم لمندوب الشحن"
    />
  );
}
