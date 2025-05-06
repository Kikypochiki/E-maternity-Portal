"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "./data-table"
import { type Notification, columns } from "./columns"
import { toast } from "sonner"

export default function NotificationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("No active session, redirecting to login")
        router.push("/auth_admin/login")
        return
      }

      const { data: notifications, error } = await supabase
        .from("AdminNotifications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.log(error)
        if (error.code === "PGRST301" || error.code === "401") {
          router.push("/auth_admin/login")
        }
        return
      }

      if (notifications) {
        setData(notifications)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth_admin/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleDeleteSelected = async (selectedRows: Notification[]) => {
    try {
      const ids = selectedRows.map((row) => row.notif_id)

      const { error } = await supabase.from("AdminNotifications").delete().in("notif_id", ids)

      if (error) {
        console.error("Error deleting notifications:", error)
        toast("Failed to delete notifications")
        return
      }

      // Update the local state by removing the deleted notifications
      setData((prevData) => prevData.filter((item) => !ids.includes(item.notif_id)))

      toast(`${ids.length} notification(s) deleted successfully`)
    } catch (error) {
      console.error("Error in delete operation:", error)
      toast("An unexpected error occurred")
    }
  }

  return (
    <div className="flex flex-col container w-full mx-auto pt-5">
      <div className="flex flex-row items-center justify-between m-2">
        <div className="flex items-center">
          {loading ? (
            <Skeleton className="w-[150px] h-[28px] rounded-full" />
          ) : (
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          )}
        </div>
      </div>
      <div className="container mx-auto">
        {loading ? (
          <div className="flex flex-col space-y-4 mt-10">
            <Skeleton className="w-full h-10 rounded-md" />
            <Skeleton className="w-full h-10 rounded-md" />
            <Skeleton className="w-full h-10 rounded-md" />
          </div>
        ) : (
          <DataTable columns={columns} data={data} onDeleteSelected={handleDeleteSelected} />
        )}
      </div>
    </div>
  )
}
