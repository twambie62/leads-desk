import {notFound} from "next/navigation";
import Link from "next/link";
import {Mail, MessageCircle, ArrowLeft} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {getLeadById, getSalesAgents,} from "@/lib/queries/dashboard";
import {LeadStatusControl} from "@/components/dashboard/lead-status-control";
import {LeadDetailsActions} from "@/components/dashboard/lead-details-actions";
import { AddActivityDialog } from "@/components/dashboard/add-activity-dialog";
import { QualificationNoteCard } from "@/components/dashboard/qualification-note-card";

export default async function LeadDetailsPage({params,}: { params: Promise<{ id: string }>; }) {
  const {id} = await params;
  const [lead, agents] = await Promise.all([getLeadById(id), getSalesAgents(),]);
  if (!lead) {
    notFound();
  }
  return (<div className="flex flex-col gap-6 p-6"> {/* Header */}
    <div className="flex items-center justify-between"><Button variant="ghost" size="sm" asChild> <Link
      href="/admin/dashboard" className="flex items-center gap-1"> <ArrowLeft className="h-4 w-4"/> Back to Dashboard
    </Link> </Button> <LeadDetailsActions lead={lead} agents={agents}/></div>
    {/* Lead Details + Status */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"> {/* Lead Information */} <Card className="lg:col-span-2">
      <CardHeader> <CardTitle>{lead.leadName}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm"> <Field label="Business Name" value={lead.businessName}/> <Field
      label="Business Type" value={lead.businessType}/> <Field label="Phone Number" value={lead.phoneNumber}/> <Field
      label="Location" value={lead.location}/> <Field label="Product Interested" value={lead.productInterested}/> <Field
      label="Source" value={lead.source}/> <Field label="Created By" value={lead.createdBy?.name}/> <Field
      label="Created On" value={lead.createdAt.toLocaleDateString()}/> {/* Email */} {lead.email && (
      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> <a
        href={`mailto:${lead.email}`} className="text-primary hover:underline"> {lead.email} </a>
      </div>)} {/* WhatsApp */} {lead.whatsappNumber && (
      <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-muted-foreground"/> <a
        href={`https://wa.me/${lead.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
        className="text-primary hover:underline"> {lead.whatsappNumber} </a></div>)} </CardContent>
    </Card> {/* Status */} <Card> <CardHeader> <CardTitle>Status</CardTitle> </CardHeader> <CardContent>
      <LeadStatusControl leadId={lead.id} status={lead.status}/> {lead.disqualifiedReason && (
      <p className="mt-3 text-sm text-muted-foreground"><span
        className="font-medium text-foreground"> Reason: </span>{" "} {lead.disqualifiedReason} </p>)} <p
      className="mt-4 text-sm text-muted-foreground"> Assigned to:{" "} <span
      className="font-medium text-foreground"> {lead.assignedAgent?.name ?? "Unassigned"} </span></p></CardContent>
    </Card></div>
    {/* Activity Timeline */} <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Timeline</CardTitle>
        <AddActivityDialog leadId={lead.id} basePath="/admin" />  {/* "/agent" on the agent page */}
      </CardHeader>
      <CardContent> {lead.activities.length === 0 ? (
        <p className="text-sm text-muted-foreground"> No activity logged yet. </p>) : (
        <ul className="space-y-3"> {lead.activities.map((activity) => (
          <li key={activity.id} className="border-l-2 border-primary/30 pl-3 text-sm"><p
            className="font-medium"> {activity.activityType.replaceAll("_", " ")} —{" "} {activity.agent.name} </p> <p
            className="text-muted-foreground"> {activity.notes} </p> <p
            className="text-xs text-muted-foreground"> {activity.activityDate.toLocaleString()} </p>
          </li>))} </ul>)} </CardContent>

    </Card>
    <QualificationNoteCard leadId={lead.id} basePath="/admin" currentNote={lead.qualificationNote} />

  </div>);
}

function Field({label, value,}: { label: string; value?: string | null; }) {
  return (<div><p className="text-xs text-muted-foreground">
    {label} </p> <p className="font-medium">
    {value ?? "—"} </p></div>);
}