"use client"

import type { ComponentType } from "react"

import { BeamSizing } from "@/components/tools/beam-sizing"
import { UnitConverter } from "@/components/tools/unit-converter"

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "unit-converter": UnitConverter,
  "beam-sizing": BeamSizing,
}

export function ToolRenderer({ toolId }: { toolId: string }) {
  const Component = TOOL_COMPONENTS[toolId]

  if (!Component) {
    return null
  }

  return <Component />
}
