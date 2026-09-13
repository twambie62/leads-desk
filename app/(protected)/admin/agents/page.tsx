import { getSession } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/ dashboard-header";
import { AgentsTable } from "@/components/dashboard/agents-table";
import { getAgentsList } from "@/lib/queries/agents";
import { getSalesAgents } from "@/lib/queries/dashboard";

export default async function AgentsPage() {
  const user = await getSession();
  const [agents, agentsForDialog] = await Promise.all([
    getAgentsList(),
    getSalesAgents(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={user?.name ?? "there"} agents={agentsForDialog} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Manage Sales Agents</h2>
          <p className="text-sm text-muted-foreground">
            View, edit, reset passwords, unlock, or deactivate agent accounts.
          </p>
        </div>
        <AgentsTable agents={agents} />
      </div>
    </div>
  );
}