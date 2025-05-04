"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Grid, List } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useRouter } from "next/navigation"
import { DataTable } from "./data-table"
import { type Admission, columns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"
import { AdmissionGridView } from "@/components/modals/admission_grid_view"
import SelectPatientToAdmissionForm from "@/components/modals/select_patient_to_admission_form"

export default function Admissions() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<"table" | "grid">("table")

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
      const { data: admissions, error } = await supabase.from("Admissions").select(`
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

      if (admissions) {
        const formattedData = admissions.map((admission) => ({
          ...admission,
          first_name: admission.Patients?.first_name || "N/A",
          last_name: admission.Patients?.last_name || "N/A",
          admission_id: admission.admission_id || "N/A",
          admission_status: admission.admission_status || "N/A",
          admission_type: admission.admission_type || "N/A",
          created_at: admission.created_at || "N/A",
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
    <div className="flex flex-col container w-full mx-auto pt-5">
      <div className="flex flex-row items-center justify-between m-2">
        <div className="flex items-center">
          {loading ? (
            <Skeleton className="w-[150px] h-[28px] rounded-full" />
          ) : (
            <h2 className="text-3xl font-bold tracking-tight">Admissions</h2>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {loading ? (
            <Skeleton className="w-[120px] h-[40px] rounded-md" />
          ) : (
            <>
              <div className="flex items-center space-x-2 border rounded-md p-1">
                <Toggle
                  pressed={viewType === "table"}
                  onPressedChange={() => setViewType("table")}
                  aria-label="Toggle table view"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white"
                >
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                  pressed={viewType === "grid"}
                  onPressedChange={() => setViewType("grid")}
                  aria-label="Toggle grid view"
                  className="data-[state=on]:bg-primary data-[state=on]:text-white"
                >
                  <Grid className="h-4 w-4" />
                </Toggle>
              </div>
              <SelectPatientToAdmissionForm
                trigger={
                  <Button>
                    Add Patient
                    <Plus className="ml-2" size={16} />
                  </Button>
                }
                onPatientAdded={fetchData}
              />
            </>
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
        ) : viewType === "table" ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <AdmissionGridView data={data} onAdmissionDeleted={fetchData} />
        )}
      </div>
    </div>
  )
}
