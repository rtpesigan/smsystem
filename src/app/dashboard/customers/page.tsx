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
import { Plus, Edit2, Trash2, Search, Mail, Phone, Loader2 } from "lucide-react"
import { CustomerModal } from "@/components/customers/customer-modal"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  rentals?: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")
      const data = await response.json()
      setCustomers(data)
      setFilteredCustomers(data)
    } catch (err) {
      setError("Failed to load customers")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchTerm))
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        let errorMessage = "Failed to delete customer"
        try {
          const body = await response.json()
          errorMessage = body?.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
      setCustomers(customers.filter((c) => c.id !== id))
    } catch (err: any) {
      alert(err?.message || "Failed to delete customer")
      console.error(err)
    }
  }

  const handleSave = async (data: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          let errorMessage = "Failed to update customer"
          try {
            const body = await response.json()
            errorMessage = body?.error || errorMessage
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }
        const updated = await response.json()
        setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? updated : c)))
      } else {
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          let errorMessage = "Failed to create customer"
          try {
            const body = await response.json()
            errorMessage = body?.error || errorMessage
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }
        const newCustomer = await response.json()
        setCustomers([...customers, newCustomer])
      }

      setShowModal(false)
      setSelectedCustomer(null)
    } catch (err: any) {
      alert(err?.message || "Failed to save customer")
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          <h1 className="page-title">Customers</h1>
          <p className="page-description">Manage and view all customer information</p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setSelectedCustomer(null)
            setShowModal(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card className="section-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            {filteredCustomers.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Active Rentals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.firstName}
                      </TableCell>
                      <TableCell>
                        {customer.lastName}
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <a
                            href={`mailto:${customer.email}`}
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No email</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone}`}
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.city}, {customer.state}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.rentals}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
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
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <CustomerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCustomer(null)
        }}
        onSave={handleSave}
        customer={selectedCustomer}
      />
    </div>
  )
}
