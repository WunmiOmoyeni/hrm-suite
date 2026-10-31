"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  RotateCcw,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/recruitment", label: "Recruitment", icon: UserPlus },
  { href: "/inventory", label: "Inventory", icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();
  const resetDemo = useStore((s) => s.resetDemo);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-background">
      <div className="px-5 py-5">
        <h1 className="text-lg font-semibold">HR Suite</h1>
        <p className="text-xs text-muted-foreground">HRM · Inventory · ATS</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            if (confirm("Reset all demo data to the starting state?"))
              resetDemo();
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset demo data
        </Button>
      </div>
    </aside>
  );
}