import Link from "next/link";
import {
  Mail, MessageCircle, Phone,
  Clock, AlertCircle,
} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

type FollowUp = {
  id: string;
  nextFollowUpDate: Date | null;
  lead: {
    id: string;
    leadName: string;
    phoneNumber: string;
    whatsappNumber: string | null;
    email: string | null;
    status: string;
  };
};

export function TodaysFollowUps({followUps,}: { followUps: FollowUp[]; }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>Today's Follow-ups</CardTitle>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        {followUps.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nothing due today — you're all caught up.
            </p>
          </div>
        ) : (
          <ul className="space-y-0">
            {followUps.map((f, index) => {
              const dueDate = f.nextFollowUpDate
                ? new Date(f.nextFollowUpDate)
                : null;

              const isOverdue = dueDate ? dueDate < today : false;

              const initials = f.lead.leadName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((name) => name[0])
                .join("")
                .toUpperCase();

              const avatarColors = [
                "bg-blue-600",
                "bg-violet-600",
                "bg-emerald-600",
                "bg-orange-600",
                "bg-pink-600",
                "bg-cyan-600",
                "bg-indigo-600",
                "bg-rose-600",
              ];

              const avatarColor = avatarColors[index % avatarColors.length];

              return (
                <li
                  key={f.id}
                  className=" border-b border-border p-3 transition-colors hover:bg-muted/40"
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${avatarColor}`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/agent/leads/${f.lead.id}`}
                        className="block truncate text-sm font-semibold hover:text-primary hover:underline"
                      >
                        {f.lead.leadName}
                      </Link>
                    </div>
                  </div>

                  {/* Phone + Status */}
                  <div className="mt-[-1px] ml-[50px] flex min-w-0 items-center gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {f.lead.phoneNumber}
                </span>

                    <span className="text-muted-foreground/40">•</span>

                    <Badge
                      variant={isOverdue ? "destructive" : "secondary"}
                      className="h-5 shrink-0 px-2 text-[10px] font-medium"
                    >
                      {isOverdue ? "Overdue" : "Due today"}
                    </Badge>
                  </div>

                  {/* Contact actions */}
                  <div className="mt-0 ml-[52px] flex items-center gap-1 border-t border-border/0 pt-0">
                    {f.lead.whatsappNumber && (
                      <a
                        href={`https://wa.me/${f.lead.whatsappNumber.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}

                    {f.lead.email && (
                      <a
                        href={`mailto:${f.lead.email}`}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}

                    <a
                      href={`tel:${f.lead.phoneNumber}`}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}