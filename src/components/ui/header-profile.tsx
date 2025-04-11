"use client"
import React from "react"
import { createClient } from "@/lib/supabase/client"
import NavUser from "../nav-user"

interface Profile {
    first_name: string
    last_name: string
    position: string
  }
  const defaultProfile = {
    first_name: "Juan",
    last_name: "Dela Cruz",
    position: "Position",
  }
  

export function headerProfile() {
      const [userProfile, setUserProfile] = React.useState<Profile>(defaultProfile)
      const supabase = createClient()
      
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profile_user")
            .select("first_name, last_name, role_profile")
            .eq("user_id", (await supabase.auth.getUser()).data?.user?.id)
            .single()
    
          if (error) {
            console.error("Error fetching user profile:", error)
          } else if (data) {
            setUserProfile({
              first_name: data.first_name,
              last_name: data.last_name,
              position: data.role_profile,
            })
          }
        } catch (err) {
          console.error("Unexpected error fetching user profile:", err)
        }
      }
    
      React.useEffect(() => {
        fetchUserProfile()
      }, [])

  return (
    <div className="flex m-4 items-center w-full">
      <NavUser profile={userProfile} />
    </div>
  )
}