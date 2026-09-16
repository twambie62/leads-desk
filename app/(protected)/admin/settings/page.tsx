// app/(protected)/admin/leads/page.tsx  (same pattern for follow-ups, meetings, sales, training, reports, agents, settings — just change the title)
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function SettingsPage() {
  return <ComingSoon title="Settings" />;
}