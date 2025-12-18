import type { ReactNode } from "react";
import { AppShell } from "../../components/AppShell";
import { ToastContainer } from "../../components/Toast";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <ToastContainer />
    </>
  );
}


