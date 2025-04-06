"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { cn } from "@/lib/utils"


const formSchema = z.object({
  patient_first_name: z.string().min(2, {
    message: "Firstname must be at least 2 characters.",
  }),
  patient_last_name: z.string().min(2, {
    message: "Lastname must be at least 2 characters.",
  }),
  patient_date_of_birth: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Date of birth must be a valid date.",
  }),
  patient_address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  patient_phone_number: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  patient_email: z
    .string()
    .email({
      message: "Email must be a valid email address.",
    })
    .optional(),
  patient_emergency_contact_name: z.string().min(2, {
    message: "Emergency contact name must be at least 2 characters.",
  }),
  patient_emergency_contact_phone: z.string().min(10, {
    message: "Emergency contact phone number must be at least 10 characters.",
  }),
  patient_bloodtype: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a bloodtype.",
  }),
  patient_medical_history: z.string().optional(),
  patient_status: z.enum(["active", "inactive"], {
    required_error: "Please select a status.",
  }),
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
      patient_first_name: "",
      patient_last_name: "",
      patient_date_of_birth: "",
      patient_address: "",
      patient_phone_number: "",
      patient_email: "",
      patient_emergency_contact_name: "",
      patient_emergency_contact_phone: "",
      patient_bloodtype: undefined,
      patient_medical_history: "",
      patient_status: "active",
    },
  })

  // Auto-refresh after successful submission
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
      const { data: supabaseData, error } = await supabase.from("patient_basic_info").insert([
        {
          patient_first_name: values.patient_first_name,
          patient_last_name: values.patient_last_name,
          patient_date_of_birth: values.patient_date_of_birth,
          patient_address: values.patient_address,
          patient_phone_number: values.patient_phone_number,
          patient_email: values.patient_email,
          patient_emergency_contact_name: values.patient_emergency_contact_name,
          patient_emergency_contact_phone: values.patient_emergency_contact_phone,
          patient_bloodtype: values.patient_bloodtype,
          patient_medical_history: values.patient_medical_history,
          patient_status: values.patient_status,
        },
      ])
      if (error) {
        console.error("Error inserting data:", error.message)
      } else {
        console.log("Data inserted successfully:", supabaseData)
        setIsSubmitted(true)
        // Call the callback immediately to refresh the patient list
        if (onPatientAdded) {
          onPatientAdded()
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Add Patient</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Please fill in the form below to add a new patient to the hospital database.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="w-full h-[400px] p-5">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h2 className="text-2xl font-bold text-center">Patient Added Successfully</h2>
              <p className="text-center">
                The patient information has been successfully added to the database.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jane"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patient_last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dela Cruz"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="patient_date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                  <FormField
                    control={form.control}
                    name="patient_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Baybay City, Leyte"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="09123456789"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patient_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_emergency_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Juan Dela Cruz"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patient_emergency_contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0987654321"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patient_bloodtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Blood Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                                   <FormField
                    control={form.control}
                    name="patient_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" className="text-zinc-300" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  </div>
                  <FormField
                    control={form.control}
                    name="patient_medical_history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any relevant medical history"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end pt-4 mt-4 border-t ">
          <Button
            className="font-semibold py-2 px-4 w-full rounded-md border"
            onClick={() =>
              form.handleSubmit(async (values) => {
                await handleSubmit(values)
              })()
            }
            type="submit"
            disabled={!form.formState.isDirty || isSubmitting || isSubmitted}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                SUBMITTING...
              </>
            ) : (
              "SUBMIT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

