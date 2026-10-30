import { BearingCompassDiagram } from "@/components/tools/bearing-compass-diagram"
import type {
  DmsParts,
  OrientationResult,
} from "@/lib/tools/bearing-azimuth/calculate"
import {
  formatBearingDecimal,
  formatBearingDms,
  formatDecimalDegrees,
  formatDms,
} from "@/lib/tools/bearing-azimuth/calculate"
import {
  BEARING_QUADRANT_LABELS,
  ORIENTATION_MODE_LABELS,
  orientationSchema,
} from "@/lib/tools/bearing-azimuth/schema"
import {
  parseSavedInput,
  readSavedRecord,
  readSavedResult,
} from "@/lib/tools/report-data"

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

export function BearingReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(orientationSchema, calculation.inputs)
  const result = readSavedResult<OrientationResult>(calculation.result, {
    numbers: ["azimuthDeg", "bearingAngleDeg"],
    strings: ["mode", "bearingQuadrant", "formula"],
    records: ["azimuthDms", "bearingDms"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const quadrantLabel = BEARING_QUADRANT_LABELS[result.bearingQuadrant]
  const modeLabel = ORIENTATION_MODE_LABELS[result.mode]
  const azimuthDms = readSavedRecord<DmsParts>(result.azimuthDms, {
    numbers: ["degrees", "minutes", "seconds"],
  })
  const bearingDms = readSavedRecord<DmsParts>(result.bearingDms, {
    numbers: ["degrees", "minutes", "seconds"],
  })

  if (!quadrantLabel || !modeLabel || !azimuthDms || !bearingDms) {
    return <ToolReportFallback />
  }

  return (
    <ToolReportLayout title="Orientación de la línea" description={modeLabel}>
      <ReportMetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetric
          label="Azimut decimal"
          value={formatDecimalDegrees(result.azimuthDeg, 6)}
          hint="Desde el norte, sentido horario"
          emphasis
        />
        <ReportMetric
          label="Azimut sexagesimal"
          value={formatDms(azimuthDms)}
        />
        <ReportMetric
          label="Rumbo decimal"
          value={formatBearingDecimal(
            result.bearingQuadrant,
            result.bearingAngleDeg,
            6
          )}
        />
        <ReportMetric
          label="Rumbo sexagesimal"
          value={formatBearingDms(result.bearingQuadrant, bearingDms)}
        />
      </ReportMetricGrid>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <ReportDetailGrid>
            <ReportDetail label="Cuadrante" value={quadrantLabel} />
            <ReportDetail
              label="Ángulo del rumbo"
              value={formatDecimalDegrees(result.bearingAngleDeg, 4)}
            />
            <ReportDetail
              label="Azimut normalizado"
              value={formatDecimalDegrees(result.azimuthDeg, 4)}
            />
          </ReportDetailGrid>

          <ReportFormula formula={result.formula} />
        </div>

        <ReportFigure
          title="Brújula de orientación"
          description="La línea se dibuja con el azimut guardado."
        >
          <BearingCompassDiagram
            azimuthDeg={result.azimuthDeg}
            className="mx-auto w-full max-w-xs"
          />
        </ReportFigure>
      </div>
    </ToolReportLayout>
  )
}
