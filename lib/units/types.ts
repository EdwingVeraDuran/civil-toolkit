export const DIMENSIONS = [
  "length",
  "area",
  "volume",
  "mass",
  "force",
  "pressure",
  "unitWeight",
  "angle",
  "temperature",
] as const

export type DimensionId = (typeof DIMENSIONS)[number]

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  length: "Longitud",
  area: "Área",
  volume: "Volumen",
  mass: "Masa",
  force: "Fuerza",
  pressure: "Presión / Esfuerzo",
  unitWeight: "Peso unitario",
  angle: "Ángulo",
  temperature: "Temperatura",
}

export type Unit = {
  id: string
  symbol: string
  name: string
  dimension: DimensionId
  factor: number
  offset?: number
}
