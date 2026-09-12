import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSession();

  return (
    <div>
      <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-500 mt-1">Role: {user?.role}</p>
    </div>
  );
}