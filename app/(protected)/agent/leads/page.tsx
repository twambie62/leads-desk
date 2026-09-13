import { getSession } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/ dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeadsSecondaryStats } from "@/components/dashboard/leads-secondary-stats";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { getStatsCardsData, getSecondaryStatsData, getFilteredLeads } from "@/lib/queries/dashboard";

export default async function AgentLeadsPage() {
  const user = await getSession();
  if (!user) return null;

  const [stats, secondaryStats, initialLeads] = await Promise.all([
    getStatsCardsData(user.id),
    getSecondaryStatsData(user.id),
    getFilteredLeads({ page: 1, pageSize: 20, agentId: user.id }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={user.name} agents={[]} showAddAgent={false} showExport={false} lockedAgentId={user.id} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <StatsCards data={stats} />
        <LeadsSecondaryStats data={secondaryStats} />
        <LeadsTable
          initialData={initialLeads}
          agents={[]}
          canDelete={true}
          lockedAgentId={user.id}
          basePath="/agent"
          pageSize={20}
          showAgentFilter={false}
          title="My Leads"
        />
      </div>
    </div>
  );
}