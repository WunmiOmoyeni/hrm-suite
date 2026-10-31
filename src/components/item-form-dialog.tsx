"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { InventoryItem } from "@/lib/types";

interface FormState {
  name: string;
  sku: string;
  category: string;
  quantity: string;
  reorderLevel: string;
}

const toForm = (i?: InventoryItem): FormState => ({
  name: i?.name ?? "",
  sku: i?.sku ?? "",
  category: i?.category ?? "",
  quantity: String(i?.quantity ?? 0),
  reorderLevel: String(i?.reorderLevel ?? 5),
});

export function ItemFormDialog({
  item,
  children,
}: {
  item?: InventoryItem;
  children: React.ReactNode; // the button that opens the dialog
}) {
  const inventory = useStore((s) => s.inventory);
  const addItem = useStore((s) => s.addItem);
  const updateItem = useStore((s) => s.updateItem);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(item));

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const categories = Array.from(new Set(inventory.map((i) => i.category)));

  function openDialog() {
    setForm(toForm(item));
    setOpen(true);
  }

  function submit() {
    const quantity = Number(form.quantity);
    const reorderLevel = Number(form.reorderLevel);

    if (!form.name.trim() || !form.sku.trim() || !form.category.trim()) {
      toast.error("Name, SKU and category are required");
      return;
    }
    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0
    ) {
      toast.error("Quantity and reorder level must be whole numbers (0 or more)");
      return;
    }
    const skuTaken = inventory.some(
      (i) =>
        i.sku.toLowerCase() === form.sku.trim().toLowerCase() &&
        i.id !== item?.id
    );
    if (skuTaken) {
      toast.error("That SKU already exists");
      return;
    }

    const data = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      quantity,
      reorderLevel,
    };

    if (item) {
      updateItem(item.id, data);
      toast.success("Item updated");
    } else {
      addItem(data);
      toast.success("Item added");
    }
    setOpen(false);
  }

  return (
    <>
      <span onClick={openDialog}>{children}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item ? "Edit item" : "Add item"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Item name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input
                  list="item-categories"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                />
                <datalist id="item-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Quantity in stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Reorder level</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.reorderLevel}
                  onChange={(e) => set("reorderLevel", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {item ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}