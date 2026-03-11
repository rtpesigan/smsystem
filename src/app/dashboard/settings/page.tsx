"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit2, Trash2, AlertCircle, Shield, User } from "lucide-react"
import { UserModal } from "@/components/settings/user-modal"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "STAFF" | "VIEWER"
  isActive: boolean
  createdAt: string
}

const roleDescriptions: Record<User["role"], string> = {
  ADMIN: "Full system access, user management, reporting",
  STAFF: "Manage customers, rentals, payments",
  VIEWER: "Read-only access to all data",
}

const roleColors: Record<User["role"], string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/40",
  STAFF: "bg-blue-100 text-blue-800 dark:bg-blue-900/40",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900/40",
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load users")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to delete user")
        }
        setUsers(users.filter((u) => u.id !== id))
      } catch (err: any) {
        alert(err?.message || "Failed to delete user")
        console.error(err)
      }
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedUser) {
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to update user")
        }
        const updated = await response.json()
        setUsers(users.map((u) => (u.id === selectedUser.id ? updated : u)))
      } else {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || "Failed to create user")
        }
        const created = await response.json()
        setUsers([created, ...users])
      }

      setShowModal(false)
      setSelectedUser(null)
    } catch (err: any) {
      alert(err?.message || "Failed to save user")
      console.error(err)
    }
  }

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
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage system users and their roles</p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            setSelectedUser(null)
            setShowModal(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Role Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>User Roles and Permissions</AlertTitle>
        <AlertDescription>
          Roles control what features and data users can access in the system. Choose appropriately based on job responsibilities.
        </AlertDescription>
      </Alert>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(roleDescriptions).map(([role, description]) => (
          <Card key={role} className="stat-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{role}</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>{users.length} user{users.length !== 1 ? 's' : ''} in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role] + " border-0"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={user.isActive ? "success" : "destructive"} className="text-xs">
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedUser(null)
        }}
        onSave={handleSave}
        user={selectedUser}
      />
    </div>
  )
}
