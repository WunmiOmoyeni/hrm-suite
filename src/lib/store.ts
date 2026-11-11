"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Applicant,
  AssetAssignment,
  Department,
  Employee,
  InventoryItem,
  Job,
  SentEmail,
  Stage,
} from "./types";
import type { ScreeningResult } from "./ai-screen";
import {
  seedApplicants,
  seedAssignments,
  seedDepartments,
  seedEmployees,
  seedInventory,
  seedJobs,
} from "./seed";
import { STANDARD_KIT_SKUS } from "./kit";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

interface DataState {
  departments: Department[];
  employees: Employee[];
  jobs: Job[];
  applicants: Applicant[];
  inventory: InventoryItem[];
  assignments: AssetAssignment[];
  emails: SentEmail[];
}

interface Actions {
  // HRM
  addEmployee: (e: Omit<Employee, "id">) => string;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  // ATS
  addJob: (j: Omit<Job, "id">) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;
  addApplicant: (a: Pick<Applicant, "name" | "email" | "jobId">) => void;
  addApplication: (
    a: Pick<Applicant, "name" | "email" | "jobId" | "phone" | "experience">,
    screening: ScreeningResult
  ) => void;
  moveApplicant: (id: string, stage: Stage) => void;
  updateApplicantNotes: (id: string, notes: string) => void;
  hireApplicant: (id: string) => string | null; // returns new employee id
  // Inventory
  addItem: (i: Omit<InventoryItem, "id">) => void;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  assignItem: (
    itemId: string,
    employeeId: string,
    qty?: number
  ) => { ok: boolean; error?: string };
  returnAssignment: (assignmentId: string) => void;
  assignStandardKit: (employeeId: string) => {
    assigned: string[];
    unavailable: string[];
  };
  // Demo
  resetDemo: () => void;
}

const initialData = (): DataState => ({
  departments: seedDepartments,
  employees: seedEmployees,
  jobs: seedJobs,
  applicants: seedApplicants,
  inventory: seedInventory,
  assignments: seedAssignments,
  emails: [],
});

