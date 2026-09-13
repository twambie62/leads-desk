import { getSession } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/ dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeadsSecondaryStats } from "@/components/dashboard/leads-secondary-stats";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { getStatsCardsData, getSecondaryStatsData, getFilteredLeads, getSalesAgents } from "@/lib/queries/dashboard";

export default async function AdminLeadsPage() {
  const user = await getSession();

  const [stats, secondaryStats, initialLeads, agents] = await Promise.all([
    getStatsCardsData(),
    getSecondaryStatsData(),
    getFilteredLeads({ page: 1, pageSize: 20 }),
    getSalesAgents(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={user?.name ?? "there"} agents={agents} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <StatsCards data={stats} />
        <LeadsSecondaryStats data={secondaryStats} />
        <LeadsTable initialData={initialLeads} agents={agents} pageSize={20} title="All Leads" />
      </div>
    </div>
  );
}