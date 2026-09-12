import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-medium">Lead Management System</span>
        <div className="flex items-center gap-4 text-sm">
          <span>
            {user.name} · {user.role}
          </span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-red-600">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}