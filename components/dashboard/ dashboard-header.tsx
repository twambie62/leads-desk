import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Greeting } from "./greeting";
import { AddLeadDialog } from "./ add-lead-dialog";
import { AddAgentDialog } from "./ add-agent-dialog";
import { ExportButton } from "./export-button";

export function DashboardHeader({
                                  userName, agents, showAddAgent = true, showExport = true, lockedAgentId,
                                }: {
  userName: string;
  agents: { id: string; name: string; email: string }[];
  showAddAgent?: boolean;
  showExport?: boolean;
  lockedAgentId?: string;
}) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 bg-white px-4 py-3 sm:px-6 sm:py-4.5">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SidebarTrigger />

        <Separator
          orientation="vertical"
          className="hidden h-6 sm:block"
        />

        <div className="min-w-0">
          <Greeting name={userName} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-4">
        {showExport && (
          <div className="hidden sm:block">
            <ExportButton />
          </div>
        )}

        {showAddAgent && <AddAgentDialog />}

        <AddLeadDialog
          agents={agents}
          lockedAgentId={lockedAgentId}
        />
      </div>
    </div>
  );
}