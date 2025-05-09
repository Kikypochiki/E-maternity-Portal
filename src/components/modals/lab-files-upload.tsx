"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { Loader2, ChevronDown, ChevronUp, Download, Trash2, Upload, File, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LabFilesUploadProps {
  patientId: string
  patientName: string
  onFileUploaded?: () => void
  trigger: React.ReactNode
}

type LabFile = {
  id: string // Supabase auto-generated ID
  patient_id: string
  file_name: string
  created_at: string
}

const supabase = createClient()

export function LabFilesUpload({ patientId, patientName, onFileUploaded, trigger}: LabFilesUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [labFiles, setLabFiles] = useState<LabFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPatientDischarged] = useState(false)
  const [isCheckingStatus] = useState(false)

  const fetchLabFiles = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching lab files for patient ID:", patientId)

      const { data, error } = await supabase
        .from("LabFiles")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching lab files:", error.message)
        toast("Failed to fetch lab files")
        return
      }

      console.log("Lab files fetched:", data?.length || 0)
      setLabFiles(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred while fetching lab files")
    } finally {
      setIsLoading(false)
    }
  }

 
  // When dialog opens, check status and fetch lab files
  useEffect(() => {
    if (isOpen) {
      const initialize = async () => {
        await fetchLabFiles()
      }
      initialize()
    }
  }, [isOpen])

  // Force view tab for discharged patients
  useEffect(() => {
    if (isPatientDischarged && activeTab !== "view") {
      setActiveTab("view")
    }
  }, [isPatientDischarged])

  // Handle tab changes
  useEffect(() => {
    if (isOpen && activeTab === "view") {
      fetchLabFiles()
    }
  }, [activeTab, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (isPatientDischarged) {
      toast("Cannot upload files for discharged patients")
      return
    }

    if (files.length === 0) {
      toast("Please select a file to upload")
      return
    }

    try {
      setIsProcessing(true)
      setUploadProgress(0)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = file.name
        const filePath = `${patientId}/${fileName}`

        // Upload file to storage
        const { error: uploadError } = await supabase.storage.from("lab.results").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.error("Error uploading file:", uploadError.message)
          toast(`Failed to upload ${fileName}. Please try again.`)
          continue
        }

        // Insert record into LabFiles table with just patient_id and file_name
        const { error: insertError } = await supabase.from("LabFiles").insert([
          {
            patient_id: patientId,
            file_name: fileName,
          },
        ])

        if (insertError) {
          console.error("Error adding lab file record:", insertError.message)
          toast(`Failed to record ${fileName} in database. Please try again.`)
          continue
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }

      toast("Lab files uploaded successfully.")

      // Reset form fields
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refresh the files list
      fetchLabFiles()

      // Switch to view tab
      setActiveTab("view")

      // Call the callback if provided
      if (onFileUploaded) {
        onFileUploaded()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  const confirmDeleteFile = (fileId: string) => {
    if (isPatientDischarged) {
      toast("Cannot delete files for discharged patients")
      return
    }

    setDeleteFileId(fileId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteFile = async () => {
    if (isPatientDischarged) {
      toast("Cannot delete files for discharged patients")
      return
    }

    if (!deleteFileId) return

    try {
      setIsProcessing(true)

      // Find the file to delete
      const fileToDelete = labFiles.find((file) => file.id === deleteFileId)

      if (fileToDelete) {
        // Delete the file from storage
        const filePath = `${patientId}/${fileToDelete.file_name}`
        const { error: storageError } = await supabase.storage.from("lab.results").remove([filePath])

        if (storageError) {
          console.error("Error deleting file from storage:", storageError.message)
          // Continue with database deletion even if storage deletion fails
        }

        // Delete the record from the database
        const { error: dbError } = await supabase.from("LabFiles").delete().eq("id", deleteFileId)

        if (dbError) {
          console.error("Error deleting lab file record:", dbError.message)
          toast("Failed to delete lab file record. Please try again.")
          return
        }

        toast("Lab file deleted successfully.")
        window.location.reload()

        // Reset delete state
        setDeleteFileId(null)
        setIsDeleteDialogOpen(false)

        // Refresh the files list
        fetchLabFiles()
      } else {
        toast("File not found.")
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleFileExpansion = (fileId: string) => {
    if (expandedFileId === fileId) {
      setExpandedFileId(null)
    } else {
      setExpandedFileId(fileId)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from("lab.results").download(filePath)

      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast("Failed to download file. Please try again.")
    }
  }

  // Render files list
  const renderFilesList = () => {
    if (isCheckingStatus) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    return (
      <ScrollArea className={`${isPatientDischarged ? "h-[340px]" : "h-[400px]"} pr-4`}>
        {isPatientDischarged && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Patient Discharged</AlertTitle>
            <AlertDescription>This patient has been discharged. Files can only be viewed.</AlertDescription>
          </Alert>
        )}

        {labFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No lab files found for this patient.</div>
        ) : (
          <div className="space-y-4">
            {labFiles.map((file) => (
              <Card key={file.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="cursor-pointer flex-1" onClick={() => toggleFileExpansion(file.id)}>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium truncate">{file.file_name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Uploaded: {formatDate(file.created_at)}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(`${patientId}/${file.file_name}`, file.file_name)
                        }}
                        className="h-8 w-8"
                      >
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">Download</span>
                      </Button>
                      {!isPatientDischarged && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDeleteFile(file.id)
                          }}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFileExpansion(file.id)
                        }}
                        className="h-8 w-8"
                      >
                        {expandedFileId === file.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedFileId === file.id && (
                  <>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-semibold">File Details</h4>
                          <p className="text-sm">Uploaded on {formatDate(file.created_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="text-xs text-muted-foreground truncate">File ID: {file.id}</div>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    )
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Lab Results</DialogTitle>
            <DialogDescription>Upload and manage lab results for {patientName}</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="view"
            value={activeTab}
            onValueChange={(value) => {
              // Only allow switching to upload tab if patient is not discharged
              if (isPatientDischarged && value !== "view") {
                toast("Cannot upload files for discharged patients")
                return
              }
              setActiveTab(value)
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View Files</TabsTrigger>
              <TabsTrigger value="upload" disabled={isPatientDischarged}>
                Upload Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-4 flex flex-col">
              {renderFilesList()}
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">Select Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    multiple
                  />
                  {files.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {files.length} file(s) selected: {files.map((f) => f.name).join(", ")}
                    </div>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveTab("view")}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isProcessing || files.length === 0}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </>
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
              This action cannot be undone. This will permanently delete the lab file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFileId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
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
