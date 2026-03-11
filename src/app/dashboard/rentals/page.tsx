"use client"

import React, { useEffect, useState } from "react"
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
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import { RentalModal } from "@/components/rentals/rental-modal"

interface Rental {
  id: string
  customer: {
    firstName: string
    lastName: string
  }
  storageUnit: {
    unitNumber: string
  }
  startDate: string
  endDate: string | null
  monthlyRate: number | string
  status: "ACTIVE" | "EXPIRED" | "CANCELLED"
}

const statusColors: Record<Rental["status"], string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/40",
  EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900/40",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/40",
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/rentals")
      if (!response.ok) throw new Error("Failed to fetch rentals")
      const data = await response.json()
      setRentals(data)
    } catch (err) {
      setError("Failed to load rentals")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this rental?")) {
      try {
        const response = await fetch(`/api/rentals/${id}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to delete rental")
        }
        setRentals(rentals.filter((r) => r.id !== id))
      } catch (err: any) {
        alert(err?.message || "Failed to delete rental")
        console.error(err)
      }
    }
  }

  const handleEdit = (rental: Rental) => {
    setSelectedRental(rental)
    setShowModal(true)
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedRental) {
        const response = await fetch(`/api/rentals/${selectedRental.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to update rental")
        }
        const updated = await response.json()
        setRentals(rentals.map((r) => (r.id === selectedRental.id ? updated : r)))
      } else {
        const response = await fetch("/api/rentals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to create rental")
        }
        const created = await response.json()
        setRentals([created, ...rentals])
      }

      setShowModal(false)
      setSelectedRental(null)
    } catch (err: any) {
      alert(err?.message || "Failed to save rental")
      console.error(err)
    }
  }

  const filtered = rentals.filter(
    (rental) =>
      `${rental.customer.firstName} ${rental.customer.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rental.storageUnit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="page-title">Rentals</h1>
          <p className="page-description">Manage customer rental agreements</p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            setSelectedRental(null)
            setShowModal(true)
          }}
        >
          <Plus className="h-4 w-4" />
          New Rental
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {rentals.filter((r) => r.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {rentals.filter((r) => r.status === "EXPIRED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₱{rentals
                .reduce((sum, r) => sum + (Number(r.monthlyRate) || 0), 0)
                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="section-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rentals Table */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle>Rental Agreements</CardTitle>
          <CardDescription>{filtered.length} rental{filtered.length !== 1 ? 's' : ''} shown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Monthly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">
                         {rental.customer.lastName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {rental.customer.firstName}
                      </TableCell>
                      <TableCell>{rental.storageUnit.unitNumber}</TableCell>
                      <TableCell>
                        {rental.startDate ? new Date(rental.startDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>₱{(Number(rental.monthlyRate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[rental.status] + " border-0"}>
                          {rental.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(rental)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rental.id)}
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
                      No rentals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RentalModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedRental(null)
        }}
        onSave={handleSave}
        rental={selectedRental}
      />
    </div>
  )
}
