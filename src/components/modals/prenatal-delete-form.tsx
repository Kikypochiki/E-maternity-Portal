"use client"

import type React from "react"

import { useState } from "react"
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
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PrenatalDeleteFormProps {
  prenatalId: string
  patientId?: string
  patientName: string
  onDeleted?: () => void
  trigger: React.ReactNode
}

export function PrenatalDeleteForm({ prenatalId, patientName, onDeleted, trigger }: PrenatalDeleteFormProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // First delete all related diagnosis records
      const { error: diagnosisError } = await supabase.from("PrenatalBasicInfo").delete().eq("id", prenatalId)

      if (diagnosisError) {
        console.error("Error deleting diagnosis records:", diagnosisError)
        toast("Failed to delete related diagnosis records. Please try again.")
        return
      }

      // Then delete the prenatal record
      const { error: prenatalError } = await supabase.from("Prenatals").delete().eq("id", prenatalId)

      if (prenatalError) {
        console.error("Error deleting prenatal record:", prenatalError)
        toast("Failed to delete prenatal record. Please try again.")
        return
      }

      toast("Prenatal record has been deleted successfully.")

      if (onDeleted) {
        onDeleted()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prenatal Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {patientName}&#39;s prenatal record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
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
