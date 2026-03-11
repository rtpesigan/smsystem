"use client"

import React, { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Moon, Sun } from "lucide-react"
import { DashboardUser } from "@/types"

interface TopNavProps {
  user: DashboardUser
}

export function TopNav({ user }: TopNavProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6">
      {/* Left side - Title and search will go here in the future */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Welcome back, {user.name || user.email}
        </h2>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role?.toLowerCase()}</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-red-600 hover:text-red-700"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
