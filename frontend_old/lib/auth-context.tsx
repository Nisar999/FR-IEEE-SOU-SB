"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type UserRole = "admin" | "faculty"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const DEMO_USERS: Record<string, User & { password: string }> = {
  "admin@insightface.ai": {
    id: "1",
    name: "Dr. Sarah Chen",
    email: "admin@insightface.ai",
    role: "admin",
    password: "admin123",
  },
  "faculty@insightface.ai": {
    id: "2",
    name: "Prof. James Wilson",
    email: "faculty@insightface.ai",
    role: "faculty",
    password: "faculty123",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    const demoUser = DEMO_USERS[email]
    if (demoUser && demoUser.password === password) {
      const { password: _, ...userData } = demoUser
      setUser(userData)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
