"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PatientBasicInfoView } from "@/components/modals/patient_basic_info_view"
import { PatientDeleteDialog } from "@/components/modals/patient_delete_dialog"
import { Button } from "@/components/ui/button"
import { Eye, Trash, User } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Patient } from "@/app/admin/patients/columns"
import { Badge } from "@/components/ui/badge"

interface PatientGridViewProps {
    data: Patient[]
    onPatientDeleted: () => void
}

export function PatientGridView({ data, onPatientDeleted }: PatientGridViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    // Filter data based on search query
    const filteredData = data.filter((patient) => patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="w-full space-y-4 p-7">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search Last Name..."
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
                    paginatedData.map((patient) => (
                        <Card 
                            key={patient.patient_id} 
                            className="overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <CardContent className="p-0">
                                <div className="flex flex-col items-center">
                                    {/* Gradient avatar background */}
                                        <User className="w-20 h-20 text-primary" strokeWidth={1.5} />
                                    
                                    {/* Patient name and G/P */}
                                    <div className="w-full p-4 text-center space-y-1">
                                        <h3 className="font-bold text-lg tracking-wide text-primary">
                                            {patient.last_name.toUpperCase()}, {patient.first_name.charAt(0).toUpperCase()}.
                                        </h3>
                                        <Badge variant="outline" className="text-sm font-medium  bg-green-50 text-green-700 border-green-200">
                                            G{patient.gravidity}  P{patient.parity}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between p-0">
                                <div className="grid grid-cols-2 w-full">
                                    <PatientBasicInfoView
                                        trigger={
                                            <Button 
                                                variant="ghost" 
                                                className="rounded-none py-3 h-auto w-full border-r text-green-600"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        }
                                        patient={patient}
                                    />
                                    <PatientDeleteDialog
                                        patientId={patient.patient_id}
                                        patientName={`${patient.first_name} ${patient.last_name}`}
                                        onPatientDeleted={onPatientDeleted}
                                        trigger={
                                                <Button 
                                                        variant="ghost" 
                                                        className="rounded-none py-3 h-auto w-full text-red-600"
                                                >
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
                    <div className="col-span-full text-center py-10">
                        No patients found matching your search.
                    </div>
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
