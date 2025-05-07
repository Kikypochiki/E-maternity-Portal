"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"

interface SignupFormProps extends React.ComponentProps<"div"> {
  heading?: string
  subheading?: string
  signupText?: string
  googleText?: string
  loginText?: string
  loginUrl?: string
}

const ADMIN_CODE = "secureAdminCode123"

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
)

async function adminSignUp(
  email: string,
  password: string,
  adminCode: string,
  position: string,
  first_name: string,
  last_name: string,
) {
  if (adminCode !== ADMIN_CODE) {
    toast.error("Invalid Admin Code. Please contact support.")
    return
  }

  const { data, error } = await serviceSupabase.auth.admin.createUser({
    email: email,
    password: password,
    user_metadata: {
      role: "admin",
    },
  })

  if (error) {
    console.error("Sign up error:", error.message)
    toast.error("Sign up failed. Check details or contact support.")
  } else {
    console.log("User signed up successfully:", data.user)
    toast.success("Sign up successful! Welcome, Admin.")
  }

  if (data) {
    const { error: roleError } = await serviceSupabase.from("role_user").insert({
      user_id: data?.user?.id || null, // Ensure user_id is not null
      role: "admin",
    })

    if (roleError) {
      console.error("Failed to assign role to user:", roleError.message)
      toast.error("Failed to assign role. Please contact support.")
    } else {
      console.log("Role 'admin' assigned successfully.")
    }
    const { error: profileError } = await serviceSupabase.from("profile_user").insert({
      user_id: data?.user?.id || null, // Ensure user_id is not null
      role_profile: position, // Insert position into role_profile column
      first_name: first_name, // Replace with actual first name
      last_name: last_name, // Replace with actual last name
    })

    if (profileError) {
      console.error("Failed to insert profile data:", profileError.message)
      toast.error("Failed to complete profile setup. Please contact support.")
    } else {
      console.log("Profile data inserted successfully.")
    }
  }
}

export function SignupFormAdmin({
  className,
  heading = "Create an admin account",
  subheading = "Enter your details below to sign up as an admin",
  signupText = "Sign up",
  loginText = "Already have an account?",
  loginUrl = "/auth_admin/login",
  ...props
}: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [adminCode, setAdminCode] = useState("")
  const [position, setPosition] = useState("")
  const [first_name, setFirstName] = useState("")
  const [last_name, setLastName] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    setIsLoading(true) // Set loading to true
    await adminSignUp(email, password, adminCode, position, first_name, last_name)
    setIsLoading(false) // Set loading to false after completion
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
          <CardDescription>{subheading}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  type="text"
                  placeholder="Enter your first name"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Enter your last name"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="Enter your position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-code">Admin Code</Label>
                <Input
                  id="admin-code"
                  type="text"
                  placeholder="Enter the admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Signing up...</span>
                  </div>
                ) : (
                  signupText
                )}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                {loginText}{" "}
                <a href={loginUrl} className="font-medium text-primary hover:underline">
                  Login
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
