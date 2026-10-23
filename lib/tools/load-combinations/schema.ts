import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const LOAD_UNITS = ["kn", "knm", "knm-line", "knm2"] as const

export type LoadUnit = (typeof LOAD_UNITS)[number]

export const LOAD_UNIT_LABELS: Record<LoadUnit, string> = {
  kn: "kN",
  knm: "kN·m",
  "knm-line": "kN/m",
  knm2: "kN/m²",
}

export const DEFAULT_LOAD_UNIT: LoadUnit = "kn"

export function isLoadUnit(value: unknown): value is LoadUnit {
  return (
    typeof value === "string" &&
    (LOAD_UNITS as readonly string[]).includes(value)
  )
}

const loadValue = z.preprocess(
  parseNumericInput,
  z.number("Ingresa un número válido").finite("Ingresa un número válido")
)

export const loadCombinationsSchema = z.object({
  deadLoad: loadValue,
  liveLoad: loadValue,
  windLoad: loadValue,
  seismicLoad: loadValue,
  unit: z.enum(LOAD_UNITS),
  useHalfLive: z.boolean(),
  windWithoutDirectionalFactor: z.boolean(),
  seismicAtServiceLevel: z.boolean(),
})

export type LoadCombinationsInput = z.infer<typeof loadCombinationsSchema>
