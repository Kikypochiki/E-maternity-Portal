"use client"

import * as React from "react"
import { Bell, LayoutDashboard, Inbox, User, Settings, Stethoscope, CircleHelp} from "lucide-react"

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
    url: "#",
    icon: LayoutDashboard,
  },
  {
    title: "On-call",
    url: "#",
    icon: Stethoscope,
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "#",
    icon: User,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Help",
    url: "#",
    icon: CircleHelp,
  },
]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-sidebar">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <Image src="/heart-rate.png" alt="heart rate" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-lg font-semibold tracking-tight pl-3">
            E-Maternity Portal
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={data} />
      </SidebarContent>
      <SidebarFooter className="">
        <div className="flex items-center gap-2">
          <div className="text-sm group-data-[collapsible=icon]:hidden">E-Maternity Portal</div>
          <div className="text-xs group-data-[collapsible=icon]:hidden">Version 1.0.0</div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
