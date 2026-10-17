"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calculator,
  ChevronRight,
  CircleUser,
  Ellipsis,
  FolderKanban,
  HardHat,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Wrench,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import { toolCategories } from "@/lib/navigation"

const activeUser = {
  name: "Edwing Vera",
  role: "Ingeniero Civil",
  initials: "EV",
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <HardHat />
              </div>
              <span className="truncate font-semibold">Civil Toolkit</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  isActive={pathname === "/"}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/proyectos" />}
                  isActive={pathname.startsWith("/proyectos")}
                  tooltip="Proyectos"
                >
                  <FolderKanban />
                  <span>Proyectos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/calculos" />}
                  isActive={pathname.startsWith("/calculos")}
                  tooltip="Cálculos"
                >
                  <Calculator />
                  <span>Cálculos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={<SidebarMenuButton tooltip="Herramientas" />}
                  >
                    <Wrench />
                    <span>Herramientas</span>
                    <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {toolCategories.map((category) => {
                        const href = `/herramientas/${category.slug}`
                        const CategoryIcon = category.icon
                        return (
                          <SidebarMenuSubItem key={category.slug}>
                            <SidebarMenuSubButton
                              render={<Link href={href} />}
                              isActive={pathname === href}
                            >
                              <CategoryIcon />
                              <span>{category.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/historial" />}
                  isActive={pathname.startsWith("/historial")}
                  tooltip="Historial"
                >
                  <History />
                  <span>Historial</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar>
                  <AvatarFallback>{activeUser.initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{activeUser.name}</span>
                  <span className="truncate text-xs">{activeUser.role}</span>
                </div>
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{activeUser.name}</DropdownMenuLabel>
                  <DropdownMenuItem render={<Link href="/perfil" />}>
                    <UserRound />
                    Modificar perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/cuenta" />}>
                    <CircleUser />
                    Configuración de cuenta
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/configuracion" />}>
                    <Settings />
                    Configuración de la aplicación
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      await logout()
                      router.replace("/login")
                    }}
                  >
                    <LogOut />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
