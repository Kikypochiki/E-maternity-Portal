"use client"
import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Generate a unique prenatal record ID

export type Patient = {
  patient_id: string
  patient_id_provided: string
  first_name: string
  last_name: string
  middle_initial?: string
}

interface PrenatalAddFormProps {
  trigger: React.ReactNode
  onPrenatalAdded?: () => void
}

// Define the prenatal form schema with Zod
const prenatalFormSchema = z.object({
  patient_id: z.string(),
  last_menstrual_period: z.date({
    required_error: "Last menstrual period is required.",
  }),
  estimated_date_of_confinement: z.date({
    required_error: "Estimated date of confinement is required.",
  }),
})

type PrenatalFormValues = z.infer<typeof prenatalFormSchema>

export function PrenatalAddForm({ trigger, onPrenatalAdded }: PrenatalAddFormProps) {
  const supabase = createClient()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isPrenatalFormOpen, setIsPrenatalFormOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with Zod resolver
  const form = useForm<PrenatalFormValues>({
    resolver: zodResolver(prenatalFormSchema),
    defaultValues: {
      patient_id: "",
      last_menstrual_period: undefined,
      estimated_date_of_confinement: undefined,
    },
  })

  // Fetch patients when dialog opens
  useEffect(() => {
    if (isSelectOpen) {
      fetchPatients()
    }
  }, [isSelectOpen])

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

  // Set patient_id in form when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      form.setValue("patient_id", selectedPatient.patient_id)
    }
  }, [selectedPatient, form])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)

      // First, get patients who already have prenatal records
      const { data: prenatalData, error: prenatalError } = await supabase.from("Prenatals").select("patient_id")

      if (prenatalError) {
        console.error("Error fetching prenatal patient IDs:", prenatalError)
        toast.error("Failed to fetch prenatal data")
        return
      }

      // Extract patient IDs that already have prenatal records
      const patientsWithPrenatals = new Set(prenatalData?.map((record) => record.patient_id) || [])

      // Fetch all patients
      const { data: patientData, error } = await supabase.from("Patients").select("*")

      if (error) {
        console.error("Error fetching patients:", error)
        toast.error("Failed to fetch patients")
        return
      }

      if (patientData) {
        // Filter out patients who already have prenatal records
        const filteredPatients = patientData.filter((patient) => !patientsWithPrenatals.has(patient.patient_id))

        const formattedData = filteredPatients.map((patient) => ({
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
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsSelectOpen(false)
    setIsPrenatalFormOpen(true)
  }

  // Format date to YYYY-MM-DD for input type="date"
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ""

    const year = date.getFullYear()
    // Month is 0-indexed in JavaScript, so add 1 and pad with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // Parse date from input type="date" format (YYYY-MM-DD)
  const parseDateFromInput = (dateString: string): Date => {
    return new Date(dateString)
  }

  const onSubmit = async (data: PrenatalFormValues) => {
    try {
      setIsSubmitting(true)

      // Format dates for database (YYYY-MM-DD)
      const lmpFormatted = formatDateForInput(data.last_menstrual_period)
      const eddFormatted = formatDateForInput(data.estimated_date_of_confinement)

      // Insert prenatal data into Prenatals table
      const { error } = await supabase.from("Prenatals").insert([
        {
          patient_id: data.patient_id,
          last_menstrual_period: lmpFormatted,
          estimated_date_of_confinement: eddFormatted,
        },
      ])

      if (error) {
        console.error("Error submitting prenatal record:", error)
        toast.error("Failed to add prenatal record")
        return
      }

      toast.success("Prenatal record added successfully!")

      // Close dialog and reset form on successful submission
      setIsPrenatalFormOpen(false)
      setSelectedPatient(null)
      form.reset({
        ...form.getValues(),
      })

      if (onPrenatalAdded) {
        onPrenatalAdded()
      }
    } catch (error) {
      console.error("Error in prenatal submission:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <div onClick={() => setIsSelectOpen(true)}>{trigger}</div>

      {/* Patient selection dialog */}
      <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Select Patient</DialogTitle>
            <DialogDescription>Search and select a patient for prenatal care.</DialogDescription>
          </DialogHeader>

          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Patient list */}
          <div
            className="flex flex-col gap-2 overflow-y-auto flex-grow mt-2 pr-1"
            style={{ maxHeight: "calc(100% - 150px)" }}
          >
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient.patient_id}
                  className="flex flex-row items-center justify-between p-4 border rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{`${patient.first_name} ${patient.middle_initial} ${patient.last_name}`}</span>
                    <span className="text-sm text-muted-foreground">{`Patient ID: ${patient.patient_id_provided}`}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Select
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? "No patients found matching your search" : "No patients available"}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsSelectOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prenatal form dialog */}
      <Dialog open={isPrenatalFormOpen} onOpenChange={setIsPrenatalFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Prenatal Care Form</DialogTitle>
            <DialogDescription>
              {selectedPatient &&
                `Complete prenatal details for ${selectedPatient.first_name} ${selectedPatient.last_name}`}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {selectedPatient && (
                <div className="bg-muted p-3 rounded-md mb-4">
                  <p className="font-medium">{`${selectedPatient.first_name} ${selectedPatient.middle_initial} ${selectedPatient.last_name}`}</p>
                  <p className="text-sm text-muted-foreground">{`Patient ID: ${selectedPatient.patient_id_provided}`}</p>
                </div>
              )}

              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4 pr-4">
                  <FormField
                    control={form.control}
                    name="last_menstrual_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Menstrual Period</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            onChange={(e) => {
                              if (e.target.value) {
                                field.onChange(parseDateFromInput(e.target.value))
                              }
                            }}
                            value={field.value ? formatDateForInput(field.value) : ""}
                            max={formatDateForInput(new Date())} // Prevent future dates
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_date_of_confinement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Date of Confinement (EDD)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            onChange={(e) => {
                              if (e.target.value) {
                                field.onChange(parseDateFromInput(e.target.value))
                              }
                            }}
                            value={field.value ? formatDateForInput(field.value) : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-6 pb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsPrenatalFormOpen(false)
                        setSelectedPatient(null)
                        form.reset()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="mr-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </span>
                          Processing...
                        </>
                      ) : (
                        "Save Prenatal Record"
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
