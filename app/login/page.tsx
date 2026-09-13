import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";
import { LoginLeftPanel } from "./login-left-panel";

const LEFT_PANEL_VARIANT: "text" | "image" = "text";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/agent/dashboard");

  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-2">
      <div className="hidden h-screen p-3 lg:block">
        <LoginLeftPanel variant={"text"} />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-sm">
          <Image src="/logo.svg" alt="LeadsDesk logo" width={35} height={35} className="rounded" />

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground/78">
            Sign in to manage your leads, track follow-ups, and keep every deal moving from first contact to close.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}