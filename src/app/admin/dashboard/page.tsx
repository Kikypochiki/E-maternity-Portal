"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BedDouble,
  UserCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Activity,
  User,
  FileText,
} from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const router = useRouter()
  const [totalPatients, setTotalPatients] = useState<number | null>(null)
  const [totalAdmitted, setTotalAdmitted] = useState<number | null>(null)
  const [totalDischarged, setTotalDischarged] = useState<number | null>(null)
  interface Patient {
    patient_id: string
    first_name: string
    last_name: string
    date_of_birth: string
    created_at: string
  }

  interface Admission {
    admission_id: string
    patient_id: string
    created_at: string
    admission_type: string
    Patients?: {
      first_name: string
      last_name: string
    }
  }

  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [recentAdmissions, setRecentAdmissions] = useState<Admission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Initialize Supabase client
  const supabase = createClient()

  const fetchDashboardData = async () => {
    try {
      // Fetch total patients count
      const { count: patientsCount, error: patientsError } = await supabase
        .from("Patients")
        .select("*", { count: "exact", head: true })

      if (patientsError) throw patientsError

      // Fetch total admitted patients count
      const { count: admittedCount, error: admittedError } = await supabase
        .from("Admissions")
        .select("*", { count: "exact", head: true })

      if (admittedError) throw admittedError

      // Fetch total discharged patients count
      const { count: dischargedCount, error: dischargedError } = await supabase
        .from("AdmissionsHistory")
        .select("*", { count: "exact", head: true })

      if (dischargedError) throw dischargedError

      // Fetch recent patients
      const { data: recentPatientsData, error: recentPatientsError } = await supabase
        .from("Patients")
        .select("patient_id, first_name, last_name, date_of_birth, created_at")
        .order("created_at", { ascending: false })
        .limit(4)

      if (recentPatientsError) throw recentPatientsError

      // Fetch recent admissions
      const { data: recentAdmissionsData, error: recentAdmissionsError } = await supabase
        .from("Admissions")
        .select("admission_id, patient_id, admission_type, created_at, Patients:patient_id(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(4)

      if (recentAdmissionsError) throw recentAdmissionsError

      // Fetch admission data for chart (last 7 days)
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toISOString().split("T")[0] // Format as YYYY-MM-DD
      })

      // Create a map to store counts by date
      const admissionsByDate: Record<string, number> = {}
      const dischargesByDate: Record<string, number> = {}

      // Initialize with zeros for all dates
      last7Days.forEach((date) => {
        admissionsByDate[date] = 0
        dischargesByDate[date] = 0
      })

      // Fetch admissions for last 7 days
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 6)
      const startDateStr = startDate.toISOString().split("T")[0]

      const { data: admissionsData, error: admissionsChartError } = await supabase
        .from("Admissions")
        .select("created_at")
        .gte("created_at", startDateStr)

      if (admissionsChartError) throw admissionsChartError

      // Count admissions by date
      admissionsData?.forEach((admission) => {
        const date = new Date(admission.created_at).toISOString().split("T")[0]
        if (admissionsByDate[date] !== undefined) {
          admissionsByDate[date]++
        }
      })

      // Fetch discharges for last 7 days
      const { data: dischargesData, error: dischargesChartError } = await supabase
        .from("AdmissionsHistory")
        .select("discharge_datetime")
        .gte("discharge_datetime", startDateStr)

      if (dischargesChartError) throw dischargesChartError

      // Count discharges by date
      dischargesData?.forEach((discharge) => {
        const date = new Date(discharge.discharge_datetime).toISOString().split("T")[0]
        if (dischargesByDate[date] !== undefined) {
          dischargesByDate[date]++
        }
      })

      // Format data for chart

      // Fetch patient types data
      const { data: patientTypesData, error: patientTypesError } = await supabase
        .from("Admissions")
        .select("admission_type")

      if (patientTypesError) throw patientTypesError

      // Count patients by type
      const typeCount: Record<string, number> = {}
      patientTypesData?.forEach((patient) => {
        const type = patient.admission_type || "Unknown"
        typeCount[type] = (typeCount[type] || 0) + 1
      })

      // Format data for chart

      setTotalPatients(patientsCount)
      setTotalAdmitted(admittedCount)
      setTotalDischarged(dischargedCount)
      setRecentPatients(recentPatientsData || [])
      setRecentAdmissions(
        (recentAdmissionsData || []).map((admission) => ({
          ...admission,
          Patients: Array.isArray(admission.Patients) ? admission.Patients[0] : admission.Patients,
        })),
      )
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
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
        fetchDashboardData()
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
  }, [router])

  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth)
      if (isNaN(birthDate.getTime())) return "N/A"

      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      return age
    } catch {
      return "N/A"
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  }

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: 0.1,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-slate-50">
        <main className="flex-1 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Statistics Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Hospital Statistics Skeleton */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-slate-50">
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview - {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <motion.div className="grid gap-6 md:grid-cols-3 mb-6" initial="hidden" animate="visible" variants={fadeIn}>
          <motion.div variants={slideUp} custom={0}>
            <Card className="overflow-hidden border-black/10 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : totalPatients}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">Active patients in the system</span> 
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} custom={1}>
            <Card className="overflow-hidden border-black/10 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Currently Admitted</CardTitle>
                <div className="p-2 bg-amber-100 rounded-full text-amber-700">
                  <BedDouble className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : totalAdmitted}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <Clock className="mr-1 h-3 w-3 text-amber-600" />
                  <span className="text-amber-600 font-medium">Current patients under care</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} custom={2}>
            <Card className="overflow-hidden border-black/10 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Discharged</CardTitle>
                <div className="p-2 bg-green-100 rounded-full text-green-700">
                  <UserCheck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : totalDischarged}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <ArrowDownRight className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">Completed patient treatments</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="grid gap-6 md:grid-cols-2" initial="hidden" animate="visible" variants={fadeIn}>
          <motion.div variants={slideUp} custom={5}>
            <Card className="border-black/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Patients</CardTitle>
                <CardDescription>Newly registered patients in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {recentPatients.length > 0 ? (
                  <div className="space-y-4">
                    {recentPatients.map((patient) => (
                      <div key={patient.patient_id} className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Age: {calculateAge(patient.date_of_birth)} • Added:{" "}
                            {new Date(patient.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>  
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No recent patients found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} custom={6}>
            <Card className="border-black/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Admissions</CardTitle>
                <CardDescription>Latest patient admissions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAdmissions.length > 0 ? (
                  <div className="space-y-4">
                    {recentAdmissions.map((admission) => (
                      <div key={admission.admission_id} className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700">
                          <BedDouble className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {admission.Patients?.first_name} {admission.Patients?.last_name}
                            </p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {admission.admission_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Admitted:{" "}
                            {new Date(admission.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BedDouble className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No recent admissions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Hospital Statistics */}
        <motion.div variants={slideUp} custom={7} className="mt-6">
          <Card className="border-black/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
              <CardDescription>Key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500">Occupancy Rate</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : totalAdmitted && totalPatients ? (
                        `${Math.round((totalAdmitted / totalPatients) * 100)}%`
                      ) : (
                        "0%"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500">Discharge Rate</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : totalDischarged && totalPatients ? (
                        `${Math.round((totalDischarged / totalPatients) * 100)}%`
                      ) : (
                        "0%"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500">System Status</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                    <span className="text-sm font-medium">Operational</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
