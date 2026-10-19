import React from "react";
import StageOrdersView from "../StageOrdersView";

export const dynamic = "force-dynamic";

export default function DeliveredPage() {
  return (
    <StageOrdersView
      stage="delivered"
      title="4. سجل الأوردرات المسلّمة"
      subtitle="أرشيف الأوردرات التي تم تسليمها بنجاح للعملاء واستلام مستحقاتها"
    />
  );
}
