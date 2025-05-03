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
import { User, Phone, Calendar, MapPin, Edit, Save, X, Heart, Globe, Home, BookOpen, Users, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Clock } from "lucide-react"
import { format } from "date-fns"
import { AdmissionHistoryDetail } from "./admission-history-detail"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { Pill, Stethoscope, FileTextIcon } from "lucide-react"
import { toast } from "sonner"

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

interface AdmissionsHistory {
  admission_id: string
  admission_status: string
  first_name: string
  last_name: string
  admission_type: string
  referring_personnel: string
  service_classification: string
  phic_number: string
  informant_name: string
  informant_relation_to_patient: string
  informant_address: string
  admitting_diagnosis: string
  admitting_diagnosis_icd_code: string
  attending_clinic_staff: string
  patient_id: string
  final_diagnosis: string
  final_diagnosis_icd_code: string
  discharge_datetime: string
  length_of_stay_hours: number
  result_status: string
  result_condition: string
  created_at: string
}

interface DoctorsOrder {
  order_id: string
  created_at: string
  progress_notes: string
  doctors_order: string
  patient_id: string
  admission_id: string
}

interface Medication {
  medication_id: string
  created_at: string
  patient_id: string
  admission_id: string
  medication: string
  date_to_take: string
  time_to_take: string
}

interface Note {
  notes_id: string
  created_at: string
  patient_id: string
  admission_id: string
  notes_content: string
}

interface PatientBasicInfoViewProps {
  trigger: React.ReactNode
  patient: Patient
  onEdit?: () => void
}

const supabase = createClient()

