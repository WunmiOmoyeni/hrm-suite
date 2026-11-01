import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
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
        <div className="flex min-h-screen">
          <Suspense
            fallback={<aside className="w-60 shrink-0 border-r bg-background" />}
          >
            <Sidebar />
          </Suspense>
          <main className="flex-1 bg-muted/30 p-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}