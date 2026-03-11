"use client"

import React, { useEffect, useState } from "react"
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

interface RentalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  rental?: any
}

export function RentalModal({ isOpen, onClose, onSave, rental }: RentalModalProps) {
  const [customers, setCustomers] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customerId: "",
    storageUnitId: "",
    startDate: "",
    endDate: "",
    months: 6,
    monthlyRate: 0,
  })

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers")
        if (!response.ok) return
        const data = await response.json()
        setCustomers(Array.isArray(data) ? data : [])
      } catch {
        // ignore
      }
    }

    const fetchUnits = async () => {
      try {
        const response = await fetch("/api/storage-units")
        if (!response.ok) return
        const data = await response.json()
        setUnits(Array.isArray(data) ? data.filter((u: any) => u.status === "AVAILABLE") : [])
      } catch {
        // ignore
      }
    }

    if (isOpen) {
      fetchCustomers()
      fetchUnits()
    }
  }, [isOpen])

  useEffect(() => {
    if (rental) {
      setFormData({
        customerId: rental.customerId || rental.customer?.id || "",
        storageUnitId: rental.storageUnitId || rental.storageUnit?.id || "",
        startDate: rental.startDate ? new Date(rental.startDate).toISOString().split("T")[0] : "",
        endDate: rental.endDate ? new Date(rental.endDate).toISOString().split("T")[0] : "",
        months: rental.months || 6,
        monthlyRate: rental.monthlyRate || 0,
      })
    } else {
      setFormData({
        customerId: "",
        storageUnitId: "",
        startDate: "",
        endDate: "",
        months: 6,
        monthlyRate: 0,
      })
    }
  }, [rental, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: name === "monthlyRate" ? parseFloat(value) : name === "months" ? parseInt(value) : value,
      }
      
      // Auto-calculate end date when start date or months change
      if (name === "startDate" || name === "months") {
        const startDate = name === "startDate" ? new Date(value) : new Date(prev.startDate)
        const months = name === "months" ? parseInt(value) : prev.months
        
        if (startDate && months && !isNaN(startDate.getTime())) {
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + months)
          newData.endDate = endDate.toISOString().split("T")[0]
        }
      }
      
      return newData
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{rental ? "Edit Rental" : "Add Rental"}</DialogTitle>
          <DialogDescription>
            {rental ? "Update rental details" : "Create a new rental agreement"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
                required
              >
                <option value="" disabled>
                  Select customer...
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageUnitId">Storage Unit *</Label>
              <select
                id="storageUnitId"
                name="storageUnitId"
                value={formData.storageUnitId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
                required
              >
                <option value="" disabled>
                  Select unit...
                </option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber} ({u.category?.name}) - ₱{u.pricePerMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="months">Duration *</Label>
              <select
                id="months"
                name="months"
                value={formData.months}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
                required
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                readOnly
                className="bg-gray-50 dark:bg-slate-800"
              />
              <p className="text-xs text-gray-500">Auto-calculated</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRate">Monthly Rate (₱) *</Label>
            <Input
              id="monthlyRate"
              name="monthlyRate"
              type="number"
              step="0.01"
              value={formData.monthlyRate}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{rental ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
