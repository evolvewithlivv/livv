import { redirect } from "next/navigation";

/** Direct messages removed from LIVV V1 product scope. */
export default function MessagesRemovedPage() {
  redirect("/home");
}
