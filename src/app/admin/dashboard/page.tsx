"use client"
import { Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import PatientCard from "@/components/patient_card"
import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { PatientAddForm } from "@/components/modals/patient_add_form."
import PatientBasicInfoView from "@/components/modals/patient_basic_info_view"
import { useSearchParams, useRouter } from "next/navigation"

interface Patient {
  patient_id: string
  patient_first_name: string
  patient_last_name: string
  patient_date_of_birth: string
  patient_address: string
  patient_phone_number: string
  patient_email: string
  patient_emergency_contact_name: string
  patient_emergency_contact_phone: string
  patient_bloodtype: string
  patient_medical_history: string
  patient_status: string
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("query") || ""
  const router = useRouter()

  const supabase = createClient()

  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("No active session, redirecting to login")
        router.push("/auth_admin/login")
        return
      }

      const { data: patients, error } = await supabase.from("patient_basic_info").select("*")
      if (patients) {
        setPatients(patients)
      }
      if (error) {
        console.log(error)

        if (error.code === "PGRST301" || error.code === "401") {
          router.push("/auth_admin/login")
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!searchQuery) {
      setFilteredPatients(patients)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = patients.filter(
      (patient) =>
        patient.patient_first_name.toLowerCase().includes(query) ||
        patient.patient_last_name.toLowerCase().includes(query) ||
        patient.patient_id.toLowerCase().includes(query) ||
        patient.patient_email.toLowerCase().includes(query) ||
        patient.patient_phone_number.includes(query),
    )

    setFilteredPatients(filtered)
  }, [searchQuery, patients])

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
      <div className="flex flex-row h-4 m-5">
        <div className="flex items-center">
          <h1 className="sm:text-2xl text-xl m-2">Patient Dashboard</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <PatientAddForm
            trigger={
              <Button>
                Add Patient
                <Plus size={16} />
              </Button>
            }
            onPatientAdded={fetchData}
          />
        </div>
      </div>
      <div className="m-5 flex-col rounded-lg border shadow-lg">
        <div className="bg-accent flex flex-col h-15 border-b rounded-t-lg justify-center w-full sm:w-full p-5">
          <div className="flex flex-row items-center text-left">
            <h1 className="sm:text-lg sm:text-md w-full font-bold">Patient</h1>
            <h1 className="sm:text-lg sm:text-md w-full font-bold">ID</h1>
            <h1 className="sm:text-lg sm:text-md w-full font-bold">Status</h1>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            {searchQuery ? (
              <div className="text-center">
                <p>No patients found matching "{searchQuery}"</p>
                <p className=" text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <p>No patients found. Add a patient to get started.</p>
            )}
          </div>
        ) : (
          <ScrollArea className="w-full">
            {filteredPatients.map((patient) => (
              <div key={patient.patient_id}>
                <PatientBasicInfoView
                  trigger={<PatientCard patient={patient} />}
                  patient={patient}
                  onFetchData={fetchData}
                />
              </div>
            ))}
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
