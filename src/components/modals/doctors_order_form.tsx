"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, ChevronDown, ChevronUp, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DoctorsOrderFormProps {
  admissionId: string
  patientId: string
  patientName: string
  onOrderAdded?: () => void
  trigger: React.ReactNode
}

type DoctorsOrder = {
  order_id: string
  admission_id: string
  patient_id: string
  progress_notes: string
  doctors_order: string
  created_at: string
}

export function DoctorsOrdersForm({
  admissionId,
  patientId,
  patientName,
  onOrderAdded,
  trigger,
}: DoctorsOrderFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressNotes, setProgressNotes] = useState("")
  const [doctorsOrder, setDoctorsOrder] = useState("")
  const [orders, setOrders] = useState<DoctorsOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const [editingOrder, setEditingOrder] = useState<DoctorsOrder | null>(null)
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPatientDischarged, setIsPatientDischarged] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const generateOrderId = () => {
    const prefix = "ORD-"
    const randomNum = Math.floor(Math.random() * 1000000000)
    return `${prefix}${randomNum.toString().padStart(6, "0")}`
  }

  const checkAdmissionStatus = async () => {
    try {
      setIsCheckingStatus(true)
      const { data, error } = await supabase
        .from("Admissions")
        .select("admission_status")
        .eq("admission_id", admissionId)
        .single()

      if (error) {
        console.error("Error checking admission status:", error.message)
        toast("Failed to check admission status. Please try again.")
        return
      }

      // Set discharge status and ensure we're on the view tab if discharged
      if (data && data.admission_status === "Discharged") {
        setIsPatientDischarged(true)
        // Force view tab for discharged patients
        setActiveTab("view")
      } else {
        setIsPatientDischarged(false)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred while checking admission status.")
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching orders for admission ID:", admissionId)

      const { data, error } = await supabase
        .from("DoctorsOrders")
        .select("*")
        .eq("admission_id", admissionId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching doctor's orders:", error.message)
        toast("Failed to fetch doctor's orders")
        return
      }

      console.log("Orders fetched:", data?.length || 0)
      setOrders(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred while fetching orders")
    } finally {
      setIsLoading(false)
    }
  }

  // When dialog opens, check status and fetch orders
  useEffect(() => {
    if (isOpen) {
      const initialize = async () => {
        await checkAdmissionStatus()
        await fetchOrders()
      }
      initialize()
    }
  }, [isOpen])

  // Handle tab changes
  useEffect(() => {
    if (isOpen && activeTab === "view") {
      fetchOrders()
    }
  }, [activeTab, isOpen])

  // Force view tab for discharged patients
  useEffect(() => {
    if (isPatientDischarged && activeTab !== "view") {
      setActiveTab("view")
    }
  }, [isPatientDischarged])

  const handleAddOrder = async () => {
    if (isPatientDischarged) {
      toast("Cannot add orders for discharged patients")
      return
    }

    if (!progressNotes || !doctorsOrder) {
      toast("Please fill in all required fields")
      return
    }

    try {
      setIsProcessing(true)

      // Generate a unique order ID
      const orderId = generateOrderId()

      // Insert new doctor's order
      const { error } = await supabase.from("DoctorsOrders").insert([
        {
          order_id: orderId,
          admission_id: admissionId,
          patient_id: patientId,
          progress_notes: progressNotes,
          doctors_order: doctorsOrder,
        },
      ])

      if (error) {
        console.error("Error adding doctor's order:", error.message)
        toast("Failed to add doctor's order. Please try again.")
        return
      }

      toast("Doctor's order added successfully.")

      // Reset form fields
      setProgressNotes("")
      setDoctorsOrder("")

      // Refresh the orders list
      fetchOrders()

      // Switch to view tab
      setActiveTab("view")

      // Call the callback if provided
      if (onOrderAdded) {
        onOrderAdded()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditOrder = (order: DoctorsOrder) => {
    if (isPatientDischarged) {
      toast("Cannot edit orders for discharged patients")
      return
    }

    setEditingOrder(order)
    setProgressNotes(order.progress_notes)
    setDoctorsOrder(order.doctors_order)
    setActiveTab("edit")
  }

  const handleUpdateOrder = async () => {
    if (isPatientDischarged) {
      toast("Cannot update orders for discharged patients")
      return
    }

    if (!editingOrder || !progressNotes || !doctorsOrder) {
      toast("Please fill in all required fields")
      return
    }

    try {
      setIsProcessing(true)

      // Update the doctor's order
      const { error } = await supabase
        .from("DoctorsOrders")
        .update({
          progress_notes: progressNotes,
          doctors_order: doctorsOrder,
        })
        .eq("order_id", editingOrder.order_id)

      if (error) {
        console.error("Error updating doctor's order:", error.message)
        toast("Failed to update doctor's order. Please try again.")
        return
      }

      toast("Doctor's order updated successfully.")

      // Reset form fields and editing state
      setProgressNotes("")
      setDoctorsOrder("")
      setEditingOrder(null)

      // Refresh the orders list
      fetchOrders()

      // Switch to view tab
      setActiveTab("view")
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmDeleteOrder = (orderId: string) => {
    if (isPatientDischarged) {
      toast("Cannot delete orders for discharged patients")
      return
    }

    setDeleteOrderId(orderId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return

    try {
      setIsProcessing(true)

      // Delete the doctor's order
      const { error } = await supabase.from("DoctorsOrders").delete().eq("order_id", deleteOrderId)

      if (error) {
        console.error("Error deleting doctor's order:", error.message)
        toast("Failed to delete doctor's order. Please try again.")
        return
      }

      toast("Doctor's order deleted successfully.")

      // Reset delete state
      setDeleteOrderId(null)
      setIsDeleteDialogOpen(false)
      window.location.reload();

      // Refresh the orders list
      fetchOrders()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const cancelEdit = () => {
    setEditingOrder(null)
    setProgressNotes("")
    setDoctorsOrder("")
    setActiveTab("view")
  }

  // Render orders list
  const renderOrdersList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (orders.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No orders found for this patient.</div>
    }

    return (
      <ScrollArea className={`${isPatientDischarged ? "h-[340px]" : "h-[400px]"} pr-4`}>
        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card key={order.order_id} className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="cursor-pointer flex-1" onClick={() => toggleOrderExpansion(order.order_id)}>
                    <CardTitle className="text-sm font-medium">Order #{index + 1}</CardTitle>
                    <CardDescription className="text-xs">Created: {formatDate(order.created_at)}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {!isPatientDischarged && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditOrder(order)
                          }}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDeleteOrder(order.order_id)
                          }}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleOrderExpansion(order.order_id)
                      }}
                      className="h-8 w-8"
                    >
                      {expandedOrderId === order.order_id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedOrderId === order.order_id && (
                <>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold">Progress Notes</h4>
                        <p className="text-sm whitespace-pre-wrap break-words">{order.progress_notes}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Doctor&apos;s Order</h4>
                        <p className="text-sm whitespace-pre-wrap break-words">{order.doctors_order}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="text-xs text-muted-foreground truncate">Order ID: {order.order_id}</div>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Doctor&apos;s Orders</DialogTitle>
            <DialogDescription>Manage doctor&apos;s order for {patientName}</DialogDescription>
          </DialogHeader>

          {isCheckingStatus ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs
              defaultValue="view"
              value={activeTab}
              onValueChange={(value) => {
                // Only allow switching to non-view tabs if patient is not discharged
                if (isPatientDischarged && value !== "view") {
                  toast("Cannot add or edit orders for discharged patients")
                  return
                }

                // Reset form state when switching away from edit tab
                if (value !== "edit") {
                  setEditingOrder(null)
                  setProgressNotes("")
                  setDoctorsOrder("")
                }

                setActiveTab(value)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">View Orders</TabsTrigger>
                <TabsTrigger value="create" disabled={isPatientDischarged}>
                  Create Order
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4 flex flex-col">
                {isPatientDischarged && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Patient Discharged</AlertTitle>
                    <AlertDescription>This patient has been discharged. Orders can&apos;t be viewed</AlertDescription>
                  </Alert>
                )}

                {renderOrdersList()}
              </TabsContent>

              <TabsContent value="create" className="mt-4">
                {isPatientDischarged && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Patient Discharged</AlertTitle>
                    <AlertDescription>
                      This patient has been discharged. New orders cannot be added or modified.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="progress-notes">Progress Notes</Label>
                    <Textarea
                      id="progress-notes"
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      placeholder="Enter progress notes"
                      className="min-h-[100px]"
                      required
                      disabled={isPatientDischarged}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="doctors-order">Doctor&apos;s Order</Label>
                    <Textarea
                      id="doctors-order"
                      value={doctorsOrder}
                      onChange={(e) => setDoctorsOrder(e.target.value)}
                      placeholder="Enter doctor's order"
                      className="min-h-[100px]"
                      required
                      disabled={isPatientDischarged}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setActiveTab("view")}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOrder} disabled={isProcessing || isPatientDischarged}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Add Order"
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="edit" className="mt-4">
                {isPatientDischarged && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Patient Discharged</AlertTitle>
                    <AlertDescription>This patient has been discharged. Orders cannot be modified.</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-progress-notes">Progress Notes</Label>
                    <Textarea
                      id="edit-progress-notes"
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      placeholder="Enter progress notes"
                      className="min-h-[100px]"
                      required
                      disabled={isPatientDischarged}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-doctors-order">Doctor&apos;s Order</Label>
                    <Textarea
                      id="edit-doctors-order"
                      value={doctorsOrder}
                      onChange={(e) => setDoctorsOrder(e.target.value)}
                      placeholder="Enter doctor's order"
                      className="min-h-[100px]"
                      required
                      disabled={isPatientDischarged}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateOrder} disabled={isProcessing || isPatientDischarged}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Update Order"
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the doctor&apos;s order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOrderId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isProcessing}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}