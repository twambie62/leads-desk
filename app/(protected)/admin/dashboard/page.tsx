import { StatsCards } from "@/components/dashboard/stats-cards";
import { SourceChart } from "@/components/dashboard/source-chart";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { StatusChart } from "@/components/dashboard/status-chart";
import {
  getStatsCardsData, getStatusChartData, getSourceChartData, getSalesAgents,
  getPaginatedLeads,
} from "@/lib/queries/dashboard";
import {DashboardHeader} from "@/components/dashboard/ dashboard-header";
import {getSession} from "@/lib/session";

export default async function AdminDashboardPage({
                                                   searchParams,
                                                 }: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const user = await getSession();

  const [stats, statusChart, sourceChart, agents, initialLeads] = await Promise.all([
    getStatsCardsData(),
    getStatusChartData(),
    getSourceChartData(),
    getSalesAgents(),
    getPaginatedLeads(1)

  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={user?.name ?? "there"} agents={agents} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <StatsCards data={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StatusChart {...statusChart} />
          </div>
          <div>
            <SourceChart data={sourceChart} />
          </div>
        </div>

        <LeadsTable agents={agents} initialData={initialLeads} />
      </div>
    </div>
  );
}