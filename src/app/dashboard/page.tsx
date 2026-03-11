"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Activity, Package, Users, DollarSign, AlertCircle, TrendingUp, Loader2, Home } from "lucide-react"

interface DashboardStats {
  stats: {
    totalStorageUnits: number
    totalCustomers: number
    activeRentals: number
    revenue: number
    pendingPayments: number
    occupancyRate: number
  }
  recentActivity: any[]
  revenueByMonth: any[]
  categoryStats: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) throw new Error("Failed to fetch stats")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  const occupancyData = [
    { name: "Occupied", value: data.stats.occupancyRate, fill: "#3b82f6" },
    { name: "Available", value: 100 - data.stats.occupancyRate, fill: "#10b981" },
  ]

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">115 Cuneta Warehouse Management</h1>
        <p className="text-blue-100 text-lg">
          Manage your storage units, customers, and payments efficiently
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Storage Units */}
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Storage Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.totalStorageUnits}</div>
            <p className="text-xs text-gray-500 mt-1">in the system</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">active accounts</p>
          </CardContent>
        </Card>

        {/* Active Rentals */}
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.activeRentals}</div>
            <p className="text-xs text-gray-500 mt-1">currently ongoing</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{typeof data.stats.revenue === 'number' ? data.stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(String(data.stats.revenue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">from completed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Overall unit occupancy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {data.stats.pendingPayments} Pending Payments
              </p>
              <p className="text-xs text-red-600 dark:text-red-300">Action required</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {data.stats.activeRentals} Active Rentals
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300">Currently ongoing</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {data.stats.occupancyRate}% Occupancy
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">Current utilization rate</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.slice(0, 5).map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-slate-800 last:border-0 last:pb-0"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {activity.user?.name || "System"} • {activity.details || "Storage"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
