import { ChannelSectionDiagram } from "@/components/tools/channel-section-diagram"
import {
  FLOW_REGIME_LABELS,
  SLOPE_CLASS_LABELS,
  type ChannelSectionProperties,
} from "@/lib/aguas/canales"
import type { OpenChannelFlowResult } from "@/lib/tools/open-channel-flow/calculate"
import {
  CHANNEL_MODE_LABELS,
  CHANNEL_SECTION_LABELS,
  openChannelFlowSchema,
} from "@/lib/tools/open-channel-flow/schema"
import {
  parseSavedInput,
  readSavedRecord,
  readSavedResult,
} from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"

import {
  ReportDetail,
  ReportDetailGrid,
  ReportFigure,
  ReportFormula,
  ReportMetric,
  ReportMetricGrid,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

function formatNullable(value: number | null, suffix: string): string {
  return value !== null && Number.isFinite(value)
    ? `${formatNumber(value, 3)} ${suffix}`
    : "—"
}

export function OpenChannelReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(openChannelFlowSchema, calculation.inputs)
  const result = readSavedResult<OpenChannelFlowResult>(calculation.result, {
    numbers: ["discharge"],
    strings: ["mode", "section", "formula"],
    arrays: ["warnings"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const sectionLabel = CHANNEL_SECTION_LABELS[result.section]
  const modeLabel = CHANNEL_MODE_LABELS[result.mode]

  if (!sectionLabel || !modeLabel) {
    return <ToolReportFallback />
  }

  const properties = readSavedRecord<ChannelSectionProperties>(
    result.properties,
    {
      numbers: [
        "area",
        "wettedPerimeter",
        "topWidth",
        "hydraulicRadius",
        "hydraulicDepth",
      ],
    }
  )
  const normalDepth =
    result.normalDepth !== null && Number.isFinite(result.normalDepth)
      ? result.normalDepth
      : null
  const criticalDepth =
    result.criticalDepth !== null && Number.isFinite(result.criticalDepth)
      ? result.criticalDepth
      : null
  const regimeLabel = result.regime ? FLOW_REGIME_LABELS[result.regime] : "—"
  const slopeLabel = result.slopeClassification
    ? SLOPE_CLASS_LABELS[result.slopeClassification]
    : "—"
  const depthRatio =
    normalDepth !== null && criticalDepth !== null && criticalDepth > 0
      ? normalDepth / criticalDepth
      : null

  return (
    <ToolReportLayout
      title="Sección y régimen de flujo"
      description={`${sectionLabel} — ${modeLabel}`}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <ReportMetricGrid className="sm:grid-cols-2 lg:grid-cols-3">
            <ReportMetric
              label="Profundidad normal, yₙ"
              value={formatNullable(normalDepth, "m")}
              emphasis
            />
            <ReportMetric
              label="Caudal, Q"
              value={`${formatNumber(result.discharge, 3)} m³/s`}
            />
            <ReportMetric
              label="Velocidad, V"
              value={formatNullable(result.velocity, "m/s")}
            />
            <ReportMetric
              label="Número de Froude, Fr"
              value={
                result.froude !== null ? formatNumber(result.froude, 3) : "—"
              }
              hint={regimeLabel}
            />
            <ReportMetric
              label="Profundidad crítica, y_c"
              value={formatNullable(criticalDepth, "m")}
            />
            <ReportMetric
              label="Pendiente crítica, S_c"
              value={
                result.criticalSlope !== null
                  ? formatNumber(result.criticalSlope, 5)
                  : "—"
              }
            />
            <ReportMetric
              label="Clasificación de pendiente"
              value={slopeLabel}
            />
            <ReportMetric
              label="Relación yₙ / y_c"
              value={depthRatio !== null ? formatNumber(depthRatio, 3) : "—"}
            />
            <ReportMetric label="Régimen" value={regimeLabel} />
          </ReportMetricGrid>

          {properties ? (
            <ReportDetailGrid>
              <ReportDetail
                label="Área mojada, A"
                value={`${formatNumber(properties.area, 3)} m²`}
              />
              <ReportDetail
                label="Perímetro mojado, P"
                value={`${formatNumber(properties.wettedPerimeter, 3)} m`}
              />
              <ReportDetail
                label="Radio hidráulico, R"
                value={`${formatNumber(properties.hydraulicRadius, 3)} m`}
              />
              <ReportDetail
                label="Ancho superficial, T"
                value={`${formatNumber(properties.topWidth, 3)} m`}
              />
              <ReportDetail
                label="Profundidad hidráulica, Dₕ"
                value={`${formatNumber(properties.hydraulicDepth, 3)} m`}
              />
              <ReportDetail
                label="Coeficiente de Manning, n"
                value={formatNumber(input.manning, 3)}
              />
            </ReportDetailGrid>
          ) : null}

          <ReportFormula formula={result.formula} />
        </div>

        {normalDepth !== null ? (
          <ReportFigure
            title="Sección transversal"
            description="Profundidad normal y profundidad crítica."
          >
            <ChannelSectionDiagram
              geometry={input.geometry}
              depth={normalDepth}
              criticalDepth={criticalDepth}
              className="mx-auto w-full max-w-sm"
            />
          </ReportFigure>
        ) : (
          <ReportFigure
            title="Sección transversal"
            description="No hay una profundidad normal válida para dibujar la sección."
          >
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Sin visualización de la sección
            </div>
          </ReportFigure>
        )}
      </div>
    </ToolReportLayout>
  )
}
