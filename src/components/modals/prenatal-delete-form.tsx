"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"

interface PrenatalDeleteFormProps {
  prenatalId: string
  patientId: string
  patientName: string
  onDeleted?: () => void
  trigger: React.ReactNode
}

export function PrenatalDeleteForm({
  prenatalId,
  patientName,
  onDeleted,
  trigger,
}: PrenatalDeleteFormProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDelete = async () => {
    try {
      setIsProcessing(true)

      // First delete all related diagnosis records
      const { error: diagnosisError } = await supabase.from("PrenatalBasicInfo").delete().eq("id", prenatalId)

      if (diagnosisError) {
        console.error("Error deleting diagnosis records:", diagnosisError)
        toast.error("Failed to delete related diagnosis records")
        return
      }

      // Then delete the prenatal record
      const { error: prenatalError } = await supabase.from("Prenatals").delete().eq("id", prenatalId)

      if (prenatalError) {
        console.error("Error deleting prenatal record:", prenatalError)
        toast.error("Failed to delete prenatal record")
        return
      }

      toast.success("Prenatal record deleted successfully")
      setIsOpen(false)

      if (onDeleted) {
        onDeleted()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Prenatal Record</DialogTitle>
            <DialogDescription>You are about to delete the prenatal record for {patientName}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Trash2 className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Warning</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This action will permanently delete this prenatal record and all associated diagnosis and
                      treatment information. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
