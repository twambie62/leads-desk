import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AddLeadDialog } from "./ add-lead-dialog";
import { AddAgentDialog } from "./ add-agent-dialog";
import { ExportButton } from "./export-button";

export function DashboardHeader({
                                  title,
                                  agents,
                                }: {
  title: string;
  agents: { id: string; name: string; email: string }[];
}) {
  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ExportButton />
        <AddAgentDialog />
        <AddLeadDialog agents={agents} />
      </div>
    </div>
  );
}