import { redirect } from "next/navigation";

/** Direct message threads removed from LIVV V1 product scope. */
export default function MessageThreadRemovedPage() {
  redirect("/home");
}
