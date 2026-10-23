"use client"

import type { ComponentType } from "react"

import { BeamSizing } from "@/components/tools/beam-sizing"
import { SlopeCalculator } from "@/components/tools/slope-calculator"
import { UnitConverter } from "@/components/tools/unit-converter"
import type { EditMode, ToolComponentProps } from "@/lib/tools/types"

const TOOL_COMPONENTS: Record<string, ComponentType<ToolComponentProps>> = {
  "unit-converter": UnitConverter,
  "slope-calculator": SlopeCalculator,
  "beam-sizing": BeamSizing,
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
