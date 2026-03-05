"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { CalendarDays, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  analyticsAttendanceByDate,
  attendanceBySubject,
  recognitionAccuracyOverTime,
  heatmapData,
  departments,
  subjects,
} from "@/lib/mock-data"

function HeatmapCell({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v >= 90) return "bg-primary/80 text-primary-foreground"
    if (v >= 80) return "bg-primary/50 text-foreground"
    if (v >= 60) return "bg-primary/25 text-foreground"
    if (v >= 40) return "bg-primary/10 text-foreground"
    return "bg-muted text-muted-foreground"
  }

  return (
    <div
      className={`flex h-9 items-center justify-center rounded-md text-xs font-mono font-medium ${getColor(
        value
      )}`}
    >
      {value}%
    </div>
  )
}

export function AnalyticsContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Attendance insights, recognition accuracy, and performance metrics
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2 h-9">
          <CalendarDays className="size-3.5" />
          Jan 1, 2026 - Mar 3, 2026
        </Button>
        <Select defaultValue="All Subjects">
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="All Departments">
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2 h-9 ml-auto">
          <Filter className="size-3.5" />
          Reset Filters
        </Button>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance by Date */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance by Date
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Present vs absent students over time
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsAttendanceByDate}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
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
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stackId="a"
                    stroke="var(--color-chart-1)"
                    fill="var(--color-chart-1)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    stackId="b"
                    stroke="var(--color-chart-5)"
                    fill="var(--color-chart-5)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance by Subject */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance by Subject
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Average attendance rate per subject
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceBySubject} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[70, 100]}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="subject"
                    width={110}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
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
                  <Bar
                    dataKey="rate"
                    fill="var(--color-chart-1)"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recognition Accuracy Over Time */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recognition Accuracy Over Time
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Monthly AI model performance trend
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recognitionAccuracyOverTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[92, 100]}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-muted-foreground)",
                    }}
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
                    dataKey="accuracy"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--color-chart-2)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Heatmap
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Attendance density by day and hour
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Header */}
                <div className="grid grid-cols-9 gap-1.5 mb-1.5">
                  <div className="text-xs font-medium text-muted-foreground" />
                  {["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM"].map(
                    (h) => (
                      <div
                        key={h}
                        className="text-center text-[11px] font-medium text-muted-foreground"
                      >
                        {h}
                      </div>
                    )
                  )}
                </div>
                {/* Rows */}
                {heatmapData.map((row) => (
                  <div
                    key={row.day}
                    className="grid grid-cols-9 gap-1.5 mb-1.5"
                  >
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                      {row.day}
                    </div>
                    <HeatmapCell value={row.h8} />
                    <HeatmapCell value={row.h9} />
                    <HeatmapCell value={row.h10} />
                    <HeatmapCell value={row.h11} />
                    <HeatmapCell value={row.h12} />
                    <HeatmapCell value={row.h1} />
                    <HeatmapCell value={row.h2} />
                    <HeatmapCell value={row.h3} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
