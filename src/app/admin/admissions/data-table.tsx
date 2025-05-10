"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {ArrowLeft, ArrowRight} from "lucide-react"

import {
  type ColumnDef,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<"all" | "admitted" | "discharged">("all")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()

      // Check if any of the specified fields contain the search value
      const lastName = String(row.getValue("last_name") || "").toLowerCase()
      const firstName = String(row.getValue("first_name") || "").toLowerCase()
      const admissionId = String(row.getValue("admission_id") || "").toLowerCase()

      return lastName.includes(searchValue) || firstName.includes(searchValue) || admissionId.includes(searchValue)
    },
  })

  return (
    <div className="w-full space-y-4 p-7">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search Patient..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center ml-4 space-x-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setColumnFilters([])
              setGlobalFilter("")
              setActiveFilter("all")
            }}
            className="px-3"
          >
            All
          </Button>
          <Button
            variant={activeFilter === "admitted" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setColumnFilters([{ id: "admission_status", value: "Admitted" }])
              setActiveFilter("admitted")
            }}
            className="px-3"
          >
            Admitted
          </Button>
          <Button
            variant={activeFilter === "discharged" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setColumnFilters([{ id: "admission_status", value: "Discharged" }])
              setActiveFilter("discharged")
            }}
            className="px-3"
          >
            Discharged
          </Button>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm px-2">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
