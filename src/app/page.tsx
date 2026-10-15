import { redirect } from "next/navigation";

/** Opening flow requires an account before onboarding. */
export default function RootPage() {
  redirect("/auth");
}
