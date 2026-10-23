import {
  ChartSpline,
  Combine,
  Compass,
  Landmark,
  LandPlot,
  Ruler,
  Scale,
  Shapes,
  TrendingUp,
} from "lucide-react"
import type { ToolInfo } from "@/lib/tools/types"

export const unitConverterInfo: ToolInfo = {
  id: "unit-converter",
  name: "Conversor de unidades",
  description:
    "Convierte entre unidades de longitud, área, volumen, masa, fuerza, presión, peso unitario, ángulo y temperatura.",
  category: "general",
  icon: Ruler,
}

export const areaCalculatorInfo: ToolInfo = {
  id: "area-calculator",
  name: "Calculadora de áreas",
  description:
    "Calcula el área de cuadrados, rectángulos, triángulos, círculos, trapecios, paralelogramos, rombos y polígonos regulares.",
  category: "general",
  icon: Shapes,
  reference: "Geometría básica — sin verificación normativa",
}

export const interpolationCalculatorInfo: ToolInfo = {
  id: "interpolation-calculator",
  name: "Interpolación lineal y doble",
  description:
    "Interpola valores entre dos puntos conocidos o dentro de una tabla 2×2 mediante interpolación lineal y bilineal.",
  category: "general",
  icon: ChartSpline,
  reference: "Interpolación numérica — sin verificación normativa",
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

export const loadCombinationsInfo: ToolInfo = {
  id: "load-combinations",
  name: "Combinaciones de carga (NSR-10)",
  description:
    "Aplica los factores de mayoración de la norma a las cargas muerta, viva, sismo y viento, y entrega las combinaciones de diseño.",
  category: "estructuras",
  icon: Combine,
  reference: "NSR-10, B.2.4.2 — Tabla B.2-3 (combinaciones mayoradas)",
}

export const soilPhaseRelationshipsInfo: ToolInfo = {
  id: "soil-phase-relationships",
  name: "Relaciones volumétricas y gravimétricas",
  description:
    "Calcula e, n, S, γ y w, además de γd, γsat y γ', a partir de pares de datos conocidos y Gs.",
  category: "suelos",
  icon: Scale,
  reference: "Mecánica de suelos — relaciones fundamentales de fase",
}

export const bearingAzimuthInfo: ToolInfo = {
  id: "bearing-azimuth",
  name: "Conversión de rumbos y azimuts",
  description:
    "Pasa la orientación de una línea de rumbo a azimut y viceversa, y entre formatos de grados decimales y sexagesimales.",
  category: "topografia",
  icon: Compass,
  reference: "Topografía — orientaciones y ángulos de línea",
}

export const coordinatesAreaInfo: ToolInfo = {
  id: "coordinates-area",
  name: "Cálculo de áreas por coordenadas (Gauss/Shoelace)",
  description:
    "Obtiene el área de un polígono a partir de las coordenadas de sus vértices, ideal para lotes y predios.",
  category: "topografia",
  icon: LandPlot,
  reference: "Topografía — fórmula de Gauss (Shoelace)",
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
  areaCalculatorInfo,
  slopeCalculatorInfo,
  interpolationCalculatorInfo,
  beamSizingInfo,
  loadCombinationsInfo,
  soilPhaseRelationshipsInfo,
  bearingAzimuthInfo,
  coordinatesAreaInfo,
]

export function getToolInfo(id: string): ToolInfo | undefined {
  return TOOL_CATALOG.find((tool) => tool.id === id)
}

export function getToolsByCategory(slug: string): ToolInfo[] {
  return TOOL_CATALOG.filter((tool) => tool.category === slug)
}
