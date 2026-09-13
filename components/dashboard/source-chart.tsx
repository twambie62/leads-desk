"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#94a3b8"];

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

      <CardContent className="flex flex-1 flex-col items-center justify-center gap-3">
        <ChartContainer
          config={chartConfig}
          className="mx-auto -mt-8 -mb-4 aspect-square h-[280px] w-full max-w-[320px] sm:h-[320px]"
        >
          <PieChart >
            <ChartTooltip
              content={<ChartTooltipContent nameKey="source" />}
            />

            <Pie
              data={data}
              dataKey="count"
              nameKey="source"
              innerRadius={60}
              strokeWidth={4}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.source}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>

            {/*<ChartLegend content={<ChartLegendContent nameKey="source" />} />*/}
          </PieChart>

        </ChartContainer>
        {/* Responsive Legend */}
        <div className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 px-2">
          {data.map((entry, i) => (
            <div
              key={entry.source}
              className="flex items-center gap-2 text-sm"
            >
      <span
        className="h-2 w-2 shrink-0 rounded-[2px]"
        style={{
          backgroundColor: COLORS[i % COLORS.length],
        }}
      />

              <span  className="whitespace-nowrap text-xs ">
        {LABELS[entry.source] ?? entry.source}
      </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}