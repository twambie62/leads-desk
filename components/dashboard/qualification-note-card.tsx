"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateQualificationNoteAction, type UpdateQualificationState } from "@/lib/actions/leads";

const initialState: UpdateQualificationState = {};

export function QualificationNoteCard({
                                        leadId, basePath, currentNote,
                                      }: {
  leadId: string;
  basePath: string;
  currentNote: string | null;
}) {
  const boundAction = updateQualificationNoteAction.bind(null, leadId, basePath);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Qualification Note</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-2">
          <Textarea
            name="qualificationNote"
            defaultValue={currentNote ?? ""}
            placeholder="Why is this lead qualified (or not)? Add a short note..."
            rows={3}
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-emerald-600">Saved.</p>}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving..." : "Save Note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}