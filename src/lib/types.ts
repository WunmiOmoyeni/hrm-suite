export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "TERMINATED";
export type JobStatus = "OPEN" | "CLOSED";
export type Stage =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export const STAGES: Stage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

export interface Department {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  status: EmployeeStatus;
  hireDate: string; // ISO date
  departmentId: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  departmentId: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  stage: Stage;
  notes: string;
  jobId: string;
  employeeId?: string; // set when hired
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number; // units currently in stock
  reorderLevel: number;
}

export interface AssetAssignment {
  id: string;
  itemId: string;
  employeeId: string;
  quantity: number;
  assignedAt: string;
  returnedAt?: string;
}