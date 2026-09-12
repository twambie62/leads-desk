import "server-only";
import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadSource } from "@/generated/prisma";
import {
  startOfWeek, subWeeks, startOfMonth, subMonths,
  startOfDay, subDays, format, eachDayOfInterval,
  eachWeekOfInterval, eachMonthOfInterval,
} from "date-fns";

const PIPELINE_STATUSES: LeadStatus[] = [
  "NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED",
];

export async function getStatsCardsData() {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const lastWeekStart = subWeeks(weekStart, 1);
  const monthStart = startOfMonth(now);
  const lastMonthStart = subMonths(monthStart, 1);

  const [allTime, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: weekStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: lastWeekStart, lt: weekStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: monthStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
  ]);

  const toMap = (rows: { status: LeadStatus; _count: number }[]) =>
    Object.fromEntries(rows.map((r) => [r.status, r._count])) as Record<string, number>;

  const allTimeMap = toMap(allTime);
  const thisWeekMap = toMap(thisWeek);
  const lastWeekMap = toMap(lastWeek);
  const thisMonthMap = toMap(thisMonth);
  const lastMonthMap = toMap(lastMonth);

  return PIPELINE_STATUSES.map((status) => ({
    status,
    allTime: allTimeMap[status] ?? 0,
    thisWeek: thisWeekMap[status] ?? 0,
    lastWeek: lastWeekMap[status] ?? 0,
    thisMonth: thisMonthMap[status] ?? 0,
    lastMonth: lastMonthMap[status] ?? 0,
  }));
}

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "var(--chart-1)",
  CONTACTED: "var(--chart-2)",
  QUALIFIED: "var(--chart-3)",
  MEETING_SCHEDULED: "var(--chart-4)",
  DISQUALIFIED: "var(--chart-5)",
  LOST: "var(--chart-5)",
  NO_RESPONSE: "var(--chart-5)",
};

const ALL_STATUSES: LeadStatus[] = [
  "NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED",
  "DISQUALIFIED", "LOST", "NO_RESPONSE",
];

export async function getStatusChartData() {
  const rangeStart = subMonths(startOfDay(new Date()), 12);
  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: { createdAt: true, status: true },
  });

  function bucket(labelFn: (d: Date) => string, buckets: Date[]) {
    const rows = buckets.map((d) => {
      const label = labelFn(d);
      const row: Record<string, string | number> = { period: label };
      for (const s of ALL_STATUSES) row[s] = 0;
      return row;
    });
    const bucketIndex = new Map(buckets.map((d, i) => [labelFn(d), i]));

    for (const lead of leads) {
      let label: string;
      if (labelFn === dayLabel) label = dayLabel(startOfDay(lead.createdAt));
      else if (labelFn === weekLabel) label = weekLabel(startOfWeek(lead.createdAt));
      else label = monthLabel(startOfMonth(lead.createdAt));

      const idx = bucketIndex.get(label);
      if (idx !== undefined) {
        rows[idx][lead.status] = (rows[idx][lead.status] as number) + 1;
      }
    }
    return rows;
  }

  const dayLabel = (d: Date) => format(d, "MMM d");
  const weekLabel = (d: Date) => format(d, "MMM d");
  const monthLabel = (d: Date) => format(d, "MMM yyyy");

  const daily = bucket(dayLabel, eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() }));
  const weekly = bucket(weekLabel, eachWeekOfInterval({ start: subWeeks(new Date(), 11), end: new Date() }));
  const monthly = bucket(monthLabel, eachMonthOfInterval({ start: subMonths(new Date(), 11), end: new Date() }));

  return { daily, weekly, monthly, statusColors: STATUS_COLORS, statuses: ALL_STATUSES };
}

export async function getSourceChartData() {
  const rows = await prisma.lead.groupBy({ by: ["source"], _count: true });
  const total = rows.reduce((sum, r) => sum + r._count, 0);
  return rows.map((r) => ({
    source: r.source,
    count: r._count,
    percentage: total > 0 ? Math.round((r._count / total) * 100) : 0,
  }));
}

const PAGE_SIZE = 10;

export async function getPaginatedLeads(page: number) {
  const skip = (page - 1) * PAGE_SIZE;

  const [leads, totalCount] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        assignedAgent: { select: { id: true, name: true } },
      },
    }),
    prisma.lead.count(),
  ]);

  return {
    leads,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    page,
  };
}

export async function getSalesAgents() {
  return prisma.user.findMany({
    where: { role: "SALES_AGENT", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}