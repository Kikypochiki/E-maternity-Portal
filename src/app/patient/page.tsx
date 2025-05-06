"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Download,
  FileText,
  Trash2,
  User,
  Phone,
  MapPin,
  Calendar,
  Activity,
  LogOut,
  Loader2,
  Bed,
  Stethoscope,
  UserCheck,
} from "lucide-react"

export default function Patient() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [patientData, setPatientData] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [appointments, setAppointments] = React.useState<any[]>([])
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [labFiles, setLabFiles] = React.useState<any[]>([])
  const [admissionData, setAdmissionData] = React.useState<any>(null)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [isDownloading, setIsDownloading] = React.useState<string | null>(null)

  // Convert military time to standard time (AM/PM)
  const formatTime = (timeString: string) => {
    try {
      // Handle different time formats
      let hours, minutes

      if (timeString.includes(":")) {
        ;[hours, minutes] = timeString.split(":").map(Number)
      } else if (timeString.length === 4) {
        hours = Number.parseInt(timeString.substring(0, 2))
        minutes = Number.parseInt(timeString.substring(2, 4))
      } else {
        return timeString // Return original if format is unknown
      }

      const period = hours >= 12 ? "PM" : "AM"
      const standardHours = hours % 12 || 12 // Convert 0 to 12
      return `${standardHours}:${minutes.toString().padStart(2, "0")} ${period}`
    } catch (error) {
      console.error("Error formatting time:", error)
      return timeString // Return original if there's an error
    }
  }

  React.useEffect(() => {
    async function fetchPatientData() {
      try {
        setIsLoading(true)

        // Get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setError("You must be logged in to view this page")
          router.push("/auth_admin/login")
          return
        }

        // Get the patient data where user_id matches the current user's ID
        const { data: patientData, error: patientError } = await supabase
          .from("Patients")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (patientError) {
          console.error("Error fetching patient data:", patientError)
          setError("Could not find your patient record")
          return
        }

        if (patientData) {
          setPatientData(patientData)

          // Fetch appointments for this patient
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from("Appointments")
            .select("*")
            .eq("patient_id", patientData.patient_id)
            .order("date_of_appointment", { ascending: true })

          if (appointmentsError) {
            console.error("Error fetching appointments:", appointmentsError)
          } else {
            setAppointments(appointmentsData || [])
          }

          // Fetch notifications for this patient
          const { data: notificationsData, error: notificationsError } = await supabase
            .from("PatientNotifications")
            .select("*")
            .eq("patient_id", patientData.patient_id)
            .order("created_at", { ascending: false })

          if (notificationsError) {
            console.error("Error fetching notifications:", notificationsError)
          } else {
            setNotifications(notificationsData || [])
          }

          // Fetch lab files for this patient
          const { data: labFilesData, error: labFilesError } = await supabase
            .from("LabFiles")
            .select("*")
            .eq("patient_id", patientData.patient_id)
            .order("created_at", { ascending: false })

          if (labFilesError) {
            console.error("Error fetching lab files:", labFilesError)
          } else {
            setLabFiles(labFilesData || [])
          }

          // Fetch admission data for this patient
          const { data: admissionData, error: admissionError } = await supabase
            .from("Admissions")
            .select("*")
            .eq("patient_id", patientData.patient_id)
            .eq("admission_status", "Admitted")
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (admissionError && admissionError.code !== "PGRST116") {
            console.error("Error fetching admission data:", admissionError)
          } else if (admissionData) {
            setAdmissionData(admissionData)
          }
        } else {
          setError("No patient record found for your account")
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [supabase, router])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { error } = await supabase.auth.signOut()
        if (error && error.message !== "Auth session missing!") {
          console.error("Error signing out:", error.message)
          toast("There was a problem logging out. Please try again.")
        }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
      }

      toast("You have been successfully logged out.")
      router.refresh()
      router.push("/auth_admin/login")
    } catch (error: unknown) {
      console.error("Unexpected error during logout:", error)
      router.push("/auth_admin/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setIsDeleting(notificationId)

      // Use notif_id instead of id for deleting notifications
      const { error } = await supabase.from("PatientNotifications").delete().eq("notif_id", notificationId)

      if (error) {
        console.error("Error deleting notification:", error)
        toast("Failed to delete notification. Please try again.")
      } else {
        // Update the notifications list
        setNotifications(notifications.filter((notif) => notif.notif_id !== notificationId))
        toast("Notification deleted successfully.")
      }
    } catch (error) {
      console.error("Unexpected error deleting notification:", error)
      toast("An error occurred. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDownloadFile = async (fileName: string) => {
    try {
      setIsDownloading(fileName)

      const { data, error } = await supabase.storage.from("lab.results").download(fileName)

      if (error) {
        console.error("Error downloading file:", error)
        toast("Failed to download file. Please try again.")
        return
      }

      if (!data) {
        toast("File not found.")
        return
      }

      // Create a download link for the file
      const url = URL.createObjectURL(data)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast("File downloaded successfully.")
    } catch (error) {
      console.error("Unexpected error downloading file:", error)
      toast("An error occurred. Please try again.")
    } finally {
      setIsDownloading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your patient information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-500">Access Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/auth_admin/login")}>Return to Login</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Patient Portal</h1>
        <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" className="flex items-center gap-2">
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>

      {patientData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage
                  src="/placeholder.svg?height=96&width=96"
                  alt={`${patientData.first_name} ${patientData.last_name}`}
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {patientData.first_name?.[0]}
                  {patientData.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">
                {patientData.first_name} {patientData.middle_initial}. {patientData.last_name}
              </CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-2">
                  Patient ID: {patientData.patient_id_provided}
                </Badge>
                {admissionData && (
                  <Badge variant="outline" className="mt-2 ml-2 bg-green-50 text-green-700 border-green-200">
                    Currently Admitted
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Sex</p>
                  <p className="font-medium">{patientData.sex}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(patientData.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{patientData.contact_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{patientData.permanent_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="details">Personal</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="notifications" className="relative">
                  Notifications
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {notifications.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="labresults">Lab Results</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Civil Status</p>
                      <p className="font-medium">{patientData.civil_status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Religion</p>
                      <p className="font-medium">{patientData.religion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-medium">{patientData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Birthplace</p>
                      <p className="font-medium">{patientData.birthplace}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Occupation</p>
                      <p className="font-medium">{patientData.occupation || "Not specified"}</p>
                    </div>
                    {patientData.civil_status === "Married" && (
                      <div>
                        <p className="text-sm text-muted-foreground">Spouse Name</p>
                        <p className="font-medium">{patientData.spouse_name || "Not specified"}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                {admissionData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bed className="h-5 w-5" />
                        Current Admission
                      </CardTitle>
                      <CardDescription>You are currently admitted to our facility</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">Admission Date</p>
                          </div>
                          <p className="text-sm">
                            {admissionData.created_at
                              ? new Date(admissionData.created_at).toLocaleDateString(undefined, {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not available"}
                          </p>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">Attending Staff</p>
                          </div>
                          <p className="text-sm">{admissionData.attending_clinic_staff || "Not specified"}</p>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">Referring Personnel</p>
                          </div>
                          <p className="text-sm">{admissionData.referring_personnel || "Not specified"}</p>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">Admission Type</p>
                          </div>
                          <p className="text-sm">{admissionData.admission_type || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <p className="font-medium text-sm">Admitting Diagnosis</p>
                        </div>
                        <p className="text-sm">{admissionData.admitting_diagnosis || "Not specified"}</p>
                        {admissionData.admitting_diagnosis_icd_code && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ICD Code: {admissionData.admitting_diagnosis_icd_code}
                          </p>
                        )}
                      </div>

                      {patientData.sex === "Female" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-primary" />
                              <p className="font-medium text-sm">Gravidity</p>
                            </div>
                            <p className="text-sm">{patientData.gravidity}</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-primary" />
                              <p className="font-medium text-sm">Parity</p>
                            </div>
                            <p className="text-sm">{patientData.parity}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Medical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {patientData.sex === "Female" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-sm text-muted-foreground">Gravidity</p>
                            <p className="font-medium">{patientData.gravidity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Parity</p>
                            <p className="font-medium">{patientData.parity}</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground text-center">
                            Your medical records will appear here once your healthcare provider updates them.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Your Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment, index) => (
                          <div key={index} className="flex items-center p-3 border rounded-lg">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {new Date(appointment.date_of_appointment).toLocaleDateString(undefined, {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Time: {formatTime(appointment.time_of_appointment)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          You have no upcoming appointments scheduled.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>View and manage your notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {notifications.length > 0 ? (
                      <div className="space-y-4">
                        {notifications.map((notification: any) => (
                          <div
                            key={notification.notif_id ?? `${notification.created_at}-${notification.notif_content}`}
                            className="flex items-start p-3 border rounded-lg"
                          >
                            <div className="bg-primary/10 p-3 rounded-full mr-4 mt-1">
                              <AlertCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-1">{notification.notif_content}</p>
                              <p className="text-xs text-muted-foreground">
                                {notification.created_at
                                  ? new Date(notification.created_at).toLocaleString()
                                  : "Date not available"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNotification(notification.notif_id)}
                              disabled={isDeleting === notification.notif_id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDeleting === notification.notif_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground text-center">You have no notifications at this time.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="labresults" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Lab Results
                    </CardTitle>
                    <CardDescription>View and download your lab results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {labFiles.length > 0 ? (
                      <div className="space-y-4">
                        {labFiles.map((file) => (
                          <div key={file.id} className="flex items-center p-3 border rounded-lg">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.created_at ? new Date(file.created_at).toLocaleString() : "Date not available"}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(file.file_name)}
                              disabled={isDownloading === file.file_name}
                              className="flex items-center gap-2"
                            >
                              {isDownloading === file.file_name ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Download
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                          You have no lab results available for download.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Patient Record Found</CardTitle>
            <CardDescription>We couldn't find a patient record associated with your account.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/auth_admin/login")}>Return to Login</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
