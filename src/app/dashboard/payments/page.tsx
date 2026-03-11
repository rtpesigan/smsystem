"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit2, Trash2, Search, AlertCircle } from "lucide-react"
import { PaymentModal } from "@/components/payments/payment-modal"

interface Payment {
  id: string
  amount: number
  dueDate: string
  paymentDate: string | null
  paymentMethod: string
  status: "COMPLETED" | "PENDING" | "OVERDUE" | "CANCELLED"
  rental?: {
    customer?: {
      firstName?: string
      lastName?: string
    }
  }
}

const statusColors: Record<Payment["status"], string> = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900/40",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/40",
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/payments")
      if (!response.ok) throw new Error("Failed to fetch payments")
      const data = await response.json()
      setPayments(data)
    } catch (err) {
      setError("Failed to load payments")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = payments.filter(
    (payment) =>
      payment.rental?.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.rental?.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount?.toString().includes(searchTerm)
  )

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        let errorMessage = "Failed to delete payment"
        try {
          const body = await response.json()
          errorMessage = body?.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
      setPayments(payments.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(err?.message || "Failed to delete payment")
      console.error(err)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedPayment) {
        const response = await fetch(`/api/payments/${selectedPayment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to update payment")
        }
        const updated = await response.json()
        setPayments(payments.map((p) => (p.id === selectedPayment.id ? updated : p)))
      } else {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to create payment")
        }
        const created = await response.json()
        setPayments([created, ...payments])
      }

      setShowModal(false)
      setSelectedPayment(null)
    } catch (err: any) {
      alert(err?.message || "Failed to save payment")
      console.error(err)
    }
  }

  const overdueCount = payments.filter((p) => p.status === "OVERDUE").length
  const totalReceived = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (typeof p.amount === "number" ? p.amount : 0), 0)

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
          <h1 className="page-title">Payments</h1>
          <p className="page-description">Track and manage rental payments</p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            setSelectedPayment(null)
            setShowModal(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Alert if there are overdue payments */}
      {overdueCount > 0 && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              {overdueCount} Overdue Payment{overdueCount > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Immediate action required to collect outstanding payments
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {payments.filter((p) => p.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="section-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>{filtered.length} payment{filtered.length !== 1 ? 's' : ''} shown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.rental?.customer
                          ? `${payment.rental.customer.lastName}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.rental?.customer
                          ? `${payment.rental.customer.firstName} `
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {typeof payment.amount === "number" ? `₱${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"}
                      </TableCell>
                      <TableCell>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{payment.paymentMethod || "Pending"}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[payment.status] + " border-0"}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedPayment(null)
        }}
        onSave={handleSave}
        payment={selectedPayment}
      />
    </div>
  )
}
