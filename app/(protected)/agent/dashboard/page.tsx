import { getSession } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/ dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatusChart } from "@/components/dashboard/status-chart";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { TodaysFollowUps } from "@/components/dashboard/todays-followups";
import {
  getStatsCardsData, getStatusChartData, getPaginatedLeads, getTodaysFollowUps,
} from "@/lib/queries/dashboard";
import {SidebarProvider} from "@/components/ui/sidebar";

export default async function AgentDashboardPage() {
  const user = await getSession();
  if (!user) return null; // layout already redirects, this satisfies TS

  const [stats, statusChart, initialLeads, followUps] = await Promise.all([
    getStatsCardsData(user.id),
    getStatusChartData(user.id),
    getPaginatedLeads(1, user.id),
    getTodaysFollowUps(user.id),
  ]);

  return (

    // <div className="flex min-h-screen flex-col">
    //   <DashboardHeader
    //     userName={user.name}
    //     agents={[]}
    //     showAddAgent={false}
    //     showExport={false}
    //     lockedAgentId={user.id}
    //   />
    //   <div className="flex flex-1 flex-col gap-6 p-6">
    //     <StatsCards data={stats} />
    //
    //     <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    //       <div className="lg:col-span-2">
    //         <StatusChart {...statusChart} />
    //       </div>
    //       <div>
    //         <TodaysFollowUps followUps={followUps} />
    //       </div>
    //     </div>
    //
    //   </div>
    // </div>


  <div className="flex min-h-screen min-w-0 flex-col">
    <DashboardHeader
          userName={user.name}
          agents={[]}
          showAddAgent={false}
          showExport={false}
          lockedAgentId={user.id}
        />
    <div className="flex flex-1 flex-col gap-6 p-6 min-w-0 overflow-x-hidden">
      <StatsCards data={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <StatusChart {...statusChart} />
        </div>
        <div className="min-w-0">
          <TodaysFollowUps followUps={followUps} />
        </div>
      </div>
        <LeadsTable initialData={initialLeads} agents={[]} canDelete={false} lockedAgentId={user.id} />

    </div>
  </div>

  );
}