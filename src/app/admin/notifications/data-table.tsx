"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import type { Notification } from "./columns"
import {ArrowLeft, ArrowRight} from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onDeleteSelected: (selectedRows: Notification[]) => void
}

export function DataTable<TData, TValue>({ columns, data, onDeleteSelected }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const handleDeleteSelected = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original as Notification)

    if (selectedRows.length === 0) return

    onDeleteSelected(selectedRows)
    table.resetRowSelection()
  }

  return (
    <div>
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder="Filter notifications..."
          value={(table.getColumn("notif_content")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("notif_content")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No notifications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
