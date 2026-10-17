import {
  Briefcase,
  Calculator,
  Droplets,
  Landmark,
  Layers,
  Ruler,
  Route,
  type LucideIcon,
} from "lucide-react"

export type ToolCategory = {
  slug: string
  label: string
  icon: LucideIcon
}

export const toolCategories: ToolCategory[] = [
  { slug: "general", label: "General", icon: Calculator },
  { slug: "estructuras", label: "Estructuras", icon: Landmark },
  { slug: "aguas", label: "Aguas", icon: Droplets },
  { slug: "vias", label: "Vías", icon: Route },
  { slug: "suelos", label: "Suelos", icon: Layers },
  { slug: "topografia", label: "Topografía", icon: Ruler },
  { slug: "administrativas", label: "Administrativas", icon: Briefcase },
]

export function getToolCategory(slug: string): ToolCategory | undefined {
  return toolCategories.find((category) => category.slug === slug)
}

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/proyectos")) return "Proyectos"
  if (pathname.startsWith("/configuracion")) return "Configuración"
  if (pathname.startsWith("/perfil")) return "Perfil"
  if (pathname.startsWith("/cuenta")) return "Configuración de cuenta"

  const match = pathname.match(/^\/herramientas\/([^/]+)/)
  if (match) {
    return getToolCategory(match[1])?.label ?? "Herramientas"
  }

  if (pathname.startsWith("/herramientas")) return "Herramientas"

  return "Dashboard"
}
