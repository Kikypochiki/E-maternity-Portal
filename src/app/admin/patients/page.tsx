"use client"
import { Plus, Grid, List } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { PatientAddForm } from "@/components/modals/patient_add_form."
import { useRouter } from "next/navigation"
import { DataTable } from "./data-table"
import { type Patient, columns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"
import { PatientGridView } from "@/components/modals/patient_grid_view"

export default function Patients() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<Patient[]>([])
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

      const { data: patients, error } = await supabase.from("Patients").select("*")

      if (error) {
        console.log(error)
        if (error.code === "PGRST301" || error.code === "401") {
          router.push("/auth_admin/login")
        }
        return
      }

      if (patients) {
        const formattedData = patients.map((patient) => ({
          ...patient,
          patient_id: patient.patient_id || "N/A",
          patient_id_provided: patient.patient_id_provided || "N/A",
          first_name: patient.first_name || "N/A",
          last_name: patient.last_name || "N/A",
          middle_initial: patient.middle_initial || "N/A",
          date_of_birth: patient.date_of_birth || "N/A",
          permanent_address: patient.permanent_address || "N/A",
          contact_number: patient.contact_number || "N/A",
          civil_status: patient.civil_status || "N/A",
          religion: patient.religion || "N/A",
          birthplace: patient.birthplace || "N/A",
          nationality: patient.nationality || "N/A",
          spouse_name: patient.spouse_name || "N/A",
          gravidty: patient.gravidty || 0,
          parity: patient.parity || 0,
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
      <div className="flex flex-row h-4 m-2">
        <div className="flex items-center">
          {loading ? (
                      <>
            <div>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
          </>
          ) : (
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
              <p className="text-muted-foreground">Manage patients and records</p>
            </div>
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
              <PatientAddForm
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
          <PatientGridView data={data} onPatientDeleted={fetchData} />
        )}
      </div>
    </div>
  )
}
