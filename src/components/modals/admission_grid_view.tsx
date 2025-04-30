"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash, ClipboardList, UserMinus} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdmissionDeleteDialog } from "@/components/modals/admission_delete_dialog"
import type { Admission } from "@/app/admin/admissions/columns"
import { AdmissionDischargeForm } from "@/components/modals/admission_discharge_form"
import { AdmissionView } from "@/components/modals/admission_view"

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
          placeholder="Search by last name or admission ID..."
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

              <CardFooter className="flex justify-between p-0">
    <div className="grid grid-cols-3 w-full">
      <AdmissionView
        admission={admission}
        patientId={admission.patient_id}
        trigger={
          <Button variant="ghost" className="rounded-lg py-3 h-auto w-full text-green-600">
          <Eye className="h-4 w-4 mr-2" />
          View
      </Button>
        }
      />
        <AdmissionDischargeForm
                  admissionId={admission.admission_id}
                  patientName={`${admission.first_name} ${admission.last_name}`}
                  trigger={
                    <Button variant="ghost" className="rounded-lg py-3 h-auto w-full text-blue-600">
                    <UserMinus className="h-4 w-4 mr-1" />
                    Discharge
                    </Button>
                  }
                  onPatientDischarged={() => {
                    window.location.reload();
                  }
                  }
                />
        <AdmissionDeleteDialog
            admissionId={admission.admission_id}
            patientName={`${admission.first_name} ${admission.last_name}`}
            onPatientDeleted={onAdmissionDeleted}
            trigger={
                <Button variant="ghost" className="rounded-lg py-3 h-auto w-full text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            }
        />
    </div>
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
