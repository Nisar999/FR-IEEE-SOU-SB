"use client"

import { Users, CalendarCheck, ScanFace, Video, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const kpis = [
  {
    title: "Total Students",
    value: "1,284",
    change: "+12",
    changeLabel: "from last month",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Today's Attendance",
    value: "1,067",
    change: "83.1%",
    changeLabel: "attendance rate",
    trend: "up" as const,
    icon: CalendarCheck,
  },
  {
    title: "Recognition Rate",
    value: "97.8%",
    change: "+0.3%",
    changeLabel: "from yesterday",
    trend: "up" as const,
    icon: ScanFace,
  },
  {
    title: "Active Cameras",
    value: "12/14",
    change: "2 offline",
    changeLabel: "needs attention",
    trend: "down" as const,
    icon: Video,
  },
]

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="relative overflow-hidden border-border/60"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  {kpi.value}
                </span>
              </div>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="size-4.5 text-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              {kpi.trend === "up" ? (
                <TrendingUp className="size-3.5 text-success" />
              ) : (
                <TrendingDown className="size-3.5 text-warning" />
              )}
              <span
                className={
                  kpi.trend === "up"
                    ? "font-medium text-success"
                    : "font-medium text-warning"
                }
              >
                {kpi.change}
              </span>
              <span className="text-muted-foreground">{kpi.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
