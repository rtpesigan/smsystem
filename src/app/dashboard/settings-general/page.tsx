"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Bell, Lock, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Storage Management Corp"
                  defaultValue="Storage Management System"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input
                  id="company-phone"
                  placeholder="+1 (555) 000-0000"
                  defaultValue="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Support Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  placeholder="support@example.com"
                  defaultValue="support@storagepro.com"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    title: "Overdue Payments",
                    description: "Alert when payments are overdue",
                  },
                  {
                    title: "Expiring Rentals",
                    description: "Alert when rentals are about to expire",
                  },
                  {
                    title: "New Customers",
                    description: "Notify about new customer registrations",
                  },
                  {
                    title: "System Maintenance",
                    description: "Important system updates and maintenance",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                ))}
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pass">Current Password</Label>
                <Input id="current-pass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pass">New Password</Label>
                <Input id="new-pass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirm Password</Label>
                <Input id="confirm-pass" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-500">Chrome on Windows • Last active just now</p>
              </div>
              <Button variant="destructive">Sign Out All Other Sessions</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the application appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: "Light Mode", value: "light" },
                  { label: "Dark Mode", value: "dark" },
                  { label: "System Default", value: "system" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      defaultChecked={option.value === "system"}
                      className="h-4 w-4"
                    />
                    <label className="font-medium">{option.label}</label>
                  </div>
                ))}
              </div>
              <Button>Save Theme</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
