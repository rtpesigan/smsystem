"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Download, FileText, TrendingUp, Users, PieChart as PieChartIcon, BarChart3 } from "lucide-react"

interface ReportsData {
  metrics: {
    totalRevenue: number
    activeRentals: number
    totalCustomers: number
    avgRentalValue: number
  }
  revenueByMonth: { month: string; revenue: number; customers: number }[]
  categoryDistribution: { name: string; value: number }[]
  rentalStatus: { name: string; value: number }[]
}

const CATEGORY_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"]

function toCsv(rows: Record<string, any>[]) {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v)
    const needs = /[\n\r,\"]/g.test(s)
    const escaped = s.replace(/\"/g, '""')
    return needs ? `"${escaped}"` : escaped
  }
  const lines = [headers.join(",")]
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h])).join(","))
  }
  return lines.join("\n")
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/reports")
        if (!response.ok) throw new Error("Failed to fetch reports")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError("Failed to load reports")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleExportCsv = () => {
    if (!data) return
    const csv = toCsv(
      data.revenueByMonth.map((r) => ({
        month: r.month,
        revenue: r.revenue,
        newCustomers: r.customers,
      }))
    )
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reports.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const revenueByMonth = data?.revenueByMonth ?? []
  const categoryDistribution = (data?.categoryDistribution ?? []).map((c, idx) => ({
    ...c,
    fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }))
  const rentalStatus = (data?.rentalStatus ?? []).map((s, idx) => ({
    ...s,
    fill: CATEGORY_COLORS[(idx + 2) % CATEGORY_COLORS.length],
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="animate-spin h-8 w-8 text-blue-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-description">Analyze business performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{typeof data?.metrics.totalRevenue === 'number' ? data.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(String(data?.metrics.totalRevenue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.metrics.activeRentals ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.metrics.totalCustomers ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Rental Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{typeof data?.metrics.avgRentalValue === 'number' ? data.metrics.avgRentalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(String(data?.metrics.avgRentalValue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="section-card">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Revenue chart visualization</p>
                <p className="text-sm">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="section-card">
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>New customers acquired per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Customer growth chart</p>
                <p className="text-sm">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="section-card">
          <CardHeader>
            <CardTitle>Storage Unit Distribution</CardTitle>
            <CardDescription>Units by category and occupancy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded">
              <div className="text-center">
                <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Category distribution chart</p>
                <p className="text-sm">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Status */}
        <Card className="section-card">
          <CardHeader>
            <CardTitle>Rental Status Overview</CardTitle>
            <CardDescription>Current rental status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Rental status chart</p>
                <p className="text-sm">Integration with chart library needed</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rentalStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rentalStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
