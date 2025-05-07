"use client"

import { SignupForm } from "@/components/signup-form"
import { SignupFormAdmin } from "@/components/signup-form-admin"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function Page() {
  const [activeTab, setActiveTab] = useState("patient")

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl">
        <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="patient">Patient Signup</TabsTrigger>
            <TabsTrigger value="admin">Admin Signup</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <SignupForm />
          </TabsContent>

          <TabsContent value="admin">
            <SignupFormAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
