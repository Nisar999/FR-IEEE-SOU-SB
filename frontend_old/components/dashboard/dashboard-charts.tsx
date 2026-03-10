"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function DashboardCharts() {
  const [attendanceTrendData, setAttendanceTrendData] = useState<any[]>([])
  const [recognitionAccuracyData, setRecognitionAccuracyData] = useState<any[]>([])
  const [subjectDistributionData, setSubjectDistributionData] = useState<any[]>([])

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("http://localhost:8000/today-attendance")
        if (res.ok) {
          const data = await res.json()

          // Generate active trend from today's attendance logs (simplified timeline)
          // We group by hour
          const hourlyCounts: Record<string, number> = {}
          const accuracyCounts: Record<string, { total: number, sum: number }> = {}
          const knownCounts: Record<string, number> = {}

          data.forEach((record: any) => {
            const timeStr = new Date(record.entry_time).toLocaleTimeString([], { hour: '2-digit', hour12: false }) + ":00"

            // Hourly Volume
            hourlyCounts[timeStr] = (hourlyCounts[timeStr] || 0) + 1

            // Hourly Accuracy
            if (!accuracyCounts[timeStr]) accuracyCounts[timeStr] = { total: 0, sum: 0 }
            accuracyCounts[timeStr].total += 1
            accuracyCounts[timeStr].sum += record.avg_confidence > 1 ? record.avg_confidence : record.avg_confidence * 100

            // Distribution (Using known person names or Unknowns)
            const subject = record.is_unknown ? "Unknown" : "Known Staff/Students"
            knownCounts[subject] = (knownCounts[subject] || 0) + 1
          })

          const trendData = Object.keys(hourlyCounts).sort().map(time => ({
            time,
            attendance: hourlyCounts[time]
          }))

          const accuracyData = Object.keys(accuracyCounts).sort().map(time => ({
            time,
            accuracy: accuracyCounts[time].total > 0 ? (accuracyCounts[time].sum / accuracyCounts[time].total).toFixed(1) : 0
          }))

          const distributionData = Object.keys(knownCounts).map(subject => ({
            subject,
            students: knownCounts[subject]
          }))

          setAttendanceTrendData(trendData.length > 0 ? trendData : [{ time: "08:00", attendance: 0 }])
          setRecognitionAccuracyData(accuracyData.length > 0 ? accuracyData : [{ time: "08:00", accuracy: 100 }])
          setSubjectDistributionData(distributionData.length > 0 ? distributionData : [{ subject: "No Data", students: 1 }])
        }
      } catch (e) {
        console.error("Failed to load chart data:", e)
      }
    }

    fetchChartData()
    const intv = setInterval(fetchChartData, 5000)
    return () => clearInterval(intv)
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Attendance Trend */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Hourly Volume
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Attendance flow today
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--color-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-chart-1)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recognition Accuracy */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Recognition Accuracy
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Hourly accuracy breakdown
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recognitionAccuracyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[80, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar
                  dataKey="accuracy"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Subject Distribution */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Visitor Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Known vs Unknown Persons
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="students"
                  nameKey="subject"
                >
                  {subjectDistributionData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--color-foreground)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
