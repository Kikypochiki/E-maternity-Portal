"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function PasswordRecoveryForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth_admin/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        console.error("Password recovery error:", error.message)
        return
      }

      setIsSubmitted(true)
      toast.success("Recovery email sent. Please check your inbox.")
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Link href="/auth_admin/login" className="mr-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                {!isSubmitted
                  ? "Enter your email and we'll send you a link to reset your password"
                  : "Check your email for a link to reset your password"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send recovery email"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              <p className="text-center text-sm text-muted-foreground">
                We've sent a password recovery link to <strong>{email}</strong>. Please check your email and follow the
                instructions to reset your password.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                }}
              >
                Try another email
              </Button>
              <Button variant="link" onClick={() => router.push("/auth_admin/login")}>
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
