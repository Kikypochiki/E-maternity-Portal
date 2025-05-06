import { createClient } from "@/lib/supabase/client"

interface NotifyAdminProps {
  notificationContent: string
}

export default function NotifyAdmin({ notificationContent }: NotifyAdminProps) {
  const supabase = createClient()

  const sendNotification = async () => {
    if (!notificationContent.trim()) {
      console.error("Notification content is empty")
      return { success: false, error: "Notification content is empty" }
    }

    try {
      const { error } = await supabase.from("AdminNotifications").insert([{ notif_content: notificationContent }])

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error sending notification:", error)
      return { success: false, error }
    }
  }
  sendNotification()

  return null
}
