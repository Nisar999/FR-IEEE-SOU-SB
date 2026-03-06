"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { students as allStudents } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PAGE_SIZE = 8

export function StudentsContent() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Students
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage student records and face recognition data
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student details and upload face data for recognition.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input id="studentName" placeholder="John Doe" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" placeholder="STU013" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ee">Electrical Engineering</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="phys">Physics</SelectItem>
                      <SelectItem value="me">Mechanical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Face Data Upload */}
                <div className="flex flex-col gap-2">
                  <Label>Face Data</Label>
                  <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center transition-colors hover:border-primary/30 hover:bg-muted/50 cursor-pointer">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drop face images here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB. Min 3 photos recommended.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ImageIcon className="size-3.5" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>
                  Add Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 h-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12" />
              <TableHead>Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((student) => {
              const initials = student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {student.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {student.id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.department}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        student.attendance >= 90
                          ? "default"
                          : student.attendance >= 75
                            ? "secondary"
                            : "destructive"
                      }
                      className="font-mono"
                    >
                      {student.attendance}%
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                        >
                          <Pencil className="size-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
