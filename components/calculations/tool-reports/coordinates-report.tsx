import { CoordinatesPolygonDiagram } from "@/components/tools/coordinates-polygon-diagram"
import type { CoordinatesAreaResult } from "@/lib/tools/coordinates-area/calculate"
import { coordinatesAreaSchema } from "@/lib/tools/coordinates-area/schema"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"
import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"

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

export function CoordinatesReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(coordinatesAreaSchema, calculation.inputs)
  const result = readSavedResult<CoordinatesAreaResult>(calculation.result, {
    numbers: [
      "areaM2",
      "area",
      "perimeterM",
      "perimeter",
      "vertexCount",
      "signedAreaM2",
    ],
    strings: ["areaUnitId", "lengthUnitId", "orientation", "formula"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const areaSymbol = getUnit(result.areaUnitId)?.symbol ?? "m²"
  const lengthSymbol = getUnit(result.lengthUnitId)?.symbol ?? "m"
  const areaHectares = Measurement.from(result.areaM2, "m2").to("ha").value
  const orientationLabel =
    result.orientation === "counterclockwise" ? "Antihorario" : "Horario"

  return (
    <ToolReportLayout
      title="Polígono y área"
      description="Área y perímetro del polígono cerrado por coordenadas."
    >
      <ReportFigure
        title="Polígono por coordenadas"
        description="El eje Y apunta hacia el norte; el dibujo es esquemático."
        className="mx-auto w-full max-w-md"
      >
        <CoordinatesPolygonDiagram
          vertices={input.vertices}
          areaLabel={`A = ${formatNumber(result.area, 3)} ${areaSymbol}`}
          className="mx-auto w-full max-w-sm"
        />
      </ReportFigure>

      <ReportMetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetric
          label="Área"
          value={`${formatNumber(result.area, 3)} ${areaSymbol}`}
          emphasis
        />
        <ReportMetric
          label="Perímetro"
          value={`${formatNumber(result.perimeter, 3)} ${lengthSymbol}`}
        />
        <ReportMetric label="Vértices" value={String(result.vertexCount)} />
        <ReportMetric label="Sentido" value={orientationLabel} />
      </ReportMetricGrid>

      <ReportDetailGrid>
        <ReportDetail
          label="Área en m²"
          value={`${formatNumber(result.areaM2, 3)} m²`}
        />
        <ReportDetail
          label="Área en hectáreas"
          value={`${formatNumber(areaHectares, 4)} ha`}
        />
        <ReportDetail
          label="Área con signo"
          value={`${formatNumber(result.signedAreaM2, 3)} m²`}
        />
      </ReportDetailGrid>

      <ReportFormula formula={result.formula} />
    </ToolReportLayout>
  )
}
