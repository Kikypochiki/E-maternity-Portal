"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

// Update the Notification type to use notif_id instead of id
export type Notification = {
  notif_id: string
  notif_content: string
  created_at: string
}

// Custom function to format date without using date-fns
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    // Format date as "May 6, 2023 at 2:30 PM"
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }

    return date.toLocaleString("en-US", options)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Date error"
  }
}

export const columns: ColumnDef<Notification>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "notif_content",
    header: "Notification",
    cell: ({ row }) => {
      const notification = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{notification.notif_content}</span>
          <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
        </div>
      )
    },
  },
]
