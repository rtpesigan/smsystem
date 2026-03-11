"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2, Lock, Mail, Package, Users, BarChart3, Shield } from "lucide-react"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Package, label: "Storage Unit Management", color: "bg-blue-500" },
    { icon: Users, label: "Customer Management", color: "bg-green-500" },
    { icon: BarChart3, label: "Analytics & Reports", color: "bg-purple-500" },
  ]

  return (
    <div className={`min-h-screen flex items-center justify-center ${mounted && theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'}`}>
      {/* Decorative elements */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-300/20'} blur-3xl`}></div>
          <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-300/20'} blur-3xl`}></div>
        </div>
      )}

      <div className="w-full max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              {mounted && (
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm border ${theme === 'dark' ? 'border-white/20' : 'border-white/30'}`}>
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Enterprise Solution</span>
                </div>
              )}
              <h1 className={`text-5xl lg:text-6xl font-bold tracking-tight ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Storage Management
              </h1>
              <p className={`text-lg ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Complete solution for storage unit inventory, customer management, and rental tracking.
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className={`flex items-center gap-4 p-4 rounded-lg ${mounted && theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-white/40 hover:bg-white/60'} backdrop-blur-sm border ${mounted && theme === 'dark' ? 'border-white/10' : 'border-white/30'} transition-all duration-300`}>
                    <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`font-medium ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {feature.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Stats */}
            <div className={`border-t ${mounted && theme === 'dark' ? 'border-white/10' : 'border-white/30'} pt-6`}>
              <p className={`text-sm font-semibold mb-4 ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                By the numbers
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className={`text-2xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>1000+</p>
                  <p className={`text-xs ${mounted && theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Active Units</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>500+</p>
                  <p className={`text-xs ${mounted && theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Customers</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>98%</p>
                  <p className={`text-xs ${mounted && theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Occupancy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <Card className="section-card w-full max-w-md shadow-2xl">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-3 mx-auto">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">
                  Welcome Back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your storage management dashboard
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className={`p-4 rounded-lg flex gap-3 border ${mounted && theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${mounted && theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                  <p className={`text-sm ${mounted && theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/20 dark:to-blue-600/20 dark:border-blue-500/30">
                <p className="text-xs font-semibold mb-3 text-blue-900 dark:text-blue-300">
                  📝 DEMO CREDENTIALS
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Email:</p>
                    <p className="font-mono text-blue-900 dark:text-blue-100">admin@example.com</p>
                  </div>
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Password:</p>
                    <p className="font-mono text-blue-900 dark:text-blue-100">admin123</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-muted-foreground">
                Need help?{" "}
                <Link href="/" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Contact administrator
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
