"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useHire } from "@/lib/use-hire";
import type { Stage } from "@/lib/types";

const stageLabel = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const EDITABLE_STAGES: Stage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

function Body({
  applicantId,
  onClose,
}: {
  applicantId: string;
  onClose: () => void;
}) {
  const applicant = useStore((s) =>
    s.applicants.find((a) => a.id === applicantId)
  );
  const jobs = useStore((s) => s.jobs);
  const departments = useStore((s) => s.departments);
  const moveApplicant = useStore((s) => s.moveApplicant);
  const updateApplicantNotes = useStore((s) => s.updateApplicantNotes);
  const hire = useHire();
  const [notes, setNotes] = useState(applicant?.notes ?? "");

  if (!applicant) return null;

  const job = jobs.find((j) => j.id === applicant.jobId);
  const dept = departments.find((d) => d.id === job?.departmentId);
  const isHired = applicant.stage === "HIRED";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{applicant.name}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-2 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            {applicant.email}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Applied for</div>
            {job?.title} · {dept?.name}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Stage</Label>
          {isHired ? (
            <div className="flex items-center gap-3">
              <Badge>Hired</Badge>
              {applicant.employeeId && (
                <Link
                  href={`/employees/${applicant.employeeId}`}
                  className="text-sm underline"
                >
                  View employee profile
                </Link>
              )}
            </div>
          ) : (
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={applicant.stage}
              onChange={(e) =>
                moveApplicant(applicant.id, e.target.value as Stage)
              }
            >
              {EDITABLE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {stageLabel(s)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Interview feedback, salary expectations..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            updateApplicantNotes(applicant.id, notes);
            toast.success("Notes saved");
          }}
        >
          Save notes
        </Button>
        {applicant.stage === "OFFER" && (
          <Button
            onClick={() => {
              updateApplicantNotes(applicant.id, notes);
              if (hire(applicant.id, applicant.name)) onClose();
            }}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Hire
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export function ApplicantDetailDialog({
  applicantId,
  onClose,
}: {
  applicantId: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!applicantId}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        {applicantId && (
          <Body key={applicantId} applicantId={applicantId} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}