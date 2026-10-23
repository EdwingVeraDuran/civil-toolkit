import type { AreaInput, AreaShape } from "@/lib/tools/area-calculator/schema"
import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"

export type AreaResult = {
  shape: AreaShape
  areaM2: number
  area: number
  areaUnitId: string
  formula: string
}

export const AREA_FORMULAS: Record<AreaShape, string> = {
  square: "A = L²",
  rectangle: "A = b · h",
  triangle: "A = (b · h) / 2",
  circle: "A = π · r²",
  trapezoid: "A = ((B + b) / 2) · h",
  parallelogram: "A = b · h",
  rhombus: "A = (D · d) / 2",
  "regular-polygon": "A = n · l² / (4 · tan(π / n))",
}

function toMeters(value: number, unitId: string): number {
  const unit = getUnit(unitId)

  if (!unit || unit.dimension !== "length") {
    throw new Error(`Unidad de longitud inválida: ${unitId}`)
  }

  return Measurement.from(value, unit).to("m").value
}

function toAreaUnit(areaM2: number, unitId: string): number {
  const unit = getUnit(unitId)

  if (!unit || unit.dimension !== "area") {
    throw new Error(`Unidad de área inválida: ${unitId}`)
  }

  return Measurement.from(areaM2, "m2").to(unit).value
}

export function calculateArea(input: AreaInput): AreaResult {
  let areaM2: number

  switch (input.shape) {
    case "square": {
      const sideM = toMeters(input.side, input.lengthUnit)
      areaM2 = sideM * sideM
      break
    }
    case "rectangle": {
      const baseM = toMeters(input.base, input.lengthUnit)
      const heightM = toMeters(input.height, input.lengthUnit)
      areaM2 = baseM * heightM
      break
    }
    case "triangle": {
      const baseM = toMeters(input.base, input.lengthUnit)
      const heightM = toMeters(input.height, input.lengthUnit)
      areaM2 = (baseM * heightM) / 2
      break
    }
    case "circle": {
      const sizeM = toMeters(input.circleSize, input.lengthUnit)
      const radiusM = input.circleMeasure === "diameter" ? sizeM / 2 : sizeM
      areaM2 = Math.PI * radiusM * radiusM
      break
    }
    case "trapezoid": {
      const baseMajorM = toMeters(input.baseMajor, input.lengthUnit)
      const baseMinorM = toMeters(input.baseMinor, input.lengthUnit)
      const heightM = toMeters(input.height, input.lengthUnit)
      areaM2 = ((baseMajorM + baseMinorM) / 2) * heightM
      break
    }
    case "parallelogram": {
      const baseM = toMeters(input.base, input.lengthUnit)
      const heightM = toMeters(input.height, input.lengthUnit)
      areaM2 = baseM * heightM
      break
    }
    case "rhombus": {
      const diagonalMajorM = toMeters(input.diagonalMajor, input.lengthUnit)
      const diagonalMinorM = toMeters(input.diagonalMinor, input.lengthUnit)
      areaM2 = (diagonalMajorM * diagonalMinorM) / 2
      break
    }
    case "regular-polygon": {
      const sideM = toMeters(input.side, input.lengthUnit)
      areaM2 =
        (input.sides * sideM * sideM) / (4 * Math.tan(Math.PI / input.sides))
      break
    }
  }

  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("No fue posible calcular un área válida")
  }

  return {
    shape: input.shape,
    areaM2,
    area: toAreaUnit(areaM2, input.areaUnit),
    areaUnitId: input.areaUnit,
    formula:
      input.shape === "circle" && input.circleMeasure === "diameter"
        ? "A = π · (d / 2)²"
        : AREA_FORMULAS[input.shape],
  }
}
