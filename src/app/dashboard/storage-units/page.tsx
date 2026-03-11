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
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react"
import { StorageUnitModal } from "@/components/storage-units/storage-unit-modal"

interface StorageUnit {
  id: string
  unitNumber: string
  categoryId: string
  category?: { name: string }
  size: string
  floorLevel: number
  pricePerMonth: number
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
}

const statusColors: Record<StorageUnit["status"], string> = {
  AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-900/40",
  OCCUPIED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40",
  MAINTENANCE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40",
}

export default function StorageUnitsPage() {
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [filteredUnits, setFilteredUnits] = useState<StorageUnit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch units on mount
  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/storage-units")
      if (!response.ok) throw new Error("Failed to fetch units")
      const data = await response.json()
      setUnits(data)
      setFilteredUnits(data)
    } catch (err) {
      setError("Failed to load storage units")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = units.filter(
      (unit) =>
        unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUnits(filtered)
  }, [searchTerm, units])

  const handleEdit = (unit: StorageUnit) => {
    setSelectedUnit(unit)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      try {
        const response = await fetch(`/api/storage-units/${id}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete unit")
        setUnits(units.filter((u) => u.id !== id))
      } catch (err) {
        alert("Failed to delete unit")
        console.error(err)
      }
    }
  }

  const handleSave = async (data: Partial<StorageUnit>) => {
    try {
      if (selectedUnit) {
        const response = await fetch(`/api/storage-units/${selectedUnit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          let errorMessage = "Failed to update unit"
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
        setUnits(units.map((u) => (u.id === selectedUnit.id ? updated : u)))
      } else {
        const response = await fetch("/api/storage-units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          let errorMessage = "Failed to create unit"
          try {
            const body = await response.json()
            errorMessage = body?.error || errorMessage
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }
        const newUnit = await response.json()
        setUnits([...units, newUnit])
      }
      setShowModal(false)
      setSelectedUnit(null)
    } catch (err: any) {
      alert(err?.message || "Failed to save unit")
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
          <h1 className="page-title">Storage Units</h1>
          <p className="page-description">Manage and monitor all storage units</p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setSelectedUnit(null)
            setShowModal(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="section-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by unit number or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage Units Table */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle>Unit Inventory</CardTitle>
          <CardDescription>
            {filteredUnits.length} of {units.length} unit{units.length !== 1 ? 's' : ''} shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Price/Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                      <TableCell>{unit.category?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className="bg-secondary text-secondary-foreground text-xs">
                          {unit.size || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>Floor {unit.floorLevel}</TableCell>
                      <TableCell>
                        {typeof unit.pricePerMonth === "number" ? `₱${unit.pricePerMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[unit.status] + " border-0"}>
                          {unit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(unit)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(unit.id)}
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
                      No storage units found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <StorageUnitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedUnit(null)
        }}
        onSave={handleSave}
        unit={selectedUnit}
      />
    </div>
  )
}
