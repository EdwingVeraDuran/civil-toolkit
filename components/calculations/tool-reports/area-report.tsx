import { AreaDiagram } from "@/components/tools/area-diagram"
import {
  AREA_SHAPE_LABELS,
  areaCalculatorSchema,
} from "@/lib/tools/area-calculator/schema"
import type { AreaResult } from "@/lib/tools/area-calculator/calculate"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"
import { getUnit } from "@/lib/units/units"

import {
  ReportFigure,
  ReportFormula,
  ReportMetric,
  ReportMetricGrid,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

export function AreaReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(areaCalculatorSchema, calculation.inputs)
  const result = readSavedResult<AreaResult>(calculation.result, {
    numbers: ["area", "areaM2"],
    strings: ["shape", "areaUnitId", "formula"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const shapeLabel = AREA_SHAPE_LABELS[result.shape]
  if (!shapeLabel) {
    return <ToolReportFallback />
  }

  const lengthSymbol = getUnit(input.lengthUnit)?.symbol ?? "m"
  const areaSymbol = getUnit(result.areaUnitId)?.symbol ?? "m²"

  return (
    <ToolReportLayout
      title="Área y geometría"
      description={`${shapeLabel} — ${result.formula}`}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <ReportFigure
          title="Diagrama de la figura"
          description="Esquema de las dimensiones registradas; no está a escala."
        >
          <AreaDiagram
            input={input}
            lengthSymbol={lengthSymbol}
            className="mx-auto w-full max-w-xs"
          />
        </ReportFigure>

        <div className="space-y-4">
          <ReportMetricGrid>
            <ReportMetric
              label="Área"
              value={`${formatNumber(result.area, 3)} ${areaSymbol}`}
              emphasis
            />
            <ReportMetric label="Figura" value={shapeLabel} />
            {result.areaUnitId !== "m2" ? (
              <ReportMetric
                label="Equivalencia"
                value={`${formatNumber(result.areaM2, 3)} m²`}
              />
            ) : null}
          </ReportMetricGrid>

          <ReportFormula formula={result.formula} />
        </div>
      </div>
    </ToolReportLayout>
  )
}
