import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getFilteredLeads } from "@/lib/queries/dashboard";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  // Agents can never override this, regardless of what's in the query string
  const agentId = user.role === "SALES_AGENT" ? user.id : undefined;

  const data = await getFilteredLeads({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    agentId,
    status: searchParams.get("status") || undefined,
    source: searchParams.get("source") || undefined,
    assignedAgentId: searchParams.get("assignedAgentId") || undefined,
    search: searchParams.get("search") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    sortBy: (searchParams.get("sortBy") as "createdAt" | "leadName") || "createdAt",
    sortDir: (searchParams.get("sortDir") as "asc" | "desc") || "desc",
  });

  return NextResponse.json(data);
}