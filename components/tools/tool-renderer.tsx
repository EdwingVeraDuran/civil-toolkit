"use client"

import type { ComponentType } from "react"

import { UnitConverter } from "@/components/tools/unit-converter"

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "unit-converter": UnitConverter,
}

export function ToolRenderer({ toolId }: { toolId: string }) {
  const Component = TOOL_COMPONENTS[toolId]

  if (!Component) {
    return null
  }

  return <Component />
}
