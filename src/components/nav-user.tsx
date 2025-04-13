"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavUserProps {
  profile: {
    first_name: string
    last_name: string
    position: string
  }
}

const defaultProfile = {
  first_name: "",
  last_name: "",
  position: "",
}

export default function NavUser({
  profile = defaultProfile,
  ...props
}: NavUserProps & React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
      toast?.( "You have been successfully logged out.")

      // Force a refresh to clear any auth state in memory
      router.refresh()

      // Redirect to login page
      router.push("/auth_admin/login")
    } catch (error) {
      console.error("Unexpected error during logout:", error)

      // Even if there's an error, we should still redirect to login
      router.push("/auth_admin/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    }
    return "U"
  }

  return (
    <div className="flex items-center justify-between p-2 mt-auto text-sm gap-3" {...props}>
      <div className="hidden sm:flex items-end flex-col">
        <div className="flex flex-col overflow-hidden">
          <h2 className="text-xs font-semibold truncate">
          {`${profile.first_name} ${profile.last_name}` || "User"}
          </h2>
        </div>
      <p className="text-xs truncate">{profile.position || "Staff"}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-7 w-7 border cursor-pointer">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 text-xs">
        <DropdownMenuLabel>
        {`${profile.first_name} ${profile.last_name}` || "User"}
        <p className="text-xs truncate">{profile.position || "Staff"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
        className="cursor-pointer flex items-center"
        onClick={() => router.push("/settings")}
        >
        <Settings className="mr-2 h-3 w-3" />
        <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
        className="cursor-pointer flex items-center"
        onClick={handleLogout}
        disabled={isLoggingOut}
        >
        {isLoggingOut ? (
          <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          <span>Logging out...</span>
          </>
        ) : (
          <>
          <LogOut className="mr-2 h-3 w-3" />
          <span>Logout</span>
          </>
        )}
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
