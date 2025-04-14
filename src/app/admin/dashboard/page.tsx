"use client"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client" // Make sure this import is correct
import { useRouter } from "next/navigation"

export default function Dashboard() {
    const router = useRouter()
  
    // Initialize Supabase client
    const supabase = createClient()
  
    const fetchData = async () => {
      try {
  
        const {
          data: { session },
        } = await supabase.auth.getSession()
  
        if (!session) {
          console.log("No active session, redirecting to login")
          router.push("/auth_admin/login")
          return
        }

      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
  
  
    useEffect(() => {
      // Check authentication on component mount
      const checkAuth = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth_admin/login")
        } else {
          fetchData()
        }
      }
  
      checkAuth()
  
      // Set up auth state listener to handle session changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          // If signed out event is detected, redirect to login
          router.push("/auth_admin/login")
        }
      })
  
      return () => {
        subscription.unsubscribe()
      }
    }, [])
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <h1>Admin Dashboard</h1>
      </div>
    </div>
  )
}