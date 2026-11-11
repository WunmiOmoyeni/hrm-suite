"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { screenApplication } from "@/lib/ai-screen";
import { useHydrated, useStore } from "@/lib/store";

const field = "w-full rounded-md border bg-background px-3 py-2 text-sm";
const empty = { name: "", email: "", phone: "", jobId: "", experience: "" };

export default function ApplyPage() {
  const hydrated = useHydrated();
  const jobs = useStore((s) => s.jobs);
  const addApplication = useStore((s) => s.addApplication);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!hydrated) return null;

  const openJobs = jobs.filter((j) => j.status === "OPEN");
  const set =
    (k: keyof typeof empty) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobs.find((j) => j.id === form.jobId);
    if (!job) return;
    setBusy(true);
    const result = await screenApplication(form.experience, job);
    addApplication(form, result);
    setBusy(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card className="space-y-3 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          <h1 className="text-xl font-semibold">Application received</h1>
          <p className="text-sm text-muted-foreground">
            Thank you for applying. Our team will be in touch if your profile
            is a match.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setForm(empty);
              setDone(false);
            }}
          >
            Submit another application
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <Card className="p-6">
        <h1 className="text-xl font-semibold">Apply for a position</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          Tell us a bit about yourself and we'll review your application.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input className={field} placeholder="Full name" required
            value={form.name} onChange={set("name")} />
          <input className={field} type="email" placeholder="Email" required
            value={form.email} onChange={set("email")} />
          <input className={field} placeholder="Phone" required
            value={form.phone} onChange={set("phone")} />
          <select className={field} required value={form.jobId}
            onChange={set("jobId")}>
            <option value="">Select a position</option>
            {openJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <textarea className={field} rows={6} required
            placeholder="Describe your experience and skills"
            value={form.experience} onChange={set("experience")} />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </Card>
    </div>
  );
}