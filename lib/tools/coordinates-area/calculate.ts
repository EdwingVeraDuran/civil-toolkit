import type {
  CoordinateVertex,
  CoordinatesAreaInput,
} from "@/lib/tools/coordinates-area/schema"
import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"

export type CoordinatesOrientation = "clockwise" | "counterclockwise"

export type CoordinatesAreaResult = {
  areaM2: number
  area: number
  areaUnitId: string
  perimeterM: number
  perimeter: number
  lengthUnitId: string
  vertexCount: number
  orientation: CoordinatesOrientation
  signedAreaM2: number
  formula: string
}

export const COORDINATES_AREA_FORMULA = "A = |Σ (xᵢ · yᵢ₊₁ − xᵢ₊₁ · yᵢ)| / 2"

function toMeters(value: number, unitId: string): number {
  const unit = getUnit(unitId)

  if (!unit || unit.dimension !== "length") {
    throw new Error(`Unidad de longitud inválida: ${unitId}`)
  }

  return Measurement.from(value, unit).to("m").value
}

function toSelectedUnit(
  value: number,
  baseUnitId: string,
  targetUnitId: string
): number {
  const base = getUnit(baseUnitId)
  const target = getUnit(targetUnitId)

  if (!base || !target) {
    throw new Error(`Unidad inválida: ${targetUnitId}`)
  }

  return Measurement.from(value, base).to(target).value
}

export function calculateCoordinatesArea(
  input: CoordinatesAreaInput
): CoordinatesAreaResult {
  const verticesM: CoordinateVertex[] = input.vertices.map((vertex) => ({
    x: toMeters(vertex.x, input.lengthUnit),
    y: toMeters(vertex.y, input.lengthUnit),
  }))

  let twiceArea = 0
  let perimeterM = 0

  for (let index = 0; index < verticesM.length; index += 1) {
    const current = verticesM[index]
    const next = verticesM[(index + 1) % verticesM.length]

    twiceArea += current.x * next.y - next.x * current.y
    perimeterM += Math.hypot(next.x - current.x, next.y - current.y)
  }

  const signedAreaM2 = twiceArea / 2
  const areaM2 = Math.abs(signedAreaM2)

  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("No fue posible calcular un área válida")
  }

  return {
    areaM2,
    area: toSelectedUnit(areaM2, "m2", input.areaUnit),
    areaUnitId: input.areaUnit,
    perimeterM,
    perimeter: toSelectedUnit(perimeterM, "m", input.lengthUnit),
    lengthUnitId: input.lengthUnit,
    vertexCount: verticesM.length,
    orientation: twiceArea > 0 ? "counterclockwise" : "clockwise",
    signedAreaM2,
    formula: COORDINATES_AREA_FORMULA,
  }
}
