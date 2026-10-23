import {
  ChartSpline,
  Combine,
  Compass,
  FlaskConical,
  HandCoins,
  Landmark,
  LandPlot,
  Ruler,
  Scale,
  Shapes,
  TableProperties,
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

export const rebarScheduleInfo: ToolInfo = {
  id: "rebar-schedule",
  name: "Despiece y cuantía de acero, tabla de pesos de varillas",
  description:
    "Calcula longitudes, pesos y cuantía del refuerzo a partir del despiece, con la tabla de varillas comerciales.",
  category: "estructuras",
  icon: TableProperties,
  reference: "NSR-10, C.3.5.3 — Tablas C.3.5.3-1 y C.3.5.3-2; NTC 2289",
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

export const atterbergLimitsInfo: ToolInfo = {
  id: "atterberg-limits",
  name: "Límites de Atterberg (LL, LP, IP)",
  description:
    "Procesa los datos del ensayo para hallar límite líquido, límite plástico e índice de plasticidad, y los ubica en la carta de plasticidad. Regresión del ensayo y clasificación.",
  category: "suelos",
  icon: FlaskConical,
  reference:
    "NTC 4630 (ASTM D4318) — límites de Atterberg; ASTM D2487 / NTC 1504 — clasificación SUCS; carta de plasticidad de Casagrande",
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

export const aiuLaborCostInfo: ToolInfo = {
  id: "aiu-labor-cost",
  name: "Calculadora de AIU y prestaciones sociales",
  description:
    "Calcula administración, imprevistos y utilidad de un presupuesto, y el costo real de un trabajador con sus prestaciones. Porcentajes sobre costos.",
  category: "administrativas",
  icon: HandCoins,
  reference:
    "AIU: Ley 80 de 1993 y Decreto 1082 de 2015; prestaciones: CST, Ley 100 de 1993 y Ley 21 de 1982",
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
  rebarScheduleInfo,
  soilPhaseRelationshipsInfo,
  atterbergLimitsInfo,
  bearingAzimuthInfo,
  coordinatesAreaInfo,
  aiuLaborCostInfo,
]

export function getToolInfo(id: string): ToolInfo | undefined {
  return TOOL_CATALOG.find((tool) => tool.id === id)
}

export function getToolsByCategory(slug: string): ToolInfo[] {
  return TOOL_CATALOG.filter((tool) => tool.category === slug)
}
