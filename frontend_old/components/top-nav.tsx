"use client"

import { Bell, Moon, Sun, ChevronDown, Circle } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopNav() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-card/50 backdrop-blur-sm px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* System Status */}
        <div className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex">
          <Circle className="size-2 fill-success text-success" />
          <span>System Online</span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto items-center gap-2 px-2 py-1.5"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium leading-tight">
                  {user?.name}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="hidden text-[10px] uppercase tracking-wider md:inline-flex"
              >
                {user?.role}
              </Badge>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
