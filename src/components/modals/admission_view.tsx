"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Heart,
  Globe,
  Home,
  BookOpen,
  Users,
  ClipboardList,
  Activity,
  UserCheck,
  FileText,
  Stethoscope,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Patient {
  patient_id: string
  patient_id_provided: string
  first_name: string
  last_name: string
  middle_initial?: string
  date_of_birth: string
  permanent_address?: string
  contact_number?: string
  civil_status?: string
  religion?: string
  birthplace?: string
  nationality?: string
  spouse_name?: string
  gravidity?: number
  parity?: number
  occupation?: string
}

interface Admission {
  admission_id: string
  admission_status: string
  first_name: string
  last_name: string
  admission_type?: string
  referring_personnel?: string
  service_classification?: string
  phic_number?: string
  informant_name?: string
  informant_relation_to_patient?: string
  informant_address?: string
  admitting_diagnosis?: string
  admitting_diagnosis_icd_code?: string
  attending_clinic_staff?: string
  patient_id?: string
  final_diagnosis?: string
  final_diagnosis_icd_code?: string
  discharge_datetime?: string
  length_of_stay_hours?: number
  result_status?: string
  result_condition?: string
  created_at?: string
}

interface AdmissionsViewProps {
  trigger: React.ReactNode
  patientId: string
  admission: Admission
  onEdit?: () => void
}

const supabase = createClient()

