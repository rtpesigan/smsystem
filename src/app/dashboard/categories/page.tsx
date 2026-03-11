"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import { CategoryModal } from "@/components/categories/category-modal"

interface StorageUnit {
  id: string
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
}

interface Category {
  id: string
  name: string
  description: string | null
  units: StorageUnit[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError("Failed to load categories")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        let errorMessage = "Failed to delete category"
        try {
          const body = await response.json()
          errorMessage = body?.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
      setCategories(categories.filter((c) => c.id !== id))
    } catch (err: any) {
      alert(err?.message || "Failed to delete category")
      console.error(err)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowModal(true)
  }

  const handleSave = async (data: { name: string; description?: string }) => {
    try {
      if (selectedCategory) {
        const response = await fetch(`/api/categories/${selectedCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to update category")
        }
        const updated = await response.json()
        setCategories(categories.map((c) => (c.id === selectedCategory.id ? updated : c)))
      } else {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to create category")
        }
        const created = await response.json()
        setCategories([created, ...categories])
      }

      setShowModal(false)
      setSelectedCategory(null)
    } catch (err: any) {
      alert(err?.message || "Failed to save category")
      console.error(err)
    }
  }

  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="page-title">Storage Categories</h1>
          <p className="page-description">Manage storage types and categories</p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            setSelectedCategory(null)
            setShowModal(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="section-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((category) => {
          const totalUnits = category.units?.length || 0
          const occupiedUnits = category.units?.filter((u) => u.status === "OCCUPIED").length || 0
          const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

          return (
            <Card key={category.id} className="section-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription className="mt-1">{category.description || ""}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Units</span>
                    <span className="font-semibold">{totalUnits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Occupied</span>
                    <Badge className="bg-secondary text-secondary-foreground text-xs">
                      {occupiedUnits} ({occupancyPct}%)
                    </Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCategory(null)
        }}
        onSave={handleSave}
        category={selectedCategory}
      />
    </div>
  )
}
