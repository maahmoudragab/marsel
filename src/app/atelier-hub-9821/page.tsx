import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AtelierHubIndex() {
  redirect("/atelier-hub-9821/queue");
}
