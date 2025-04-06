"use client"
import { Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import PatientCard from "@/components/patient_card"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { PatientAddForm } from "@/components/modals/patient_add_form."
import PatientBasicInfoView from "@/components/modals/patient_basic_info_view"
import { useSearchParams } from "next/navigation"

interface Patient {
  patient_first_name: string
  patient_last_name: string
  patient_id: string
  patient_date_of_birth: string
  patient_address: string
  patient_phone_number: string
  patient_email: string
  patient_gender: string
  patient_emergency_contact: string
  patient_emergency_contact_name: string
  patient_emergency_contact_phone: string
  patient_bloodtype: string
  patient_medical_history: string
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("query") || ""


  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data: patients, error } = await supabase.from("patient_basic_info").select("*")
      if (patients) {
        setPatients(patients)
      }
      if (error) {
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter patients based on search query
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
    fetchData()
  }, [])
  return (
    <div className="flex flex-col container w-full mx-auto pt-5">
      <div className="flex flex-row h-4 m-5">
        <div className="flex items-center">
          <h1 className="text-zinc-300 sm:text-2xl text-xl m-2">
            Patient Dashboard
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end text-white">
          <PatientAddForm
            trigger={
              <Button className="m-3 sm:text-sm text-xs w-25 sm:w-30 h-8 bg-background border border-color-border rounded-lg hover:bg-zinc-700 active:bg-zinc-900 flex items-center justify-center gap-2">
          Add Patient
          <Plus size={16} />
              </Button>
            }
            onPatientAdded={fetchData}
          />
        </div>
      </div>
      <div className="m-5 flex-col bg-background rounded-lg border border-zinc-800 shadow-lg">
      <div className="flex flex-col h-15 border-b border-zinc-800 rounded-t-lg bg-color-primary bg-primary justify-center w-full sm:w-full p-5">
      <div className="flex flex-row items-center text-left">
        <h1 className="sm:text-lg sm:text-md w-full">
          Patient
        </h1>
        <h1 className="sm:text-lg sm:text-md w-full">
          Id
        </h1>
        <h1 className="sm:text-lg sm:text-md w-full">
          Id
        </h1>
        </div>
      </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
        <p className="text-zinc-400">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex justify-center items-center h-40">
        {searchQuery ? (
          <div className="text-center">
            <p className="text-zinc-400">No patients found matching "{searchQuery}"</p>
            <p className="text-zinc-500 text-sm mt-2">Try a different search term</p>
          </div>
        ) : (
          <p className="text-zinc-400">No patients found. Add a patient to get started.</p>
        )}
          </div>
        ) : (
        <ScrollArea className="h-[530px] w-full">
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
