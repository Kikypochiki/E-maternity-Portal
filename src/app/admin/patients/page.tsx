"use client"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { PatientAddForm } from "@/components/modals/patient_add_form."
import { useRouter } from "next/navigation"
import { DataTable } from "./data-table"
import { type Patient, columns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"

export default function Patients() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<Patient[]>([])
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
          patient_id_provided: patient.patient_id_provided || "N/A",
          first_name: patient.first_name || "N/A",
          last_name: patient.last_name || "N/A",
          contact_number: patient.contact_number || "N/A",
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
            <Skeleton className="w-[100px] h-[20px] rounded-full" />
          ) : (
            <h1 className="sm:text-2xl text-xl m-2">Patients</h1>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {loading ? (
            <Skeleton className="w-[120px] h-[40px] rounded-md" />
          ) : (
            <PatientAddForm
              trigger={
                <Button>
                  Add Patient
                  <Plus className="ml-2" size={16} />
                </Button>
              }
              onPatientAdded={fetchData}
            />
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
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </div>
  )
}
