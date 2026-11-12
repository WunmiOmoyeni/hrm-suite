import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "HR Suite",
  description: "Integrated HRM, Inventory and Recruitment demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <AppShell>{children}</AppShell>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}