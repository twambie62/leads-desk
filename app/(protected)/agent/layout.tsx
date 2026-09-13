import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/dashboard/app-sidebar";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (user?.role === "ADMIN") redirect("/admin/dashboard");

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="bg-muted/40">{children}</SidebarInset>
    </SidebarProvider>
  )
}