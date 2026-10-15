import { redirect } from "next/navigation";

/** Opening flow requires an account before onboarding. */
export const dynamic = "force-dynamic";

export default function RootPage() {
  redirect("/auth");
}
