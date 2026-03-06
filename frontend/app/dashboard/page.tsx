"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  )
}
