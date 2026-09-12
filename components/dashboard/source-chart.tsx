"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#94a3b8"];

const LABELS: Record<string, string> = {
  FACEBOOK: "Facebook", WHATSAPP: "WhatsApp", REFERRAL: "Referral",
  WEBSITE: "Website", PHYSICAL: "Physical", OTHER: "Other",
};

export function SourceChart({ data }: { data: { source: string; count: number; percentage: number }[] }) {
  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.source, { label: LABELS[d.source] ?? d.source, color: COLORS[i % COLORS.length] }])
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leads by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[320px] max-h-[320px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
            <Pie data={data} dataKey="count" nameKey="source" innerRadius={60} strokeWidth={4}>
              {data.map((entry, i) => (
                <Cell key={entry.source} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}