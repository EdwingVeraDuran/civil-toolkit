"use client"

import type { ComponentType } from "react"

import { AreaCalculator } from "@/components/tools/area-calculator"
import { AiuLaborCost } from "@/components/tools/aiu-labor-cost"
import { AtterbergLimits } from "@/components/tools/atterberg-limits"
import { BeamSizing } from "@/components/tools/beam-sizing"
import { BearingAzimuth } from "@/components/tools/bearing-azimuth"
import { CoordinatesArea } from "@/components/tools/coordinates-area"
import { InterpolationCalculator } from "@/components/tools/interpolation-calculator"
import { LoadCombinations } from "@/components/tools/load-combinations"
import { OpenChannelFlow } from "@/components/tools/open-channel-flow"
import { RebarSchedule } from "@/components/tools/rebar-schedule"
import { SlopeCalculator } from "@/components/tools/slope-calculator"
import { SoilPhaseRelationships } from "@/components/tools/soil-phase-relationships"
import { UnitConverter } from "@/components/tools/unit-converter"
import type { EditMode, ToolComponentProps } from "@/lib/tools/types"

const TOOL_COMPONENTS: Record<string, ComponentType<ToolComponentProps>> = {
  "unit-converter": UnitConverter,
  "area-calculator": AreaCalculator,
  "slope-calculator": SlopeCalculator,
  "interpolation-calculator": InterpolationCalculator,
  "beam-sizing": BeamSizing,
  "load-combinations": LoadCombinations,
  "open-channel-flow": OpenChannelFlow,
  "rebar-schedule": RebarSchedule,
  "soil-phase-relationships": SoilPhaseRelationships,
  "atterberg-limits": AtterbergLimits,
  "bearing-azimuth": BearingAzimuth,
  "coordinates-area": CoordinatesArea,
  "aiu-labor-cost": AiuLaborCost,
}

export function ToolRenderer({
  toolId,
  initialInput,
  editMode,
}: {
  toolId: string
  initialInput?: Record<string, unknown>
  editMode?: EditMode
}) {
  const Component = TOOL_COMPONENTS[toolId]

  if (!Component) {
    return null
  }

  return <Component initialInput={initialInput} editMode={editMode} />
}
