"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar, User, Users, ClipboardList, Clock, Activity, Heart, Home } from "lucide-react"
import { format } from "date-fns"

interface AdmissionHistoryDetailProps {
  admission: {
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
  trigger: React.ReactNode
}

export function AdmissionHistoryDetail({ admission, trigger }: AdmissionHistoryDetailProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200"

    switch (status.toLowerCase()) {
      case "active":
      case "admitted":
        return "bg-green-50 text-green-700 border-green-200"
      case "discharged":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-md md:max-w-xl lg:max-w-2xl overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6 rounded-l-xl border-l shadow-lg"
      >
        <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Admission Details
            </SheetTitle>
          </div>
        </SheetHeader>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="py-6">
          <div className="space-y-8">
            {/* Header Card */}
            <motion.div variants={slideUp}>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">
                          {admission.first_name} {admission.last_name}
                        </h3>
                        <p className="text-sm text-slate-500">ID: {admission.admission_id}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 text-xs font-medium ${getStatusColor(admission.admission_status)}`}
                      >
                        {admission.admission_status || "Unknown Status"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="px-2 py-1 text-xs font-medium bg-violet-50 text-violet-700 border-violet-200"
                      >
                        {admission.admission_type || "Unknown Type"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {admission.service_classification || "Unclassified"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {admission.created_at
                            ? format(new Date(admission.created_at), "MMM d, yyyy • h:mm a")
                            : "Unknown date"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Admission Details */}
            <motion.div className="space-y-4" variants={slideUp}>
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Admission Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem
                  icon={<Calendar className="text-primary" />}
                  label="Admission Date"
                  value={admission.created_at ? format(new Date(admission.created_at), "MMMM d, yyyy • h:mm a") : "N/A"}
                />
                <InfoItem
                  icon={<User className="text-primary" />}
                  label="Referring Personnel"
                  value={admission.referring_personnel || "N/A"}
                />
                <InfoItem
                  icon={<Users className="text-primary" />}
                  label="Attending Clinic Staff"
                  value={admission.attending_clinic_staff || "N/A"}
                />
                <InfoItem
                  icon={<ClipboardList className="text-primary" />}
                  label="PHIC Number"
                  value={admission.phic_number || "N/A"}
                />
              </div>
            </motion.div>

            {/* Diagnosis Information */}
            <motion.div className="space-y-4" variants={slideUp}>
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Diagnosis Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem
                  icon={<Activity className="text-primary" />}
                  label="Admitting Diagnosis"
                  value={admission.admitting_diagnosis || "N/A"}
                />
                {admission.admitting_diagnosis_icd_code && (
                  <InfoItem
                    icon={<ClipboardList className="text-primary" />}
                    label="Admitting Diagnosis ICD Code"
                    value={admission.admitting_diagnosis_icd_code}
                  />
                )}
                <InfoItem
                  icon={<Activity className="text-primary" />}
                  label="Final Diagnosis"
                  value={admission.final_diagnosis || "N/A"}
                />
                {admission.final_diagnosis_icd_code && (
                  <InfoItem
                    icon={<ClipboardList className="text-primary" />}
                    label="Final Diagnosis ICD Code"
                    value={admission.final_diagnosis_icd_code}
                  />
                )}
              </div>
            </motion.div>

            {/* Discharge Information */}
            {admission.discharge_datetime && (
              <motion.div className="space-y-4" variants={slideUp}>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Discharge Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem
                    icon={<Calendar className="text-primary" />}
                    label="Discharge Date"
                    value={format(new Date(admission.discharge_datetime), "MMMM d, yyyy • h:mm a")}
                  />
                  <InfoItem
                    icon={<Clock className="text-primary" />}
                    label="Length of Stay"
                    value={`${admission.length_of_stay_hours} hours`}
                  />
                  <InfoItem
                    icon={<Activity className="text-primary" />}
                    label="Result Status"
                    value={admission.result_status || "N/A"}
                  />
                  <InfoItem
                    icon={<Heart className="text-primary" />}
                    label="Result Condition"
                    value={admission.result_condition || "N/A"}
                  />
                </div>
              </motion.div>
            )}

            {/* Informant Information */}
            <motion.div className="space-y-4" variants={slideUp}>
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Informant Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem
                  icon={<User className="text-primary" />}
                  label="Informant Name"
                  value={admission.informant_name || "N/A"}
                />
                <InfoItem
                  icon={<Users className="text-primary" />}
                  label="Relation to Patient"
                  value={admission.informant_relation_to_patient || "N/A"}
                />
                <InfoItem
                  icon={<Home className="text-primary" />}
                  label="Informant Address"
                  value={admission.informant_address || "N/A"}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
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
