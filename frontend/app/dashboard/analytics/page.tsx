"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { DashboardShell } from "@/components/dashboard-shell"
import { AnalyticsContent } from "@/components/analytics/analytics-content"

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <DashboardShell>
      <AnalyticsContent />
    </DashboardShell>
  )
}
