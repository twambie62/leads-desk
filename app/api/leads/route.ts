import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPaginatedLeads } from "@/lib/queries/dashboard";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;

  const data = await getPaginatedLeads(page);
  return NextResponse.json(data);
}