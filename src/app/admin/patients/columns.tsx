"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientDeleteDialog } from "@/components/modals/patient_delete_dialog"
import { PatientBasicInfoView } from "@/components/modals/patient_basic_info_view"
import {Eye} from "lucide-react"

import Patient from "@/app/patient/page"

export type Patient = {
  patient_id: string
  patient_id_provided: string
  first_name: string
  last_name: string
  middle_initial?: string
  date_of_birth: string
  permanent_address?: string
  contact_number?: string
  civil_status?: string
  religion?: string
  birthplace?: string
  nationality?: string
  spouse_name?: string
  gravidity?: number
  parity?: number
}
export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "patient_id_provided",
    header: "Patient ID",
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
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
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Last Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
      },
  },
  {
    accessorKey: "gravidity",
    header: "Gravidity",
  },
  {
    accessorKey: "parity",
    header: "Parity",
  },
  {
    accessorKey: "contact_number",
    header: "Contact Number",
  },
  {
    id: "actions",
    cell: ({ row }) => {
    const patient = row.original
    return (
      <div className="flex space-x-2">
      <PatientBasicInfoView
        trigger={
        <Button variant="ghost" className="hover:relative group">
        <Eye className="h-4 w-4 text-green-600" />
        <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
          View Patient
        </span>
        </Button>
        }
        patient={patient}
      />
      <PatientDeleteDialog
        patientId={patient.patient_id}
        patientName={`${patient.first_name} ${patient.last_name}`}
        onPatientDeleted={() => {
        window.location.reload();
        }}
        trigger={
        <Button variant="ghost" className="hover:relative group">
        <Trash2 className="h-4 w-4 text-red-600" />
        <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-primary text-white text-xs rounded px-2 py-1">
          Delete Patient
        </span>
        </Button>
    }
      />
      </div>
    )
    },
  },
  ]