"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { DashboardShell } from "@/components/dashboard-shell"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <DashboardShell>
      <SettingsContent />
    </DashboardShell>
  )
}