export function PatientBasicInfoView({ trigger, patient, onEdit }: PatientBasicInfoViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Patient>({
    patient_id: patient?.patient_id || "",
    patient_id_provided: patient?.patient_id_provided || "",
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    middle_initial: patient?.middle_initial || "",
    date_of_birth: patient?.date_of_birth || "",
    permanent_address: patient?.permanent_address || "",
    contact_number: patient?.contact_number || "",
    civil_status: patient?.civil_status || "",
    religion: patient?.religion || "",
    birthplace: patient?.birthplace || "",
    nationality: patient?.nationality || "",
    spouse_name: patient?.spouse_name || "",
    gravidity: patient?.gravidity || 0,
    parity: patient?.parity || 0,
    occupation: patient?.occupation || "",
  })

  const [admissionsHistories, setAdmissionsHistories] = useState<AdmissionsHistory[]>([])
  const [isLoadingHistories, setIsLoadingHistories] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [admissionToDelete, setAdmissionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [deleteOrderDialogOpen, setDeleteOrderDialogOpen] = useState(false)
  const [deleteMedicationDialogOpen, setDeleteMedicationDialogOpen] = useState(false)
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false)
  const [isDeletingOrder, setIsDeletingOrder] = useState(false)
  const [isDeletingMedication, setIsDeletingMedication] = useState(false)
  const [isDeletingNote, setIsDeletingNote] = useState(false)

  const [doctorsOrders, setDoctorsOrders] = useState<DoctorsOrder[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoadingDoctorsOrders, setIsLoadingDoctorsOrders] = useState(false)
  const [isLoadingMedications, setIsLoadingMedications] = useState(false)
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)

  useEffect(() => {
    if (patient) {
      setFormData({
        patient_id: patient.patient_id || "",
        patient_id_provided: patient.patient_id_provided || "",
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        middle_initial: patient.middle_initial || "",
        date_of_birth: patient.date_of_birth || "",
        permanent_address: patient.permanent_address || "",
        contact_number: patient.contact_number || "",
        civil_status: patient.civil_status || "",
        religion: patient.religion || "",
        birthplace: patient.birthplace || "",
        nationality: patient.nationality || "",
        spouse_name: patient.spouse_name || "",
        gravidity: patient.gravidity || 0,
        parity: patient.parity || 0,
        occupation: patient.occupation || "",
      })
    }
  }, [patient])

  const fetchAdmissionsHistories = async () => {
    if (!patient?.patient_id) return

    setIsLoadingHistories(true)
    try {
      const { data, error } = await supabase.from("AdmissionsHistory").select("*").eq("patient_id", patient.patient_id)

      if (error) {
        console.error("Error fetching admission histories:", error)
        return
      }

      setAdmissionsHistories(data || [])
    } catch (error) {
      console.error("Error in fetch operation:", error)
    } finally {
      setIsLoadingHistories(false)
    }
  }

  const fetchDoctorsOrders = async () => {
    if (!patient?.patient_id) return

    setIsLoadingDoctorsOrders(true)
    try {
      const { data, error } = await supabase
        .from("DoctorsOrdersHistory")
        .select("*")
        .eq("patient_id", patient.patient_id)

      if (error) {
        console.error("Error fetching doctors orders:", error)
        return
      }

      setDoctorsOrders(data || [])
    } catch (error) {
      console.error("Error in fetch operation:", error)
    } finally {
      setIsLoadingDoctorsOrders(false)
    }
  }

  const fetchMedications = async () => {
    if (!patient?.patient_id) return

    setIsLoadingMedications(true)
    try {
      const { data, error } = await supabase.from("MedicationsHistory").select("*").eq("patient_id", patient.patient_id)

      if (error) {
        console.error("Error fetching medications:", error)
        return
      }

      setMedications(data || [])
    } catch (error) {
      console.error("Error in fetch operation:", error)
    } finally {
      setIsLoadingMedications(false)
    }
  }

  const fetchNotes = async () => {
    if (!patient?.patient_id) return

    setIsLoadingNotes(true)
    try {
      const { data, error } = await supabase.from("NotesHistory").select("*").eq("patient_id", patient.patient_id)

      if (error) {
        console.error("Error fetching notes:", error)
        return
      }

      setNotes(data || [])
    } catch (error) {
      console.error("Error in fetch operation:", error)
    } finally {
      setIsLoadingNotes(false)
    }
  }

  useEffect(() => {
    if (patient?.patient_id) {
      fetchAdmissionsHistories()
    }
  }, [patient?.patient_id])

  useEffect(() => {
    if (patient?.patient_id && activeTab === "doctors-orders") {
      fetchDoctorsOrders()
    }
  }, [patient?.patient_id, activeTab])

  useEffect(() => {
    if (patient?.patient_id && activeTab === "medications") {
      fetchMedications()
    }
  }, [patient?.patient_id, activeTab])

  useEffect(() => {
    if (patient?.patient_id && activeTab === "notes") {
      fetchNotes()
    }
  }, [patient?.patient_id, activeTab])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("Patients")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_initial: formData.middle_initial,
          date_of_birth: formData.date_of_birth,
          permanent_address: formData.permanent_address,
          contact_number: formData.contact_number,
          civil_status: formData.civil_status,
          religion: formData.religion,
          birthplace: formData.birthplace,
          nationality: formData.nationality,
          spouse_name: formData.spouse_name,
          gravidity: Number(formData.gravidity),
          parity: Number(formData.parity),
          occupation: formData.occupation,
        })
        .eq("patient_id", patient.patient_id)
        .select()

      if (error) {
        console.error("Error updating patient:", error)
        return
      }

      console.log("Patient updated successfully:", data)
      setIsEditing(false)
      if (onEdit) onEdit()
    } catch (error) {
      console.error("Error in update operation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    if (patient) {
      setFormData({
        patient_id: patient.patient_id || "",
        patient_id_provided: patient.patient_id_provided || "",
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        middle_initial: patient.middle_initial || "",
        date_of_birth: patient.date_of_birth || "",
        permanent_address: patient.permanent_address || "",
        contact_number: patient.contact_number || "",
        civil_status: patient.civil_status || "",
        religion: patient.religion || "",
        birthplace: patient.birthplace || "",
        nationality: patient.nationality || "",
        spouse_name: patient.spouse_name || "",
        gravidity: patient.gravidity || 0,
        parity: patient.parity || 0,
        occupation: patient.occupation || "",
      })
    }
    setIsEditing(false)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100"
    switch (status.toLowerCase()) {
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

  async function handleDeleteAdmission(): Promise<void> {
    if (!admissionToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("AdmissionsHistory").delete().eq("admission_id", admissionToDelete)

      if (error) {
        console.error("Error deleting admission record:", error)
        return
      }

      setAdmissionsHistories((prev) => prev.filter((history) => history.admission_id !== admissionToDelete))
      console.log("Admission record deleted successfully")
    } catch (error) {
      console.error("Error in delete operation:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAdmissionToDelete(null)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    setIsDeletingOrder(true)
    try {
      const { error } = await supabase.from("DoctorsOrdersHistory").delete().eq("order_id", orderToDelete)

      if (error) {
        console.error("Error deleting order:", error)
        toast("Failed to delete order. Please try again.")
        return
      }

      // Update the local state to remove the deleted order
      setDoctorsOrders((prev) => prev.filter((order) => order.order_id !== orderToDelete))

      toast("Order deleted successfully.")
    } catch (error) {
      console.error("Error in delete operation:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsDeletingOrder(false)
      setDeleteOrderDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleDeleteMedication = async () => {
    if (!medicationToDelete) return

    setIsDeletingMedication(true)
    try {
      const { error } = await supabase.from("MedicationsHistory").delete().eq("medication_id", medicationToDelete)

      if (error) {
        console.error("Error deleting medication:", error)
        toast("Failed to delete medication. Please try again.")
        return
      }

      // Update the local state to remove the deleted medication
      setMedications((prev) => prev.filter((medication) => medication.medication_id !== medicationToDelete))

      toast("Medication deleted successfully.")
    } catch (error) {
      console.error("Error in delete operation:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsDeletingMedication(false)
      setDeleteMedicationDialogOpen(false)
      setMedicationToDelete(null)
    }
  }

  const handleDeleteNote = async () => {
    if (!noteToDelete) return

    setIsDeletingNote(true)
    try {
      const { error } = await supabase.from("NotesHistory").delete().eq("notes_id", noteToDelete)

      if (error) {
        console.error("Error deleting note:", error)
        toast("Failed to delete note. Please try again.")
        return
      }

      // Update the local state to remove the deleted note
      setNotes((prev) => prev.filter((note) => note.notes_id !== noteToDelete))

      toast("Note deleted successfully.")
    } catch (error) {
      console.error("Error in delete operation:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsDeletingNote(false)
      setDeleteNoteDialogOpen(false)
      setNoteToDelete(null)
    }
  }

  // Add inline style for no-scrollbar utility
  const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

  return (
    <Sheet>
      <style jsx global>
        {noScrollbarStyle}
      </style>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-md md:max-w-xl lg:max-w-2xl overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6 rounded-l-xl border-l shadow-lg"
      >
        <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <motion.div className="mb-6" variants={slideUp}>
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full text-primary">
                        <User className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">
                          {formData.first_name} {formData.middle_initial ? `${formData.middle_initial}. ` : ""}
                          {formData.last_name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.civil_status && (
                            <Badge
                              variant="outline"
                              className={cn("px-2 py-1 text-xs font-medium", getStatusColor(formData.civil_status))}
                            >
                              {formData.civil_status}
                            </Badge>
                          )}
                          {formData.date_of_birth && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs font-medium bg-violet-50 text-violet-700 border-violet-200"
                            >
                              Age: {calculateAge(formData.date_of_birth)}
                            </Badge>
                          )}
                          {formData.nationality && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {formData.nationality}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="px-3 py-1 text-xs font-medium bg-primary/5 text-primary border-primary/20"
                          >
                            ID: {formData.patient_id_provided}
                          </Badge>
                          {formData.gravidity !== undefined && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border-green-200"
                            >
                              Gravidity: {formData.gravidity}
                            </Badge>
                          )}
                          {formData.parity !== undefined && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              Parity: {formData.parity}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full mb-6 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="info"
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Patient Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Admission</span>
            </TabsTrigger>
            <TabsTrigger
              value="doctors-orders"
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="medications"
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <Pill className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Medications</span>
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <FileTextIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form"
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
                          value={formData.first_name}
                          onChange={handleChange}
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
                          value={formData.last_name}
                          onChange={handleChange}
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
                          value={formData.middle_initial || ""}
                          onChange={handleChange}
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
                          value={formData.date_of_birth || ""}
                          onChange={handleChange}
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
                          value={formData.contact_number || ""}
                          onChange={handleChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="civil_status" className="text-slate-700">
                          Civil Status
                        </Label>
                        <Select
                          value={formData.civil_status || ""}
                          onValueChange={(value) => handleSelectChange("civil_status", value)}
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
                          value={formData.gravidity?.toString() || ""}
                          onChange={handleChange}
                          className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2"></div>
                      <div className="space-y-2">
                        <Label htmlFor="parity" className="text-slate-700">
                          Parity
                        </Label>
                        <Input
                          id="parity"
                          name="parity"
                          type="number"
                          value={formData.parity?.toString() || ""}
                          onChange={handleChange}
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
                        value={formData.permanent_address || ""}
                        onChange={handleChange}
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
                          value={formData.religion || ""}
                          onChange={handleChange}
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
                          value={formData.birthplace || ""}
                          onChange={handleChange}
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
                          value={formData.nationality || ""}
                          onChange={handleChange}
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
                          value={formData.spouse_name || ""}
                          onChange={handleChange}
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
                          value={formData.occupation || ""}
                          onChange={handleChange}
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
                  key="view-mode"
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
                          value={formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : "N/A"}
                        />
                        <InfoItem
                          icon={<Phone className="text-primary" />}
                          label="Contact Number"
                          value={formData.contact_number || "N/A"}
                        />
                        <InfoItem
                          icon={<Users className="text-primary" />}
                          label="Civil Status"
                          value={formData.civil_status || "N/A"}
                        />
                        <InfoItem
                          icon={<Heart className="text-primary" />}
                          label="Spouse Name"
                          value={formData.spouse_name || "N/A"}
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
                          value={formData.gravidity?.toString() || "N/A"}
                        />
                        <InfoItem
                          icon={<Users className="text-primary" />}
                          label="Parity"
                          value={formData.parity?.toString() || "N/A"}
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
                          value={formData.permanent_address || "N/A"}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem
                            icon={<MapPin className="text-primary" />}
                            label="Birthplace"
                            value={formData.birthplace || "N/A"}
                          />
                          <InfoItem
                            icon={<Globe className="text-primary" />}
                            label="Nationality"
                            value={formData.nationality || "N/A"}
                          />
                          <InfoItem
                            icon={<BookOpen className="text-primary" />}
                            label="Religion"
                            value={formData.religion || "N/A"}
                          />
                          <InfoItem
                            icon={<User className="text-primary" />}
                            label="Occupation"
                            value={formData.occupation || "N/A"}
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

          <TabsContent value="history">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-4">
              <div className="space-y-6">
                <motion.div className="space-y-4" variants={slideUp}>
                  <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Admission History Documents
                  </h4>

                  {isLoadingHistories ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="animate-spin h-8 w-8 text-primary"
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
                        <p className="text-sm text-slate-500">Loading admission history...</p>
                      </div>
                    </div>
                  ) : admissionsHistories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <FileText className="h-12 w-12 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700">No admission history</h3>
                        <p className="text-sm text-slate-500">
                          This patient doesn&#39;t have any admission history documents yet.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {admissionsHistories.map((history) => (
                        <Card
                          key={history.admission_id}
                          className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col">
                              <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                    <FileText className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col gap-2">
                                      <h4 className="text-base font-semibold text-slate-800 truncate">
                                        {history.admission_id}
                                      </h4>
                                      <div className="flex items-center gap-1 text-sm text-slate-500">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>
                                          {history.created_at
                                            ? format(new Date(history.created_at), "MMM d, yyyy • h:mm a")
                                            : "Unknown date"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AdmissionHistoryDetail
                                    admission={history}
                                    trigger={
                                      <Button variant="outline" size="sm">
                                        View
                                      </Button>
                                    }
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      setAdmissionToDelete(history.admission_id)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="doctors-orders">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-4">
              <div className="space-y-6">
                <motion.div className="space-y-4" variants={slideUp}>
                  <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Doctor's Orders</h4>

                  {isLoadingDoctorsOrders ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="animate-spin h-8 w-8 text-primary"
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
                        <p className="text-sm text-slate-500">Loading doctor's orders...</p>
                      </div>
                    </div>
                  ) : doctorsOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Stethoscope className="h-12 w-12 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700">No doctor's orders</h3>
                        <p className="text-sm text-slate-500">
                          This patient doesn&#39;t have any doctor&#39;s orders yet.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctorsOrders.map((order) => (
                        <Card
                          key={order.order_id}
                          className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                    <Stethoscope className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-700">Order ID: {order.order_id}</h4>
                                    <p className="text-xs text-slate-500">
                                      {order.created_at
                                        ? format(new Date(order.created_at), "MMM d, yyyy • h:mm a")
                                        : "Unknown date"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {order.admission_id}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      setOrderToDelete(order.order_id)
                                      setDeleteOrderDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-xs font-medium text-slate-500 mb-1">Doctor's Order</h5>
                                  <p className="text-sm text-slate-800 p-3 bg-slate-50 rounded-md">
                                    {order.doctors_order}
                                  </p>
                                </div>

                                {order.progress_notes && (
                                  <div>
                                    <h5 className="text-xs font-medium text-slate-500 mb-1">Progress Notes</h5>
                                    <p className="text-sm text-slate-800 p-3 bg-slate-50 rounded-md">
                                      {order.progress_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="medications">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-4">
              <div className="space-y-6">
                <motion.div className="space-y-4" variants={slideUp}>
                  <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Medications</h4>

                  {isLoadingMedications ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="animate-spin h-8 w-8 text-primary"
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
                        <p className="text-sm text-slate-500">Loading medications...</p>
                      </div>
                    </div>
                  ) : medications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Pill className="h-12 w-12 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700">No medications</h3>
                        <p className="text-sm text-slate-500">This patient doesn&#39;t have any medications yet.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medications.map((medication) => (
                        <Card
                          key={medication.medication_id}
                          className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                    <Pill className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-700">{medication.medication}</h4>
                                    <p className="text-xs text-slate-500">
                                      {medication.created_at
                                        ? format(new Date(medication.created_at), "MMM d, yyyy")
                                        : "Unknown date"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {medication.medication_id}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      setMedicationToDelete(medication.medication_id)
                                      setDeleteMedicationDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-xs font-medium text-slate-500 mb-1">Date to Take</h5>
                                  <p className="text-sm text-slate-800 p-2 bg-slate-50 rounded-md">
                                    {medication.date_to_take
                                      ? format(new Date(medication.date_to_take), "MMM d, yyyy")
                                      : "Not specified"}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-medium text-slate-500 mb-1">Time to Take</h5>
                                  <p className="text-sm text-slate-800 p-2 bg-slate-50 rounded-md">
                                    {medication.time_to_take || "Not specified"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notes">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-4">
              <div className="space-y-6">
                <motion.div className="space-y-4" variants={slideUp}>
                  <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Notes</h4>

                  {isLoadingNotes ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="animate-spin h-8 w-8 text-primary"
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
                        <p className="text-sm text-slate-500">Loading notes...</p>
                      </div>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <FileTextIcon className="h-12 w-12 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700">No notes</h3>
                        <p className="text-sm text-slate-500">This patient doesn&#39;t have any notes yet.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <Card
                          key={note.notes_id}
                          className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                    <FileTextIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-700">Note ID: {note.notes_id}</h4>
                                    <p className="text-xs text-slate-500">
                                      {note.created_at
                                        ? format(new Date(note.created_at), "MMM d, yyyy • h:mm a")
                                        : "Unknown date"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {note.admission_id}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                      setNoteToDelete(note.notes_id)
                                      setDeleteNoteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-xs font-medium text-slate-500 mb-1">Note Content</h5>
                                <p className="text-sm text-slate-800 p-3 bg-slate-50 rounded-md whitespace-pre-wrap">
                                  {note.notes_content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setAdmissionToDelete(null)
          }}
          onConfirm={handleDeleteAdmission}
          title="Delete Admission Record"
          description="Are you sure you want to delete this admission record? This action cannot be undone."
          isDeleting={isDeleting}
        />
        {/* Delete Order Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteOrderDialogOpen}
          onClose={() => {
            setDeleteOrderDialogOpen(false)
            setOrderToDelete(null)
          }}
          onConfirm={handleDeleteOrder}
          title="Delete Doctor's Order"
          description="Are you sure you want to delete this doctor's order? This action cannot be undone."
          isDeleting={isDeletingOrder}
        />

        {/* Delete Medication Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteMedicationDialogOpen}
          onClose={() => {
            setDeleteMedicationDialogOpen(false)
            setMedicationToDelete(null)
          }}
          onConfirm={handleDeleteMedication}
          title="Delete Medication Record"
          description="Are you sure you want to delete this medication record? This action cannot be undone."
          isDeleting={isDeletingMedication}
        />

        {/* Delete Note Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteNoteDialogOpen}
          onClose={() => {
            setDeleteNoteDialogOpen(false)
            setNoteToDelete(null)
          }}
          onConfirm={handleDeleteNote}
          title="Delete Note"
          description="Are you sure you want to delete this note? This action cannot be undone."
          isDeleting={isDeletingNote}
        />
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
