"use client"
import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {toast} from "sonner"

const generateAdmissionId = () => {
  const prefix = "AD-"
  const randomNum = Math.floor(Math.random() * 1000000000)
  return `${prefix}${randomNum.toString().padStart(6, "0")}`
}

export type Patient = {
  patient_id: string
  patient_id_provided: string
  first_name: string
  last_name: string
  middle_initial?: string
  admission_status?: string
}

interface SelectPatientToAdmissionFormProps {
  trigger: React.ReactNode
  onPatientAdded?: () => void // Add this property to the interface
}

// Define the admission form schema with Zod
const admissionFormSchema = z.object({
  patient_id: z.string(),
  admission_id: z.string(), // Added admission_id to the schema
  admission_type: z.enum(["new", "old"]),
  referring_personnel: z.string().optional(),
  service_classification: z.enum(["PHIC", "NON PHIC"]),
  phic_number: z
    .string()
    .optional()
    .refine(
      () => {
        // If service_classification is PHIC, phic_number is required
        return true
      },
      {
        message: "PHIC number is required for PHIC patients",
      },
    ),
  informant_name: z.string().min(1, "Informant name is required"),
  informant_relation_to_patient: z.string().min(1, "Relation to patient is required"),
  informant_address: z.string().min(1, "Informant address is required"),
  admitting_diagnosis: z.string().min(1, "Admitting diagnosis is required"),
  admitting_diagnosis_icd_code: z.string().min(1, "ICD code is required"),
  attending_clinic_staff: z.string().min(1, "Attending clinic staff is required"),
  admission_status: z.enum(["admitted", "discharged"]),
})

type AdmissionFormValues = z.infer<typeof admissionFormSchema>

export default function SelectPatientToAdmissionForm({ trigger, onPatientAdded}: SelectPatientToAdmissionFormProps) {
  const supabase = createClient()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with Zod resolver
  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      patient_id: "",
      admission_type: "new",
      service_classification: "NON PHIC",
      referring_personnel: "",
      phic_number: "",
      informant_name: "",
      informant_relation_to_patient: "",
      informant_address: "",
      admitting_diagnosis: "",
      admitting_diagnosis_icd_code: "",
      attending_clinic_staff: "",
      admission_status: "admitted",
      admission_id: generateAdmissionId(),
    },
  })

  // Watch service_classification to conditionally render PHIC number field
  const serviceClassification = form.watch("service_classification")

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
      const { data: patientData, error } = await supabase.from("Patients").select("*")
      if (error) {
        console.log(error)
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
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsSelectOpen(false)
    setIsAdmissionOpen(true)
  }

  const onSubmit = async (data: AdmissionFormValues) => {
    try {
      setIsSubmitting(true)

      // Generate a new admission ID for each submission
      const admissionId = generateAdmissionId()

      // Insert admission data into Admissions table
      const { error } = await supabase.from("Admissions").insert([
        {
          patient_id: data.patient_id,
          admission_type: data.admission_type,
          referring_personnel: data.referring_personnel,
          service_classification: data.service_classification,
          phic_number: data.service_classification === "PHIC" ? data.phic_number : null,
          informant_name: data.informant_name,
          informant_relation_to_patient: data.informant_relation_to_patient,
          informant_address: data.informant_address,
          admitting_diagnosis: data.admitting_diagnosis,
          admitting_diagnosis_icd_code: data.admitting_diagnosis_icd_code,
          attending_clinic_staff: data.attending_clinic_staff,
          admission_status: "Admitted",
          admission_id: admissionId, // Use the generated ID
        },
      ])

      if (error) {
        toast(`Error submitting admission`)
        return
      }

      // Show success toast
      toast("Admission submitted successfully!")

      // Close dialog and reset form on successful submission
      setIsAdmissionOpen(false)
      setSelectedPatient(null)
      form.reset({
        ...form.getValues(),
        admission_id: generateAdmissionId(), // Reset with a new ID for next use
      })
      if (onPatientAdded) {
        onPatientAdded()
      }
    } catch (error) {
      console.error("Error in admission submission:", error)
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
            <DialogDescription>Search and select a patient to admit to the hospital.</DialogDescription>
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

      {/* Admission form dialog */}
      <Dialog open={isAdmissionOpen} onOpenChange={setIsAdmissionOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Patient Admission Form</DialogTitle>
            <DialogDescription>
              {selectedPatient &&
                `Complete admission details for ${selectedPatient.first_name} ${selectedPatient.last_name}`}
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
                    name="admission_type"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Admission Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="new" id="new" />
                              <Label htmlFor="new">New</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="old" id="old" />
                              <Label htmlFor="old">Old</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referring_personnel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referring Personnel</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service_classification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Classification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service classification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PHIC">PHIC</SelectItem>
                            <SelectItem value="NON PHIC">NON PHIC</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serviceClassification === "PHIC" && (
                    <FormField
                      control={form.control}
                      name="phic_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PHIC Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="informant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informant Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="informant_relation_to_patient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relation to Patient</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="informant_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informant Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="admitting_diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admitting Diagnosis</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="admitting_diagnosis_icd_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis ICD Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="attending_clinic_staff"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attending Clinic Staff</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        setIsAdmissionOpen(false)
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
                          Processing...
                        </>
                      ) : (
                        "Complete Admission"
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
