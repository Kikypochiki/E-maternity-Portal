"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Settings, Loader2} from "lucide-react"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  async function handleUpdateProfile(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault()

    try {
      const updatedProfile = {
        first_name: (document.getElementById("firstName") as HTMLInputElement)?.value || profile.first_name,
        last_name: (document.getElementById("lastName") as HTMLInputElement)?.value || profile.last_name,
        position: (document.getElementById("position") as HTMLInputElement)?.value || profile.position,
      }

      const { error } = await supabase
        .from("profile_user")
        .update({
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          role_profile: updatedProfile.position,
        })
        .eq("user_id", (await supabase.auth.getUser()).data?.user?.id)

      if (error) {
        console.error("Error updating profile:", error.message)
        toast?.("There was a problem updating your profile. Please try again.")
      } else {
        toast?.("Profile updated successfully.")
        router.refresh()
      }
    } catch (error) {
      console.error("Unexpected error during profile update:", error)
      toast?.("An unexpected error occurred. Please try again.")
    }
  }
  return (
    <div className="flex items-center justify-between p-2 mt-auto text-sm gap-3" {...props}>
      <div className="sm:flex items-end flex-col">
        <div className="flex flex-col overflow-hidden">
          <h2 className="text-sm font-semibold truncate">{`${profile.first_name} ${profile.last_name}` || "User"}</h2>
        </div>
        <p className="text-xs truncate">{profile.position || "Staff"}</p>
      </div>

      <Sheet>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 border cursor-pointer">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuLabel>
              {`${profile.first_name} ${profile.last_name}` || "User"}
              <p className="text-xs truncate">{profile.position || "Staff"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <SheetTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer flex items-center"
                onSelect={(e) => {
                  // Prevent the dropdown from closing
                  e.preventDefault()
                  // Close the dropdown manually
                  setIsDropdownOpen(false)
                }}
              >
                <Settings className="mr-2 h-3 w-3" />
                <span>Settings</span>
              </DropdownMenuItem>
            </SheetTrigger>
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

        <SheetContent className="sm:max-w-md p-5">
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Make changes to your profile here. Click save when you&#39;re done.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input id="firstName" defaultValue={profile.first_name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input id="lastName" defaultValue={profile.last_name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input id="position" defaultValue={profile.position} className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" onClick={handleUpdateProfile}>Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>

      </Sheet>
    </div>
  )
}