export const useStore = create<DataState & Actions>()(
  persist(
    (set, get) => ({
      ...initialData(),

      addEmployee: (e) => {
        const id = uid();
        set((s) => ({ employees: [...s.employees, { ...e, id }] }));
        return id;
      },

      // Terminating an employee returns their equipment to stock
      updateEmployee: (id, patch) =>
        set((s) => {
          const prev = s.employees.find((e) => e.id === id);
          const employees = s.employees.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          );

          const terminating =
            !!prev &&
            prev.status !== "TERMINATED" &&
            patch.status === "TERMINATED";
          if (!terminating) return { employees };

          const toReturn = s.assignments.filter(
            (a) => a.employeeId === id && !a.returnedAt
          );
          if (toReturn.length === 0) return { employees };

          const date = today();
          return {
            employees,
            assignments: s.assignments.map((a) =>
              a.employeeId === id && !a.returnedAt
                ? { ...a, returnedAt: date }
                : a
            ),
            inventory: s.inventory.map((i) => {
              const back = toReturn
                .filter((a) => a.itemId === i.id)
                .reduce((n, a) => n + a.quantity, 0);
              return back ? { ...i, quantity: i.quantity + back } : i;
            }),
          };
        }),

      addJob: (j) => set((s) => ({ jobs: [...s.jobs, { ...j, id: uid() }] })),

      updateJob: (id, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),

      // Manual add by HR (goes straight into Applied)
      addApplicant: (a) =>
        set((s) => ({
          applicants: [
            ...s.applicants,
            { ...a, id: uid(), stage: "APPLIED", notes: "", source: "MANUAL" },
          ],
        })),

      // Public application site: the AI result decides Applied vs Rejected
      addApplication: (a, screening) =>
        set((s) => ({
          applicants: [
            ...s.applicants,
            {
              id: uid(),
              name: a.name,
              email: a.email,
              jobId: a.jobId,
              phone: a.phone,
              experience: a.experience,
              source: "APPLICATION_SITE",
              aiScore: screening.score,
              aiSummary: screening.summary,
              stage: screening.passed ? "APPLIED" : "REJECTED",
              notes: screening.passed ? "" : "Not selected by AI screening.",
            },
          ],
        })),

      // Moving someone to Screening automatically "sends" an interview email
      moveApplicant: (id, stage) =>
        set((s) => {
          const applicant = s.applicants.find((a) => a.id === id);
          if (!applicant || applicant.stage === stage) return {};

          const applicants = s.applicants.map((a) =>
            a.id === id ? { ...a, stage } : a
          );
          if (stage !== "SCREENING") return { applicants };

          const job = s.jobs.find((j) => j.id === applicant.jobId);
          const email: SentEmail = {
            id: uid(),
            applicantId: id,
            to: applicant.email,
            subject: `Interview invitation: ${job?.title ?? "your application"}`,
            body: `Hi ${applicant.name.split(" ")[0]},\n\nThank you for applying${
              job ? ` for ${job.title}` : ""
            }. We'd like to invite you to an interview. Please reply with times that suit you this week.\n\nBest regards,\nHR Team`,
            sentAt: new Date().toISOString(),
          };
          return { applicants, emails: [email, ...s.emails] };
        }),

      updateApplicantNotes: (id, notes) =>
        set((s) => ({
          applicants: s.applicants.map((a) =>
            a.id === id ? { ...a, notes } : a
          ),
        })),

      // The key integration: ATS -> HRM
      hireApplicant: (id) => {
        const { applicants, jobs } = get();
        const applicant = applicants.find((a) => a.id === id);
        if (!applicant || applicant.employeeId) return null;
        const job = jobs.find((j) => j.id === applicant.jobId);
        if (!job) return null;

        const [firstName, ...rest] = applicant.name.trim().split(" ");
        const employeeId = uid();
        const employee: Employee = {
          id: employeeId,
          firstName,
          lastName: rest.join(" "),
          email: applicant.email,
          title: job.title,
          status: "ACTIVE",
          hireDate: today(),
          departmentId: job.departmentId,
        };

        set((s) => ({
          employees: [...s.employees, employee],
          applicants: s.applicants.map((a) =>
            a.id === id ? { ...a, stage: "HIRED", employeeId } : a
          ),
        }));
        return employeeId;
      },

      addItem: (i) =>
        set((s) => ({ inventory: [...s.inventory, { ...i, id: uid() }] })),

      updateItem: (id, patch) =>
        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === id ? { ...i, ...patch } : i
          ),
        })),

      // The key integration: Inventory <-> HRM
      assignItem: (itemId, employeeId, qty = 1) => {
        const item = get().inventory.find((i) => i.id === itemId);
        if (!item) return { ok: false, error: "Item not found" };
        if (item.quantity < qty)
          return { ok: false, error: `Only ${item.quantity} in stock` };

        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity - qty } : i
          ),
          assignments: [
            ...s.assignments,
            {
              id: uid(),
              itemId,
              employeeId,
              quantity: qty,
              assignedAt: today(),
            },
          ],
        }));
        return { ok: true };
      },

      returnAssignment: (assignmentId) => {
        const a = get().assignments.find((x) => x.id === assignmentId);
        if (!a || a.returnedAt) return;
        set((s) => ({
          assignments: s.assignments.map((x) =>
            x.id === assignmentId ? { ...x, returnedAt: today() } : x
          ),
          inventory: s.inventory.map((i) =>
            i.id === a.itemId ? { ...i, quantity: i.quantity + a.quantity } : i
          ),
        }));
      },

      assignStandardKit: (employeeId) => {
        const assigned: string[] = [];
        const unavailable: string[] = [];
        for (const sku of STANDARD_KIT_SKUS) {
          const item = get().inventory.find((i) => i.sku === sku);
          if (!item) continue;
          const alreadyHas = get().assignments.some(
            (a) =>
              a.employeeId === employeeId &&
              a.itemId === item.id &&
              !a.returnedAt
          );
          if (alreadyHas) continue;
          const result = get().assignItem(item.id, employeeId, 1);
          (result.ok ? assigned : unavailable).push(item.name);
        }
        return { assigned, unavailable };
      },

      resetDemo: () => set(initialData()),
    }),
    { name: "hrm-suite-demo" }
  )
);

// Avoids Next.js hydration mismatches: render data-driven UI only after
// the persisted state has loaded in the browser.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}