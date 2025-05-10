"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, ChevronDown, ChevronUp, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock } from "lucide-react"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"

interface MedicationsFormProps {
  admissionId: string
  patientId: string
  patientName: string
  onMedicationAdded?: () => void
  trigger: React.ReactNode
}

type Medication = {
  medication_id: string
  admission_id: string
  patient_id: string
  medication: string
  date_to_take: string
  time_to_take: string
  created_at: string
}

const medicationSchema = z.object({
  medication: z.string().min(1, {
    message: "Medication name is required",
  }),
  date_to_take: z.string().min(1, {
    message: "Date to take is required",
  }),
  time_to_take: z.string().min(1, {
    message: "Time to take is required",
  }),
})

export function MedicationsForm({
  admissionId,
  patientId,
  patientName,
  onMedicationAdded,
  trigger,
}: MedicationsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMedicationId, setExpandedMedicationId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [deleteMedicationId, setDeleteMedicationId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPatientDischarged, setIsPatientDischarged] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const form = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      medication: "",
      date_to_take: "",
      time_to_take: "",
    },
  })

  const generateMedicationId = () => {
    const prefix = "MED-"
    const randomNum = Math.floor(Math.random() * 1000000000)
    return `${prefix}${randomNum.toString().padStart(6, "0")}`
  }

  const checkAdmissionStatus = async () => {
    try {
      setIsCheckingStatus(true)
      const { data, error } = await supabase
        .from("Admissions")
        .select("admission_status")
        .eq("admission_id", admissionId)
        .single()

      if (error) {
        console.error("Error checking admission status:", error.message)
        toast("Failed to check admission status. Please try again.")
        return
      }

      if (data && data.admission_status === "Discharged") {
        setIsPatientDischarged(true)
      } else {
        setIsPatientDischarged(false)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred while checking admission status.")
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const fetchMedications = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("Medications")
        .select("*")
        .eq("admission_id", admissionId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching medications:", error.message)
        toast("Failed to fetch medications")
        return
      }

      setMedications(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred while fetching medications")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkAdmissionStatus()
      if (activeTab === "view") {
        fetchMedications()
      }
    }
  }, [isOpen, activeTab, admissionId])

  const handleAddMedication = async (values: z.infer<typeof medicationSchema>) => {
    if (isPatientDischarged) {
      toast("Cannot add medications for discharged patients")
      return
    }

    try {
      setIsProcessing(true)

      // Generate a unique medication ID
      const medicationId = generateMedicationId()

      // Insert new medication
      const { error } = await supabase.from("Medications").insert([
        {
          medication_id: medicationId,
          admission_id: admissionId,
          patient_id: patientId,
          medication: values.medication,
          date_to_take: values.date_to_take,
          time_to_take: values.time_to_take,
        },
      ])

      if (error) {
        console.error("Error adding medication:", error.message)
        toast("Failed to add medication. Please try again.")
        return
      }

      toast("Medication added successfully.")

      // Reset form fields
      form.reset()

      // Refresh the medications list
      fetchMedications()

      // Switch to view tab
      setActiveTab("view")

      // Call the callback if provided
      if (onMedicationAdded) {
        onMedicationAdded()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditMedication = (med: Medication) => {
    if (isPatientDischarged) {
      toast("Cannot edit medications for discharged patients")
      return
    }

    setEditingMedication(med)
    form.reset({
      medication: med.medication,
      date_to_take: med.date_to_take,
      time_to_take: med.time_to_take,
    })
    setActiveTab("edit")
  }

  const handleUpdateMedication = async (values: z.infer<typeof medicationSchema>) => {
    if (isPatientDischarged) {
      toast("Cannot update medications for discharged patients")
      return
    }

    if (!editingMedication) {
      toast("No medication selected for editing")
      return
    }

    try {
      setIsProcessing(true)

      // Update the medication
      const { error } = await supabase
        .from("Medications")
        .update({
          medication: values.medication,
          date_to_take: values.date_to_take,
          time_to_take: values.time_to_take,
        })
        .eq("medication_id", editingMedication.medication_id)

      if (error) {
        console.error("Error updating medication:", error.message)
        toast("Failed to update medication. Please try again.")
        return
      }

      toast("Medication updated successfully.")

      // Reset form fields and editing state
      form.reset()
      setEditingMedication(null)

      // Refresh the medications list
      fetchMedications()

      // Switch to view tab
      setActiveTab("view")
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmDeleteMedication = (medicationId: string) => {
    if (isPatientDischarged) {
      toast("Cannot delete medications for discharged patients")
      return
    }

    setDeleteMedicationId(medicationId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteMedication = async () => {
    if (!deleteMedicationId) return

    try {
      setIsProcessing(true)

      // Delete the medication
      const { error } = await supabase.from("Medications").delete().eq("medication_id", deleteMedicationId)

      if (error) {
        console.error("Error deleting medication:", error.message)
        toast("Failed to delete medication. Please try again.")
        return
      }

      toast("Medication deleted successfully.")
      window.location.reload()

      // Reset delete state
      setDeleteMedicationId(null)
      setIsDeleteDialogOpen(false)

      // Refresh the medications list
      fetchMedications()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleMedicationExpansion = (medicationId: string) => {
    if (expandedMedicationId === medicationId) {
      setExpandedMedicationId(null)
    } else {
      setExpandedMedicationId(medicationId)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const cancelEdit = () => {
    setEditingMedication(null)
    form.reset()
    setActiveTab("view")
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Medications</DialogTitle>
            <DialogDescription>Manage medications for {patientName}</DialogDescription>
          </DialogHeader>

          {isCheckingStatus ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isPatientDischarged && activeTab !== "view" ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Patient Discharged</AlertTitle>
              <AlertDescription>
                This patient has been discharged. New medications cannot be added or modified.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs
              defaultValue="view"
              value={activeTab}
              onValueChange={(value) => {
                if (isPatientDischarged && value !== "view") {
                  toast("Cannot add or edit medications for discharged patients")
                  return
                }
                if (value !== "edit") {
                  setEditingMedication(null)
                  form.reset()
                }
                setActiveTab(value)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">View Medications</TabsTrigger>
                <TabsTrigger value="create" disabled={isPatientDischarged}>
                  Add Medication
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4 flex flex-col">
                {isPatientDischarged && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Patient Discharged</AlertTitle>
                    <AlertDescription>This patient has been discharged. Medications are read-only.</AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : medications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No medications found for this patient.</div>
                ) : (
                  <ScrollArea className={`${isPatientDischarged ? "h-[340px]" : "h-[400px]"} pr-4 `}>
                    <div className="space-y-4">
                      {medications.map((med) => (
                        <Card key={med.medication_id} className="hover:bg-accent/50 transition-colors">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div
                                className="cursor-pointer flex-1"
                                onClick={() => toggleMedicationExpansion(med.medication_id)}
                              >
                                <CardTitle className="text-sm font-medium">{med.medication}</CardTitle>
                                <CardDescription className="text-xs">
                                  Take on: {formatDate(med.date_to_take)} at {med.time_to_take}
                                </CardDescription>
                              </div>
                              <div className="flex space-x-2">
                                {!isPatientDischarged && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditMedication(med)}
                                      className="h-8 w-8"
                                    >
                                      <Pencil className="h-4 w-4 text-blue-600" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => confirmDeleteMedication(med.medication_id)}
                                      className="h-8 w-8"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleMedicationExpansion(med.medication_id)}
                                  className="h-8 w-8"
                                >
                                  {expandedMedicationId === med.medication_id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Toggle</span>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedMedicationId === med.medication_id && (
                            <>
                              <CardContent className="pb-2">
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-semibold">Medication</h4>
                                    <p className="text-sm break-words">{med.medication}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold">Date to Take</h4>
                                    <p className="text-sm">{formatDate(med.date_to_take)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold">Time to Take</h4>
                                    <p className="text-sm">{med.time_to_take}</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="pt-0">
                                <div className="text-xs text-muted-foreground truncate">
                                  Medication ID: {med.medication_id}
                                </div>
                              </CardFooter>
                            </>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="create" className="mt-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddMedication)} className="space-y-4">
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="medication"
                        render={({ field }) => (
                          <FormItem className="grid gap-2">
                            <Label htmlFor="medication">Medication</Label>
                            <FormControl>
                              <Input
                                id="medication"
                                placeholder="Enter medication name"
                                {...field}
                                disabled={isPatientDischarged}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date_to_take"
                        render={({ field }) => (
                          <FormItem className="grid gap-2">
                            <Label htmlFor="date-to-take">Date to Take</Label>
                            <FormControl>
                              <Input
                                id="date-to-take"
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                {...field}
                                disabled={isPatientDischarged}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time_to_take"
                        render={({ field }) => (
                          <FormItem className="grid gap-2">
                            <Label htmlFor="time-to-take">Time to Take</Label>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <FormControl>
                                <Input
                                  id="time-to-take"
                                  {...field}
                                  disabled={isPatientDischarged}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setActiveTab("view")}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isProcessing || isPatientDischarged}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Add Medication"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="edit" className="mt-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdateMedication)} className="space-y-4">
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="medication"
                        render={({ field }) => (
                          <FormItem className="grid gap-2">
                            <Label htmlFor="edit-medication">Medication</Label>
                            <FormControl>
                              <Input
                                id="edit-medication"
                                placeholder="Enter medication name"
                                {...field}
                                disabled={isPatientDischarged}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date_to_take"
                        render={({ field }) => (
                          <FormItem className="grid gap-2">
                            <Label htmlFor="edit-date-to-take">Date to Take</Label>
                            <FormControl>
                              <Input
                                id="edit-date-to-take"
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                {...field}
                                disabled={isPatientDischarged}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time_to_take"
                        render={({ field }) => (
                          <FormItem className="grid gap-2">
                            <Label htmlFor="edit-time-to-take">Time to Take</Label>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <FormControl>
                                <Input
                                  id="edit-time-to-take"
                                  type="time"
                                  {...field}
                                  disabled={isPatientDischarged}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isProcessing || isPatientDischarged}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Update Medication"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteMedicationId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedication}
              disabled={isProcessing}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}