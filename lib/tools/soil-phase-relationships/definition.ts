import { soilPhaseRelationshipsInfo } from "@/lib/tools/catalog"
import {
  calculateSoilPhaseRelationships,
  type SoilPhaseResult,
} from "@/lib/tools/soil-phase-relationships/calculate"
import {
  soilPhaseRelationshipsSchema,
  type SoilPhaseInput,
} from "@/lib/tools/soil-phase-relationships/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"
import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"

function formatSummary(input: SoilPhaseInput, result: SoilPhaseResult): string {
  const unit = getUnit(input.unitWeightUnit)
  const unitWeight = unit
    ? Measurement.from(result.unitWeight, "knm3").to(unit).value
    : result.unitWeight
  const symbol = unit?.symbol ?? "kN/m³"

  return `Relaciones de fase: e = ${formatNumber(
    result.voidRatio,
    3
  )}; n = ${formatNumber(result.porosity * 100, 2)} %; S = ${formatNumber(
    result.saturation * 100,
    2
  )} %; γ = ${formatNumber(unitWeight, 3)} ${symbol}; w = ${formatNumber(
    result.waterContent * 100,
    2
  )} %`
}

export const soilPhaseRelationshipsDefinition: ToolDefinition<
  SoilPhaseInput,
  SoilPhaseResult
> = {
  info: soilPhaseRelationshipsInfo,
  schema: soilPhaseRelationshipsSchema,
  validate: createValidator(soilPhaseRelationshipsSchema),
  calculate: calculateSoilPhaseRelationships,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(input, result),
  }),
}
