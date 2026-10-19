import React from "react";
import StageOrdersView from "../StageOrdersView";

export const dynamic = "force-dynamic";

export default function QueuePage() {
  return (
    <StageOrdersView
      stage="confirmed"
      title="1. الأوردرات في الانتظار"
      subtitle="أوردرات مؤكدة جديدة بانتظار بدء سحبها للتنفيذ وتجهيز القماش"
    />
  );
}
