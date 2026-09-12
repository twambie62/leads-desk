import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Greeting } from "./greeting";
import { AddLeadDialog } from "./ add-lead-dialog";
import { AddAgentDialog } from "./ add-agent-dialog";
import { ExportButton } from "./export-button";

export function DashboardHeader({
                                  userName,
                                  agents,
                                }: {
  userName: string;
  agents: { id: string; name: string; email: string }[];
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <Greeting name={userName} />
      </div>
      <div className="flex items-center gap-3">
        <ExportButton />
        <AddAgentDialog />
        <AddLeadDialog agents={agents} />
      </div>
    </div>
  );
}