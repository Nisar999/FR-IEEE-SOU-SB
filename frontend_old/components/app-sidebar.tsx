"use client"

import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ScanFace,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const adminNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/dashboard/students", icon: Users },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

const facultyNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/dashboard/students", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = user?.role === "admin" ? adminNavItems : facultyNavItems

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <ScanFace className="size-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              InsightFace
            </span>
            <span className="text-[11px] leading-none text-muted-foreground">
              Attendance System
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <Separator className="mx-4 w-auto" />
      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Logout"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
