import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma,LeadStatus, LeadSource } from "@/src/generated/prisma";
import {
  startOfWeek, subWeeks, startOfMonth, subMonths,
  startOfDay, subDays, format, eachDayOfInterval,
  eachWeekOfInterval, eachMonthOfInterval, endOfDay,
} from "date-fns";

const PIPELINE_STATUSES: LeadStatus[] = [
  "NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED",
];

export async function getStatsCardsData(agentId?: string) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const lastWeekStart = subWeeks(weekStart, 1);
  const monthStart = startOfMonth(now);
  const lastMonthStart = subMonths(monthStart, 1);
  const scope = agentId ? { assignedAgentId: agentId } : {};

  const [allTime, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { deletedAt: null, ...scope } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { deletedAt: null, ...scope, createdAt: { gte: weekStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { deletedAt: null, ...scope, createdAt: { gte: lastWeekStart, lt: weekStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { deletedAt: null, ...scope, createdAt: { gte: monthStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true, where: { deletedAt: null, ...scope, createdAt: { gte: lastMonthStart, lt: monthStart } } }),
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
  NEW_LEAD: "hsl(var(--chart-1))",
  CONTACTED: "hsl(var(--chart-2))",
  QUALIFIED: "hsl(var(--chart-3))",
  MEETING_SCHEDULED: "hsl(var(--chart-4))",
  DISQUALIFIED: "hsl(var(--chart-5))",
  LOST: "hsl(var(--chart-5))",
  NO_RESPONSE: "hsl(var(--chart-5))",
};

const ALL_STATUSES: LeadStatus[] = [
  "NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED",
  "DISQUALIFIED", "LOST", "NO_RESPONSE",
];

export async function getStatusChartData(agentId?: string) {

  const scope = agentId ? { assignedAgentId: agentId } : {};
  const rangeStart = subMonths(startOfDay(new Date()), 12);
  const leads = await prisma.lead.findMany({
    where: { deletedAt: null, ...scope, createdAt: { gte: rangeStart } },
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
  const rows = await prisma.lead.groupBy({  by: ["source"],  _count: true, where: { deletedAt: null }, });
  const total = rows.reduce((sum, r) => sum + r._count, 0);
  return rows.map((r) => ({
    source: r.source,
    count: r._count,
    percentage: total > 0 ? Math.round((r._count / total) * 100) : 0,
  }));
}

const PAGE_SIZE = 10;

export async function getPaginatedLeads(page: number, agentId?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const scope = agentId ? { assignedAgentId: agentId } : {};

  const [leads, totalCount] = await Promise.all([
    prisma.lead.findMany({
      where: { deletedAt: null, ...scope },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { assignedAgent: { select: { id: true, name: true } } },
    }),
    prisma.lead.count({ where: { deletedAt: null, ...scope } }),
  ]);

  return { leads, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), page };
}

export async function getLeadById(id: string, agentId?: string) {
  const scope = agentId ? { assignedAgentId: agentId } : {};
  return prisma.lead.findFirst({
    where: { id, deletedAt: null, ...scope },
    include: {
      assignedAgent: { select: { id: true, name: true, email: true } },
      createdBy: { select: { name: true } },
      activities: { orderBy: { activityDate: "desc" }, include: { agent: { select: { name: true } } } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true } } } },
    },
  });
}

export async function getSalesAgents() {
  return prisma.user.findMany({
    where: { role: "SALES_AGENT", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}


const NON_ACTIONABLE_STATUSES: LeadStatus[] = ["DISQUALIFIED", "LOST", "NO_RESPONSE"];

export async function getTodaysFollowUps(agentId?: string) {
  const cutoff = endOfDay(new Date());

  const activities = await prisma.leadActivity.findMany({
    where: {
      nextFollowUpDate: { lte: cutoff, not: null },
      lead: {
        deletedAt: null,
        status: { notIn: NON_ACTIONABLE_STATUSES },
        ...(agentId ? { assignedAgentId: agentId } : {}),
      },
    },
    orderBy: { nextFollowUpDate: "asc" },
    include: {
      lead: {
        select: { id: true, leadName: true, phoneNumber: true, whatsappNumber: true, email: true, status: true },
      },
    },
  });

  // Keep only the most relevant (soonest) follow-up per lead
  const seen = new Set<string>();
  const result = [];
  for (const activity of activities) {
    if (seen.has(activity.leadId)) continue;
    seen.add(activity.leadId);
    result.push(activity);
  }
  return result;
}

export async function getSecondaryStatsData(agentId?: string) {
  const scope = agentId ? { assignedAgentId: agentId } : {};
  const [total, disqualified, lost, noResponse] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null, ...scope } }),
    prisma.lead.count({ where: { deletedAt: null, ...scope, status: "DISQUALIFIED" } }),
    prisma.lead.count({ where: { deletedAt: null, ...scope, status: "LOST" } }),
    prisma.lead.count({ where: { deletedAt: null, ...scope, status: "NO_RESPONSE" } }),
  ]);
  return { total, disqualified, lost, noResponse };
}

export type LeadFilters = {
  page: number;
  pageSize?: number;
  agentId?: string; // forced scope — always wins over assignedAgentId below
  status?: string;
  source?: string;
  assignedAgentId?: string; // "unassigned" sentinel handled specially
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "leadName";
  sortDir?: "asc" | "desc";
};

export async function getFilteredLeads(filters: LeadFilters) {
  const {
    page, pageSize = 10, agentId, status, source, assignedAgentId,
    search, dateFrom, dateTo, sortBy = "createdAt", sortDir = "desc",
  } = filters;

  const skip = (page - 1) * pageSize;
  const where: Prisma.LeadWhereInput = { deletedAt: null };

  if (agentId) {
    where.assignedAgentId = agentId;
  } else if (assignedAgentId === "unassigned") {
    where.assignedAgentId = null;
  } else if (assignedAgentId) {
    where.assignedAgentId = assignedAgentId;
  }

  if (status) where.status = status as LeadStatus;
  if (source) where.source = source as LeadSource;

  if (search) {
    where.OR = [
      { leadName: { contains: search, mode: "insensitive" } },
      { businessName: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) } : {}),
    };
  }

  const [leads, totalCount] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take: pageSize,
      include: { assignedAgent: { select: { id: true, name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / pageSize)), page, pageSize,
  };
}