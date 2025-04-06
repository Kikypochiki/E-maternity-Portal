import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Home, Mail, Phone, User, Users, FileText, Heart, Pencil} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { PatientEditForm } from "./patient_edit_form"
import { PatientDeleteDialog } from "./patient_delete_dialog"

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
}

export default function PatientBasicInfoView({ trigger, patient, onFetchData }: { trigger: React.ReactNode; patient: Patient; onFetchData: () => void }) {
    // Format date of birth if it's a valid date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return isNaN(date.getTime()) ? dateString : format(date, "MMMM d, yyyy")
        } catch (error) {
            return dateString
        }
    }

    // Calculate age from date of birth
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
        } catch (error) {
            return "N/A"
        }
    }

    const fetchData = React.useCallback(() => {
        if (typeof onFetchData === "function") {
            onFetchData()
        } else {
            console.error("fetchData function should be passed as a prop from the parent component.")
        }
    }, [onFetchData])

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-zinc-900 border border-zinc-700 text-white">
                <DialogHeader className="pb-4 border-b border-zinc-700">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        {`${patient.patient_first_name} ${patient.patient_last_name}`}
                        <div className="pl-5 flex gap-2">
                            <PatientEditForm
                                patient={patient}
                                trigger={
                                    <div>
                                        <Button className="bg-blue-400 text-white w-full hover:bg-blue-500 h-8">
                                            <Pencil size={12} />
                                            Edit
                                        </Button>
                                    </div>
                                }
                                onPatientUpdated={fetchData}
                            />
                            <PatientDeleteDialog
                                patientId={patient.patient_id}
                                patientName={`${patient.patient_first_name} ${patient.patient_last_name}`}
                                onPatientDeleted={fetchData}
                            />
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-300 text-sm mt-1 flex items-center gap-2">
                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs font-medium">ID: {patient.patient_id}</span>
                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs font-medium">
                            Age: {calculateAge(patient.patient_date_of_birth)}
                        </span>
                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs font-medium">
                            Blood Type: {patient.patient_bloodtype}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="w-full h-[400px]">
                    <div className="space-y-6 px-3">
                        {/* Personal Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2 flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-sm">First Name</p>
                                    <p className="text-white">{patient.patient_first_name}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-sm">Last Name</p>
                                    <p className="text-white">{patient.patient_last_name}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Date of Birth
                                </p>
                                <p className="text-white">{formatDate(patient.patient_date_of_birth)}</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2 flex items-center gap-2">
                                <Phone className="h-5 w-5 text-blue-500" />
                                Contact Information
                            </h3>

                            <div className="space-y-1">
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    <Home className="h-4 w-4 text-blue-500" />
                                    Address
                                </p>
                                <p className="text-white">{patient.patient_address || "Not provided"}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-blue-500" />
                                        Phone Number
                                    </p>
                                    <p className="text-white">{patient.patient_phone_number}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-500" />
                                        Email
                                    </p>
                                    <p className="text-white">{patient.patient_email || "Not provided"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-red-500" />
                                Emergency Contact
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-sm">Name</p>
                                    <p className="text-white">{patient.patient_emergency_contact_name}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-sm">Phone</p>
                                    <p className="text-white">{patient.patient_emergency_contact_phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                Medical Information
                            </h3>

                            <div className="space-y-1">
                                <p className="text-zinc-400 text-sm">Blood Type</p>
                                <p className="text-white">
                                    <span className="bg-red-900/50 px-2 py-1 rounded text-sm font-medium">
                                        {patient.patient_bloodtype}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    Medical History
                                </p>
                                <div className="bg-zinc-800 p-3 rounded-md text-white">
                                    {patient.patient_medical_history || "No medical history recorded"}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="flex justify-end pt-4 mt-4 border-t border-zinc-700">
                    <p className="text-xs text-zinc-400">Last updated: {format(new Date(), "MMMM d, yyyy")}</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

