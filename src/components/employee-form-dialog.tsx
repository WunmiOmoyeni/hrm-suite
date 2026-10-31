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
import type { Employee, EmployeeStatus } from "@/lib/types";

type FormData = Omit<Employee, "id">;

const selectClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm";

export function EmployeeFormDialog({
  employee,
  children,
}: {
  employee?: Employee;
  children: React.ReactNode; // the button that opens the dialog
}) {
  const departments = useStore((s) => s.departments);
  const addEmployee = useStore((s) => s.addEmployee);
  const updateEmployee = useStore((s) => s.updateEmployee);

  const blank = (): FormData => ({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    status: "ACTIVE",
    hireDate: new Date().toISOString().slice(0, 10),
    departmentId: departments[0]?.id ?? "",
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(blank);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function openDialog() {
    setForm(employee ? { ...employee } : blank());
    setOpen(true);
  }

  function submit() {
    if (!form.firstName.trim() || !form.email.trim() || !form.title.trim()) {
      toast.error("First name, email and job title are required");
      return;
    }
    if (employee) {
      updateEmployee(employee.id, form);
      toast.success("Employee updated");
    } else {
      addEmployee(form);
      toast.success("Employee added");
    }
    setOpen(false);
  }

  return (
    <>
      <span onClick={openDialog}>{children}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {employee ? "Edit employee" : "Add employee"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Last name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

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
                  onChange={(e) =>
                    set("status", e.target.value as EmployeeStatus)
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Hire date</Label>
              <Input
                type="date"
                value={form.hireDate}
                onChange={(e) => set("hireDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {employee ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}