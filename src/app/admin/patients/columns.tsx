"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Patient = {
    last_name: string,
    first_name: string,
    patient_id_provided: string,
    contact_number: string,
}
export const columns: ColumnDef<Patient>[] = [
    {
        accessorKey: "patient_id_provided",
        header: "Patient ID",
        cell: ({ row }) => {
            return <span>{row.getValue("patient_id_provided")}</span>
        },
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
        cell: ({ row }) => {
            return <span>{row.getValue("contact_number")}</span>
        },
    },]