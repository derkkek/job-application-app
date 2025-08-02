import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 