"use client"

import { useEffect, useState } from "react"
import { Users, CalendarCheck, ScanFace, Video, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function KpiCards() {
  const [metrics, setMetrics] = useState({
    totalPersons: 0,
    todayAttendance: 0,
    recognitionRate: 0,
    activeCameras: 0,
    totalCameras: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [headcountRes, attendanceRes, cameraRes] = await Promise.all([
          fetch("http://localhost:8000/live-headcount").catch(() => null),
          fetch("http://localhost:8000/today-attendance").catch(() => null),
          fetch("http://localhost:8000/camera-status").catch(() => null),
        ])

        let totalPersons = 0
        let recognizedRate = 0
        if (headcountRes && headcountRes.ok) {
          const hd = await headcountRes.json()
          totalPersons = hd.total_persons || 0
          if (totalPersons > 0) {
            recognizedRate = (hd.known_persons / totalPersons) * 100
          }
        }

        let todayAttendance = 0
        if (attendanceRes && attendanceRes.ok) {
          const att = await attendanceRes.json()
          todayAttendance = att.length || 0
        }

        let activeCams = 0
        let totalCams = 0
        if (cameraRes && cameraRes.ok) {
          const cams = await cameraRes.json()
          totalCams = cams.length
          activeCams = cams.filter((c: any) => c.status === "active").length
        }

        setMetrics({
          totalPersons,
          todayAttendance,
          recognitionRate: recognizedRate,
          activeCameras: activeCams,
          totalCameras: totalCams,
        })
      } catch (e) {
        console.error("Failed to fetch KPIs:", e)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  const kpis = [
    {
      title: "Live Headcount",
      value: metrics.totalPersons.toString(),
      change: "Real-time",
      changeLabel: "active persons",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Today's Attendance",
      value: metrics.todayAttendance.toString(),
      change: "Total",
      changeLabel: "records today",
      trend: "up" as const,
      icon: CalendarCheck,
    },
    {
      title: "Recognition Rate",
      value: `${metrics.recognitionRate.toFixed(1)}%`,
      change: "Live",
      changeLabel: "accuracy",
      trend: metrics.recognitionRate > 80 ? "up" as const : "down" as const,
      icon: ScanFace,
    },
    {
      title: "Active Cameras",
      value: `${metrics.activeCameras}/${metrics.totalCameras}`,
      change: `${metrics.totalCameras - metrics.activeCameras} offline`,
      changeLabel: "status",
      trend: metrics.activeCameras === metrics.totalCameras ? "up" as const : "down" as const,
      icon: Video,
    },
  ]

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
