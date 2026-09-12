"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type StatRow = {
  status: string;
  allTime: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
};

const LABELS: Record<string, string> = {
  NEW_LEAD: "New Leads",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  MEETING_SCHEDULED: "Meeting Scheduled",
};

function Delta({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  }
  const isUp = diff > 0;
  return (
    <span className={`flex items-center gap-1 text-xs ${isUp ? "text-emerald-600" : "text-red-600"}`}>
      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(diff)} vs last {previous === current ? "" : ""}
    </span>
  );
}

export function StatsCards({ data }: { data: StatRow[] }) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
          <TabsList>
            <TabsTrigger value="week">vs Last Week</TabsTrigger>
            <TabsTrigger value="month">vs Last Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((row) => {
          const current = period === "week" ? row.thisWeek : row.thisMonth;
          const previous = period === "week" ? row.lastWeek : row.lastMonth;
          return (
            <Card key={row.status}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {LABELS[row.status] ?? row.status}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{row.allTime}</div>
                <Delta current={current} previous={previous} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}