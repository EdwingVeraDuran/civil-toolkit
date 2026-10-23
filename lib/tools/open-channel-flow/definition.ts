import { FLOW_REGIME_LABELS, SLOPE_CLASS_LABELS } from "@/lib/aguas/canales"
import { openChannelFlowInfo } from "@/lib/tools/catalog"
import {
  calculateOpenChannelFlow,
  type OpenChannelFlowResult,
} from "@/lib/tools/open-channel-flow/calculate"
import {
  CHANNEL_SECTION_SUMMARY_LABELS,
  openChannelFlowSchema,
  type OpenChannelFlowInput,
} from "@/lib/tools/open-channel-flow/schema"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"
import { formatNumber } from "@/lib/units/format"

function formatSummary(result: OpenChannelFlowResult): string {
  const section = CHANNEL_SECTION_SUMMARY_LABELS[result.section]
  const discharge = `Q = ${formatNumber(result.discharge, 2)} m³/s`

  if (result.normalDepth === null) {
    const critical =
      result.criticalDepth !== null
        ? `; y_c = ${formatNumber(result.criticalDepth, 2)} m`
        : ""
    return `${section}: sin solución de flujo normal para ${discharge}${critical}`
  }

  const parts = [`y = ${formatNumber(result.normalDepth, 2)} m`, discharge]

  if (result.velocity !== null) {
    parts.push(`V = ${formatNumber(result.velocity, 2)} m/s`)
  }

  if (result.criticalDepth !== null) {
    parts.push(`y_c = ${formatNumber(result.criticalDepth, 2)} m`)
  }

  if (result.froude !== null && result.regime !== null) {
    parts.push(
      `Fr = ${formatNumber(result.froude, 2)} (${FLOW_REGIME_LABELS[
        result.regime
      ].toLowerCase()})`
    )
  }

  if (result.slopeClassification !== null) {
    parts.push(
      `pendiente ${SLOPE_CLASS_LABELS[
        result.slopeClassification
      ].toLowerCase()}`
    )
  }

  return `${section}: ${parts.join("; ")}`
}

export const openChannelFlowDefinition: ToolDefinition<
  OpenChannelFlowInput,
  OpenChannelFlowResult
> = {
  info: openChannelFlowInfo,
  schema: openChannelFlowSchema,
  validate: createValidator(openChannelFlowSchema),
  calculate: calculateOpenChannelFlow,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(result),
  }),
}
