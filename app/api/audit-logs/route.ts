import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAuditLogs } from "@/lib/queries/audit";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const data = await getAuditLogs({
    page: Number(searchParams.get("page")) || 1,
    action: searchParams.get("action") || undefined,
    userId: searchParams.get("userId") || undefined,
    search: searchParams.get("search") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  });

  return NextResponse.json(data);
}