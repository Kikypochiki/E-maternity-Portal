"use client"

import * as React from "react"
import { Bell, LayoutDashboard, Users, Hospital, Stethoscope, HeartHandshake} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image";
// This is sample data.
const data = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Patients",
    url: "/admin/patients",
    icon: Users,
  },
  {
    title: "Prenatal Checkups",
    url: "/admin/prenatals",
    icon: HeartHandshake,
  },
  {
    title: "Admissions",
    url: "/admin/admissions",
    icon: Hospital,
  },
  {
    title: "Appointments",
    url: "/admin/appointments",
    icon: Stethoscope,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
  },
]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-1">
          <Image
            src="/icons8-maternity-50.png"
            alt="heart rate"
            width={40}
            height={40}
            className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-"
          />
          <h1 className="text-xl font-semibold tracking-tight pl-1 group-data-[collapsible=icon]:hidden">
            E-Maternity Portal
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={data}/>
      </SidebarContent>
      <SidebarFooter className="">
        <div className="flex items-center gap-2 mb-4 ml-2 mr-2">
          <div className="text-sm group-data-[collapsible=icon]:hidden">E-Maternity Portal</div>
          <div className="text-xs group-data-[collapsible=icon]:hidden">Version 1.0.0</div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
