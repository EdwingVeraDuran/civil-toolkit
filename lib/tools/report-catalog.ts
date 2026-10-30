/**
 * Herramientas que tienen una plantilla de reporte con visualización.
 *
 * Las herramientas sin visualización conservan el reporte genérico.
 */
export const TOOL_REPORT_IDS = [
  "area-calculator",
  "slope-calculator",
  "interpolation-calculator",
  "beam-sizing",
  "open-channel-flow",
  "pipe-hydraulics",
  "atterberg-limits",
  "bearing-azimuth",
  "coordinates-area",
  "soil-phase-relationships",
] as const

export type ToolReportId = (typeof TOOL_REPORT_IDS)[number]

const TOOL_REPORT_ID_SET: ReadonlySet<string> = new Set(TOOL_REPORT_IDS)

export function isToolReportId(toolId: string): toolId is ToolReportId {
  return TOOL_REPORT_ID_SET.has(toolId)
}
