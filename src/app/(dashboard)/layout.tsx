import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Auth enforcement is handled per-page (playground supports demo mode,
  // history requires auth via its own check) and in proxy.ts.
  return <>{children}</>;
}
