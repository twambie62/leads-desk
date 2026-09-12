import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (user?.role === "ADMIN") redirect("/admin/dashboard");

  return <>{children}</>;
}