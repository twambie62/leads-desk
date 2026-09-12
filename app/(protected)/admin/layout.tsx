import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/dashboard/app-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (user?.role !== "ADMIN") redirect("/agent/dashboard");

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 bg-muted/40">{children}</main>
    </SidebarProvider>
  );
}