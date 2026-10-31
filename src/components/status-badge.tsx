import { Badge } from "@/components/ui/badge";
import type { EmployeeStatus } from "@/lib/types";

const config: Record<
  EmployeeStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  ACTIVE: { label: "Active", variant: "default" },
  ON_LEAVE: { label: "On leave", variant: "secondary" },
  TERMINATED: { label: "Terminated", variant: "destructive" },
};

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}