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
import { motion, AnimatePresence } from "framer-motion"

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
  occupation: z.string().optional(),
  gravidity: z.number()
    .refine((val) => val >= 0, {
      message: "Gravidity must be a positive number.",}),
  parity: z.number()
    .refine((val) => val >= 0, {
      message: "Parity must be a positive number.",}),
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
      occupation: "",
      gravidity: 0,
      parity: 0,
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


  return (
    <div>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-gradient-to-b from-background to-muted/30 p-6 rounded-lg"
          >
          <DialogHeader className="mb-4">
            <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            >
            <DialogTitle className="text-2xl font-bold text-primary">Add New Patient</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill out the form below to add a new patient to the system.
            </DialogDescription>
            </motion.div>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <Alert className="bg-green-50 border-green-200 my-4 shadow-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </motion.div>
              <AlertDescription className="text-green-800 font-medium ml-2">
                Patient added successfully!
              </AlertDescription>
              </Alert>
            </motion.div>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <FormField
                name="first_name"
                render={({ field }) => (
                <FormItem className="transition-all duration-200">
                <FormLabel className="font-medium text-foreground/80">First Name</FormLabel>
                <FormControl>
                  <Input
                  placeholder="First Name"
                  {...field}
                  className="border-input/50 focus:border-primary transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
                </FormItem>
                )}
                />
                <FormField
                name="last_name"
                render={({ field }) => (
                <FormItem className="transition-all duration-200">
                <FormLabel className="font-medium text-foreground/80">Last Name</FormLabel>
                <FormControl>
                  <Input
                  placeholder="Last Name"
                  {...field}
                  className="border-input/50 focus:border-primary transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
                </FormItem>
                )}
                />
                <FormField
                name="middle_initial"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Middle Initial</FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Middle Initial"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Date of Birth</FormLabel>
                    <FormControl>
                    <Input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      {...field}
                      className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                    </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="sex"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Sex</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value || ""}
                    >
                    <SelectTrigger className="border-input/50 focus:border-primary transition-all duration-200">
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
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Contact Number</FormLabel>
                    <FormControl>
                    <Input
                      placeholder="####-###-####"
                      {...field}
                      maxLength={13}
                      pattern="\d{4}-\d{3}-\d{4}"
                      inputMode="numeric"
                      className="border-input/50 focus:border-primary transition-all duration-200"
                      onChange={(e) => {
                      // Only allow numbers and dashes, and auto-insert dashes
                      let value = e.target.value.replace(/[^\d]/g, "");
                      if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4);
                      if (value.length > 8) value = value.slice(0, 8) + "-" + value.slice(8);
                      if (value.length > 13) value = value.slice(0, 13);
                      field.onChange(value);
                      }}
                      value={field.value}
                    />
                    </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="civil_status"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Civil Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-input/50 focus:border-primary transition-all duration-200">
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
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Religion</FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Religion"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="birthplace"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Birthplace</FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Birthplace"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="nationality"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Nationality</FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Nationality"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="spouse_name"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Spouse Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Spouse Name"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="occupation"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Occupation</FormLabel>
                  <FormControl>
                    <Input
                    placeholder="Occupation"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="gravidity"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Gravidity</FormLabel>
                    <FormControl>
                    <Input
                      type="number"
                      placeholder="Gravidity"
                      value={field.value === 0 ? "0" : field.value || ""}
                      onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : Number(val));
                      }}
                      min={0}
                      className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                    </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
                <FormField
                name="parity"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Parity</FormLabel>
                    <FormControl>
                    <Input
                      type="number"
                      placeholder="Parity"
                      value={field.value === 0 ? "0" : field.value || ""}
                      onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : Number(val));
                      }}
                      min={0}
                      className="border-input/50 focus:border-primary transition-all duration-200"
                    />
                    </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                name="permanent_address"
                render={({ field }) => (
                  <FormItem className="transition-all duration-200">
                  <FormLabel className="font-medium text-foreground/80">Permanent Address</FormLabel>
                  <FormControl>
                    <Textarea
                    placeholder="Permanent Address"
                    {...field}
                    className="border-input/50 focus:border-primary transition-all duration-200 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end gap-2 pt-4"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                  ) : (
                  "Submit"
                  )}
                </Button>
                </motion.div>
              </form>
            </Form>
            )}
          </ScrollArea>
          </motion.div>
        </DialogContent>
        </Dialog>
      )}
      </AnimatePresence>
    </div>
  )
}
