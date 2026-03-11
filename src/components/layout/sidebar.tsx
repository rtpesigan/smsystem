"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Package,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
  Box,
} from "lucide-react"

const menuItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Storage Units", icon: Package, href: "/dashboard/storage-units" },
  { label: "Categories", icon: Box, href: "/dashboard/categories" },
  { label: "Customers", icon: Users, href: "/dashboard/customers" },
  { label: "Rentals", icon: FileText, href: "/dashboard/rentals" },
  { label: "Payments", icon: DollarSign, href: "/dashboard/payments" },
  { label: "Reports", icon: BarChart3, href: "/dashboard/reports" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 z-30 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Box className="h-6 w-6 text-blue-600" />
            115 Warehouse
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2026 Storage Management System
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-20"
        />
      )}
    </>
  )
}
