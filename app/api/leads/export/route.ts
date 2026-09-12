// app/api/leads/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toCsv } from "@/lib/utils/csv";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedAgent: { select: { name: true } } },
  });

  const csv = toCsv(
    leads.map((l) => ({
      leadName: l.leadName,
      businessName: l.businessName,
      phoneNumber: l.phoneNumber,
      whatsappNumber: l.whatsappNumber,
      email: l.email,
      location: l.location,
      businessType: l.businessType,
      productInterested: l.productInterested,
      source: l.source,
      status: l.status,
      assignedAgent: l.assignedAgent?.name ?? "Unassigned",
      createdAt: l.createdAt.toISOString(),
    }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}