"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StorageUnitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  unit?: any
}

interface CategoryOption {
  id: string
  name: string
}

export function StorageUnitModal({
  isOpen,
  onClose,
  onSave,
  unit,
}: StorageUnitModalProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [formData, setFormData] = useState({
    unitNumber: "",
    categoryId: "",
    size: "SMALL",
    floorLevel: 1,
    pricePerMonth: 0,
    description: "",
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) return
        const data = await response.json()
        setCategories(
          (Array.isArray(data) ? data : []).map((c: any) => ({
            id: c.id,
            name: c.name,
          }))
        )
      } catch {
        // ignore
      }
    }

    if (isOpen) fetchCategories()
  }, [isOpen])

  useEffect(() => {
    if (unit) {
      setFormData({
        unitNumber: unit.unitNumber || "",
        categoryId: unit.categoryId || unit.category?.id || "",
        size: unit.size || "SMALL",
        floorLevel: unit.floorLevel || unit.floor || 1,
        pricePerMonth: unit.pricePerMonth || unit.price || 0,
        description: unit.description || "",
      })
    } else {
      setFormData({
        unitNumber: "",
        categoryId: "",
        size: "SMALL",
        floorLevel: 1,
        pricePerMonth: 0,
        description: "",
      })
    }
  }, [unit, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "floorLevel" || name === "pricePerMonth" ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting form data:", formData) // Debug log
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Storage Unit" : "Add Storage Unit"}</DialogTitle>
          <DialogDescription>
            {unit
              ? "Update the storage unit details"
              : "Create a new storage unit. Fill in all required fields."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unit Number */}
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number *</Label>
            <Input
              id="unitNumber"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              placeholder="e.g., A101"
              required
            />
          </div>

          {/* Category and Size Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
                required
              >
                <option value="" disabled>
                  Select category...
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., 50 sq ft, 100 sq ft, Large"
              />
            </div>
          </div>

          {/* Floor and Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor Level *</Label>
              <Input
                id="floor"
                name="floorLevel"
                type="number"
                value={formData.floorLevel}
                onChange={handleChange}
                placeholder="1"
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Month (₱) *</Label>
              <Input
                id="price"
                name="pricePerMonth"
                type="number"
                step="0.01"
                value={formData.pricePerMonth}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{unit ? "Update Unit" : "Create Unit"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
