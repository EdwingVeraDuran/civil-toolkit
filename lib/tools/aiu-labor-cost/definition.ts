import { aiuLaborCostInfo } from "@/lib/tools/catalog"
import {
  calculateAiuLaborCost,
  type AiuLaborCostResult,
} from "@/lib/tools/aiu-labor-cost/calculate"
import {
  aiuLaborCostSchema,
  type AiuLaborCostInput,
} from "@/lib/tools/aiu-labor-cost/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatSummary(
  _input: AiuLaborCostInput,
  result: AiuLaborCostResult
): string {
  return `AIU ${formatNumber(
    result.aiu.totalPercent,
    2
  )} % · Presupuesto ${formatNumber(
    result.aiu.totalBudget,
    0
  )} COP; costo laboral ${formatNumber(result.labor.monthlyCost, 0)} COP/mes`
}

export const aiuLaborCostDefinition: ToolDefinition<
  AiuLaborCostInput,
  AiuLaborCostResult
> = {
  info: aiuLaborCostInfo,
  schema: aiuLaborCostSchema,
  validate: createValidator(aiuLaborCostSchema),
  calculate: calculateAiuLaborCost,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(input, result),
  }),
}
