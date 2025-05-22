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
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

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

export default function SelectPatientToAdmissionForm({ trigger, onPatientAdded }: SelectPatientToAdmissionFormProps) {
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
      <AnimatePresence>
        {isSelectOpen && (
          <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
            <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <DialogHeader>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DialogTitle className="text-2xl font-bold text-primary">Select Patient</DialogTitle>
                    <DialogDescription>Search and select a patient to admit to the hospital.</DialogDescription>
                  </motion.div>
                </DialogHeader>

                {/* Search input */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex flex-col gap-2 overflow-y-auto flex-grow mt-2 pr-1"
                  style={{ maxHeight: "calc(100% - 150px)" }}
                >
                  {isLoading ? (
                    // Skeleton loading state
                    Array.from({ length: 5 }).map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
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
                        key={patient.patient_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
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
                      transition={{ delay: 0.2 }}
                      className="text-center py-4 text-muted-foreground"
                    >
                      {searchQuery ? "No patients found matching your search" : "No patients available"}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Admission form dialog */}
      <AnimatePresence>
        {isAdmissionOpen && (
          <Dialog open={isAdmissionOpen} onOpenChange={setIsAdmissionOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <DialogTitle className="text-2xl font-bold text-primary">Patient Admission Form</DialogTitle>
                    <DialogDescription>
                      {selectedPatient &&
                        `Complete admission details for ${selectedPatient.first_name} ${selectedPatient.last_name}`}
                    </DialogDescription>
                  </motion.div>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {selectedPatient && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-muted p-3 rounded-md mb-4"
                      >
                        <p className="font-medium">{`${selectedPatient.first_name} ${selectedPatient.middle_initial} ${selectedPatient.last_name}`}</p>
                        <p className="text-sm text-muted-foreground">{`Patient ID: ${selectedPatient.patient_id_provided}`}</p>
                      </motion.div>
                    )}

                    <ScrollArea className="h-[60vh] pr-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="space-y-4 pr-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <FormField
                            control={form.control}
                            name="admission_type"
                            render={({ field }) => (
                              <FormItem className="space-y-1 transition-all duration-200">
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
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <FormField
                            control={form.control}
                            name="referring_personnel"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Referring Personnel</FormLabel>
                                <FormControl>
                                  <Input {...field} className="border-input/50 focus:border-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <FormField
                            control={form.control}
                            name="service_classification"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Service Classification</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-input/50 focus:border-primary">
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
                        </motion.div>

                        <AnimatePresence>
                          {serviceClassification === "PHIC" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FormField
                                control={form.control}
                                name="phic_number"
                                render={({ field }) => (
                                  <FormItem className="transition-all duration-200">
                                    <FormLabel>PHIC Number</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="border-input/50 focus:border-primary" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <FormField
                            control={form.control}
                            name="informant_name"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Informant Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="border-input/50 focus:border-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="informant_relation_to_patient"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Relation to Patient</FormLabel>
                                <FormControl>
                                  <Input {...field} className="border-input/50 focus:border-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <FormField
                            control={form.control}
                            name="informant_address"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Informant Address</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="border-input/50 focus:border-primary min-h-[80px]" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <FormField
                            control={form.control}
                            name="admitting_diagnosis"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Admitting Diagnosis</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="border-input/50 focus:border-primary min-h-[80px]" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="admitting_diagnosis_icd_code"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Diagnosis ICD Code</FormLabel>
                                <FormControl>
                                  <Input {...field} className="border-input/50 focus:border-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <FormField
                            control={form.control}
                            name="attending_clinic_staff"
                            render={({ field }) => (
                              <FormItem className="transition-all duration-200">
                                <FormLabel>Attending Clinic Staff</FormLabel>
                                <FormControl>
                                  <Input {...field} className="border-input/50 focus:border-primary" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.65 }}
                          className="flex justify-end gap-2 pt-6 pb-4"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAdmissionOpen(false)
                              setSelectedPatient(null)
                              form.reset()
                            }}
                            className="transition-all duration-200"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 transition-all duration-200"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Complete Admission"
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </ScrollArea>
                  </form>
                </Form>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
