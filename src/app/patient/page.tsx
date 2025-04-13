"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button" // Adjust the path based on your project structure

export default function Patient() {
  const router = useRouter()

  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false)

  // Initialize Supabase client
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // First check if there's an active session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Only attempt to sign out if there's an active session
        const { error } = await supabase.auth.signOut()
        if (error && error.message !== "Auth session missing!") {
          console.error("Error signing out:", error.message)
          toast?.("There was a problem logging out. Please try again.")
        }
      } else {
        console.log("No active session found, proceeding with logout flow")
      }

      // Clear any local storage items related to auth
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        // Clear any other auth-related items you might have
      }

      // Show success message
      toast?.("You have been successfully logged out.")

      // Force a refresh to clear any auth state in memory
      router.refresh()

      // Redirect to login page
      router.push("/auth_admin/login")
    } catch (error: unknown) {
      console.error("Unexpected error during logout:", error)

      // Even if there's an error, we should still redirect to login
      router.push("/auth_admin/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div>
      <h1>Patient</h1>
      <Button onClick={handleLogout} disabled={isLoggingOut}>Logout</Button>
    </div>
  )
}

