import { SoilPhaseDiagram } from "@/components/tools/soil-phase-diagram"
import type {
  SoilPhaseResult,
  SoilPhaseVolumes,
} from "@/lib/tools/soil-phase-relationships/calculate"
import {
  SOIL_PHASE_MODE_LABELS,
  soilPhaseRelationshipsSchema,
} from "@/lib/tools/soil-phase-relationships/schema"
import {
  parseSavedInput,
  readSavedRecord,
  readSavedResult,
} from "@/lib/tools/report-data"
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
  ReportNote,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

function displayUnitWeight(value: number, unitId: string): number {
  const unit = getUnit(unitId)
  if (!unit || unit.dimension !== "unitWeight") return value
  return Measurement.from(value, "knm3").to(unit).value
}

export function SoilPhaseReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(
    soilPhaseRelationshipsSchema,
    calculation.inputs
  )
  const result = readSavedResult<SoilPhaseResult>(calculation.result, {
    numbers: [
      "voidRatio",
      "porosity",
      "saturation",
      "waterContent",
      "unitWeight",
      "dryUnitWeight",
      "saturatedUnitWeight",
      "submergedUnitWeight",
      "specificGravity",
      "waterUnitWeight",
    ],
    strings: ["mode", "formula"],
    records: ["phase"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const phase = readSavedRecord<SoilPhaseVolumes>(result.phase, {
    numbers: [
      "volumeSolidsM3",
      "volumeVoidsM3",
      "volumeWaterM3",
      "volumeAirM3",
      "volumeTotalM3",
      "weightSolidsKN",
      "weightWaterKN",
      "weightTotalKN",
    ],
  })
  const modeLabel = SOIL_PHASE_MODE_LABELS[result.mode]

  if (!phase || !modeLabel) {
    return <ToolReportFallback />
  }

  const unitWeightSymbol = getUnit(input.unitWeightUnit)?.symbol ?? "kN/m³"
  const displayedUnitWeight = displayUnitWeight(
    result.unitWeight,
    input.unitWeightUnit
  )
  const displayedDryUnitWeight = displayUnitWeight(
    result.dryUnitWeight,
    input.unitWeightUnit
  )
  const displayedSaturatedUnitWeight = displayUnitWeight(
    result.saturatedUnitWeight,
    input.unitWeightUnit
  )
  const displayedSubmergedUnitWeight = displayUnitWeight(
    result.submergedUnitWeight,
    input.unitWeightUnit
  )
  const displayedWaterUnitWeight = displayUnitWeight(
    result.waterUnitWeight,
    input.unitWeightUnit
  )

  return (
    <ToolReportLayout
      title="Relaciones de fase"
      description={`${modeLabel} — relaciones volumétricas y gravimétricas.`}
    >
      <ReportMetricGrid className="sm:grid-cols-2 lg:grid-cols-3">
        <ReportMetric
          label="Relación de vacíos, e"
          value={formatNumber(result.voidRatio, 3)}
          emphasis
        />
        <ReportMetric
          label="Porosidad, n"
          value={`${formatNumber(result.porosity * 100, 2)} %`}
          hint={`n = ${formatNumber(result.porosity, 3)}`}
        />
        <ReportMetric
          label="Grado de saturación, S"
          value={`${formatNumber(result.saturation * 100, 2)} %`}
        />
        <ReportMetric
          label="Peso unitario natural, γ"
          value={`${formatNumber(displayedUnitWeight, 3)} ${unitWeightSymbol}`}
        />
        <ReportMetric
          label="Contenido de agua, w"
          value={`${formatNumber(result.waterContent * 100, 2)} %`}
        />
      </ReportMetricGrid>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <ReportDetailGrid>
            <ReportDetail
              label="Peso unitario seco, γd"
              value={`${formatNumber(displayedDryUnitWeight, 3)} ${unitWeightSymbol}`}
            />
            <ReportDetail
              label="Peso unitario saturado, γsat"
              value={`${formatNumber(displayedSaturatedUnitWeight, 3)} ${unitWeightSymbol}`}
            />
            <ReportDetail
              label="Peso unitario sumergido, γ'"
              value={`${formatNumber(displayedSubmergedUnitWeight, 3)} ${unitWeightSymbol}`}
            />
            <ReportDetail
              label="Gravedad específica, Gs"
              value={formatNumber(result.specificGravity, 3)}
            />
            <ReportDetail
              label="Peso unitario del agua, γw"
              value={`${formatNumber(displayedWaterUnitWeight, 3)} ${unitWeightSymbol}`}
            />
            <ReportDetail label="Modo de cálculo" value={modeLabel} />
          </ReportDetailGrid>

          <ReportFormula formula={result.formula} />
        </div>

        <ReportFigure
          title="Diagrama de fases"
          description="Normalizado para Vs = 1 m³; no está a escala."
        >
          <SoilPhaseDiagram
            result={result}
            volumeUnitId={input.volumeUnit}
            forceUnitId={input.forceUnit}
            className="mx-auto w-full max-w-sm"
          />
        </ReportFigure>
      </div>

      <ReportNote>
        Resultados orientativos. Verifica los datos con ensayos de laboratorio y
        la normativa aplicable antes de usarlos en diseño.
      </ReportNote>
    </ToolReportLayout>
  )
}
