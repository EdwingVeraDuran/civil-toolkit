import { Measurement } from "@/lib/units/measurement"
import type { Unit } from "@/lib/units/types"
import { getUnit, unitsByDimension } from "@/lib/units/units"
import type { UnitConversionInput } from "@/lib/tools/unit-converter/schema"

export type ConversionRow = {
  unit: Unit
  measurement: Measurement
}

export type UnitConversionResult = {
  from: Measurement
  to: Measurement
  rows: ConversionRow[]
}

export function calculateConversion(input: UnitConversionInput): UnitConversionResult {
  const fromUnit = getUnit(input.fromUnitId)
  const toUnit = getUnit(input.toUnitId)

  if (!fromUnit || !toUnit) {
    throw new Error("Unidad no válida")
  }
  if (fromUnit.dimension !== toUnit.dimension) {
    throw new Error("Las unidades deben pertenecer a la misma dimensión")
  }

  const from = new Measurement(input.value, fromUnit)
  const to = from.to(toUnit)
  const rows = unitsByDimension(fromUnit.dimension).map((unit) => ({
    unit,
    measurement: from.to(unit),
  }))

  return { from, to, rows }
}
