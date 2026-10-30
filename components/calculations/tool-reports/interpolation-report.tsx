import { InterpolationDiagram } from "@/components/tools/interpolation-diagram"
import type {
  DoubleResult,
  LinearResult,
} from "@/lib/tools/interpolation-calculator/calculate"
import {
  INTERPOLATION_MODE_LABELS,
  interpolationSchema,
} from "@/lib/tools/interpolation-calculator/schema"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"
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

function isLinearResult(
  result: LinearResult | DoubleResult
): result is LinearResult {
  return result.mode === "linear"
}

export function InterpolationReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(interpolationSchema, calculation.inputs)

  if (!input) {
    return <ToolReportFallback />
  }

  if (input.mode === "linear") {
    const result = readSavedResult<LinearResult>(calculation.result, {
      numbers: ["value", "targetX", "targetY", "t", "deltaX", "deltaY"],
      strings: ["mode", "resultVariable", "targetVariable", "formula"],
    })

    if (
      !result ||
      !isLinearResult(result) ||
      (result.resultVariable !== "x" && result.resultVariable !== "y") ||
      (result.targetVariable !== "x" && result.targetVariable !== "y")
    ) {
      return <ToolReportFallback />
    }

    return (
      <ToolReportLayout
        title={INTERPOLATION_MODE_LABELS.linear}
        description="Interpolación entre dos puntos conocidos."
      >
        <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <ReportMetricGrid className="sm:grid-cols-2">
              <ReportMetric
                label="Valor interpolado"
                value={`${result.resultVariable} = ${formatNumber(result.value, 3)}`}
                emphasis
              />
              <ReportMetric
                label="Factor de interpolación"
                value={`t = ${formatNumber(result.t, 4)}`}
              />
            </ReportMetricGrid>

            <ReportDetailGrid className="sm:grid-cols-2 lg:grid-cols-2">
              <ReportDetail
                label="Δx = x₂ − x₁"
                value={formatNumber(result.deltaX, 3)}
              />
              <ReportDetail
                label="Δy = y₂ − y₁"
                value={formatNumber(result.deltaY, 3)}
              />
              <ReportDetail
                label="Pendiente m = Δy / Δx"
                value={
                  result.slope === null
                    ? "Vertical"
                    : formatNumber(result.slope, 3)
                }
              />
              <ReportDetail
                label="Punto objetivo"
                value={`(${formatNumber(result.targetX, 3)}; ${formatNumber(
                  result.targetY,
                  3
                )})`}
              />
            </ReportDetailGrid>

            <ReportFormula formula={result.formula} />
          </div>

          <ReportFigure title="Diagrama de interpolación">
            <InterpolationDiagram
              input={input}
              result={result}
              className="mx-auto w-full max-w-sm"
            />
          </ReportFigure>
        </div>
      </ToolReportLayout>
    )
  }

  const result = readSavedResult<DoubleResult>(calculation.result, {
    numbers: ["value", "targetX", "targetY", "tx", "ty", "zAtY1", "zAtY2"],
    strings: ["mode", "formula"],
  })

  if (!result || result.mode !== "double") {
    return <ToolReportFallback />
  }

  return (
    <ToolReportLayout
      title={INTERPOLATION_MODE_LABELS.double}
      description="Interpolación bilineal dentro de una tabla 2×2."
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <ReportMetricGrid className="sm:grid-cols-2">
            <ReportMetric
              label="Valor interpolado"
              value={`z = ${formatNumber(result.value, 3)}`}
              emphasis
            />
            <ReportMetric
              label="Punto objetivo"
              value={`(${formatNumber(result.targetX, 3)}; ${formatNumber(
                result.targetY,
                3
              )})`}
            />
          </ReportMetricGrid>

          <ReportDetailGrid className="sm:grid-cols-2 lg:grid-cols-2">
            <ReportDetail
              label="Factor tₓ"
              value={`tₓ = ${formatNumber(result.tx, 4)}`}
            />
            <ReportDetail
              label="Factor t_y"
              value={`t_y = ${formatNumber(result.ty, 4)}`}
            />
            <ReportDetail
              label="z(x, y₁)"
              value={formatNumber(result.zAtY1, 3)}
            />
            <ReportDetail
              label="z(x, y₂)"
              value={formatNumber(result.zAtY2, 3)}
            />
          </ReportDetailGrid>

          <ReportFormula formula={result.formula} />
        </div>

        <ReportFigure title="Diagrama de interpolación doble">
          <InterpolationDiagram
            input={input}
            result={result}
            className="mx-auto w-full max-w-sm"
          />
        </ReportFigure>
      </div>
    </ToolReportLayout>
  )
}
