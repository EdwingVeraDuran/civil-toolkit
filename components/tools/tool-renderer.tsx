"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import type { EditMode, ToolComponentProps } from "@/lib/tools/types"

function ToolLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

const TOOL_COMPONENTS: Record<string, ComponentType<ToolComponentProps>> = {
  "unit-converter": dynamic(
    () =>
      import("@/components/tools/unit-converter").then(
        (module) => module.UnitConverter
      ),
    { loading: ToolLoading }
  ),
  "area-calculator": dynamic(
    () =>
      import("@/components/tools/area-calculator").then(
        (module) => module.AreaCalculator
      ),
    { loading: ToolLoading }
  ),
  "slope-calculator": dynamic(
    () =>
      import("@/components/tools/slope-calculator").then(
        (module) => module.SlopeCalculator
      ),
    { loading: ToolLoading }
  ),
  "interpolation-calculator": dynamic(
    () =>
      import("@/components/tools/interpolation-calculator").then(
        (module) => module.InterpolationCalculator
      ),
    { loading: ToolLoading }
  ),
  "beam-sizing": dynamic(
    () =>
      import("@/components/tools/beam-sizing").then(
        (module) => module.BeamSizing
      ),
    { loading: ToolLoading }
  ),
  "load-combinations": dynamic(
    () =>
      import("@/components/tools/load-combinations").then(
        (module) => module.LoadCombinations
      ),
    { loading: ToolLoading }
  ),
  "open-channel-flow": dynamic(
    () =>
      import("@/components/tools/open-channel-flow").then(
        (module) => module.OpenChannelFlow
      ),
    { loading: ToolLoading }
  ),
  "pipe-hydraulics": dynamic(
    () =>
      import("@/components/tools/pipe-hydraulics").then(
        (module) => module.PipeHydraulics
      ),
    { loading: ToolLoading }
  ),
  "rebar-schedule": dynamic(
    () =>
      import("@/components/tools/rebar-schedule").then(
        (module) => module.RebarSchedule
      ),
    { loading: ToolLoading }
  ),
  "soil-phase-relationships": dynamic(
    () =>
      import("@/components/tools/soil-phase-relationships").then(
        (module) => module.SoilPhaseRelationships
      ),
    { loading: ToolLoading }
  ),
  "atterberg-limits": dynamic(
    () =>
      import("@/components/tools/atterberg-limits").then(
        (module) => module.AtterbergLimits
      ),
    { loading: ToolLoading }
  ),
  "bearing-azimuth": dynamic(
    () =>
      import("@/components/tools/bearing-azimuth").then(
        (module) => module.BearingAzimuth
      ),
    { loading: ToolLoading }
  ),
  "coordinates-area": dynamic(
    () =>
      import("@/components/tools/coordinates-area").then(
        (module) => module.CoordinatesArea
      ),
    { loading: ToolLoading }
  ),
  "aiu-labor-cost": dynamic(
    () =>
      import("@/components/tools/aiu-labor-cost").then(
        (module) => module.AiuLaborCost
      ),
    { loading: ToolLoading }
  ),
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
