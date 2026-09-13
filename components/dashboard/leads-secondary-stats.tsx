import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeadsSecondaryStats({
                                      data,
                                    }: {
  data: { total: number; disqualified: number; lost: number; noResponse: number };
}) {
  const cards = [
    { label: "Total Leads", value: data.total },
    { label: "Disqualified", value: data.disqualified },
    { label: "Lost", value: data.lost },
    { label: "No Response", value: data.noResponse },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}