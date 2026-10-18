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
import { getToolInfo } from "@/lib/tools/catalog"

export type ToolCategory = {
  slug: string
  label: string
  icon: LucideIcon
}

export const toolCategories = [
  { slug: "general", label: "General", icon: Calculator },
  { slug: "estructuras", label: "Estructuras", icon: Landmark },
  { slug: "aguas", label: "Aguas", icon: Droplets },
  { slug: "vias", label: "Vías", icon: Route },
  { slug: "suelos", label: "Suelos", icon: Layers },
  { slug: "topografia", label: "Topografía", icon: Ruler },
  { slug: "administrativas", label: "Administrativas", icon: Briefcase },
] as const satisfies readonly ToolCategory[]

export type ToolCategorySlug = (typeof toolCategories)[number]["slug"]

export function getToolCategory(slug: string): ToolCategory | undefined {
  return toolCategories.find((category) => category.slug === slug)
}

export function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/calculos")) return "Cálculos"
  if (pathname.startsWith("/historial")) return "Historial"
  if (pathname.startsWith("/proyectos")) return "Proyectos"
  if (pathname.startsWith("/configuracion")) return "Configuración"
  if (pathname.startsWith("/perfil")) return "Mi Cuenta"

  const toolMatch = pathname.match(/^\/herramientas\/[^/]+\/([^/]+)/)
  if (toolMatch) {
    const tool = getToolInfo(toolMatch[1])
    if (tool) {
      return tool.name
    }
  }

  const categoryMatch = pathname.match(/^\/herramientas\/([^/]+)/)
  if (categoryMatch) {
    const category = getToolCategory(categoryMatch[1])
    if (category) {
      return category.label
    }
  }

  if (pathname.startsWith("/herramientas")) return "Herramientas"

  return "Dashboard"
}
