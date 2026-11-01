"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { EmployeeFormDialog } from "@/components/employee-form-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

function ProfileView() {
    const { id } = useParams<{ id: string }>();
    const employees = useStore((s) => s.employees);
    const departments = useStore((s) => s.departments);
    const applicants = useStore((s) => s.applicants);
    const jobs = useStore((s) => s.jobs);
    const inventory = useStore((s) => s.inventory);
    const assignments = useStore((s) => s.assignments);
    const assignItem = useStore((s) => s.assignItem);
    const returnAssignment = useStore((s) => s.returnAssignment);
    const assignStandardKit = useStore((s) => s.assignStandardKit);
    const [itemId, setItemId] = useState("");

    const employee = employees.find((e) => e.id === id);

    if (!employee) {
        return (
            <div className="space-y-2">
                <p>Employee not found.</p>
                <Link href="/employees" className="text-sm underline">
                    Back to employees
                </Link>
            </div>
        );
    }

    const dept = departments.find((d) => d.id === employee.departmentId);
    const applicant = applicants.find((a) => a.employeeId === employee.id);
    const job = applicant && jobs.find((j) => j.id === applicant.jobId);

    const mine = assignments.filter((a) => a.employeeId === employee.id);
    const active = mine.filter((a) => !a.returnedAt);
    const history = mine.filter((a) => a.returnedAt);
    const available = inventory.filter((i) => i.quantity > 0);
    const itemName = (id: string) =>
        inventory.find((i) => i.id === id)?.name ?? "Unknown item";

    function handleAssign() {
        if (!itemId) return;
        const result = assignItem(itemId, employee!.id);
        if (result.ok) toast.success(`${itemName(itemId)} assigned`);
        else toast.error(result.error ?? "Could not assign item");
        setItemId("");
    }

    function handleKit() {
        const { assigned, unavailable } = assignStandardKit(employee!.id);
        if (assigned.length) toast.success(`Assigned: ${assigned.join(", ")}`);
        if (unavailable.length)
            toast.error(`Out of stock: ${unavailable.join(", ")}`);
        if (!assigned.length && !unavailable.length)
            toast.info("Standard kit already assigned");
    }

    return (
        <div className="space-y-6">
            <Link
                href="/employees"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                All employees
            </Link>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">{fullName(employee)}</h2>
                        <StatusBadge status={employee.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {employee.title} · {dept?.name}
                    </p>
                </div>
                <EmployeeFormDialog employee={employee}>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </EmployeeFormDialog>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <div className="text-xs text-muted-foreground">Email</div>
                            {employee.email}
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Department</div>
                            {dept?.name}
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Hire date</div>
                            {formatDate(employee.hireDate)}
                        </div>
                        {job && (
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Joined through recruitment
                                </div>
                                {job.title}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Assigned equipment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {active.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No equipment assigned yet.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Assigned</TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {active.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell className="font-medium">
                                                {itemName(a.itemId)}
                                            </TableCell>
                                            <TableCell>{a.quantity}</TableCell>
                                            <TableCell>{formatDate(a.assignedAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        returnAssignment(a.id);
                                                        toast.success(`${itemName(a.itemId)} returned`);
                                                    }}
                                                >
                                                    <Undo2 className="mr-1 h-4 w-4" />
                                                    Return
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {employee.status !== "TERMINATED" && (
                            <div className="flex flex-wrap gap-2 border-t pt-4">
                                <select
                                    className="min-w-[200px] flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                                    value={itemId}
                                    onChange={(e) => setItemId(e.target.value)}
                                >
                                    <option value="">Select equipment to assign...</option>
                                    {available.map((i) => (
                                        <option key={i.id} value={i.id}>
                                            {i.name} ({i.quantity} in stock)
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={handleAssign} disabled={!itemId}>
                                    Assign
                                </Button>
                                <Button variant="outline" onClick={handleKit}>
                                    Assign standard kit
                                </Button>
                            </div>
                        )}

                        {history.length > 0 && (
                            <div className="border-t pt-4">
                                <div className="mb-2 text-xs font-medium text-muted-foreground">
                                    Returned items
                                </div>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {history.map((a) => (
                                        <li key={a.id}>
                                            {itemName(a.itemId)} · returned{" "}
                                            {formatDate(a.returnedAt!)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function EmployeeProfilePage() {
    const hydrated = useHydrated();
    if (!hydrated) return null;
    return <ProfileView />;
}