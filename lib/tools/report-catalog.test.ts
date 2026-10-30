import { describe, expect, it } from "vitest"

import { TOOL_CATALOG } from "@/lib/tools/catalog"
import { TOOL_REPORT_IDS, isToolReportId } from "@/lib/tools/report-catalog"

describe("TOOL_REPORT_IDS", () => {
  it("cubre las 10 herramientas con visualización", () => {
    expect(TOOL_REPORT_IDS).toHaveLength(10)
  })

  it("no contiene identificadores repetidos", () => {
    expect(new Set(TOOL_REPORT_IDS).size).toBe(TOOL_REPORT_IDS.length)
  })

  it("solo incluye herramientas registradas en el catálogo", () => {
    const catalogIds = new Set(TOOL_CATALOG.map((tool) => tool.id))

    for (const toolId of TOOL_REPORT_IDS) {
      expect(catalogIds.has(toolId)).toBe(true)
    }
  })

  it("deja el reporte genérico para las herramientas sin gráfico", () => {
    const toolsWithoutReport = TOOL_CATALOG.map((tool) => tool.id).filter(
      (toolId) => !isToolReportId(toolId)
    )

    expect(toolsWithoutReport.sort()).toEqual([
      "aiu-labor-cost",
      "load-combinations",
      "rebar-schedule",
      "unit-converter",
    ])
  })

  it("reconoce únicamente los identificadores del catálogo de reportes", () => {
    expect(isToolReportId("beam-sizing")).toBe(true)
    expect(isToolReportId("rebar-schedule")).toBe(false)
  })
})
