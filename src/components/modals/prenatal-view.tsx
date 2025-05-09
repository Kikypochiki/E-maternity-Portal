"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, Loader2, AlertCircle, Stethoscope, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrenatalInfo {
  id: string
  patient_id: string
  last_menstrual_period: string
  estimated_date_of_confinement: string
  created_at: string
}

interface PatientInfo {
  patient_id: string
  first_name: string
  last_name: string
  middle_initial?: string
  date_of_birth?: string
}

interface DiagnosisInfo {
  id: string
  diagnosis: string
  treatment: string
  created_at: string
}

interface PrenatalViewProps {
  trigger: React.ReactNode
  prenatalId: string
}

const supabase = createClient()

export function PrenatalView({ trigger, prenatalId }: PrenatalViewProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [prenatalData, setPrenatalData] = useState<PrenatalInfo | null>(null)
  const [patientData, setPatientData] = useState<PatientInfo | null>(null)
  const [diagnosisRecords, setDiagnosisRecords] = useState<DiagnosisInfo[]>([])

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchPrenatalData = async () => {
      setIsLoading(true)
      setFetchError(null)

      try {
        // Fetch prenatal record
        const { data: prenatalRecord, error: prenatalError } = await supabase
          .from("Prenatals")
          .select("*")
          .eq("id", prenatalId)
          .single()

        if (prenatalError) {
          console.error("Error fetching prenatal record:", prenatalError)
          setFetchError("Failed to load prenatal data. Please try again.")
          return
        }

        if (prenatalRecord) {
          setPrenatalData(prenatalRecord)

          // Fetch patient information
          const { data: patientRecord, error: patientError } = await supabase
            .from("Patients")
            .select("*")
            .eq("patient_id", prenatalRecord.patient_id)
            .single()

          if (patientError) {
            console.error("Error fetching patient data:", patientError)
            setFetchError("Failed to load patient data. Please try again.")
            return
          }

          if (patientRecord) {
            setPatientData(patientRecord)
          }

          // Fetch diagnosis records
          const { data: diagnosisData, error: diagnosisError } = await supabase
            .from("PrenatalBasicInfo")
            .select("*")
            .eq("prenatal_id", prenatalId)
            .order("created_at", { ascending: false })

          if (diagnosisError) {
            console.error("Error fetching diagnosis data:", diagnosisError)
            setFetchError("Failed to load diagnosis data. Please try again.")
            return
          }

          if (diagnosisData) {
            setDiagnosisRecords(diagnosisData)
          }
        } else {
          setFetchError("Prenatal record not found")
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setFetchError("An unexpected error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrenatalData()
  }, [prenatalId])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-full max-w-md md:max-w-lg overflow-y-auto p-6 rounded-l-xl border-l shadow-lg"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-slate-600">Loading prenatal information...</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-full max-w-md md:max-w-lg overflow-y-auto p-6 rounded-l-xl border-l shadow-lg"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error Loading Data</h3>
            <p className="text-slate-600 text-center mb-6">{fetchError}</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!prenatalData || !patientData) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-full max-w-md md:max-w-lg overflow-y-auto p-6 rounded-l-xl border-l shadow-lg"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Data Found</h3>
            <p className="text-slate-600 text-center mb-6">Could not find the requested prenatal record.</p>
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
        className="w-full max-w-md md:max-w-lg overflow-y-auto p-6 rounded-l-xl border-l shadow-lg"
      >
        <SheetHeader className="space-y-2 mb-6">
          <SheetTitle className="text-2xl font-bold text-slate-800">
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
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-1 text-xs font-medium",
                          "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}
                      >
                        Prenatal Record
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-3 py-1 text-xs font-medium bg-primary/5 text-primary border-primary/20"
                      >
                        ID: {prenatalData.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 mx-auto">
            <TabsTrigger value="basic" className="text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Prenatal Dates
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="text-sm">
              <Stethoscope className="w-4 h-4 mr-2" />
              Diagnosis & Treatment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Prenatal Dates</h4>
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem
                    icon={<Calendar className="text-primary" />}
                    label="Last Menstrual Period"
                    value={formatDate(prenatalData.last_menstrual_period)}
                  />
                  <InfoItem
                    icon={<Calendar className="text-primary" />}
                    label="Estimated Due Date"
                    value={formatDate(prenatalData.estimated_date_of_confinement)}
                  />
                  <InfoItem
                    icon={<Calendar className="text-primary" />}
                    label="Record Created"
                    value={new Date(prenatalData.created_at).toLocaleString()}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnosis">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Diagnosis & Treatment Records
                </h4>
                <ScrollArea className="h-[400px] pr-4">
                  {diagnosisRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ClipboardList className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                      <p className="text-muted-foreground">No diagnosis records found for this prenatal checkup</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {diagnosisRecords.map((record, index) => (
                        <Card key={record.id} className="bg-white border border-slate-100 shadow-sm">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h5 className="font-semibold text-primary">Record #{index + 1}</h5>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(record.created_at).toLocaleString()}
                                </span>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h6 className="text-sm font-medium text-slate-700">Diagnosis</h6>
                                  <p className="text-sm whitespace-pre-wrap text-slate-600">{record.diagnosis}</p>
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium text-slate-700">Treatment</h6>
                                  <p className="text-sm whitespace-pre-wrap text-slate-600">{record.treatment}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
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
