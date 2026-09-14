"use client";

import { useState } from "react";
import { Bar, BarChart, Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

type ChartType = "Bar Chart" | "Area Chart" | "Line Chart";

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "Bar Chart", label: "Bar Chart" },
  { value: "Area Chart", label: "Area Chart" },
  { value: "Line Chart", label: "Line Chart" },
];

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
  const [chartType, setChartType] = useState<ChartType>("Bar Chart");
  const data = period === "daily" ? daily : period === "weekly" ? weekly : monthly;

  const chartConfig: ChartConfig = Object.fromEntries(
    statuses.map((s) => [s, { label: LABELS[s] ?? s, color: statusColors[s] }])
  );

  const sharedAxes = (
    <>
      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
      <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={32} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </>
  );

  return (
    <Card className="h-full min-w-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <CardTitle>Lead Status Over Time</CardTitle>
          <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
            <SelectTrigger className="max-h-8.5  w-[112px] rounded-lg text-sm  bg-white hover:bg-white focus:bg-white dark:bg-transparent dark:hover:bg-transparent ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHART_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="daily" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="min-w-0">
        <div className="overflow-x-auto">
        <ChartContainer config={chartConfig}
                        className="h-[320px] overflow-x-auto "
                        style={{ minWidth: `${data.length * 60}px` }}
        >
          {chartType === "Bar Chart" ? (
            <BarChart data={data}>
              {sharedAxes}
              {statuses.map((s) => (
                <Bar key={s} dataKey={s} stackId="a" fill={`var(--color-${s})`} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          ) : chartType === "Area Chart" ? (
            <AreaChart data={data}>
              {sharedAxes}
              {statuses.map((s) => (
                <Area
                  key={s}
                  dataKey={s}
                  type="monotone"
                  stackId="a"
                  fill={`var(--color-${s})`}
                  fillOpacity={0.4}
                  stroke={`var(--color-${s})`}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={data}>
              {sharedAxes}
              {statuses.map((s) => (
                <Line
                  key={s}
                  dataKey={s}
                  type="monotone"
                  stackId="a"
                  stroke={`var(--color-${s})`}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          )}
        </ChartContainer>
          </div>
      </CardContent>
    </Card>
  );
}