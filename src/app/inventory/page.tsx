"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Undo2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ItemFormDialog } from "@/components/item-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { InventoryItem } from "@/lib/types";

const selectClass = "rounded-md border bg-background px-3 py-2 text-sm";

function AssignDialog({
  item,
  onClose,
}: {
  item: InventoryItem | null;
  onClose: () => void;
}) {
  const employees = useStore((s) => s.employees);
  const assignItem = useStore((s) => s.assignItem);
  const [employeeId, setEmployeeId] = useState("");
  const [qty, setQty] = useState("1");

  const eligible = employees.filter((e) => e.status !== "TERMINATED");

  function close() {
    setEmployeeId("");
    setQty("1");
    onClose();
  }

  function submit() {
    if (!item || !employeeId) return;
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    const result = assignItem(item.id, employeeId, n);
    if (result.ok) {
      const emp = employees.find((e) => e.id === employeeId);
      toast.success(`${item.name} assigned to ${emp ? fullName(emp) : "employee"}`);
      close();
    } else {
      toast.error(result.error ?? "Could not assign item");
    }
  }

  return (
    <Dialog
      open={!!item}
      onOpenChange={(o) => {
        if (!o) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign {item?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            {item?.quantity} in stock
          </p>
          <div className="space-y-1">
            <Label>Employee</Label>
            <select
              className={`${selectClass} w-full`}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Select an employee...</option>
              {eligible.map((e) => (
                <option key={e.id} value={e.id}>
                  {fullName(e)} — {e.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!employeeId}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InventoryView() {
  const inventory = useStore((s) => s.inventory);
  const assignments = useStore((s) => s.assignments);
  const employees = useStore((s) => s.employees);
  const returnAssignment = useStore((s) => s.returnAssignment);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [assignTarget, setAssignTarget] = useState<InventoryItem | null>(null);

  const categories = Array.from(new Set(inventory.map((i) => i.category)));
  const q = query.toLowerCase();
  const rows = inventory.filter(
    (i) =>
      (category === "ALL" || i.category === category) &&
      `${i.name} ${i.sku}`.toLowerCase().includes(q)
  );

  const active = assignments
    .filter((a) => !a.returnedAt)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));

  const assignedQty = (itemId: string) =>
    active.filter((a) => a.itemId === itemId).reduce((n, a) => n + a.quantity, 0);

  const lowCount = inventory.filter((i) => i.quantity <= i.reorderLevel).length;
  const itemName = (id: string) =>
    inventory.find((i) => i.id === id)?.name ?? "Unknown item";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {inventory.length} items · {lowCount} low on stock
          </p>
        </div>
        <ItemFormDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </ItemFormDialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-xs bg-background"
          placeholder="Search item name or SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="ALL">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>In stock</TableHead>
              <TableHead>Reorder at</TableHead>
              <TableHead>Assigned out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No items match your filters.
                </TableCell>
              </TableRow>
            )}
            {rows.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.sku}</div>
                </TableCell>
                <TableCell>{i.category}</TableCell>
                <TableCell className="font-medium">{i.quantity}</TableCell>
                <TableCell>{i.reorderLevel}</TableCell>
                <TableCell>{assignedQty(i.id)}</TableCell>
                <TableCell>
                  {i.quantity === 0 ? (
                    <Badge variant="destructive">Out of stock</Badge>
                  ) : i.quantity <= i.reorderLevel ? (
                    <Badge variant="destructive">Low stock</Badge>
                  ) : (
                    <Badge variant="secondary">In stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i.quantity === 0}
                      onClick={() => setAssignTarget(i)}
                    >
                      <UserPlus className="mr-1 h-4 w-4" />
                      Assign
                    </Button>
                    <ItemFormDialog item={i}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </ItemFormDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is currently assigned.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((a) => {
                  const emp = employees.find((e) => e.id === a.employeeId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {itemName(a.itemId)}
                      </TableCell>
                      <TableCell>
                        {emp ? (
                          <Link
                            href={`/employees/${emp.id}`}
                            className="hover:underline"
                          >
                            {fullName(emp)}
                          </Link>
                        ) : (
                          "—"
                        )}
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AssignDialog item={assignTarget} onClose={() => setAssignTarget(null)} />
    </div>
  );
}

export default function InventoryPage() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <InventoryView />;
}