"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { DashboardShell } from "@/components/dashboard-shell"
import { StudentsContent } from "@/components/students/students-content"

export default function StudentsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <DashboardShell>
      <StudentsContent />
    </DashboardShell>
  )
}
