import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPaginatedLeads } from "@/lib/queries/dashboard";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;

  // Agents can only ever see their own leads — this is enforced here regardless of
  // what the client requests, not just hidden in the UI.
  const agentId = user.role === "SALES_AGENT" ? user.id : undefined;

  const data = await getPaginatedLeads(page, agentId);
  return NextResponse.json(data);
}