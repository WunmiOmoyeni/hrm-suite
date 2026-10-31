import type {
  Applicant,
  AssetAssignment,
  Department,
  Employee,
  InventoryItem,
  Job,
} from "./types";

export const seedDepartments: Department[] = [
  { id: "d1", name: "Engineering" },
  { id: "d2", name: "Human Resources" },
  { id: "d3", name: "Finance" },
  { id: "d4", name: "Operations" },
  { id: "d5", name: "Sales & Marketing" },
];

export const seedEmployees: Employee[] = [
  { id: "e1", firstName: "Adaeze", lastName: "Okafor", email: "adaeze.okafor@company.com", title: "Engineering Manager", status: "ACTIVE", hireDate: "2023-02-13", departmentId: "d1" },
  { id: "e2", firstName: "Tunde", lastName: "Bakare", email: "tunde.bakare@company.com", title: "Frontend Developer", status: "ACTIVE", hireDate: "2024-05-06", departmentId: "d1" },
  { id: "e3", firstName: "Funke", lastName: "Adebayo", email: "funke.adebayo@company.com", title: "HR Manager", status: "ACTIVE", hireDate: "2022-09-01", departmentId: "d2" },
  { id: "e4", firstName: "Chidi", lastName: "Eze", email: "chidi.eze@company.com", title: "Accountant", status: "ACTIVE", hireDate: "2023-11-20", departmentId: "d3" },
  { id: "e5", firstName: "Halima", lastName: "Yusuf", email: "halima.yusuf@company.com", title: "Operations Lead", status: "ON_LEAVE", hireDate: "2022-03-14", departmentId: "d4" },
  { id: "e6", firstName: "Seun", lastName: "Ogunleye", email: "seun.ogunleye@company.com", title: "Marketing Executive", status: "ACTIVE", hireDate: "2024-08-12", departmentId: "d5" },
  { id: "e7", firstName: "Ngozi", lastName: "Nwosu", email: "ngozi.nwosu@company.com", title: "Backend Developer", status: "ACTIVE", hireDate: "2024-01-08", departmentId: "d1" },
  { id: "e8", firstName: "Ibrahim", lastName: "Sule", email: "ibrahim.sule@company.com", title: "Sales Associate", status: "ACTIVE", hireDate: "2025-02-03", departmentId: "d5" },
];

export const seedJobs: Job[] = [
  { id: "j1", title: "Full-Stack Developer", description: "Build and maintain our SaaS products using Next.js and Node.", status: "OPEN", departmentId: "d1" },
  { id: "j2", title: "HR Assistant", description: "Support recruitment, onboarding and employee records.", status: "OPEN", departmentId: "d2" },
  { id: "j3", title: "Sales Executive", description: "Drive new business for our school and hospital products.", status: "OPEN", departmentId: "d5" },
  { id: "j4", title: "Junior Accountant", description: "Assist with bookkeeping and monthly reporting.", status: "CLOSED", departmentId: "d3" },
];

export const seedApplicants: Applicant[] = [
  { id: "a1", name: "Bola Ajayi", email: "bola.ajayi@mail.com", stage: "INTERVIEW", notes: "Strong React portfolio.", jobId: "j1" },
  { id: "a2", name: "Emeka Obi", email: "emeka.obi@mail.com", stage: "SCREENING", notes: "", jobId: "j1" },
  { id: "a3", name: "Zainab Lawal", email: "zainab.lawal@mail.com", stage: "OFFER", notes: "Great communication, salary discussion pending.", jobId: "j1" },
  { id: "a4", name: "Kunle Adeyemi", email: "kunle.adeyemi@mail.com", stage: "APPLIED", notes: "", jobId: "j1" },
  { id: "a5", name: "Ifeoma Chukwu", email: "ifeoma.chukwu@mail.com", stage: "APPLIED", notes: "", jobId: "j2" },
  { id: "a6", name: "Peter Danjuma", email: "peter.danjuma@mail.com", stage: "SCREENING", notes: "Has 2 years HR experience.", jobId: "j2" },
  { id: "a7", name: "Amaka Eze", email: "amaka.eze@mail.com", stage: "INTERVIEW", notes: "", jobId: "j3" },
  { id: "a8", name: "Yemi Alade", email: "yemi.alade@mail.com", stage: "REJECTED", notes: "Not enough sales experience.", jobId: "j3" },
  { id: "a9", name: "Samuel Etim", email: "samuel.etim@mail.com", stage: "APPLIED", notes: "", jobId: "j3" },
];

// quantity = units currently in stock (already net of seed assignments)
export const seedInventory: InventoryItem[] = [
  { id: "i1", name: "Dell Latitude Laptop", sku: "LAP-001", category: "Laptops", quantity: 6, reorderLevel: 3 },
  { id: "i2", name: "Wireless Mouse", sku: "ACC-010", category: "Accessories", quantity: 14, reorderLevel: 5 },
  { id: "i3", name: "USB-C Hub", sku: "ACC-020", category: "Accessories", quantity: 2, reorderLevel: 5 },
  { id: "i4", name: "Employee ID Card", sku: "ID-001", category: "Access", quantity: 25, reorderLevel: 10 },
  { id: "i5", name: "Office Chair", sku: "FUR-001", category: "Furniture", quantity: 4, reorderLevel: 2 },
  { id: "i6", name: "Company Phone", sku: "PHN-001", category: "Phones", quantity: 1, reorderLevel: 2 },
  { id: "i7", name: "Monitor 24\"", sku: "MON-001", category: "Monitors", quantity: 8, reorderLevel: 3 },
];

export const seedAssignments: AssetAssignment[] = [
  { id: "as1", itemId: "i1", employeeId: "e1", quantity: 1, assignedAt: "2023-02-13" },
  { id: "as2", itemId: "i1", employeeId: "e2", quantity: 1, assignedAt: "2024-05-06" },
  { id: "as3", itemId: "i4", employeeId: "e2", quantity: 1, assignedAt: "2024-05-06" },
  { id: "as4", itemId: "i6", employeeId: "e6", quantity: 1, assignedAt: "2024-08-12" },
];