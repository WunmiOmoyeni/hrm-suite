"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Job, JobStatus } from "@/lib/types";

type FormData = Omit<Job, "id">;

const selectClass = "w-full rounded-md border bg-background px-3 py-2 text-sm";

export function JobFormDialog({
  job,
  children,
}: {
  job?: Job;
  children: React.ReactNode; // the button that opens the dialog
}) {
  const departments = useStore((s) => s.departments);
  const addJob = useStore((s) => s.addJob);
  const updateJob = useStore((s) => s.updateJob);

  const blank = (): FormData => ({
    title: "",
    description: "",
    status: "OPEN",
    departmentId: departments[0]?.id ?? "",
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(blank);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function openDialog() {
    setForm(job ? { ...job } : blank());
    setOpen(true);
  }

  function submit() {
    if (!form.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (job) {
      updateJob(job.id, form);
      toast.success("Job updated");
    } else {
      addJob(form);
      toast.success("Job posted");
    }
    setOpen(false);
  }

  return (
    <>
      <span onClick={openDialog}>{children}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{job ? "Edit job" : "Post a job"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Job title</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Department</Label>
                <select
                  className={selectClass}
                  value={form.departmentId}
                  onChange={(e) => set("departmentId", e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  className={selectClass}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as JobStatus)}
                >
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{job ? "Save changes" : "Post job"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}