"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash, ClipboardList, UserMinus, Pill, MoreVertical, FileText, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdmissionDeleteDialog } from "@/components/modals/admission_delete_dialog"
import type { Admission } from "@/app/admin/admissions/columns"
import { AdmissionDischargeForm } from "@/components/modals/admission_discharge_form"
import { AdmissionView } from "@/components/modals/admission_view"
import { DoctorsOrdersForm } from "@/components/modals/doctors_order_form"
import { MedicationsForm } from "@/components/modals/medications_form"
import { NotesAttachmentForm } from "@/components/modals/notes_attachment_form"
import { LabFilesUpload } from "@/components/modals/lab-files-upload"

interface AdmissionGridViewProps {
  data: Admission[]
  onAdmissionDeleted: () => void
}

export function AdmissionGridView({ data, onAdmissionDeleted }: AdmissionGridViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filter data based on search query
  const filteredData = data.filter(
    (admission) =>
      admission.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.admission_id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="w-full space-y-4 p-7">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search Patient..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setCurrentPage(1) // Reset to first page on search
          }}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((admission) => (
            <Card key={admission.admission_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col items-center">
                  {/* Icon and status badge */}
                  <div className="w-full flex justify-between items-center p-4 bg-muted">
                    <ClipboardList className="w-10 h-10 text-primary" strokeWidth={1.5} />
                    <Badge
                      variant={admission.admission_status === "Admitted" ? "default" : "secondary"}
                      className={
                        admission.admission_status === "Admitted"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-gray-800 hover:bg-red-200"
                      }
                    >
                      {admission.admission_status}
                    </Badge>
                  </div>

                  {/* Admission details */}
                  <div className="w-full p-4 space-y-2">
                    <h3 className="font-bold text-lg tracking-wide text-primary">
                      {admission.last_name.toUpperCase()}, {admission.first_name.charAt(0).toUpperCase()}.
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <p>ID: {admission.admission_id}</p>
                      <p>Type: {admission.admission_type || "N/A"}</p>
                      <p>Date: {admission.created_at ? new Date(admission.created_at).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between p-4">
                <AdmissionView
                  admission={admission}
                  patientId={admission.patient_id}
                  trigger={
                    <Button variant="outline" size="sm" className="text-green-600">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  }
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <DoctorsOrdersForm
                        admissionId={admission.admission_id}
                        patientName={`${admission.first_name} ${admission.last_name}`}
                        trigger={
                          <button className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm">
                            <ClipboardList className="h-4 w-4 mr-2 text-purple-600" />
                            Doctor&#39;s Orders
                          </button>
                        }
                        patientId={admission.patient_id}
                      />
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <MedicationsForm
                        admissionId={admission.admission_id}
                        patientName={`${admission.first_name} ${admission.last_name}`}
                        trigger={
                          <button className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm">
                            <Pill className="h-4 w-4 mr-2 text-purple-600" />
                            Medications
                          </button>
                        }
                        patientId={admission.patient_id}
                      />
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <NotesAttachmentForm
                        admissionId={admission.admission_id}
                        patientName={`${admission.first_name} ${admission.last_name}`}
                        trigger={
                          <button className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Notes
                          </button>
                        }
                        patientId={admission.patient_id}
                      />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <AdmissionDischargeForm
                        admissionId={admission.admission_id}
                        patientName={`${admission.first_name} ${admission.last_name}`}
                        trigger={
                          <button className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm">
                            <UserMinus className="h-4 w-4 mr-2 text-blue-600" />
                            Discharge
                          </button>
                        }
                        onPatientDischarged={() => {
                          window.location.reload()
                        }}
                      />
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <LabFilesUpload
                        patientId={admission.patient_id}
                        patientName={`${admission.first_name} ${admission.last_name}`}
                        trigger={
                          <button className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm">
                            <Upload className="h-4 w-4 mr-2 text-purple-600" />
                            Upload Lab Files
                          </button>
                        }
                      />
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-red-50">
                      <AdmissionDeleteDialog
                        admissionId={admission.admission_id}
                        patientName={`${admission.first_name} ${admission.last_name}`}
                        onPatientDeleted={onAdmissionDeleted}
                        trigger={
                          <button className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm text-red-600">
                            <Trash className="h-4 w-4 mr-2 text-red-600" />
                            Delete
                          </button>
                        }
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">No admissions found matching your search.</div>
        )}
      </div>

      {/* Pagination controls */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm px-2">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
