"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "./store";

// Shared by the pipeline board and the applicant dialog
export function useHire() {
  const router = useRouter();
  const hireApplicant = useStore((s) => s.hireApplicant);

  return (applicantId: string, name: string) => {
    const employeeId = hireApplicant(applicantId);
    if (!employeeId) {
      toast.error("Could not hire this applicant");
      return null;
    }
    toast.success(`${name} hired. Employee record created.`, {
      action: {
        label: "View profile",
        onClick: () => router.push(`/employees/${employeeId}`),
      },
    });
    return employeeId;
  };
}