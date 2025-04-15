"use client"

import type React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Home, Phone, User, Users, Heart, Globe, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"

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
}

interface PatientBasicInfoViewProps {
  trigger: React.ReactNode
  patient: Patient
  onFetchData: () => void
}

const MotionCard = motion(Card)

export default function PatientBasicInfoSheet({ trigger, patient }: PatientBasicInfoViewProps) {
  // Format date of birth if it's a valid date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? dateString : format(date, "MMMM d, yyyy")
    } catch {
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
    } catch {
      return "N/A"
    }
  }

  const InfoItem = ({ label, value, icon }: { label: string; value: string | undefined; icon?: React.ReactNode }) => (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="font-medium text-foreground">{value || "Not provided"}</p>
    </div>
  )

return (
    <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="sm:max-w-2xl h-screen flex flex-col bg-gradient-to-b from-background to-background/95 border-l">
            <SheetHeader className="pb-4 relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/5 blur-xl" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2.5 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <SheetTitle className="text-xl font-bold">{`${patient.first_name} ${patient.last_name}`}</SheetTitle>
                    </div>

                    <SheetDescription className="text-sm mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                            ID: {patient.patient_id_provided}
                        </Badge>
                        <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                            Age: {calculateAge(patient.date_of_birth)}
                        </Badge>
                    </SheetDescription>
                </div>

                <Separator className="mt-4" />
            </SheetHeader>

            <ScrollArea className="w-full flex-1 h-full overflow-auto px-5">
                <div className="space-y-8 py-2">
                    {/* Personal Information */}
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-primary/10 shadow-sm overflow-hidden"
                    >
                        <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                            <h3 className="text-base font-medium flex items-center gap-2 text-primary">
                                <Users className="h-4 w-4" />
                                Personal Information
                            </h3>
                        </div>
                        <CardContent className="p-4 grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="First Name" value={patient.first_name} />
                                <InfoItem label="Last Name" value={patient.last_name} />
                            </div>

                            <InfoItem
                                label="Date of Birth"
                                value={formatDate(patient.date_of_birth)}
                                icon={<Calendar className="h-4 w-4 text-primary" />}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {patient.nationality && (
                                    <InfoItem
                                        label="Nationality"
                                        value={patient.nationality}
                                        icon={<Globe className="h-4 w-4 text-primary" />}
                                    />
                                )}

                                {patient.civil_status && (
                                    <InfoItem
                                        label="Civil Status"
                                        value={patient.civil_status}
                                        icon={<Heart className="h-4 w-4 text-primary" />}
                                    />
                                )}
                            </div>

                            {patient.religion && (
                                <InfoItem
                                    label="Religion"
                                    value={patient.religion}
                                    icon={<BookOpen className="h-4 w-4 text-primary" />}
                                />
                            )}

                            {patient.spouse_name && (
                                <InfoItem
                                    label="Spouse Name"
                                    value={patient.spouse_name}
                                    icon={<Users className="h-4 w-4 text-primary" />}
                                />
                            )}
                        </CardContent>
                    </MotionCard>

                    {/* Contact Information */}
                    <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="border border-primary/10 shadow-sm overflow-hidden"
                    >
                        <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                            <h3 className="text-base font-medium flex items-center gap-2 text-primary">
                                <Phone className="h-4 w-4" />
                                Contact Information
                            </h3>
                        </div>
                        <CardContent className="p-4 grid gap-4">
                            {patient.permanent_address && (
                                <InfoItem
                                    label="Address"
                                    value={patient.permanent_address}
                                    icon={<Home className="h-4 w-4 text-primary" />}
                                />
                            )}

                            <InfoItem
                                label="Phone Number"
                                value={patient.contact_number}
                                icon={<Phone className="h-4 w-4 text-primary" />}
                            />
                        </CardContent>
                    </MotionCard>
                </div>
            </ScrollArea>

            <SheetFooter className="flex justify-between items-center pt-4 mt-2 border-t">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <p className="text-xs text-muted-foreground">Last updated: {format(new Date(), "MMMM d, yyyy")}</p>
                <div className="w-2 h-2 rounded-full bg-primary/40" />
            </SheetFooter>
        </SheetContent>
    </Sheet>
)
}
