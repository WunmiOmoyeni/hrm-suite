import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import {Toaster} from "@/components/ui/sonner";

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
          <Sidebar />
          <main className="flex-1 bg-muted/30 p-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}