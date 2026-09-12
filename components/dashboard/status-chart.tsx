"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig, ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";

const LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  MEETING_SCHEDULED: "Meeting Scheduled",
  DISQUALIFIED: "Disqualified",
  LOST: "Lost",
  NO_RESPONSE: "No Response",
};

export function StatusChart({
                              daily, weekly, monthly, statusColors, statuses,
                            }: {
  daily: Record<string, string | number>[];
  weekly: Record<string, string | number>[];
  monthly: Record<string, string | number>[];
  statusColors: Record<string, string>;
  statuses: string[];
}) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const data = period === "daily" ? daily : period === "weekly" ? weekly : monthly;

  const chartConfig: ChartConfig = Object.fromEntries(
    statuses.map((s) => [s, { label: LABELS[s] ?? s, color: statusColors[s] }])
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lead Status Over Time</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {statuses.map((s) => (
              <Bar key={s} dataKey={s} stackId="a" fill={statusColors[s]} radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}