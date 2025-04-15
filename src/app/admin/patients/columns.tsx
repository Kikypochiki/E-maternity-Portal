"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { PatientDeleteDialog } from "@/components/modals/patient_delete_dialog"
import PatientBasicInfoView from "@/components/modals/patient_basic_info_view"
import {Eye} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
        accessorKey: "contact_number",
        header: "Contact Number",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const patient = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(patient.patient_id)}
              >
              Copy Patient Account ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <PatientBasicInfoView 
              trigger={
               <Button
               variant="ghost" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                View Patient</Button>
              }
              patient={patient}
              onFetchData={() => {
                console.log("Fetching patient data...");
              }}/>
              <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                <PatientDeleteDialog 
              patientId={patient.patient_id} 
              patientName={`${patient.first_name} ${patient.last_name}`}
              onPatientDeleted={() => {
                window.location.reload();
              }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]