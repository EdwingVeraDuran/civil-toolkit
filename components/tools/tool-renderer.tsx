"use client"

import type { ComponentType } from "react"

import { AreaCalculator } from "@/components/tools/area-calculator"
import { BeamSizing } from "@/components/tools/beam-sizing"
import { BearingAzimuth } from "@/components/tools/bearing-azimuth"
import { CoordinatesArea } from "@/components/tools/coordinates-area"
import { InterpolationCalculator } from "@/components/tools/interpolation-calculator"
import { LoadCombinations } from "@/components/tools/load-combinations"
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
  "rebar-schedule": RebarSchedule,
  "soil-phase-relationships": SoilPhaseRelationships,
  "bearing-azimuth": BearingAzimuth,
  "coordinates-area": CoordinatesArea,
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
