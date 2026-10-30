import { SectionDiagram } from "@/components/tools/section-diagram"
import {
  BEAM_SIZING_REPORT_RESULT_SPEC,
  getBeamSizingReportLabels,
  type BeamSizingReportResult,
} from "@/lib/tools/beam-sizing/report"
import { beamSizingSchema } from "@/lib/tools/beam-sizing/schema"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"

import {
  ReportDetail,
  ReportDetailGrid,
  ReportFigure,
  ReportMetric,
  ReportMetricGrid,
  ReportNote,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

function formatMm(value: number): string {
  return `${new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
  }).format(value)} mm`
}

export function BeamSizingReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(beamSizingSchema, calculation.inputs)
  const result = readSavedResult<BeamSizingReportResult>(
    calculation.result,
    BEAM_SIZING_REPORT_RESULT_SPEC
  )

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const labels = getBeamSizingReportLabels(input, result)

  if (!labels) {
    return <ToolReportFallback />
  }

  const { elementLabel, supportLabel, capacityLabel } = labels

  return (
    <ToolReportLayout
      title="Sección recomendada"
      description={`${elementLabel} — ${supportLabel}`}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <ReportFigure
          title="Sección transversal"
          description="Dimensiones recomendadas en milímetros."
        >
          <SectionDiagram
            width={result.b}
            height={result.h}
            className="mx-auto w-full max-w-xs"
          />
        </ReportFigure>

        <div className="space-y-4">
          <ReportMetricGrid>
            <ReportMetric
              label="Sección recomendada"
              value={`${result.b} × ${result.h} mm`}
              emphasis
            />
            <ReportMetric
              label="Peralte mínimo exacto"
              value={formatMm(result.hMinExact)}
            />
            <ReportMetric
              label="Peralte redondeado"
              value={formatMm(result.h)}
              hint="Múltiplo de 50 mm"
            />
            <ReportMetric label="Ancho mínimo" value={formatMm(result.bMin)} />
          </ReportMetricGrid>

          <ReportDetailGrid className="sm:grid-cols-2 lg:grid-cols-2">
            <ReportDetail
              label="Capacidad de disipación"
              value={capacityLabel}
            />
            <ReportDetail
              label="Relación L/h"
              value={formatNumber(result.factor, 2)}
            />
            <ReportDetail
              label="Tabla de espesores"
              value={
                result.usedRecommendedTable
                  ? "Tabla CR.9.5 (recomendada)"
                  : "Tabla C.9.5(a)"
              }
            />
            <ReportDetail
              label="Referencia del ancho"
              value={result.bMinReference}
            />
          </ReportDetailGrid>

          <ReportNote>
            Predimensionado orientativo según la NSR-10 (Tabla C.9.5(a) y
            CR.9.5). Verifica las deflexiones y la resistencia de la sección
            antes de usarla en diseño.
          </ReportNote>
        </div>
      </div>
    </ToolReportLayout>
  )
}
