"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrenatalDiagnosisFormProps {
  prenatalId: string
  patientName: string
  onInfoAdded?: () => void
  trigger: React.ReactNode
}

type PrenatalBasicInfo = {
  id: string
  prenatal_id: string
  diagnosis: string
  treatment: string
  created_at: string
}

export function PrenatalDiagnosisForm({
  prenatalId,
  patientName,
  onInfoAdded,
  trigger,
}: PrenatalDiagnosisFormProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")
  const [basicInfoRecords, setBasicInfoRecords] = useState<PrenatalBasicInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const [editingRecord, setEditingRecord] = useState<PrenatalBasicInfo | null>(null)
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchPrenatalInfo = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching prenatal info for prenatal ID:", prenatalId)

      const { data, error } = await supabase
        .from("PrenatalBasicInfo")
        .select("*")
        .eq("prenatal_id", prenatalId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching prenatal info:", error.message)
        toast.error("Failed to fetch prenatal information")
        return
      }

      console.log("Prenatal info fetched:", data?.length || 0)
      setBasicInfoRecords(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred while fetching records")
    } finally {
      setIsLoading(false)
    }
  }

  // When dialog opens, fetch records
  useEffect(() => {
    if (isOpen) {
      fetchPrenatalInfo()
    }
  }, [isOpen])

  // Handle tab changes
  useEffect(() => {
    if (isOpen && activeTab === "view") {
      fetchPrenatalInfo()
    }
  }, [activeTab, isOpen])

  const handleAddInfo = async () => {
    if (!diagnosis || !treatment) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsProcessing(true)

      // Insert new prenatal basic info with prenatal_id instead of id
      const { error } = await supabase.from("PrenatalBasicInfo").insert([
        {
          prenatal_id: prenatalId,
          diagnosis: diagnosis,
          treatment: treatment,
        },
      ])

      if (error) {
        console.error("Error adding prenatal info:", error.message)
        toast.error("Failed to add prenatal information. Please try again.")
        return
      }

      toast.success("Prenatal information added successfully.")

      // Reset form fields
      setDiagnosis("")
      setTreatment("")

      // Refresh the records list
      fetchPrenatalInfo()

      // Switch to view tab
      setActiveTab("view")

      // Call the callback if provided
      if (onInfoAdded) {
        onInfoAdded()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditInfo = (record: PrenatalBasicInfo) => {
    setEditingRecord(record)
    setDiagnosis(record.diagnosis)
    setTreatment(record.treatment)
    setActiveTab("edit")
  }

  const handleUpdateInfo = async () => {
    if (!editingRecord || !diagnosis || !treatment) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsProcessing(true)

      // Update the prenatal basic info
      const { error } = await supabase
        .from("PrenatalBasicInfo")
        .update({
          diagnosis: diagnosis,
          treatment: treatment,
        })
        .eq("id", editingRecord.id)

      if (error) {
        console.error("Error updating prenatal info:", error.message)
        toast.error("Failed to update prenatal information. Please try again.")
        return
      }

      toast.success("Prenatal information updated successfully.")

      // Reset form fields and editing state
      setDiagnosis("")
      setTreatment("")
      setEditingRecord(null)

      // Refresh the records list
      fetchPrenatalInfo()

      // Switch to view tab
      setActiveTab("view")
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmDeleteInfo = (recordId: string) => {
    setDeleteRecordId(recordId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteInfo = async () => {
    if (!deleteRecordId) return

    try {
      setIsProcessing(true)

      // Delete the prenatal basic info
      const { error } = await supabase.from("PrenatalBasicInfo").delete().eq("id", deleteRecordId)

      if (error) {
        console.error("Error deleting prenatal info:", error.message)
        toast.error("Failed to delete prenatal information. Please try again.")
        return
      }

      window.location.reload()
      toast.success("Prenatal information deleted successfully.")

      // Reset delete state
      setDeleteRecordId(null)
      setIsDeleteDialogOpen(false)

      // Refresh the records list
      fetchPrenatalInfo()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleRecordExpansion = (recordId: string) => {
    if (expandedRecordId === recordId) {
      setExpandedRecordId(null)
    } else {
      setExpandedRecordId(recordId)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const cancelEdit = () => {
    setEditingRecord(null)
    setDiagnosis("")
    setTreatment("")
    setActiveTab("view")
  }

  // Render records list
  const renderRecordsList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (basicInfoRecords.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No diagnosis records found for this prenatal checkup.
        </div>
      )
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {basicInfoRecords.map((record, index) => (
            <Card key={record.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="cursor-pointer flex-1" onClick={() => toggleRecordExpansion(record.id)}>
                    <CardTitle className="text-sm font-medium">Diagnosis & Treatment #{index + 1}</CardTitle>
                    <CardDescription className="text-xs">Created: {formatDate(record.created_at)}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditInfo(record)
                      }}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDeleteInfo(record.id)
                      }}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRecordExpansion(record.id)
                      }}
                      className="h-8 w-8"
                    >
                      {expandedRecordId === record.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedRecordId === record.id && (
                <>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold">Diagnosis</h4>
                        <p className="text-sm whitespace-pre-wrap break-words">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Treatment</h4>
                        <p className="text-sm whitespace-pre-wrap break-words">{record.treatment}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="text-xs text-muted-foreground truncate">Record ID: {record.id}</div>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Prenatal Diagnosis & Treatment</DialogTitle>
            <DialogDescription>Manage diagnosis and treatment for {patientName}</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="view"
            value={activeTab}
            onValueChange={(value) => {
              // Reset form state when switching away from edit tab
              if (value !== "edit") {
                setEditingRecord(null)
                setDiagnosis("")
                setTreatment("")
              }

              setActiveTab(value)
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View Records</TabsTrigger>
              <TabsTrigger value="create">Create Record</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-4 flex flex-col">
              {renderRecordsList()}
            </TabsContent>

            <TabsContent value="create" className="mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Textarea
                    id="treatment"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="Enter treatment"
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveTab("view")}>
                  Cancel
                </Button>
                <Button onClick={handleAddInfo} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add Record"
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="edit" className="mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-diagnosis">Diagnosis</Label>
                  <Textarea
                    id="edit-diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-treatment">Treatment</Label>
                  <Textarea
                    id="edit-treatment"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="Enter treatment"
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateInfo} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Update Record"
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prenatal diagnosis and treatment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRecordId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInfo}
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
