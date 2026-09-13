import { getSession } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/ dashboard-header";
import { AuditLogTable } from "@/components/dashboard/audit-log-table";
import { getAuditLogs, getAuditLogUsers } from "@/lib/queries/audit";
import { getSalesAgents } from "@/lib/queries/dashboard";

export default async function ReportsPage() {
  const user = await getSession();

  const [initialLogs, users, agents] = await Promise.all([
    getAuditLogs({ page: 1 }),
    getAuditLogUsers(),
    getSalesAgents(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={user?.name ?? "there"} agents={agents} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            More reporting (conversion rates, sales by agent, monthly breakdowns) is coming soon. For now, here's a full activity log of everything happening in the system.
          </p>
        </div>
        <AuditLogTable initialData={initialLogs} users={users} />
      </div>
    </div>
  );
}