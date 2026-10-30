import { describe, expect, it } from "vitest"

import {
  BEAM_SIZING_REPORT_RESULT_SPEC,
  getBeamSizingReportLabels,
  type BeamSizingReportResult,
} from "@/lib/tools/beam-sizing/report"
import { beamSizingSchema } from "@/lib/tools/beam-sizing/schema"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"

const SAVED_INPUT = {
  fy: 420,
  span: 4,
  capacity: "DMO",
  elementType: "viga",
  lightweight: false,
  concreteDensity: 1800,
  supportCondition: "un-extremo-continuo",
  fragilePartitions: true,
}

const SAVED_RESULT = {
  b: 200,
  h: 350,
  bMin: 200,
  factor: 12,
  capacity: "DMO",
  warnings: [
    "Se usó la Tabla CR.9.5 (recomendada). NSR-10, C.9.5.2.1 — Deben calcularse las deflexiones si el elemento soporta o está unido a tabiques o divisiones susceptibles de dañarse.",
    "Predimensionado orientativo: verifica las deflexiones y la resistencia de acuerdo con la NSR-10.",
  ],
  hMinExact: 333.3333333333333,
  bMinReference: "NSR-10, C.21.3.4 — bw ≥ 200 mm",
  usedRecommendedTable: true,
}

describe("reporte de predimensionado de vigas", () => {
  it("lee snapshots antiguos sin elementType ni supportCondition en result", () => {
    const input = parseSavedInput(beamSizingSchema, SAVED_INPUT)
    const result = readSavedResult<BeamSizingReportResult>(
      SAVED_RESULT,
      BEAM_SIZING_REPORT_RESULT_SPEC
    )

    if (!input || !result) {
      throw new Error("El snapshot guardado debe ser válido para el reporte")
    }

    expect(getBeamSizingReportLabels(input, result)).toEqual({
      elementLabel: "Viga",
      supportLabel: "Un extremo continuo",
      capacityLabel: "Moderada (DMO)",
    })
  })
})
