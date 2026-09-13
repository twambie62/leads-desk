"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarClock, Video, ShoppingBag,
  GraduationCap, FileBarChart, UserCog, Settings, LogOut, ChevronsUpDown, KeyRound,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChangePasswordDialog } from "./change-password-dialog";

const ADMIN_NAV = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/admin/leads", icon: Users },
  { title: "Follow-ups", url: "/admin/follow-ups", icon: CalendarClock },
  { title: "Meetings", url: "/admin/meetings", icon: Video },
  { title: "Sales", url: "/admin/sales", icon: ShoppingBag },
  { title: "Training", url: "/admin/training", icon: GraduationCap },
  { title: "Reports", url: "/admin/reports", icon: FileBarChart },
];

const ADMIN_SETTINGS_NAV = [
  { title: "Agents", url: "/admin/agents", icon: UserCog },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AGENT_NAV = [
  { title: "Dashboard", url: "/agent/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/agent/leads", icon: Users },
  { title: "Follow-ups", url: "/agent/follow-ups", icon: CalendarClock },
  { title: "Meetings", url: "/agent/meetings", icon: Video },
  { title: "Sales", url: "/agent/sales", icon: ShoppingBag },
  { title: "Training", url: "/agent/training", icon: GraduationCap },
];

type SidebarUser = { name: string; email: string; role: string };

export function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : AGENT_NAV;
  const homeUrl = isAdmin ? "/admin/dashboard" : "/agent/dashboard";

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <Sidebar className="border-gray-300">
        <SidebarHeader className="px-4 py-4">
          <Link href={homeUrl} className="flex items-center gap-2">
            <Image src="/logo.svg" alt="LeadsDesk logo" width={28} height={28} className="rounded shrink-0" />
            <span className="text-lg font-semibold tracking-tight leading-none">Leads
              <span className="text-lg font-thin tracking">Desk</span></span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className="flex w-full items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="leading-none">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMIN_SETTINGS_NAV.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url} className="flex w-full items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="leading-none">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t p-2 border-gray-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium leading-none">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{user.email}</p>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e)=>{
                  setChangePasswordOpen(true)
                }}
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setChangePasswordOpen(true), 0);
                }}
                className="flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4" /> Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                <form action="/api/auth/logout" method="POST" className="w-full">
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}