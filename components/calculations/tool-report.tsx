import type { ReactNode } from "react"

import { AreaReport } from "@/components/calculations/tool-reports/area-report"
import { AtterbergReport } from "@/components/calculations/tool-reports/atterberg-report"
import { BeamSizingReport } from "@/components/calculations/tool-reports/beam-sizing-report"
import { BearingReport } from "@/components/calculations/tool-reports/bearing-report"
import { CoordinatesReport } from "@/components/calculations/tool-reports/coordinates-report"
import { InterpolationReport } from "@/components/calculations/tool-reports/interpolation-report"
import { OpenChannelReport } from "@/components/calculations/tool-reports/open-channel-report"
import { PipeHydraulicsReport } from "@/components/calculations/tool-reports/pipe-hydraulics-report"
import { SlopeReport } from "@/components/calculations/tool-reports/slope-report"
import { SoilPhaseReport } from "@/components/calculations/tool-reports/soil-phase-report"
import type { ToolReportProps } from "@/components/calculations/tool-reports/report-ui"
import type { Calculation } from "@/lib/types/calculation"
import { isToolReportId, type ToolReportId } from "@/lib/tools/report-catalog"

type ToolReportRenderer = (props: ToolReportProps) => ReactNode

const TOOL_REPORTS: Record<ToolReportId, ToolReportRenderer> = {
  "area-calculator": (props) => <AreaReport {...props} />,
  "slope-calculator": (props) => <SlopeReport {...props} />,
  "interpolation-calculator": (props) => <InterpolationReport {...props} />,
  "beam-sizing": (props) => <BeamSizingReport {...props} />,
  "open-channel-flow": (props) => <OpenChannelReport {...props} />,
  "pipe-hydraulics": (props) => <PipeHydraulicsReport {...props} />,
  "atterberg-limits": (props) => <AtterbergReport {...props} />,
  "bearing-azimuth": (props) => <BearingReport {...props} />,
  "coordinates-area": (props) => <CoordinatesReport {...props} />,
  "soil-phase-relationships": (props) => <SoilPhaseReport {...props} />,
}

export function renderToolReport(calculation: Calculation): ReactNode {
  if (!isToolReportId(calculation.tool_id)) {
    return null
  }

  return TOOL_REPORTS[calculation.tool_id]({ calculation })
}
