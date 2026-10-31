import type { Employee } from "./types";

export const fullName = (e: Pick<Employee, "firstName" | "lastName">) =>
  `${e.firstName} ${e.lastName}`.trim();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });