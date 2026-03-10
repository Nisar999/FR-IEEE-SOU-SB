export const students = [
  { id: "STU001", name: "Alice Johnson", department: "Computer Science", attendance: 94, image: "/placeholder-avatar.jpg" },
  { id: "STU002", name: "Bob Williams", department: "Electrical Engineering", attendance: 87, image: "/placeholder-avatar.jpg" },
  { id: "STU003", name: "Carol Martinez", department: "Mathematics", attendance: 91, image: "/placeholder-avatar.jpg" },
  { id: "STU004", name: "David Lee", department: "Physics", attendance: 78, image: "/placeholder-avatar.jpg" },
  { id: "STU005", name: "Emily Davis", department: "Computer Science", attendance: 96, image: "/placeholder-avatar.jpg" },
  { id: "STU006", name: "Frank Brown", department: "Mechanical Engineering", attendance: 82, image: "/placeholder-avatar.jpg" },
  { id: "STU007", name: "Grace Kim", department: "Computer Science", attendance: 89, image: "/placeholder-avatar.jpg" },
  { id: "STU008", name: "Henry Taylor", department: "Electrical Engineering", attendance: 73, image: "/placeholder-avatar.jpg" },
  { id: "STU009", name: "Iris Chen", department: "Mathematics", attendance: 97, image: "/placeholder-avatar.jpg" },
  { id: "STU010", name: "Jack Anderson", department: "Physics", attendance: 85, image: "/placeholder-avatar.jpg" },
  { id: "STU011", name: "Karen White", department: "Computer Science", attendance: 92, image: "/placeholder-avatar.jpg" },
  { id: "STU012", name: "Liam Harris", department: "Mechanical Engineering", attendance: 88, image: "/placeholder-avatar.jpg" },
]

export const recentAttendance = [
  { name: "Alice Johnson", time: "08:32 AM", confidence: 98.7, status: "recognized" as const },
  { name: "Bob Williams", time: "08:35 AM", confidence: 96.2, status: "recognized" as const },
  { name: "Carol Martinez", time: "08:37 AM", confidence: 99.1, status: "recognized" as const },
  { name: "David Lee", time: "08:41 AM", confidence: 94.8, status: "recognized" as const },
  { name: "Emily Davis", time: "08:43 AM", confidence: 97.5, status: "recognized" as const },
  { name: "Unknown", time: "08:45 AM", confidence: 42.1, status: "unknown" as const },
  { name: "Frank Brown", time: "08:48 AM", confidence: 95.3, status: "recognized" as const },
  { name: "Grace Kim", time: "08:52 AM", confidence: 98.9, status: "recognized" as const },
]

export const attendanceTrendData = [
  { date: "Mon", attendance: 82 },
  { date: "Tue", attendance: 88 },
  { date: "Wed", attendance: 85 },
  { date: "Thu", attendance: 91 },
  { date: "Fri", attendance: 87 },
  { date: "Sat", attendance: 45 },
  { date: "Sun", attendance: 0 },
]

export const recognitionAccuracyData = [
  { time: "8AM", accuracy: 96.5 },
  { time: "9AM", accuracy: 97.2 },
  { time: "10AM", accuracy: 95.8 },
  { time: "11AM", accuracy: 98.1 },
  { time: "12PM", accuracy: 94.3 },
  { time: "1PM", accuracy: 96.7 },
  { time: "2PM", accuracy: 97.9 },
  { time: "3PM", accuracy: 95.2 },
]

export const subjectDistributionData = [
  { subject: "Computer Science", students: 145, fill: "var(--color-chart-1)" },
  { subject: "Electrical Eng.", students: 98, fill: "var(--color-chart-2)" },
  { subject: "Mathematics", students: 72, fill: "var(--color-chart-3)" },
  { subject: "Physics", students: 63, fill: "var(--color-chart-4)" },
  { subject: "Mechanical Eng.", students: 54, fill: "var(--color-chart-5)" },
]

export const analyticsAttendanceByDate = [
  { date: "Jan 1", present: 310, absent: 42 },
  { date: "Jan 8", present: 325, absent: 27 },
  { date: "Jan 15", present: 298, absent: 54 },
  { date: "Jan 22", present: 340, absent: 12 },
  { date: "Jan 29", present: 332, absent: 20 },
  { date: "Feb 5", present: 315, absent: 37 },
  { date: "Feb 12", present: 342, absent: 10 },
  { date: "Feb 19", present: 328, absent: 24 },
  { date: "Feb 26", present: 335, absent: 17 },
  { date: "Mar 5", present: 345, absent: 7 },
]

export const attendanceBySubject = [
  { subject: "Computer Science", rate: 92 },
  { subject: "Electrical Eng.", rate: 87 },
  { subject: "Mathematics", rate: 84 },
  { subject: "Physics", rate: 89 },
  { subject: "Mechanical Eng.", rate: 86 },
]

export const recognitionAccuracyOverTime = [
  { month: "Sep", accuracy: 94.2 },
  { month: "Oct", accuracy: 95.8 },
  { month: "Nov", accuracy: 96.5 },
  { month: "Dec", accuracy: 97.1 },
  { month: "Jan", accuracy: 97.8 },
  { month: "Feb", accuracy: 98.2 },
  { month: "Mar", accuracy: 98.5 },
]

export const heatmapData = [
  { day: "Mon", h8: 85, h9: 92, h10: 88, h11: 90, h12: 45, h1: 78, h2: 82, h3: 75 },
  { day: "Tue", h8: 88, h9: 94, h10: 91, h11: 87, h12: 42, h1: 80, h2: 85, h3: 78 },
  { day: "Wed", h8: 82, h9: 89, h10: 86, h11: 92, h12: 48, h1: 76, h2: 80, h3: 72 },
  { day: "Thu", h8: 90, h9: 95, h10: 92, h11: 88, h12: 50, h1: 82, h2: 87, h3: 80 },
  { day: "Fri", h8: 78, h9: 86, h10: 83, h11: 85, h12: 40, h1: 72, h2: 76, h3: 68 },
]

export const departments = [
  "All Departments",
  "Computer Science",
  "Electrical Engineering",
  "Mathematics",
  "Physics",
  "Mechanical Engineering",
]

export const subjects = [
  "All Subjects",
  "Data Structures",
  "Algorithms",
  "Circuit Theory",
  "Linear Algebra",
  "Quantum Mechanics",
  "Thermodynamics",
]
