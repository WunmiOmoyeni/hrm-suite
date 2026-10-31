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
import { useStore } from "@/lib/store";

export function ApplicantFormDialog({
  defaultJobId,
  children,
}: {
  defaultJobId?: string;
  children: React.ReactNode; // the button that opens the dialog
}) {
  const jobs = useStore((s) => s.jobs);
  const addApplicant = useStore((s) => s.addApplicant);
  const openJobs = jobs.filter((j) => j.status === "OPEN");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobId, setJobId] = useState("");

  function openDialog() {
    if (openJobs.length === 0) {
      toast.error("Post an open job first");
      return;
    }
    setName("");
    setEmail("");
    setJobId(
      defaultJobId && openJobs.some((j) => j.id === defaultJobId)
        ? defaultJobId
        : openJobs[0].id
    );
    setOpen(true);
  }

  function submit() {
    if (!name.trim() || !email.trim() || !jobId) {
      toast.error("Name, email and job are required");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    addApplicant({ name: name.trim(), email: email.trim(), jobId });
    toast.success("Applicant added");
    setOpen(false);
  }

  return (
    <>
      <span onClick={openDialog}>{children}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add applicant</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Applying for</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              >
                {openJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Add applicant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}