"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, CalendarIcon, Clock, User, Plus, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import NotifyAdmin from "@/components/modals/notify-admin"
import NotifyPatient from "@/components/modals/notify-patient"
import { motion, AnimatePresence } from "framer-motion"

type Patient = {
  patient_id: string
  patient_id_provided: string
  first_name: string
  last_name: string
  middle_initial?: string
  date_of_birth?: string
}

// Update the Appointment type to only include the necessary fields
type Appointment = {
  appointment_id: string
  patient_id: string
  date_of_appointment: string
  time_of_appointment?: string
}

// Fix the formatDate function to properly handle month formatting
const formatDate = (date: Date, format: string): string => {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const shortMonthNames = monthNames.map((m) => m.substring(0, 3))

  // Create a new string with replacements
  let result = format

  // Order matters - replace longer patterns first
  result = result.replace("MMMM", monthNames[date.getMonth()])
  result = result.replace("MMM", shortMonthNames[date.getMonth()])
  result = result.replace("MM", month)
  result = result.replace("yyyy", year.toString())
  result = result.replace("dd", day)
  result = result.replace("d", date.getDate().toString())

  return result
}

// Custom Calendar Component
const CustomCalendar = ({
  value,
  onChange,
  hasAppointments,
  disablePastDates = true,
}: {
  value: Date
  onChange: (date: Date) => void
  hasAppointments?: (date: Date) => boolean
  disablePastDates?: boolean
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1))

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    // Previous month days to display
    const prevMonthDays = []
    const prevMonth = month === 0 ? 11 : month - 1
    const prevMonthYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth)

    for (let i = 0; i < firstDayOfMonth; i++) {
      prevMonthDays.push({
        date: new Date(prevMonthYear, prevMonth, daysInPrevMonth - firstDayOfMonth + i + 1),
        isCurrentMonth: false,
        isPast: false,
      })
    }

    // Current month days
    const currentMonthDays = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      currentMonthDays.push({
        date,
        isCurrentMonth: true,
        isPast: disablePastDates && date < today,
      })
    }

    // Next month days to display
    const nextMonthDays = []
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length
    const daysToAdd = 42 - totalDaysDisplayed // 6 rows of 7 days

    const nextMonth = month === 11 ? 0 : month + 1
    const nextMonthYear = month === 11 ? year + 1 : year

    for (let i = 1; i <= daysToAdd; i++) {
      nextMonthDays.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false,
        isPast: false,
      })
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Check if a date is the selected date
  const isSelectedDate = (date: Date) => {
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    )
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const days = generateCalendarDays()
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="p-3 border rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = isSelectedDate(day.date)
          const isTodayDate = isToday(day.date)
          const hasAppts = hasAppointments ? hasAppointments(day.date) : false

          return (
            <div
              key={index}
              className={cn(
                "h-9 w-9 p-0 font-normal text-center flex items-center justify-center rounded-md",
                !day.isCurrentMonth && "text-muted-foreground opacity-50",
                day.isPast && "text-muted-foreground opacity-50",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isTodayDate && !isSelected && "bg-accent text-accent-foreground",
                hasAppts && !isSelected && "font-bold bg-primary/10 text-primary",
                !day.isPast && !isSelected && "hover:bg-accent hover:text-accent-foreground",
                "cursor-pointer transition-all duration-200",
              )}
              onClick={() => {
                if (!day.isPast) {
                  onChange(day.date)
                }
              }}
            >
              {day.date.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const supabase = createClient()
  const [date, setDate] = useState<Date>(new Date())
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSelectPatientOpen, setIsSelectPatientOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appointmentTime, setAppointmentTime] = useState<string>("09:00")
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, Appointment[]>>({})
  const [selectedTab, setSelectedTab] = useState("calendar")

  // Fetch patients and appointments on component mount
  useEffect(() => {
    fetchPatients()
    fetchAppointments()
    cleanupExpiredAppointments() // Add this line to clean up expired appointments
  }, [])

  // Filter patients based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = patients.filter(
        (patient) =>
          patient.first_name.toLowerCase().includes(query) ||
          patient.last_name.toLowerCase().includes(query) ||
          patient.patient_id_provided.toLowerCase().includes(query),
      )
      setFilteredPatients(filtered)
    }
  }, [searchQuery, patients])

  // Group appointments by date
  useEffect(() => {
    const groupedAppointments: Record<string, Appointment[]> = {}

    appointments.forEach((appointment) => {
      const dateKey = appointment.date_of_appointment.split("T")[0]
      if (!groupedAppointments[dateKey]) {
        groupedAppointments[dateKey] = []
      }
      groupedAppointments[dateKey].push(appointment)
    })

    setAppointmentsByDate(groupedAppointments)
  }, [appointments])

  // Fetch all patients from the database
  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const { data: patientData, error } = await supabase.from("Patients").select("*")

      if (error) {
        console.error("Error fetching patients:", error)
        return
      }

      if (patientData) {
        const formattedData = patientData.map((patient) => ({
          ...patient,
          patient_id: patient.patient_id || "N/A",
          patient_id_provided: patient.patient_id_provided || "N/A",
          first_name: patient.first_name || "N/A",
          last_name: patient.last_name || "N/A",
          middle_initial: patient.middle_initial || "",
        }))
        setPatients(formattedData)
        setFilteredPatients(formattedData)
      }
    } catch (error) {
      console.error("Error in fetch operation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Simplify the fetchAppointments function to only fetch appointment data
  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("Appointments")
        .select("appointment_id, patient_id, date_of_appointment, time_of_appointment")

      if (error) {
        console.error("Error fetching appointments:", error)
        return
      }

      if (data) {
        setAppointments(data)
      }
    } catch (error) {
      console.error("Error in fetch operation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to clean up expired appointments
  const cleanupExpiredAppointments = async () => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const formattedDate = formatDate(yesterday, "yyyy-MM-dd")

      // Delete appointments that are older than yesterday
      const { error } = await supabase.from("Appointments").delete().lte("date_of_appointment", formattedDate)

      if (error) {
        console.error("Error cleaning up expired appointments:", error)
        return
      }

      // Refresh appointments after cleanup
      fetchAppointments()
    } catch (error) {
      console.error("Error in cleanup operation:", error)
    }
  }

  // Add the following function after the cleanupExpiredAppointments function and before the handlePatientSelect function:

  // Function to check and send notifications for upcoming appointments

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsSelectPatientOpen(false)
  }

  // Update the handleCreateAppointment function to only include the necessary fields
  const handleCreateAppointment = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient")
      return
    }

    // Check if the selected date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      toast.error("Cannot schedule appointments in the past")
      return
    }

    try {
      setIsSubmitting(true)

      // Format the date for database storage
      const formattedDate = formatDate(date, "yyyy-MM-dd")

      // Insert appointment data into Appointments table without specifying appointment_id
      const { data, error } = await supabase
        .from("Appointments")
        .insert([
          {
            patient_id: selectedPatient.patient_id,
            date_of_appointment: formattedDate,
            time_of_appointment: appointmentTime,
          },
        ])
        .select()

      if (error) {
        console.error("Error creating appointment:", error)
        toast.error("Failed to create appointment")
        return
      }

      // Add the new appointment to the state using the ID generated by Supabase
      if (data && data.length > 0) {
        const newAppointment = data[0]
        setAppointments((prev) => [...prev, newAppointment])

        // Send notification about new appointment
        const notificationContent = `NEW APPOINTMENT: ${selectedPatient.first_name} ${selectedPatient.last_name} has been scheduled for ${formatDate(date, "MMM d, yyyy")} at ${formatTime(appointmentTime)}.`
        NotifyAdmin({ notificationContent })
        NotifyPatient({
          patient_id: selectedPatient.patient_id,
          notificationContent: `You have a new appointment scheduled for ${formatDate(date, "MMM d, yyyy")} at ${formatTime(appointmentTime)}.`,
        })
        toast.success("New appointment scheduled")

        // Reset form
        setSelectedPatient(null)
        setAppointmentTime("09:00")
      }
    } catch (error) {
      console.error("Error in appointment creation:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancel an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase.from("Appointments").delete().eq("appointment_id", appointmentId)

      if (error) {
        console.error("Error canceling appointment:", error)
        toast.error("Failed to cancel appointment")
        return
      }

      // Remove the appointment from state
      setAppointments((prev) => prev.filter((apt) => apt.appointment_id !== appointmentId))
      toast.success("Appointment canceled successfully")
    } catch (error) {
      console.error("Error in cancel operation:", error)
      toast.error("An unexpected error occurred")
    }
  }
  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase.from("Appointments").delete().eq("appointment_id", appointmentId)

      if (error) {
        console.error("Error completing appointment:", error)
        toast.error("Failed to complete appointment")
        return
      }

      // Remove the appointment from state
      setAppointments((prev) => prev.filter((apt) => apt.appointment_id !== appointmentId))
      toast.success("Appointment succesfully completed")
    } catch (error) {
      console.error("Error in complete operation:", error)
      toast.error("An unexpected error occurred")
    }
  }

  // Get appointments for the selected date
  const getAppointmentsForDate = (selectedDate: Date) => {
    const dateKey = formatDate(selectedDate, "yyyy-MM-dd")
    return appointmentsByDate[dateKey] || []
  }

  // Check if a date has appointments
  const hasAppointments = (day: Date) => {
    const dateKey = formatDate(day, "yyyy-MM-dd")
    return appointmentsByDate[dateKey] && appointmentsByDate[dateKey].length > 0
  }

  // Get today's appointments
  const todaysAppointments = getAppointmentsForDate(new Date())

  // Get upcoming appointments (excluding today)
  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.date_of_appointment)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return appointmentDate > today
    })
    .sort((a, b) => {
      return new Date(a.date_of_appointment).getTime() - new Date(b.date_of_appointment).getTime()
    })

  // Helper function to get patient information by patient_id
  const getPatientById = (patientId: string) => {
    return patients.find((patient) => patient.patient_id === patientId)
  }

  // Helper function to convert 24-hour time to 12-hour time format
  const formatTime = (time24: string | undefined): string => {
    if (!time24) return "No time specified"

    const [hourStr, minute] = time24.split(":")
    const hour = Number.parseInt(hourStr, 10)
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? "AM" : "PM"

    return `${hour12}:${minute} ${ampm}`
  }

  // Render loading skeleton for calendar view
  const renderCalendarSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-3 w-36" />
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-1">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <Skeleton key={dayIndex} className="h-7 w-7 rounded-md mx-auto" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )

  // Render loading skeleton for appointment lists
  const renderAppointmentListSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  // Add the following useEffect after the existing useEffect hooks:

  // Set up periodic checking for appointment notifications
  useEffect(() => {
    const checkNotifications = () => {
      // Get already notified appointments from localStorage
      const notifiedAppointmentsStr = localStorage.getItem("notifiedAppointments") || "{}"
      const notifiedAppointments = JSON.parse(notifiedAppointmentsStr)

      // Current date for tracking
      const today = new Date().toISOString().split("T")[0]

      // Clean up old notifications (from previous days)
      Object.keys(notifiedAppointments).forEach((date) => {
        if (date !== today) {
          delete notifiedAppointments[date]
        }
      })

      // Initialize today's notifications if needed
      if (!notifiedAppointments[today]) {
        notifiedAppointments[today] = []
      }

      // Get current date and time
      const now = new Date()

      // Check for appointments that are 1 day away
      const oneDayFromNow = new Date(now)
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
      const oneDayDate = formatDate(oneDayFromNow, "yyyy-MM-dd")

      // Check for appointments that are coming up in the next hour
      const oneHourFromNow = new Date(now)
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)
      const nextHour = oneHourFromNow.getHours()

      // Process each appointment to check if notifications are needed
      appointments.forEach((appointment) => {
        const appointmentDate = appointment.date_of_appointment.split("T")[0]
        const appointmentTime = appointment.time_of_appointment
        const appointmentId = appointment.appointment_id
        const patient = getPatientById(appointment.patient_id)

        if (!patient) return

        const patientName = `${patient.first_name} ${patient.last_name}`

        // Check for 1-day notification
        if (appointmentDate === oneDayDate && !notifiedAppointments[today].includes(`day_${appointmentId}`)) {
          const notificationContent = `REMINDER: Appointment for ${patientName} is scheduled for tomorrow at ${formatTime(appointmentTime)}.`
          NotifyAdmin({ notificationContent })
          NotifyPatient({
            patient_id: appointment.patient_id,
            notificationContent: `You have an appointment scheduled for tomorrow at ${formatTime(appointmentTime)}.`,
          })

          toast("You have an appointment tomorrow")
          notifiedAppointments[today].push(`day_${appointmentId}`)
        }

        // Check for 1-hour notification
        if (
          appointmentDate === formatDate(now, "yyyy-MM-dd") &&
          appointmentTime &&
          Number.parseInt(appointmentTime.split(":")[0]) === nextHour &&
          !notifiedAppointments[today].includes(`hour_${appointmentId}`)
        ) {
          const notificationContent = `URGENT: Appointment for ${patientName} is coming up in 1 hour at ${formatTime(appointmentTime)}.`
          NotifyAdmin({ notificationContent })
          NotifyPatient({
            patient_id: appointment.patient_id,
            notificationContent: `You have an appointment coming up in 1 hour at ${formatTime(appointmentTime)}.`,
          })

          toast("You have an appointment in 1 hour")
          notifiedAppointments[today].push(`hour_${appointmentId}`)
        }
      })

      // Save updated notifications back to localStorage
      localStorage.setItem("notifiedAppointments", JSON.stringify(notifiedAppointments))
    }

    // Check immediately on component mount
    checkNotifications()

    // Set up interval to check every 15 minutes
    const notificationInterval = setInterval(checkNotifications, 15 * 60 * 1000) // 15 minutes in milliseconds

    // Clean up interval on component unmount
    return () => clearInterval(notificationInterval)
  }, [appointments])

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          {isLoading ? (
            <>
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                <p className="text-muted-foreground">Schedule and manage patient check-up appointments</p>
              </div>
              <Dialog open={isSelectPatientOpen} onOpenChange={setIsSelectPatientOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>New Appointment</span>
                  </Button>
                </DialogTrigger>

                <AnimatePresence>
                  {isSelectPatientOpen && (
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <DialogHeader>
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                          >
                            <DialogTitle className="text-2xl font-bold text-primary">Select Patient</DialogTitle>
                            <DialogDescription>
                              Search and select a patient to schedule an appointment.
                            </DialogDescription>
                          </motion.div>
                        </DialogHeader>

                        {/* Search input */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="relative mb-4"
                        >
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search patients by name or ID..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </motion.div>

                        {/* Patient list */}
                        <ScrollArea className="flex-1 pr-4" style={{ height: "300px" }}>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            className="flex flex-col gap-2 pb-4"
                          >
                            {isLoading ? (
                              // Skeleton loading state
                              Array.from({ length: 5 }).map((_, index) => (
                                <motion.div
                                  key={`skeleton-${index}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                                  className="p-4 border rounded-md"
                                >
                                  <div className="flex flex-col gap-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                  </div>
                                </motion.div>
                              ))
                            ) : filteredPatients.length > 0 ? (
                              filteredPatients.map((patient, index) => (
                                <motion.div
                                  key={`patient-${patient.patient_id}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                                  whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
                                  className="flex flex-row items-center justify-between p-4 border rounded-md hover:bg-muted cursor-pointer"
                                  onClick={() => handlePatientSelect(patient)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{`${patient.first_name} ${patient.middle_initial}. ${patient.last_name}`}</span>
                                    <span className="text-sm text-muted-foreground">{`Patient ID: ${patient.patient_id_provided}`}</span>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    Select
                                  </Button>
                                </motion.div>
                              ))
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center py-4 text-muted-foreground"
                              >
                                {searchQuery ? "No patients found matching your search" : "No patients available"}
                              </motion.div>
                            )}
                          </motion.div>
                        </ScrollArea>
                      </motion.div>
                    </DialogContent>
                  )}
                </AnimatePresence>
              </Dialog>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="w-full">
            <Skeleton className="h-10 w-full mb-6" />
            {renderCalendarSkeleton()}
          </div>
        ) : (
          <div>
            <Tabs defaultValue="calendar" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="today">Today&apos;s Appointments</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
              </TabsList>

                <TabsContent value="calendar" className="mt-6">
                  {isLoading ? (
                    renderCalendarSkeleton()
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-1">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle>Select Date</CardTitle>
                            <CardDescription className="text-sm">Choose a date for the appointment</CardDescription>
                          </CardHeader>
                          <CardContent className="p-2">
                            <div className="flex justify-center">
                              <CustomCalendar value={date} onChange={setDate} hasAppointments={hasAppointments} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>{formatDate(date, "MMMM d, yyyy")} - Appointments</CardTitle>
                            <CardDescription>
                              {getAppointmentsForDate(date).length} appointments scheduled
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {getAppointmentsForDate(date).length > 0 ? (
                              <div className="space-y-4">
                                {getAppointmentsForDate(date).map((appointment) => {
                                  const patient = getPatientById(appointment.patient_id)
                                  return (
                                    <div
                                      key={appointment.appointment_id}
                                      className="flex items-center justify-between p-4 border rounded-md"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                          <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            {patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient"}
                                          </p>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatTime(appointment.time_of_appointment)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-destructive hover:bg-destructive/10"
                                          onClick={() => handleCancelAppointment(appointment.appointment_id)}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                                <p className="text-muted-foreground">No appointments scheduled for this date</p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                              {selectedPatient ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-primary/10 text-primary">
                                    {selectedPatient.first_name} {selectedPatient.last_name}
                                  </Badge>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                "No patient selected"
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {appointmentTime ? formatTime(appointmentTime) : "Select time"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="grid gap-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium leading-none">Appointment Time</h4>
                                      <p className="text-sm text-muted-foreground">Set the time for this appointment</p>
                                    </div>
                                    <div className="grid gap-2">
                                      <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 10 }).flatMap((_, i) => {
                                            const hour = i + 8 // 8 AM to 5 PM (17:00)
                                            const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                                            const ampm = hour < 12 ? "AM" : "PM"
                                            const hourStr = hour.toString().padStart(2, "0") // 24-hour value
                                            return [
                                              <SelectItem key={`time-${hourStr}-00`} value={`${hourStr}:00`}>
                                                {`${hour12}:00 ${ampm}`}
                                              </SelectItem>,
                                              <SelectItem key={`time-${hourStr}-30`} value={`${hourStr}:30`}>
                                                {`${hour12}:30 ${ampm}`}
                                              </SelectItem>
                                            ]
                                          })}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <div>
                                <Button onClick={handleCreateAppointment} disabled={!selectedPatient || isSubmitting}>
                                  {isSubmitting ? (
                                    <>
                                      <span className="mr-2">
                                        <svg
                                          className="animate-spin h-4 w-4 text-white"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                      </span>
                                      Scheduling...
                                    </>
                                  ) : (
                                    "Schedule Appointment"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="today" className="mt-6">
                  {isLoading ? (
                    renderAppointmentListSkeleton()
                  ) : (
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Today&apos;s Appointments</CardTitle>
                          <CardDescription>
                            {formatDate(new Date(), "MMMM d, yyyy")} - {todaysAppointments.length} appointments
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {todaysAppointments.length > 0 ? (
                            <div className="space-y-4">
                              {todaysAppointments.map((appointment) => {
                                const patient = getPatientById(appointment.patient_id)
                                return (
                                  <div
                                    key={appointment.appointment_id}
                                    className="flex items-center justify-between p-4 border rounded-md"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="font-medium">
                                          {patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient"}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTime(appointment.time_of_appointment)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-green-600 hover:bg-green-50"
                                          onClick={() => handleCompleteAppointment(appointment.appointment_id)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Complete
                                        </Button>
                                      </div>
                                      <div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-destructive hover:bg-destructive/10"
                                          onClick={() => handleCancelAppointment(appointment.appointment_id)}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                              <p className="text-muted-foreground">No appointments scheduled for today</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6">
                  {isLoading ? (
                    renderAppointmentListSkeleton()
                  ) : (
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Upcoming Appointments</CardTitle>
                          <CardDescription>Next {upcomingAppointments.length} scheduled appointments</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {upcomingAppointments.length > 0 ? (
                            <div className="space-y-4">
                              {upcomingAppointments.map((appointment) => {
                                const patient = getPatientById(appointment.patient_id)
                                return (
                                  <div
                                    key={appointment.appointment_id}
                                    className="flex items-center justify-between p-4 border rounded-md"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="font-medium">
                                          {patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient"}
                                        </p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" />
                                            <span>
                                              {formatDate(new Date(appointment.date_of_appointment), "MMM d, yyyy")}
                                            </span>
                                          </div>
                                          <div className="hidden sm:block text-muted-foreground">•</div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatTime(appointment.time_of_appointment)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleCancelAppointment(appointment.appointment_id)}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                              <p className="text-muted-foreground">No upcoming appointments scheduled</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
