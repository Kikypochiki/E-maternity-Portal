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
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, ChevronDown, ChevronUp, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NotesAttachmentFormProps {
  admissionId: string
  patientId: string
  patientName: string
  onNoteAdded?: () => void
  trigger: React.ReactNode
}

type Note = {
  notes_id: string
  admission_id: string
  patient_id: string
  notes_content: string
  created_at: string
}

export function NotesAttachmentForm({
  admissionId,
  patientId,
  patientName,
  onNoteAdded,
  trigger,
}: NotesAttachmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notesContent, setNotesContent] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPatientDischarged, setIsPatientDischarged] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const generateNoteId = () => {
    const prefix = "NOTE-"
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

  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("Notes")
        .select("*")
        .eq("admission_id", admissionId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notes:", error.message)
        toast("Failed to fetch notes")
        return
      }

      setNotes(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred while fetching notes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkAdmissionStatus()
      if (activeTab === "view") {
        fetchNotes()
      }
    }
  }, [isOpen, activeTab, admissionId])

  const handleAddNote = async () => {
    if (isPatientDischarged) {
      toast("Cannot add notes for discharged patients")
      return
    }

    if (!notesContent) {
      toast("Please enter note content")
      return
    }

    try {
      setIsProcessing(true)

      // Generate a unique note ID
      const noteId = generateNoteId()

      // Insert new note
      const { error } = await supabase.from("Notes").insert([
        {
          notes_id: noteId,
          admission_id: admissionId,
          patient_id: patientId,
          notes_content: notesContent,
        },
      ])

      if (error) {
        console.error("Error adding note:", error.message)
        toast("Failed to add note. Please try again.")
        return
      }

      toast("Note added successfully.")

      // Reset form fields
      setNotesContent("")

      // Refresh the notes list
      fetchNotes()

      // Switch to view tab
      setActiveTab("view")

      // Call the callback if provided
      if (onNoteAdded) {
        onNoteAdded()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditNote = (note: Note) => {
    if (isPatientDischarged) {
      toast("Cannot edit notes for discharged patients")
      return
    }

    setEditingNote(note)
    setNotesContent(note.notes_content)
    setActiveTab("edit")
  }

  const handleUpdateNote = async () => {
    if (isPatientDischarged) {
      toast("Cannot update notes for discharged patients")
      return
    }

    if (!editingNote || !notesContent) {
      toast("Please enter note content")
      return
    }

    try {
      setIsProcessing(true)

      // Update the note
      const { error } = await supabase
        .from("Notes")
        .update({
          notes_content: notesContent,
        })
        .eq("notes_id", editingNote.notes_id)

      if (error) {
        console.error("Error updating note:", error.message)
        toast("Failed to update note. Please try again.")
        return
      }

      toast("Note updated successfully.")

      // Reset form fields and editing state
      setNotesContent("")
      setEditingNote(null)

      // Refresh the notes list
      fetchNotes()

      // Switch to view tab
      setActiveTab("view")
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmDeleteNote = (noteId: string) => {
    if (isPatientDischarged) {
      toast("Cannot delete notes for discharged patients")
      return
    }

    setDeleteNoteId(noteId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return

    try {
      setIsProcessing(true)

      // Delete the note
      const { error } = await supabase.from("Notes").delete().eq("notes_id", deleteNoteId)

      if (error) {
        console.error("Error deleting note:", error.message)
        toast("Failed to delete note. Please try again.")
        return
      }

      toast("Note deleted successfully.")
      window.location.reload()

      // Reset delete state
      setDeleteNoteId(null)
      setIsDeleteDialogOpen(false)

      // Refresh the notes list
      fetchNotes()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleNoteExpansion = (noteId: string) => {
    if (expandedNoteId === noteId) {
      setExpandedNoteId(null)
    } else {
      setExpandedNoteId(noteId)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setNotesContent("")
    setActiveTab("view")
  }

  // Function to get the first line or first few characters for preview
  const getContentPreview = (content: string, maxLength = 50) => {
    const firstLine = content.split("\n")[0] || ""
    if (firstLine.length <= maxLength) return firstLine
    return firstLine.substring(0, maxLength) + "..."
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Nurse's/RM Notes</DialogTitle>
            <DialogDescription>Manage notes for {patientName}</DialogDescription>
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
                This patient has been discharged. New notes cannot be added or modified.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs
              defaultValue="view"
              value={activeTab}
              onValueChange={(value) => {
                if (isPatientDischarged && value !== "view") {
                  toast("Cannot add or edit notes for discharged patients")
                  return
                }
                if (value !== "edit") {
                  setEditingNote(null)
                  setNotesContent("")
                }
                setActiveTab(value)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">View Notes</TabsTrigger>
                <TabsTrigger value="create" disabled={isPatientDischarged}>
                  Add Note
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4 flex flex-col">
                {isPatientDischarged && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Patient Discharged</AlertTitle>
                    <AlertDescription>This patient has been discharged. Notes are read-only.</AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No notes found for this patient.</div>
                ) : (
                  <ScrollArea className={`${isPatientDischarged ? "h-[340px]" : "h-[400px]"} pr-4 `}>
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <Card key={note.notes_id} className="hover:bg-accent/50 transition-colors">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="cursor-pointer flex-1" onClick={() => toggleNoteExpansion(note.notes_id)}>
                                <CardTitle className="text-sm font-medium">
                                  {getContentPreview(note.notes_content)}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Created: {formatDate(note.created_at)}
                                </CardDescription>
                              </div>
                              <div className="flex space-x-2">
                                {!isPatientDischarged && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditNote(note)}
                                      className="h-8 w-8"
                                    >
                                      <Pencil className="h-4 w-4 text-blue-600" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => confirmDeleteNote(note.notes_id)}
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
                                  onClick={() => toggleNoteExpansion(note.notes_id)}
                                  className="h-8 w-8"
                                >
                                  {expandedNoteId === note.notes_id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Toggle</span>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedNoteId === note.notes_id && (
                            <>
                              <CardContent className="pb-2">
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-semibold">Note Content</h4>
                                    <p className="text-sm whitespace-pre-wrap">{note.notes_content}</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="pt-0">
                                <div className="text-xs text-muted-foreground truncate">Note ID: {note.notes_id}</div>
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
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="notes-content">Note Content</Label>
                    <Textarea
                      id="notes-content"
                      value={notesContent}
                      onChange={(e) => setNotesContent(e.target.value)}
                      placeholder="Enter note content"
                      rows={8}
                      required
                      disabled={isPatientDischarged}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setActiveTab("view")}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote} disabled={isProcessing || isPatientDischarged}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Add Note"
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="edit" className="mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-notes-content">Note Content</Label>
                    <Textarea
                      id="edit-notes-content"
                      value={notesContent}
                      onChange={(e) => setNotesContent(e.target.value)}
                      placeholder="Enter note content"
                      rows={8}
                      required
                      disabled={isPatientDischarged}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateNote} disabled={isProcessing || isPatientDischarged}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Update Note"
                    )}
                  </Button>
                </DialogFooter>
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
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteNoteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
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