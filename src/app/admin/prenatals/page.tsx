"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus} from "lucide-react"
import { useRouter } from "next/navigation"
import { DataTable } from "./data-table"
import { type Prenatal, columns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrenatalAddForm } from "@/components/modals/prenatal-add-form"
import { Calendar, User } from "lucide-react"
import NotifyPatient from "@/components/modals/notify-patient"

// Utility function to format a date string as "MM/DD/YYYY"
function formatDate(dateString: string) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid date"
  return date.toLocaleDateString()
}

export default function Admissions() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<Prenatal[]>([])
  const [loading, setLoading] = useState(true)
  const [] = useState<"table" | "grid">("table")

  // Notify patients 1 week before their estimated due date
  const notifyPatientsDueSoon = async () => {
    const today = new Date()
    const oneWeekFromNow = new Date()
    oneWeekFromNow.setDate(today.getDate() + 7)

    for (const prenatal of data) {
      if (!prenatal.estimated_date_of_confinement || !prenatal.patient_id) continue

      const edd = new Date(prenatal.estimated_date_of_confinement)
      // Check if EDD is exactly 7 days from today (ignoring time)
      const diffDays = Math.ceil((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 7) {
        await NotifyPatient({
          patient_id: prenatal.patient_id,
          notificationContent: `Your estimated due date is in one week (${formatDate(prenatal.estimated_date_of_confinement)}). Please prepare accordingly and contact your healthcare provider if you have any concerns.`,
        })
      }
    }
  }

  useEffect(() => {
    if (!loading && data.length > 0) {
      notifyPatientsDueSoon()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data])

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

      // Join query to get both admission data and patient names
      const { data: prenatals, error } = await supabase.from("Prenatals").select(`
          *,
          Patients(first_name, last_name)
        `)

      if (error) {
        console.log(error)
        if (error.code === "PGRST301" || error.code === "401") {
          router.push("/auth_admin/login")
        }
        return
      }

      if (prenatals) {
        const formattedData = prenatals.map((prenatal) => ({
          ...prenatal,
          first_name: prenatal.Patients?.first_name || "N/A",
          last_name: prenatal.Patients?.last_name || "N/A",
          last_menstrual_period: prenatal.last_menstrual_period || "N/A",
          estimated_date_of_confinement: prenatal.estimated_date_of_confinement || "N/A",
          created_at: prenatal.created_at || "N/A",
        }))
        setData(formattedData)
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

return (
  <div className="container mx-auto py-6">
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        {loading ? (
          <>
            <div>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prenatal Checkups</h1>
              <p className="text-muted-foreground">Manage prenatal checkups and records</p>
            </div>
            <PrenatalAddForm
              trigger={
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>New Prenatal Checkup</span>
                </Button>
              }
              onPrenatalAdded={fetchData}
            />
          </>
        )}
      </div>

      {loading ? (
        <div className="w-full">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-[600px] w-full rounded-md" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All </TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Prenatal Records</CardTitle>
                <CardDescription>
                  Showing all prenatal checkup records. Click on a record to view more details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <DataTable columns={columns} data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Prenatal Checkups</CardTitle>
                <CardDescription>Most recent prenatal checkups performed in the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {data.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-2">
                      {data
                        .filter((prenatal) => {
                          const checkupDate = new Date(prenatal.created_at)
                          const thirtyDaysAgo = new Date()
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                          return checkupDate >= thirtyDaysAgo
                        })
                        .slice(0, 5)
                        .map((prenatal) => (
                          <div
                            key={prenatal.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {prenatal.first_name} {prenatal.last_name}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>EDD: {formatDate(prenatal.estimated_date_of_confinement)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(prenatal.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No recent prenatal checkups found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  </div>
)
}
