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

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  payment?: any
}

export function PaymentModal({ isOpen, onClose, onSave, payment }: PaymentModalProps) {
  const [rentals, setRentals] = useState<any[]>([])
  const [formData, setFormData] = useState({
    rentalId: "",
    amount: 0,
    paymentMethod: "CASH",
    status: "PENDING",
    dueDate: "",
    paymentDate: "",
  })

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch("/api/rentals")
        if (!response.ok) return
        const data = await response.json()
        setRentals(Array.isArray(data) ? data : [])
      } catch {
        // ignore
      }
    }

    if (isOpen) fetchRentals()
  }, [isOpen])

  useEffect(() => {
    if (payment) {
      setFormData({
        rentalId: payment.rentalId || payment.rental?.id || "",
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || "CASH",
        status: payment.status || "PENDING",
        dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split("T")[0] : "",
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split("T")[0] : "",
      })
    } else {
      setFormData({
        rentalId: "",
        amount: 0,
        paymentMethod: "CASH",
        status: "PENDING",
        dueDate: "",
        paymentDate: "",
      })
    }
  }, [payment, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{payment ? "Edit Payment" : "Add Payment"}</DialogTitle>
          <DialogDescription>
            {payment ? "Update payment details" : "Record a new payment"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rentalId">Customer & Rental *</Label>
            <select
              id="rentalId"
              name="rentalId"
              value={formData.rentalId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
              required
            >
              <option value="" disabled>
                Select customer and rental...
              </option>
              {rentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.customer?.firstName} {r.customer?.lastName} — Unit {r.storageUnit?.unitNumber}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Select a rental to automatically associate the customer</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
                required
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="CHECK">Check</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={handleChange}
                disabled={formData.status !== "COMPLETED"}
              />
              {formData.status === "COMPLETED" && (
                <p className="text-xs text-gray-500">Will be auto-set if left blank</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{payment ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
