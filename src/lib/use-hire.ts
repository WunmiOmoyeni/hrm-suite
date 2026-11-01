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
      duration: 10000,
      action: {
        label: "Assign kit & view",
        onClick: () => {
          const { assigned, unavailable } =
            useStore.getState().assignStandardKit(employeeId);
          if (assigned.length) toast.success(`Assigned: ${assigned.join(", ")}`);
          if (unavailable.length)
            toast.error(`Out of stock: ${unavailable.join(", ")}`);
          router.push(`/employees/${employeeId}`);
        },
      },
    });
    return employeeId;
  };
}