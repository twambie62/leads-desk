"use client";

import { useState } from "react";
import {
  Pie, PieChart, Cell,
  Bar, BarChart, XAxis, YAxis, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig, ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#94a3b8",
];

const LABELS: Record<string, string> = {
  FACEBOOK: "Facebook", WHATSAPP: "WhatsApp", REFERRAL: "Referral",
  WEBSITE: "Website", PHYSICAL: "Physical", OTHER: "Other",
};

type ChartType = "Donut" | "Bar Chart" | "Radar";

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "Donut", label: "Donut" },
  { value: "Bar Chart", label: "Bar Chart" },
  { value: "Radar", label: "Radar" },
];

export function SourceChart({ data }: { data: { source: string; count: number; percentage: number }[] }) {
  const [chartType, setChartType] = useState<ChartType>("Donut");

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.source, { label: LABELS[d.source] ?? d.source, color: COLORS[i % COLORS.length] }])
  );

  return (
    <Card className="h-full min-w-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Leads by Source</CardTitle>
        <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
          <SelectTrigger className="max-h-8.5 w-[112px] rounded-lg text-sm bg-white hover:bg-white focus:bg-white dark:bg-transparent dark:hover:bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHART_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 min-w-0">
        {chartType === "Donut" && (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[272px] w-full max-w-[320px] sm:h-[320px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
              <Pie data={data} dataKey="count" nameKey="source" innerRadius={60} strokeWidth={4}>
                {data.map((entry, i) => (
                  <Cell key={entry.source} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="source" className="flex-wrap gap-x-4 gap-y-1.5" />} />            </PieChart>
          </ChartContainer>
        )}

        {chartType === "Bar Chart" && (
          <ChartContainer config={chartConfig} className="h-[270px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="source"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => LABELS[value] ?? value}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
              <Bar dataKey="count" radius={4}>
                {data.map((entry, i) => (
                  <Cell key={entry.source} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}

        {chartType === "Radar" && (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[270px] w-full max-w-[320px] sm:h-[320px]"
          >
            <RadarChart data={data}>
              <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="source" tickFormatter={(value) => LABELS[value] ?? value} />
              <PolarRadiusAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Radar
                dataKey="count"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}