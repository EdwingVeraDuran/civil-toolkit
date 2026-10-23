import type { ToolDefinition } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"
import { slopeCalculatorInfo } from "@/lib/tools/catalog"
import { createValidator } from "@/lib/tools/validate"
import {
  slopeSchema,
  type SlopeInput,
} from "@/lib/tools/slope-calculator/schema"
import {
  calculateSlope,
  type SlopeResult,
} from "@/lib/tools/slope-calculator/calculate"

function formatSummary(result: SlopeResult): string {
  if (result.direction === "plano") {
    return `Plano (${formatNumber(result.percent, 2)} %)`
  }

  return `Pendiente ${formatNumber(result.percent, 2)} % (${formatNumber(
    result.angleDeg,
    2
  )}°) ${result.direction}`
}

export const slopeCalculatorDefinition: ToolDefinition<
  SlopeInput,
  SlopeResult
> = {
  info: slopeCalculatorInfo,
  schema: slopeSchema,
  validate: createValidator(slopeSchema),
  calculate: calculateSlope,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(result),
  }),
}
