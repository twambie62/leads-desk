import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (user?.role !== "ADMIN") redirect("/agent/dashboard");

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex flex-1 flex-col bg-muted/40">{children}</main>

      </div>
    </SidebarProvider>
  );
}