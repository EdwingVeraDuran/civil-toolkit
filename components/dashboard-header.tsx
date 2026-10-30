"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getPageTitle } from "@/lib/navigation"

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header
      data-slot="dashboard-header"
      className="flex h-12 shrink-0 items-center gap-2 border-b px-4 print:hidden"
    >
      <SidebarTrigger />
      <Separator orientation="vertical" />
      <span className="text-sm font-medium">{getPageTitle(pathname)}</span>
    </header>
  )
}
