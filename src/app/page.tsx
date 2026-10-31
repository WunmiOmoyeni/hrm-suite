"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydrated, useStore } from "@/lib/store";
import { STAGES } from "@/lib/types";

const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function DashboardPage() {
  const hydrated = useHydrated();
  const { departments, employees, jobs, applicants, inventory, assignments } =
    useStore();

  if (!hydrated) return null;

  const headcount = employees.filter((e) => e.status !== "TERMINATED").length;
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;
  const inPipeline = applicants.filter(
    (a) => a.stage !== "HIRED" && a.stage !== "REJECTED"
  ).length;
  const lowStock = inventory.filter((i) => i.quantity <= i.reorderLevel);
  const assetsOut = assignments
    .filter((a) => !a.returnedAt)
    .reduce((n, a) => n + a.quantity, 0);

  const kpis = [
    { title: "Headcount", value: headcount },
    { title: "Open positions", value: openJobs },
    { title: "Candidates in pipeline", value: inPipeline },
    { title: "Low-stock items", value: lowStock.length },
    { title: "Assets assigned", value: assetsOut },
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
          <Card key={k.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiring pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STAGES.map((stage) => (
              <div key={stage} className="flex items-center justify-between text-sm">
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
          <CardContent className="space-y-2">
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span>{d.name}</span>
                <Badge variant="secondary">
                  {
                    employees.filter(
                      (e) =>
                        e.departmentId === d.id && e.status !== "TERMINATED"
                    ).length
                  }
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low-stock alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All items are above their reorder level.
              </p>
            )}
            {lowStock.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span>{i.name}</span>
                <Badge variant="destructive">
                  {i.quantity} left
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}