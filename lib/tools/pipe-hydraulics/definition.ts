import { PIPE_METHOD_LABELS } from "@/lib/aguas/tuberias"
import { pipeHydraulicsInfo } from "@/lib/tools/catalog"
import {
  calculatePipeHydraulics,
  type PipeHydraulicsResult,
} from "@/lib/tools/pipe-hydraulics/calculate"
import {
  pipeHydraulicsSchema,
  type PipeHydraulicsInput,
} from "@/lib/tools/pipe-hydraulics/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatSummary(result: PipeHydraulicsResult): string {
  const method = PIPE_METHOD_LABELS[result.method]
  const diameter =
    result.diameterMm !== null
      ? `${formatNumber(result.diameterMm, 1)} mm`
      : "—"
  const discharge =
    result.discharge !== null
      ? `${formatNumber(result.discharge, 3)} m³/s`
      : "—"
  const headLoss =
    result.headLoss !== null ? `${formatNumber(result.headLoss, 3)} m` : "—"

  if (
    result.diameterMm === null ||
    result.discharge === null ||
    result.headLoss === null
  ) {
    return `Sin solución: D = ${diameter}; Q = ${discharge}; H = ${headLoss}; ${method}`
  }

  const prefix = result.converged ? "" : "Aproximado: "
  return `${prefix}D = ${diameter}; Q = ${discharge}; H = ${headLoss}; ΣK = ${formatNumber(
    result.totalK,
    2
  )}; ${method}`
}

export const pipeHydraulicsDefinition: ToolDefinition<
  PipeHydraulicsInput,
  PipeHydraulicsResult
> = {
  info: pipeHydraulicsInfo,
  schema: pipeHydraulicsSchema,
  validate: createValidator(pipeHydraulicsSchema),
  calculate: calculatePipeHydraulics,
  toSnapshot: (input, result) => ({
    inputs: {
      ...input,
      accessories: input.accessories.map((accessory) => ({ ...accessory })),
    },
    result: {
      ...result,
      warnings: [...result.warnings],
    },
    summary: formatSummary(result),
  }),
}
