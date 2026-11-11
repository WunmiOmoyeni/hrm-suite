"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

// Pages that should NOT show the dashboard sidebar
const PUBLIC_ROUTES = ["/apply"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  if (isPublic) {
    return <main className="min-h-screen bg-muted/30 p-8">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Suspense
        fallback={<aside className="w-60 shrink-0 border-r bg-background" />}
      >
        <Sidebar />
      </Suspense>
      <main className="flex-1 bg-muted/30 p-8">{children}</main>
    </div>
  );
}
