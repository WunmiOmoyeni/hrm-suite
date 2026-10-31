"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { EmployeeFormDialog } from "@/components/employee-form-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, fullName } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/store";

const selectClass = "rounded-md border bg-background px-3 py-2 text-sm";

function EmployeesView() {
  const employees = useStore((s) => s.employees);
  const departments = useStore((s) => s.departments);

  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const q = query.toLowerCase();
  const rows = employees.filter(
    (e) =>
      (dept === "ALL" || e.departmentId === dept) &&
      (status === "ALL" || e.status === status) &&
      `${fullName(e)} ${e.email} ${e.title}`.toLowerCase().includes(q)
  );

  const deptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">
            {employees.length} people across {departments.length} departments.
          </p>
        </div>
        <EmployeeFormDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add employee
          </Button>
        </EmployeeFormDialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-xs bg-background"
          placeholder="Search name, email or title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={selectClass}
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          <option value="ALL">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hired</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No employees match your filters.
                </TableCell>
              </TableRow>
            )}
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Link
                    href={`/employees/${e.id}`}
                    className="font-medium hover:underline"
                  >
                    {fullName(e)}
                  </Link>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </TableCell>
                <TableCell>{e.title}</TableCell>
                <TableCell>{deptName(e.departmentId)}</TableCell>
                <TableCell>
                  <StatusBadge status={e.status} />
                </TableCell>
                <TableCell>{formatDate(e.hireDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function EmployeesPage() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <EmployeesView />;
}