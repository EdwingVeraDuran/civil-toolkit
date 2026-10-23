import { atterbergLimitsInfo } from "@/lib/tools/catalog"
import {
  calculateAtterbergLimits,
  type AtterbergLimitsResult,
} from "@/lib/tools/atterberg-limits/calculate"
import {
  atterbergLimitsSchema,
  type AtterbergLimitsInput,
} from "@/lib/tools/atterberg-limits/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatSummary(result: AtterbergLimitsResult): string {
  const liquidLimit = formatNumber(result.liquidLimitRounded, 0)
  const plasticLimit = formatNumber(result.plasticLimitRounded, 0)

  if (result.nonPlastic) {
    return `LL = ${liquidLimit} %; LP = ${plasticLimit} %; IP = NP; clasificación NP`
  }

  return `LL = ${liquidLimit} %; LP = ${plasticLimit} %; IP = ${formatNumber(
    result.plasticityIndexRounded,
    0
  )} %; clasificación ${result.classification.symbol}`
}

export const atterbergLimitsDefinition: ToolDefinition<
  AtterbergLimitsInput,
  AtterbergLimitsResult
> = {
  info: atterbergLimitsInfo,
  schema: atterbergLimitsSchema,
  validate: createValidator(atterbergLimitsSchema),
  calculate: calculateAtterbergLimits,
  toSnapshot: (input, result) => ({
    inputs: {
      liquidLimitPoints: input.liquidLimitPoints.map((point) => ({ ...point })),
      plasticLimitValues: [...input.plasticLimitValues],
    },
    result: { ...result },
    summary: formatSummary(result),
  }),
}
