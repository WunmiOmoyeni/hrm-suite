"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, fullName } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/store";
import { STAGES } from "@/lib/types";

const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

function DashboardView() {
  const departments = useStore((s) => s.departments);
  const employees = useStore((s) => s.employees);
  const jobs = useStore((s) => s.jobs);
  const applicants = useStore((s) => s.applicants);
  const inventory = useStore((s) => s.inventory);
  const assignments = useStore((s) => s.assignments);

  const current = employees.filter((e) => e.status !== "TERMINATED");
  const openJobs = jobs.filter((j) => j.status === "OPEN");
  const inPipeline = applicants.filter(
    (a) => a.stage !== "HIRED" && a.stage !== "REJECTED"
  ).length;
  const lowStock = inventory.filter((i) => i.quantity <= i.reorderLevel);
  const assetsOut = assignments
    .filter((a) => !a.returnedAt)
    .reduce((n, a) => n + a.quantity, 0);

  const recentHires = [...employees]
    .sort((a, b) => b.hireDate.localeCompare(a.hireDate))
    .slice(0, 5);

  const deptCounts = departments.map((d) => ({
    ...d,
    count: current.filter((e) => e.departmentId === d.id).length,
  }));
  const maxDept = Math.max(1, ...deptCounts.map((d) => d.count));

  const kpis = [
    { title: "Headcount", value: current.length, href: "/employees" },
    { title: "Open positions", value: openJobs.length, href: "/recruitment" },
    { title: "Candidates in pipeline", value: inPipeline, href: "/recruitment" },
    { title: "Low-stock items", value: lowStock.length, href: "/inventory" },
    { title: "Assets assigned", value: assetsOut, href: "/inventory" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview across people, hiring and inventory.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.title} href={k.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {k.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{k.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/recruitment" className="hover:underline">
                Hiring pipeline
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="flex items-center justify-between text-sm"
              >
                <span>{label(stage)}</span>
                <Badge variant="secondary">
                  {applicants.filter((a) => a.stage === stage).length}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deptCounts.map((d) => (
              <div key={d.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{d.name}</span>
                  <span className="font-medium">{d.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${(d.count / maxDept) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/inventory" className="hover:underline">
                Low-stock alerts
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All items are above their reorder level.
              </p>
            )}
            {lowStock.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{i.name}</span>
                <Badge variant="destructive">
                  {i.quantity === 0 ? "Out of stock" : `${i.quantity} left`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent hires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentHires.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <Link
                    href={`/employees/${e.id}`}
                    className="font-medium hover:underline"
                  >
                    {fullName(e)}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {e.title}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(e.hireDate)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Link href="/recruitment" className="hover:underline">
                Open positions
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openJobs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No open positions.
              </p>
            )}
            {openJobs.map((j) => {
              const count = applicants.filter(
                (a) => a.jobId === j.id && a.stage !== "REJECTED"
              ).length;
              const dept = departments.find((d) => d.id === j.departmentId);
              return (
                <div
                  key={j.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {dept?.name}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {count} candidate{count === 1 ? "" : "s"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <DashboardView />;
}