import { SlopeDiagram } from "@/components/tools/slope-diagram"
import type {
  SlopeDirectionResult,
  SlopeResult,
} from "@/lib/tools/slope-calculator/calculate"
import { slopeSchema } from "@/lib/tools/slope-calculator/schema"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"
import { getUnit } from "@/lib/units/units"

import {
  ReportDetail,
  ReportDetailGrid,
  ReportFigure,
  ReportMetric,
  ReportMetricGrid,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

const DIRECTION_LABELS: Record<SlopeDirectionResult, string> = {
  ascendente: "Ascendente",
  descendente: "Descendente",
  plano: "Plano",
}

function formatLength(valueM: number, unitId: string): string {
  return `${formatNumber(valueM, 3)} ${getUnit(unitId)?.symbol ?? "m"}`
}

function formatRatio(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(value)
}

export function SlopeReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(slopeSchema, calculation.inputs)
  const result = readSavedResult<SlopeResult>(calculation.result, {
    numbers: [
      "runM",
      "riseM",
      "slopeLengthM",
      "percent",
      "permille",
      "angleDeg",
      "cmPerM",
      "mmPerM",
    ],
    strings: ["direction"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const directionLabel = DIRECTION_LABELS[result.direction]
  if (!directionLabel) {
    return <ToolReportFallback />
  }

  const runUnit = input.runUnit

  return (
    <ToolReportLayout
      title="Pendiente y desnivel"
      description={`${directionLabel} — relación 1:n = 1 vertical por n horizontal.`}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <ReportMetricGrid className="sm:grid-cols-2">
            <ReportMetric
              label="Pendiente"
              value={`${formatNumber(result.percent, 2)} %`}
              hint={directionLabel}
              emphasis
            />
            <ReportMetric
              label="Desnivel"
              value={formatLength(result.riseM, runUnit)}
            />
            <ReportMetric
              label="Longitud inclinada"
              value={formatLength(result.slopeLengthM, runUnit)}
            />
            <ReportMetric
              label="Ángulo"
              value={`${formatNumber(result.angleDeg, 2)}°`}
            />
          </ReportMetricGrid>

          <ReportDetailGrid className="sm:grid-cols-2 lg:grid-cols-2">
            <ReportDetail
              label="Relación V:H"
              value={
                result.ratio === null
                  ? "Plano"
                  : `1 : ${formatRatio(result.ratio)}`
              }
            />
            <ReportDetail
              label="Por mil"
              value={`${formatNumber(result.permille, 2)} ‰`}
            />
            <ReportDetail
              label="cm/m"
              value={`${formatNumber(result.cmPerM, 2)} cm/m`}
            />
            <ReportDetail
              label="mm/m"
              value={`${formatNumber(result.mmPerM, 2)} mm/m`}
            />
          </ReportDetailGrid>
        </div>

        <ReportFigure title="Diagrama de la pendiente">
          <SlopeDiagram
            run={result.runM}
            rise={result.riseM}
            runLabel={`L = ${formatLength(result.runM, runUnit)}`}
            riseLabel={`h = ${formatLength(result.riseM, runUnit)}`}
            slopeLengthLabel={`s = ${formatLength(result.slopeLengthM, runUnit)}`}
            angleLabel={`θ = ${formatNumber(result.angleDeg, 2)}°`}
            className="mx-auto w-full max-w-xs"
          />
        </ReportFigure>
      </div>
    </ToolReportLayout>
  )
}
