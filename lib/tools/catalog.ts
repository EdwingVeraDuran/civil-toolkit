import { Landmark, Ruler, TrendingUp } from "lucide-react"
import type { ToolInfo } from "@/lib/tools/types"

export const unitConverterInfo: ToolInfo = {
  id: "unit-converter",
  name: "Conversor de unidades",
  description:
    "Convierte entre unidades de longitud, área, volumen, masa, fuerza, presión, ángulo y temperatura.",
  category: "general",
  icon: Ruler,
}

export const beamSizingInfo: ToolInfo = {
  id: "beam-sizing",
  name: "Predimensionado de vigas",
  description:
    "Estima el peralte y el ancho de vigas y losas en una dirección por control de deflexiones.",
  category: "estructuras",
  icon: Landmark,
  reference: "NSR-10, Título C — Concreto estructural",
}

export const slopeCalculatorInfo: ToolInfo = {
  id: "slope-calculator",
  name: "Calculadora de pendientes",
  description:
    "Calcula pendientes, desniveles, ángulos y longitudes inclinadas a partir de desniveles, pendientes o dos cotas.",
  category: "general",
  icon: TrendingUp,
  reference: "Geometría básica — sin verificación normativa",
}

export const TOOL_CATALOG: ToolInfo[] = [
  unitConverterInfo,
  slopeCalculatorInfo,
  beamSizingInfo,
]

export function getToolInfo(id: string): ToolInfo | undefined {
  return TOOL_CATALOG.find((tool) => tool.id === id)
}

export function getToolsByCategory(slug: string): ToolInfo[] {
  return TOOL_CATALOG.filter((tool) => tool.category === slug)
}
