import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const CHANNEL_MODES = ["discharge", "depth"] as const
export type ChannelMode = (typeof CHANNEL_MODES)[number]

export const CHANNEL_MODE_LABELS: Record<ChannelMode, string> = {
  discharge: "Caudal conocido → profundidad normal",
  depth: "Profundidad conocida → caudal",
}

export const CHANNEL_MODE_DESCRIPTIONS: Record<ChannelMode, string> = {
  discharge:
    "Se conoce el caudal. La profundidad normal se obtiene iterando la ecuación de Manning; luego se calculan la velocidad, la profundidad crítica y el régimen.",
  depth:
    "Se conoce la profundidad de flujo uniforme. Se calcula el caudal con Manning y, a partir de él, la profundidad crítica y el régimen.",
}

export const CHANNEL_SECTIONS = [
  "rectangular",
  "trapezoidal",
  "triangular",
  "circular",
] as const
export type ChannelSectionType = (typeof CHANNEL_SECTIONS)[number]

export const CHANNEL_SECTION_LABELS: Record<ChannelSectionType, string> = {
  rectangular: "Rectangular",
  trapezoidal: "Trapezoidal",
  triangular: "Triangular",
  circular: "Circular parcialmente llena",
}

export const CHANNEL_SECTION_SUMMARY_LABELS: Record<
  ChannelSectionType,
  string
> = {
  rectangular: "Rectangular",
  trapezoidal: "Trapezoidal",
  triangular: "Triangular",
  circular: "Circular",
}

export const CHANNEL_SECTION_DESCRIPTIONS: Record<ChannelSectionType, string> =
  {
    rectangular: "Ancho de fondo constante b y paredes verticales.",
    trapezoidal:
      "Ancho de fondo b y taludes laterales z (horizontal:vertical).",
    triangular: "Sección en V con taludes laterales z (horizontal:vertical).",
    circular:
      "Conducto circular de diámetro D con flujo a superficie libre. La profundidad debe ser menor que D.",
  }

export const DEFAULT_CHANNEL_MODE: ChannelMode = "discharge"
export const DEFAULT_CHANNEL_SECTION: ChannelSectionType = "rectangular"

const positiveNumber = (message: string) =>
  z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un número válido")
      .finite("Ingresa un número válido")
      .positive(message)
  )

const rectangularGeometrySchema = z.object({
  section: z.literal("rectangular"),
  bottomWidth: positiveNumber("El ancho de fondo debe ser mayor que cero"),
})

const trapezoidalGeometrySchema = z.object({
  section: z.literal("trapezoidal"),
  bottomWidth: positiveNumber("El ancho de fondo debe ser mayor que cero"),
  sideSlope: positiveNumber("El talud debe ser mayor que cero"),
})

const triangularGeometrySchema = z.object({
  section: z.literal("triangular"),
  sideSlope: positiveNumber("El talud debe ser mayor que cero"),
})

const circularGeometrySchema = z.object({
  section: z.literal("circular"),
  diameter: positiveNumber("El diámetro debe ser mayor que cero"),
})

export const channelGeometrySchema = z.discriminatedUnion("section", [
  rectangularGeometrySchema,
  trapezoidalGeometrySchema,
  triangularGeometrySchema,
  circularGeometrySchema,
])

const commonFields = {
  geometry: channelGeometrySchema,
  slope: positiveNumber("La pendiente debe ser mayor que cero"),
  manning: positiveNumber("El coeficiente de Manning debe ser mayor que cero"),
}

const dischargeSchema = z.object({
  mode: z.literal("discharge"),
  ...commonFields,
  discharge: positiveNumber("El caudal debe ser mayor que cero"),
})

const depthSchema = z.object({
  mode: z.literal("depth"),
  ...commonFields,
  depth: positiveNumber("La profundidad debe ser mayor que cero"),
})

export const openChannelFlowSchema = z
  .discriminatedUnion("mode", [dischargeSchema, depthSchema])
  .superRefine((input, context) => {
    if (
      input.mode === "depth" &&
      input.geometry.section === "circular" &&
      input.depth >= input.geometry.diameter
    ) {
      context.addIssue({
        code: "custom",
        path: ["depth"],
        message:
          "En una sección circular la profundidad debe ser menor que el diámetro",
      })
    }
  })

export type OpenChannelFlowInput = z.infer<typeof openChannelFlowSchema>
export type OpenChannelFlowDischargeInput = z.infer<typeof dischargeSchema>
export type OpenChannelFlowDepthInput = z.infer<typeof depthSchema>
