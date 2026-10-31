"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RotateCcw,
  UserCheck,
  X,
} from "lucide-react";
import { ApplicantDetailDialog } from "@/components/applicant-detail-dialog";
import { ApplicantFormDialog } from "@/components/applicant-form-dialog";
import { JobFormDialog } from "@/components/job-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHydrated, useStore } from "@/lib/store";
import { useHire } from "@/lib/use-hire";
import { STAGES, type Applicant, type Stage } from "@/lib/types";

const stageLabel = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const FLOW: Stage[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER"];

function ApplicantCard({
  a,
  jobTitle,
  showJob,
  onOpen,
}: {
  a: Applicant;
  jobTitle: string;
  showJob: boolean;
  onOpen: () => void;
}) {
  const moveApplicant = useStore((s) => s.moveApplicant);
  const hire = useHire();

  const idx = FLOW.indexOf(a.stage);
  const back = idx > 0 ? FLOW[idx - 1] : null;
  const forward = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

  return (
    <div className="rounded-md border bg-background p-3 shadow-sm">
      <button
        className="text-left text-sm font-medium hover:underline"
        onClick={onOpen}
      >
        {a.name}
      </button>
      <div className="text-xs text-muted-foreground">{a.email}</div>
      {showJob && <div className="mt-1 text-xs">{jobTitle}</div>}
      {a.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {a.notes}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1">
        {back && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title={`Move to ${stageLabel(back)}`}
            onClick={() => moveApplicant(a.id, back)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {forward && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title={`Move to ${stageLabel(forward)}`}
            onClick={() => moveApplicant(a.id, forward)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {a.stage === "OFFER" && (
          <Button
            size="sm"
            className="h-7"
            onClick={() => hire(a.id, a.name)}
          >
            <UserCheck className="mr-1 h-4 w-4" />
            Hire
          </Button>
        )}
        {idx >= 0 && (
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto h-7 w-7 text-destructive"
            title="Reject"
            onClick={() => moveApplicant(a.id, "REJECTED")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {a.stage === "REJECTED" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={() => moveApplicant(a.id, "APPLIED")}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reopen
          </Button>
        )}
        {a.stage === "HIRED" && a.employeeId && (
          <Link
            href={`/employees/${a.employeeId}`}
            className="text-xs underline"
          >
            View profile
          </Link>
        )}
      </div>
    </div>
  );
}

function RecruitmentView() {
  const jobs = useStore((s) => s.jobs);
  const applicants = useStore((s) => s.applicants);
  const departments = useStore((s) => s.departments);
  const updateJob = useStore((s) => s.updateJob);

  const [view, setView] = useState<"pipeline" | "jobs">("pipeline");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = applicants.filter(
    (a) => jobFilter === "ALL" || a.jobId === jobFilter
  );
  const jobTitle = (id: string) =>
    jobs.find((j) => j.id === id)?.title ?? "—";
  const deptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? "—";
  const openCount = jobs.filter((j) => j.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Recruitment</h2>
          <p className="text-sm text-muted-foreground">
            {openCount} open positions · {applicants.length} applicants
          </p>
        </div>
        <div className="flex gap-2">
          <ApplicantFormDialog
            defaultJobId={jobFilter === "ALL" ? undefined : jobFilter}
          >
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add applicant
            </Button>
          </ApplicantFormDialog>
          <JobFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post job
            </Button>
          </JobFormDialog>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          <Button
            variant={view === "pipeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("pipeline")}
          >
            Pipeline
          </Button>
          <Button
            variant={view === "jobs" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("jobs")}
          >
            Jobs
          </Button>
        </div>

        {view === "pipeline" && (
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="ALL">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
                {j.status === "CLOSED" ? " (closed)" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {view === "pipeline" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STAGES.map((stage) => {
            const inStage = visible.filter((a) => a.stage === stage);
            return (
              <div
                key={stage}
                className="w-64 shrink-0 space-y-3 rounded-lg bg-muted/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {stageLabel(stage)}
                  </span>
                  <Badge variant="secondary">{inStage.length}</Badge>
                </div>
                {inStage.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No candidates
                  </p>
                )}
                {inStage.map((a) => (
                  <ApplicantCard
                    key={a.id}
                    a={a}
                    jobTitle={jobTitle(a.jobId)}
                    showJob={jobFilter === "ALL"}
                    onOpen={() => setSelectedId(a.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Hired</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => {
                const forJob = applicants.filter((a) => a.jobId === j.id);
                const hired = forJob.filter((a) => a.stage === "HIRED").length;
                return (
                  <TableRow key={j.id}>
                    <TableCell>
                      <div className="font-medium">{j.title}</div>
                      <div className="line-clamp-1 max-w-sm text-xs text-muted-foreground">
                        {j.description}
                      </div>
                    </TableCell>
                    <TableCell>{deptName(j.departmentId)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={j.status === "OPEN" ? "default" : "secondary"}
                      >
                        {j.status === "OPEN" ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>{forJob.length}</TableCell>
                    <TableCell>{hired}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setJobFilter(j.id);
                            setView("pipeline");
                          }}
                        >
                          View applicants
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateJob(j.id, {
                              status: j.status === "OPEN" ? "CLOSED" : "OPEN",
                            })
                          }
                        >
                          {j.status === "OPEN" ? "Close" : "Reopen"}
                        </Button>
                        <JobFormDialog job={j}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                        </JobFormDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <ApplicantDetailDialog
        applicantId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default function RecruitmentPage() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <RecruitmentView />;
}