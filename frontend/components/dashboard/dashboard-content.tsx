"use client"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { LiveFeed } from "@/components/dashboard/live-feed"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time attendance monitoring and recognition insights
        </p>
      </div>
      <KpiCards />
      <LiveFeed />
      <DashboardCharts />
    </div>
  )
}
