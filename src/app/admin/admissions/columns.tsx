"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Trash2, UserMinus, Stethoscope, Pill, ClipboardList, Upload} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdmissionDeleteDialog } from "@/components/modals/admission_delete_dialog"
import { AdmissionDischargeForm } from "@/components/modals/admission_discharge_form"
import { AdmissionView } from "@/components/modals/admission_view"
import { DoctorsOrdersForm } from "@/components/modals/doctors_order_form"
import { MedicationsForm } from "@/components/modals/medications_form"
import { NotesAttachmentForm } from "@/components/modals/notes_attachment_form"
import { LabFilesUpload } from "@/components/modals/lab-files-upload"

export type Admission = {
  admission_id: string
  patient_id: string
  admission_status: string
  first_name: string
  last_name: string
  admission_type?: string
  referring_personnel?: string
  service_classification?: string
  phic_number?: string
  informant_name?: string
  informant_relation_to_patient?: string
  informant_address?: string
  admitting_diagnosis?: string
  admitting_diagnosis_icd_code?: string
  attending_clinic_staff?: string
  created_at?: string
}

export const columns: ColumnDef<Admission>[] = [
  {
    accessorKey: "admission_id",
    header: "Admission ID",
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "admission_status",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("admission_status") as string

        return (
        <Badge
          variant={status === "Admitted" ? "default" : "secondary"}
          className={
          status === "Admitted"
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-gray-800 hover:bg-red-200"
          }
        >
          {status}
        </Badge>
        )
      },
      sortingFn: (rowA, rowB, columnId) => {
        const statusOrder = { "Admitted": 0, "Discharged": 1 }
        const getStatusKey = (value: unknown): "Admitted" | "Discharged" =>
          value === "Admitted" ? "Admitted" : "Discharged";
        const a = statusOrder[getStatusKey(rowA.getValue(columnId))];
        const b = statusOrder[getStatusKey(rowB.getValue(columnId))];
        return a - b
            },
          },
          {
            accessorKey: "created_at",
            header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date Admitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
            ),
            cell: ({ row }) => {
        const date = row.getValue("created_at") as string
        return date ? new Date(date).toLocaleDateString() : "N/A"
            },
            sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string | undefined
        const b = rowB.getValue(columnId) as string | undefined
        if (!a && !b) return 0
        if (!a) return 1
        if (!b) return -1
        return new Date(a).getTime() - new Date(b).getTime()
            },
          },
          {
            id: "actions",
            cell: ({ row }) => {
      const admission = row.original

      return (
        <div className="flex space-x-2">
          <div>
            <AdmissionView
              trigger={
                <Button variant="ghost" className="hover:relative group">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                    View Details
                  </span>
                </Button>
              }
              admission={admission}
              patientId={admission.patient_id}
            />
          </div>
          <div>
            <AdmissionDeleteDialog
              admissionId={admission.admission_id}
              patientName={`${admission.first_name} ${admission.last_name}`}
              trigger={
                <Button variant="ghost" className="hover:relative group">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                    Delete
                  </span>
                </Button>
              }
              onPatientDeleted={() => {
                window.location.reload()
              }}
            />
          </div>
          <div>
            <AdmissionDischargeForm
              admissionId={admission.admission_id}
              patientName={`${admission.first_name} ${admission.last_name}`}
              trigger={
                <Button variant="ghost" className="hover:relative group">
                  <UserMinus className="h-4 w-4 text-purple-600" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                    Discharge
                  </span>
                </Button>
              }
              onPatientDischarged={() => {
                window.location.reload()
              }}
            />
          </div>
          <div>
            <DoctorsOrdersForm
              admissionId={admission.admission_id}
              patientId={admission.patient_id}
              patientName={`${admission.first_name} ${admission.last_name}`}
              trigger={
                <Button variant="ghost" className="hover:relative group">
                  <Stethoscope className="h-4 w-4 text-purple-600" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                    Doctor&#39;s Order
                  </span>
                </Button>
              }
            />
          </div>
          <div>
            <MedicationsForm
              admissionId={admission.admission_id}
              patientId={admission.patient_id}
              patientName={`${admission.first_name} ${admission.last_name}`}
              trigger={
                <Button variant="ghost" className="hover:relative group">
                  <Pill className="h-4 w-4 text-purple-600" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                    Medications
                  </span>
                </Button>
              }
            />
          </div>
          <div>
            <NotesAttachmentForm
            admissionId={admission.admission_id}
            patientId={admission.patient_id}
            patientName={`${admission.first_name} ${admission.last_name}`}
            trigger={
              <Button variant="ghost" className="hover:relative group">
                <ClipboardList className="h-4 w-4 text-purple-600" />
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                  Notes
                </span>
              </Button>
            }
            />
          </div>
          <div>
            <LabFilesUpload
              patientId={admission.patient_id}
              patientName={`${admission.first_name} ${admission.last_name}`}
              trigger={
                <Button variant="ghost" className="hover:relative group">
                  <Upload className="h-4 w-4 text-purple-600" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                    Upload Lab Files
                  </span>
                </Button>
              }
            />
          </div>
        </div>
      )
    },
  },
]