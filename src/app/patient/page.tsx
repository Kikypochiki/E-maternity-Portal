"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Patient() {
  const router = useRouter()

  const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("auth/login");
    };

  return (
    <div>
      <h1>Patient</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
