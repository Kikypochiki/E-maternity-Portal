"use client"

import type React from "react"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

const generatePatientId = () => {
  const prefix = "PT-"
  const randomNum = Math.floor(Math.random() * 1000000000)
  return `${prefix}${randomNum.toString().padStart(6, "0")}`
}

const formSchema = z.object({
  last_name: z.string().min(2, {
    message: "Lastname must be at least 2 characters.",
  }),
  first_name: z.string().min(2, {
    message: "Firstname must be at least 2 characters.",
  }),
  middle_initial: z.string().min(1, {
    message: "Middle initial must be at least 1 character.",
  }),
  date_of_birth: z.string().min(1, {
    message: "Date of birth is required.",
  }),
  sex: z.string().min(1, {
    message: "Sex is required.",
  }),
  permanent_address: z.string().min(1, {
    message: "Permanent address is required.",
  }),
  contact_number: z.string().min(11, {
    message: "Contact number is required.",
  }),
  civil_status: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    errorMap: () => ({ message: "Civil status is required." }),
  }),
  religion: z.string().min(1, {
    message: "Religion is required.",
  }),
  birthplace: z.string().min(1, {
    message: "Birthplace is required.",
  }),
  nationality: z.string().min(1, {
    message: "Nationality is required",
  }),
  spouse_name: z.string().optional(),
  patient_id_provided: z.string(),
})

interface PatientAddFormModalProps {
  trigger: React.ReactNode
  onPatientAdded?: () => void
}

export function PatientAddForm({ trigger, onPatientAdded }: PatientAddFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      last_name: "",
      first_name: "",
      middle_initial: "",
      date_of_birth: "",
      sex: "",
      permanent_address: "",
      contact_number: "",
      civil_status: "Single",
      religion: "",
      birthplace: "",
      nationality: "",
      spouse_name: "",
      patient_id_provided: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      form.setValue("patient_id_provided", generatePatientId())
    }
  }, [isOpen, form])

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false)
        form.reset()
        setIsOpen(false)
        if (onPatientAdded) {
          onPatientAdded()
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted, form, onPatientAdded])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      const { data: supabaseData, error } = await supabase.from("Patients").insert([
        {
          ...values,
        },
      ])
      if (error) {
        console.error("Error inserting data:", error.message)
        alert("Failed to submit the form. Please try again.")
      } else {
        console.log("Data inserted successfully:", supabaseData)
        setIsSubmitted(true)
        if (onPatientAdded) {
          onPatientAdded()
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false)
      form.reset()
    }
  }

  return (
    <div>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Fill out the form below to add a new patient to the system.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            {isSubmitted ? (
              <Alert className="bg-green-50 border-green-200 my-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">Patient added successfully!</AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="middle_initial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Initial</FormLabel>
                          <FormControl>
                            <Input placeholder="Middle Initial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Sex" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="contact_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="civil_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Civil Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Civil Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Divorced">Divorced</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <FormControl>
                            <Input placeholder="Religion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="birthplace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birthplace</FormLabel>
                          <FormControl>
                            <Input placeholder="Birthplace" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input placeholder="Nationality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="spouse_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spouse Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Spouse Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="permanent_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Permanent Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
