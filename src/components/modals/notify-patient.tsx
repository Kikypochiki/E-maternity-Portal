import { createClient } from "@/lib/supabase/client"

interface NotifyPatientProps {
  patient_id: string
  notificationContent: string
}

export default function NotifyPatient({ patient_id, notificationContent }: NotifyPatientProps) {
  const supabase = createClient()

  const sendNotification = async () => {
    if (!notificationContent.trim()) {
      console.error("Notification content is empty")
      return { success: false, error: "Notification content is empty" }
    }

    if (!patient_id) {
      console.error("Patient ID is missing")
      return { success: false, error: "Patient ID is missing" }
    }

    try {
      const { error } = await supabase.from("PatientNotifications").insert([
        {
          patient_id: patient_id,
          notif_content: notificationContent,
        },
      ])

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
