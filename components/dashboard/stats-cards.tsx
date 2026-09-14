"use client";

import { useState } from "react";
import {
  Users01,
  Phone01,
  CheckVerified01,
  VideoRecorder,
  ArrowUp,
  ArrowDown,
  Minus,
} from "@untitledui/icons";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const ICONS: Record<string, React.ElementType> = {
  NEW_LEAD: Users01,
  CONTACTED: Phone01,
  QUALIFIED: CheckVerified01,
  MEETING_SCHEDULED: VideoRecorder,
};

function Delta({
                 current,
                 previous,
                 period,
               }: {
  current: number;
  previous: number;
  period: "week" | "month";
}) {
  const diff = current - previous;
  const label = period === "week" ? "week" : "month";

  if (diff === 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Minus className="size-3" />
        No change
      </span>
    );
  }

  const isUp = diff > 0;

  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${
        isUp ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {isUp ? (
        <ArrowUp className="size-3" />
      ) : (
        <ArrowDown className="size-3" />
      )}

      {Math.abs(diff)} vs last {label}
    </span>
  );
}

function Percentage({
                      current,
                      previous,
                    }: {
  current: number;
  previous: number;
}) {
  if (previous === 0) {
    return (
      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
        0.00%
      </span>
    );
  }

  const percentage = ((current - previous) / previous) * 100;

  return (
    <span className="rounded-full border border-border px-[6.5px] py-0.5 text-[10px] text-foreground/72">
      {percentage > 0 ? "+" : ""}
      {percentage.toFixed(1)}%
    </span>
  );
}

export function StatsCards({ data }: { data: StatRow[] }) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  return (
    <div>
      {/* Comparison selector */}
      <div className="mb-3 flex justify-end">
        <Tabs
          value={period}
          onValueChange={(value) =>
            setPeriod(value as "week" | "month")
          }
        >
          <TabsList className="h-8 rounded-lg bg-muted-foreground/10 p-1">
            <TabsTrigger
              value="week"
              className="h-6 rounded-md px-2.5 text-xs"
            >
              vs Last Week
            </TabsTrigger>

            <TabsTrigger
              value="month"
              className="h-6 rounded-md px-2.5 text-xs"
            >
              vs Last Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((row) => {
          const current =
            period === "week" ? row.thisWeek : row.thisMonth;

          const previous =
            period === "week" ? row.lastWeek : row.lastMonth;

          const Icon = ICONS[row.status] ?? Users01;

          return (
            <Card
              key={row.status}
              className="border-0 shadow-none"
            >
              <CardContent className="pl-4 -mt-2.5 -mb-2.5">
                {/* Top row */}
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <Icon className="size-4 text-black/70" />
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {LABELS[row.status] ?? row.status}
                  </span>
                </div>

                {/* Number */}
                <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {row.allTime}
                </div>

                {/* Bottom row */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Delta
                    current={current}
                    previous={previous}
                    period={period}                  />

                  <Percentage
                    current={current}
                    previous={previous}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}