export function AdmissionView({ trigger, patientId, admission, onEdit }: AdmissionsViewProps) {
  const [activeTab, setActiveTab] = useState("patient")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingPatient, setIsFetchingPatient] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [patientData, setPatientData] = useState<Patient>({
    patient_id: "",
    patient_id_provided: "",
    first_name: "",
    last_name: "",
    middle_initial: "",
    date_of_birth: "",
    permanent_address: "",
    contact_number: "",
    civil_status: "",
    religion: "",
    birthplace: "",
    nationality: "",
    spouse_name: "",
    gravidity: 0,
    parity: 0,
    occupation: "",
  })

  const [admissionData, setAdmissionData] = useState<Admission>({
    admission_id: admission?.admission_id || "",
    admission_status: admission?.admission_status || "",
    first_name: admission?.first_name || "",
    last_name: admission?.last_name || "",
    admission_type: admission?.admission_type || "",
    referring_personnel: admission?.referring_personnel || "",
    service_classification: admission?.service_classification || "",
    phic_number: admission?.phic_number || "",
    informant_name: admission?.informant_name || "",
    informant_relation_to_patient: admission?.informant_relation_to_patient || "",
    informant_address: admission?.informant_address || "",
    admitting_diagnosis: admission?.admitting_diagnosis || "",
    admitting_diagnosis_icd_code: admission?.admitting_diagnosis_icd_code || "",
    attending_clinic_staff: admission?.attending_clinic_staff || "",
    patient_id: admission?.patient_id || patientId || "",
    final_diagnosis: admission?.final_diagnosis || "",
    final_diagnosis_icd_code: admission?.final_diagnosis_icd_code || "",
    discharge_datetime: admission?.discharge_datetime || "",
    length_of_stay_hours: admission?.length_of_stay_hours || 0,
    result_status: admission?.result_status || "",
    result_condition: admission?.result_condition || "",
    created_at: admission?.created_at || "",
  })

  // Fetch patient data when component mounts or patientId changes
  useEffect(() => {
    const fetchPatient = async () => {
      setIsFetchingPatient(true)
      setFetchError(null)

      try {
        const { data, error } = await supabase.from("Patients").select("*").eq("patient_id", patientId).single()

        if (error) {
          console.error("Error fetching patient:", error)
          setFetchError("Failed to load patient data. Please try again.")
          return
        }

        if (data) {
          setPatientData({
            patient_id: data.patient_id || "",
            patient_id_provided: data.patient_id_provided || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            middle_initial: data.middle_initial || "",
            date_of_birth: data.date_of_birth || "",
            permanent_address: data.permanent_address || "",
            contact_number: data.contact_number || "",
            civil_status: data.civil_status || "",
            religion: data.religion || "",
            birthplace: data.birthplace || "",
            nationality: data.nationality || "",
            spouse_name: data.spouse_name || "",
            gravidity: data.gravidity || 0,
            parity: data.parity || 0,
            occupation: data.occupation || "",
          })
        } else {
          setFetchError("Patient not found")
        }
      } catch (error) {
        console.error("Unexpected error fetching patient:", error)
        setFetchError("An unexpected error occurred. Please try again.")
      } finally {
        setIsFetchingPatient(false)
      }
    }

    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  // Update admission data when admission prop changes
  useEffect(() => {
    if (admission) {
      setAdmissionData({
        admission_id: admission.admission_id || "",
        admission_status: admission.admission_status || "",
        first_name: admission.first_name || "",
        last_name: admission.last_name || "",
        admission_type: admission.admission_type || "",
        referring_personnel: admission.referring_personnel || "",
        service_classification: admission.service_classification || "",
        phic_number: admission.phic_number || "",
        informant_name: admission.informant_name || "",
        informant_relation_to_patient: admission.informant_relation_to_patient || "",
        informant_address: admission.informant_address || "",
        admitting_diagnosis: admission.admitting_diagnosis || "",
        admitting_diagnosis_icd_code: admission.admitting_diagnosis_icd_code || "",
        attending_clinic_staff: admission.attending_clinic_staff || "",
        patient_id: admission.patient_id || patientId || "",
        final_diagnosis: admission.final_diagnosis || "",
        final_diagnosis_icd_code: admission.final_diagnosis_icd_code || "",
        discharge_datetime: admission.discharge_datetime || "",
        length_of_stay_hours: admission.length_of_stay_hours || 0,
        result_status: admission.result_status || "",
        result_condition: admission.result_condition || "",
        created_at: admission.created_at || "",
      })
    }
  }, [admission, patientId])

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

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPatientData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAdmissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAdmissionData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePatientSelectChange = (field: string, value: string) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAdmissionSelectChange = (field: string, value: string) => {
    setAdmissionData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (activeTab === "patient") {
        const { data, error } = await supabase
          .from("Patients")
          .update({
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            middle_initial: patientData.middle_initial,
            date_of_birth: patientData.date_of_birth,
            permanent_address: patientData.permanent_address,
            contact_number: patientData.contact_number,
            civil_status: patientData.civil_status,
            religion: patientData.religion,
            birthplace: patientData.birthplace,
            nationality: patientData.nationality,
            spouse_name: patientData.spouse_name,
            gravidity: Number(patientData.gravidity),
            parity: Number(patientData.parity),
            occupation: patientData.occupation,
          })
          .eq("patient_id", patientId)
          .select()

        if (error) {
          console.error("Error updating patient:", error)
          return
        }

        console.log("Patient updated successfully:", data)
      } else {
        const { data, error } = await supabase
          .from("Admissions")
          .update({
            admission_status: admissionData.admission_status,
            first_name: admissionData.first_name,
            last_name: admissionData.last_name,
            admission_type: admissionData.admission_type,
            referring_personnel: admissionData.referring_personnel,
            service_classification: admissionData.service_classification,
            phic_number: admissionData.phic_number,
            informant_name: admissionData.informant_name,
            informant_relation_to_patient: admissionData.informant_relation_to_patient,
            informant_address: admissionData.informant_address,
            admitting_diagnosis: admissionData.admitting_diagnosis,
            admitting_diagnosis_icd_code: admissionData.admitting_diagnosis_icd_code,
            attending_clinic_staff: admissionData.attending_clinic_staff,
            final_diagnosis: admissionData.final_diagnosis,
            final_diagnosis_icd_code: admissionData.final_diagnosis_icd_code,
            discharge_datetime: admissionData.discharge_datetime,
            length_of_stay_hours: Number(admissionData.length_of_stay_hours),
            result_status: admissionData.result_status,
            result_condition: admissionData.result_condition,
          })
          .eq("admission_id", admission.admission_id)
          .select()

        if (error) {
          console.error("Error updating admission:", error)
          return
        }

        console.log("Admission updated successfully:", data)
      }

      setIsEditing(false)
      if (onEdit) onEdit()
    } catch (error) {
      console.error("Error in update operation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    if (activeTab === "patient") {
      // Reset patient data to original state
      const fetchPatient = async () => {
        try {
          const { data, error } = await supabase.from("Patients").select("*").eq("patient_id", patientId).single()

          if (error) {
            console.error("Error fetching patient:", error)
            return
          }

          if (data) {
            setPatientData({
              patient_id: data.patient_id || "",
              patient_id_provided: data.patient_id_provided || "",
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              middle_initial: data.middle_initial || "",
              date_of_birth: data.date_of_birth || "",
              permanent_address: data.permanent_address || "",
              contact_number: data.contact_number || "",
              civil_status: data.civil_status || "",
              religion: data.religion || "",
              birthplace: data.birthplace || "",
              nationality: data.nationality || "",
              spouse_name: data.spouse_name || "",
              gravidity: data.gravidity || 0,
              parity: data.parity || 0,
              occupation: data.occupation || "",
            })
          }
        } catch (error) {
          console.error("Unexpected error fetching patient:", error)
        }
      }

      fetchPatient()
    } else if (admission) {
      setAdmissionData({
        admission_id: admission.admission_id || "",
        admission_status: admission.admission_status || "",
        first_name: admission.first_name || "",
        last_name: admission.last_name || "",
        admission_type: admission.admission_type || "",
        referring_personnel: admission.referring_personnel || "",
        service_classification: admission.service_classification || "",
        phic_number: admission.phic_number || "",
        informant_name: admission.informant_name || "",
        informant_relation_to_patient: admission.informant_relation_to_patient || "",
        informant_address: admission.informant_address || "",
        admitting_diagnosis: admission.admitting_diagnosis || "",
        admitting_diagnosis_icd_code: admission.admitting_diagnosis_icd_code || "",
        attending_clinic_staff: admission.attending_clinic_staff || "",
        patient_id: admission.patient_id || patientId || "",
        final_diagnosis: admission.final_diagnosis || "",
        final_diagnosis_icd_code: admission.final_diagnosis_icd_code || "",
        discharge_datetime: admission.discharge_datetime || "",
        length_of_stay_hours: admission.length_of_stay_hours || 0,
        result_status: admission.result_status || "",
        result_condition: admission.result_condition || "",
        created_at: admission.created_at || "",
      })
    }
    setIsEditing(false)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100"
    switch (status.toLowerCase()) {
      case "admitted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "discharged":
        return "bg-sky-50 text-sky-700 border-sky-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      case "married":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "single":
        return "bg-sky-50 text-sky-700 border-sky-200"
      case "divorced":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "widowed":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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

  // Loading state while fetching patient data
  if (isFetchingPatient) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-full max-w-md md:max-w-lg overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6 rounded-l-xl border-l shadow-lg"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-slate-600">Loading patient information...</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Error state if patient data fetch failed
  if (fetchError) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-full max-w-md md:max-w-lg overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6 rounded-l-xl border-l shadow-lg"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Data</h3>
            <p className="text-slate-600 text-center mb-6">{fetchError}</p>
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
              Retry
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-md md:max-w-lg overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6 rounded-l-xl border-l shadow-lg"
      >
        <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <motion.div className="mb-6 w-full" variants={slideUp}>
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full text-primary">
                        <User className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">
                          {patientData.first_name} {patientData.middle_initial ? `${patientData.middle_initial}. ` : ""}
                          {patientData.last_name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {admissionData.admission_status && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2 py-1 text-xs font-medium",
                                getStatusColor(admissionData.admission_status),
                              )}
                            >
                              {admissionData.admission_status}
                            </Badge>
                          )}
                          {patientData.date_of_birth && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs font-medium bg-violet-50 text-violet-700 border-violet-200"
                            >
                              Age: {calculateAge(patientData.date_of_birth)}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="px-3 py-1 text-xs font-medium bg-primary/5 text-primary border-primary/20"
                          >
                            ID: {patientData.patient_id_provided}
                          </Badge>
                          {admissionData.admission_id && (
                            <Badge
                              variant="outline"
                              className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Admission: {admissionData.admission_id}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </SheetTitle>
          </div>
        </SheetHeader>

        <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 mx-auto">
            <TabsTrigger value="patient" className="text-sm">
              <User className="w-4 h-4 mr-2" />
              Patient Details
            </TabsTrigger>
            <TabsTrigger value="admission" className="text-sm">
              <ClipboardList className="w-4 h-4 mr-2" />
              Admission Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form-patient"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                  className="py-4"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={slideUp}>
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-slate-700">
                          First Name
                        </Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={patientData.first_name}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-slate-700">
                          Last Name
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={patientData.last_name}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="middle_initial" className="text-slate-700">
                          Middle Initial
                        </Label>
                        <Input
                          id="middle_initial"
                          name="middle_initial"
                          value={patientData.middle_initial || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="text-slate-700">
                          Date of Birth
                        </Label>
                        <Input
                          id="date_of_birth"
                          name="date_of_birth"
                          type="date"
                          value={patientData.date_of_birth || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_number" className="text-slate-700">
                          Contact Number
                        </Label>
                        <Input
                          id="contact_number"
                          name="contact_number"
                          value={patientData.contact_number || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="civil_status" className="text-slate-700">
                          Civil Status
                        </Label>
                        <Select
                          value={patientData.civil_status || ""}
                          onValueChange={(value) => handlePatientSelectChange("civil_status", value)}
                        >
                          <SelectTrigger id="civil_status" className="w-full border-slate-200 focus:ring-primary/20">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={slideUp}>
                      <div className="space-y-2">
                        <Label htmlFor="gravidity" className="text-slate-700">
                          Gravidity
                        </Label>
                        <Input
                          id="gravidity"
                          name="gravidity"
                          type="number"
                          value={patientData.gravidity?.toString() || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parity" className="text-slate-700">
                          Parity
                        </Label>
                        <Input
                          id="parity"
                          name="parity"
                          type="number"
                          value={patientData.parity?.toString() || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={slideUp}>
                      <Label htmlFor="permanent_address" className="text-slate-700">
                        Permanent Address
                      </Label>
                      <Input
                        id="permanent_address"
                        name="permanent_address"
                        value={patientData.permanent_address || ""}
                        onChange={handlePatientChange}
                        className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                      />
                    </motion.div>

                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={slideUp}>
                      <div className="space-y-2">
                        <Label htmlFor="religion" className="text-slate-700">
                          Religion
                        </Label>
                        <Input
                          id="religion"
                          name="religion"
                          value={patientData.religion || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthplace" className="text-slate-700">
                          Birthplace
                        </Label>
                        <Input
                          id="birthplace"
                          name="birthplace"
                          value={patientData.birthplace || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nationality" className="text-slate-700">
                          Nationality
                        </Label>
                        <Input
                          id="nationality"
                          name="nationality"
                          value={patientData.nationality || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="spouse_name" className="text-slate-700">
                          Spouse Name
                        </Label>
                        <Input
                          id="spouse_name"
                          name="spouse_name"
                          value={patientData.spouse_name || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-slate-700">
                          Occupation
                        </Label>
                        <Input
                          id="occupation"
                          name="occupation"
                          value={patientData.occupation || ""}
                          onChange={handlePatientChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </motion.div>

                    <motion.div className="flex justify-between pt-6" variants={slideUp}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        className="border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="view-mode-patient"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                  className="py-4"
                >
                  <div className="space-y-6">
                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={<Calendar className="text-primary" />}
                          label="Date of Birth"
                          value={
                            patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : "N/A"
                          }
                        />
                        <InfoItem
                          icon={<Phone className="text-primary" />}
                          label="Contact Number"
                          value={patientData.contact_number || "N/A"}
                        />
                        <InfoItem
                          icon={<Users className="text-primary" />}
                          label="Civil Status"
                          value={patientData.civil_status || "N/A"}
                        />
                        <InfoItem
                          icon={<Heart className="text-primary" />}
                          label="Spouse Name"
                          value={patientData.spouse_name || "N/A"}
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Medical Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={<Users className="text-primary" />}
                          label="Gravidity"
                          value={patientData.gravidity?.toString() || "N/A"}
                        />
                        <InfoItem
                          icon={<Users className="text-primary" />}
                          label="Parity"
                          value={patientData.parity?.toString() || "N/A"}
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Location & Background
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem
                          icon={<Home className="text-primary" />}
                          label="Permanent Address"
                          value={patientData.permanent_address || "N/A"}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem
                            icon={<MapPin className="text-primary" />}
                            label="Birthplace"
                            value={patientData.birthplace || "N/A"}
                          />
                          <InfoItem
                            icon={<Globe className="text-primary" />}
                            label="Nationality"
                            value={patientData.nationality || "N/A"}
                          />
                          <InfoItem
                            icon={<BookOpen className="text-primary" />}
                            label="Religion"
                            value={patientData.religion || "N/A"}
                          />
                          <InfoItem
                            icon={<User className="text-primary" />}
                            label="Occupation"
                            value={patientData.occupation || "N/A"}
                          />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div className="pt-6" variants={slideUp}>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full md:w-auto bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Information
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="admission">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form-admission"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                  className="py-4"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={slideUp}>
                      <div className="space-y-2">
                        <Label htmlFor="admission_status" className="text-slate-700">
                          Admission Status
                        </Label>
                        <Select
                          value={admissionData.admission_status || ""}
                          onValueChange={(value) => handleAdmissionSelectChange("admission_status", value)}
                        >
                          <SelectTrigger
                            id="admission_status"
                            className="w-full border-slate-200 focus:ring-primary/20"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admitted">Admitted</SelectItem>
                            <SelectItem value="Discharged">Discharged</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admission_type" className="text-slate-700">
                          Admission Type
                        </Label>
                        <Input
                          id="admission_type"
                          name="admission_type"
                          value={admissionData.admission_type || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referring_personnel" className="text-slate-700">
                          Referring Personnel
                        </Label>
                        <Input
                          id="referring_personnel"
                          name="referring_personnel"
                          value={admissionData.referring_personnel || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service_classification" className="text-slate-700">
                          Service Classification
                        </Label>
                        <Input
                          id="service_classification"
                          name="service_classification"
                          value={admissionData.service_classification || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phic_number" className="text-slate-700">
                          PHIC Number
                        </Label>
                        <Input
                          id="phic_number"
                          name="phic_number"
                          value={admissionData.phic_number || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="attending_clinic_staff" className="text-slate-700">
                          Attending Clinic Staff
                        </Label>
                        <Input
                          id="attending_clinic_staff"
                          name="attending_clinic_staff"
                          value={admissionData.attending_clinic_staff || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={slideUp}>
                      <Label htmlFor="admitting_diagnosis" className="text-slate-700">
                        Admitting Diagnosis
                      </Label>
                      <Input
                        id="admitting_diagnosis"
                        name="admitting_diagnosis"
                        value={admissionData.admitting_diagnosis || ""}
                        onChange={handleAdmissionChange}
                        className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={slideUp}>
                      <Label htmlFor="admitting_diagnosis_icd_code" className="text-slate-700">
                        Admitting Diagnosis ICD Code
                      </Label>
                      <Input
                        id="admitting_diagnosis_icd_code"
                        name="admitting_diagnosis_icd_code"
                        value={admissionData.admitting_diagnosis_icd_code || ""}
                        onChange={handleAdmissionChange}
                        className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                      />
                    </motion.div>

                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Informant Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="informant_name" className="text-slate-700">
                            Informant Name
                          </Label>
                          <Input
                            id="informant_name"
                            name="informant_name"
                            value={admissionData.informant_name || ""}
                            onChange={handleAdmissionChange}
                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="informant_relation_to_patient" className="text-slate-700">
                            Relation to Patient
                          </Label>
                          <Input
                            id="informant_relation_to_patient"
                            name="informant_relation_to_patient"
                            value={admissionData.informant_relation_to_patient || ""}
                            onChange={handleAdmissionChange}
                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="informant_address" className="text-slate-700">
                          Informant Address
                        </Label>
                        <Input
                          id="informant_address"
                          name="informant_address"
                          value={admissionData.informant_address || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-4 mt-6" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Discharge Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="discharge_datetime" className="text-slate-700">
                            Discharge Date & Time
                          </Label>
                          <Input
                            id="discharge_datetime"
                            name="discharge_datetime"
                            type="datetime-local"
                            value={admissionData.discharge_datetime || ""}
                            onChange={handleAdmissionChange}
                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="length_of_stay_hours" className="text-slate-700">
                            Length of Stay (Hours)
                          </Label>
                          <Input
                            id="length_of_stay_hours"
                            name="length_of_stay_hours"
                            type="number"
                            value={admissionData.length_of_stay_hours?.toString() || ""}
                            onChange={handleAdmissionChange}
                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="result_status" className="text-slate-700">
                            Result Status
                          </Label>
                          <Select
                            value={admissionData.result_status || ""}
                            onValueChange={(value) => handleAdmissionSelectChange("result_status", value)}
                          >
                            <SelectTrigger id="result_status" className="w-full border-slate-200 focus:ring-primary/20">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Improved">Improved</SelectItem>
                              <SelectItem value="Recovered">Recovered</SelectItem>
                              <SelectItem value="Unchanged">Unchanged</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="result_condition" className="text-slate-700">
                            Result Condition
                          </Label>
                          <Input
                            id="result_condition"
                            name="result_condition"
                            value={admissionData.result_condition || ""}
                            onChange={handleAdmissionChange}
                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="final_diagnosis" className="text-slate-700">
                          Final Diagnosis
                        </Label>
                        <Input
                          id="final_diagnosis"
                          name="final_diagnosis"
                          value={admissionData.final_diagnosis || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="final_diagnosis_icd_code" className="text-slate-700">
                          Final Diagnosis ICD Code
                        </Label>
                        <Input
                          id="final_diagnosis_icd_code"
                          name="final_diagnosis_icd_code"
                          value={admissionData.final_diagnosis_icd_code || ""}
                          onChange={handleAdmissionChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    </motion.div>

                    <motion.div className="flex justify-between pt-6" variants={slideUp}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        className="border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="view-mode-admission"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                  className="py-4"
                >
                  <div className="space-y-6">
                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Admission Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={<Activity className="text-primary" />}
                          label="Admission Status"
                          value={admissionData.admission_status || "N/A"}
                        />
                        <InfoItem
                          icon={<ClipboardList className="text-primary" />}
                          label="Admission Type"
                          value={admissionData.admission_type || "N/A"}
                        />
                        <InfoItem
                          icon={<Calendar className="text-primary" />}
                          label="Date and Time Admitted"
                          value={admissionData.created_at ? new Date(admissionData.created_at).toLocaleString() : "N/A"}
                        />
                        <InfoItem
                          icon={<UserCheck className="text-primary" />}
                          label="Referring Personnel"
                          value={admissionData.referring_personnel || "N/A"}
                        />
                        <InfoItem
                          icon={<FileText className="text-primary" />}
                          label="Service Classification"
                          value={admissionData.service_classification || "N/A"}
                        />
                        <InfoItem
                          icon={<FileText className="text-primary" />}
                          label="PHIC Number"
                          value={admissionData.phic_number || "N/A"}
                        />
                        <InfoItem
                          icon={<Stethoscope className="text-primary" />}
                          label="Attending Clinic Staff"
                          value={admissionData.attending_clinic_staff || "N/A"}
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Diagnosis Information
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem
                          icon={<Stethoscope className="text-primary" />}
                          label="Admitting Diagnosis"
                          value={admissionData.admitting_diagnosis || "N/A"}
                        />
                        <InfoItem
                          icon={<FileText className="text-primary" />}
                          label="Admitting Diagnosis ICD Code"
                          value={admissionData.admitting_diagnosis_icd_code || "N/A"}
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Informant Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={<User className="text-primary" />}
                          label="Informant Name"
                          value={admissionData.informant_name || "N/A"}
                        />
                        <InfoItem
                          icon={<Users className="text-primary" />}
                          label="Relation to Patient"
                          value={admissionData.informant_relation_to_patient || "N/A"}
                        />
                      </div>
                      <InfoItem
                        icon={<Home className="text-primary" />}
                        label="Informant Address"
                        value={admissionData.informant_address || "N/A"}
                      />
                    </motion.div>

                    <motion.div className="space-y-4" variants={slideUp}>
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Discharge Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={<Calendar className="text-primary" />}
                          label="Discharge Date & Time"
                          value={
                            admissionData.discharge_datetime
                              ? new Date(admissionData.discharge_datetime).toLocaleString()
                              : "N/A"
                          }
                        />
                        <InfoItem
                          icon={<Clock className="text-primary" />}
                          label="Length of Stay (Hours)"
                          value={admissionData.length_of_stay_hours?.toString() || "N/A"}
                        />
                        <InfoItem
                          icon={<Activity className="text-primary" />}
                          label="Result Status"
                          value={admissionData.result_status || "N/A"}
                        />
                        <InfoItem
                          icon={<FileText className="text-primary" />}
                          label="Result Condition"
                          value={admissionData.result_condition || "N/A"}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem
                          icon={<Stethoscope className="text-primary" />}
                          label="Final Diagnosis"
                          value={admissionData.final_diagnosis || "N/A"}
                        />
                        <InfoItem
                          icon={<FileText className="text-primary" />}
                          label="Final Diagnosis ICD Code"
                          value={admissionData.final_diagnosis_icd_code || "N/A"}
                        />
                      </div>
                    </motion.div>

                    <motion.div className="pt-6" variants={slideUp}>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full md:w-auto bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Information
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">{icon}</div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-sm font-medium text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )
}
