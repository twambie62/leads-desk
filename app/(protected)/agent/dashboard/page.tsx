import { getSession } from "@/lib/session";

export default async function AgentDashboardPage() {
  const user = await getSession();

  return <h1 className="text-xl font-semibold">Sales Agent Dashboard — Welcome, {user?.name}</h1>;
}