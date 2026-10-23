import { rebarScheduleInfo } from "@/lib/tools/catalog"
import {
  calculateRebarSchedule,
  type RebarScheduleResult,
} from "@/lib/tools/rebar-schedule/calculate"
import {
  rebarScheduleSchema,
  type RebarScheduleInput,
} from "@/lib/tools/rebar-schedule/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatSummary(
  input: RebarScheduleInput,
  result: RebarScheduleResult
): string {
  const waste =
    input.wastePercent > 0
      ? ` (incl. ${formatNumber(input.wastePercent, 2)} % desperdicio)`
      : ""
  const volume =
    result.weightPerVolumeKgM3 !== null
      ? ` · ${formatNumber(result.weightPerVolumeKgM3, 1)} kg/m³`
      : ""

  return `Despiece de acero: ${result.totalBars} barras · ${formatNumber(
    result.totalLengthM,
    2
  )} m · ${formatNumber(result.totalWeightKg, 2)} kg${waste}${volume}`
}

export const rebarScheduleDefinition: ToolDefinition<
  RebarScheduleInput,
  RebarScheduleResult
> = {
  info: rebarScheduleInfo,
  schema: rebarScheduleSchema,
  validate: createValidator(rebarScheduleSchema),
  calculate: calculateRebarSchedule,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(input, result),
  }),
}
