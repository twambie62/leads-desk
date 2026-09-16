// app/(protected)/admin/leads/page.tsx  (same pattern for follow-ups, meetings, sales, training, reports, agents, settings — just change the title)
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function TrainingPage() {
  return <ComingSoon title="Training" />;
}