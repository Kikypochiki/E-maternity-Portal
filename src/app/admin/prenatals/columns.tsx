"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Stethoscope, Trash2, Upload} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrenatalDiagnosisForm } from "@/components/modals/prenatal-diagnosis-form"
import { PrenatalView } from "@/components/modals/prenatal-view"
import { PrenatalDeleteForm } from "@/components/modals/prenatal-delete-form"
import { LabFilesUpload } from "@/components/modals/lab-files-upload"

export type Prenatal = {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  last_menstrual_period: string
  estimated_date_of_confinement: string
  created_at: string
}

export const columns: ColumnDef<Prenatal>[] = [
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
    accessorKey: "last_menstrual_period",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Last Menstrual Period
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("last_menstrual_period") as string
      return date ? new Date(date).toLocaleDateString() : "N/A"
    },
  },
  {
    accessorKey: "estimated_date_of_confinement",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Estimated Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("estimated_date_of_confinement") as string
      return date ? new Date(date).toLocaleDateString() : "N/A"
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return date ? new Date(date).toLocaleDateString() : "N/A"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const prenatal = row.original

      return (
        <div className="flex space-x-2">
          <PrenatalView
            trigger={
              <Button variant="ghost" className="hover:relative group">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                  View Details
                </span>
              </Button>
            }
            prenatalId={prenatal.id}
          />

          <PrenatalDiagnosisForm
            prenatalId={prenatal.id}
            patientName={`${prenatal.first_name} ${prenatal.last_name}`}
            trigger={
              <Button variant="ghost" className="hover:relative group">
                <Stethoscope className="h-4 w-4 text-purple-600" />
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                  Add Diagnosis
                </span>
              </Button>
            }
          />

          <PrenatalDeleteForm
            prenatalId={prenatal.id}
            patientId={prenatal.patient_id}
            patientName={`${prenatal.first_name} ${prenatal.last_name}`}
            trigger={
              <Button variant="ghost" className="hover:relative group">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
                  Delete Record
                </span>
              </Button>
            }
            onDeleted={() => {
              window.location.reload()
            }}
          />
            <LabFilesUpload
              patientId={prenatal.patient_id}
              patientName={`${prenatal.first_name} ${prenatal.last_name}`}
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
      )
    },
  },
]
