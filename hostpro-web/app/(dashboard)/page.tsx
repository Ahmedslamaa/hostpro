// Server component wrapper — avoids "use client" at page level
// which causes Vercel route-group manifest bug in Next.js 14
import { DashboardContent } from "./dashboard-content";

export default function DashboardPage() {
  return <DashboardContent />;
}
