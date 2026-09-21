import { redirect } from "next/navigation";

/** Connect / Community removed from LIVV V1 product scope. */
export default function ConnectRemovedPage() {
  redirect("/home");
}
