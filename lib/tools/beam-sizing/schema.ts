import { z } from "zod"
import { parseNumericInput } from "@/lib/tools/parse-numeric"
import {
  DISSIPATION_CAPACITIES,
  ELEMENT_TYPES,
  LIGHTWEIGHT_DENSITY_MAX,
  LIGHTWEIGHT_DENSITY_MIN,
  SUPPORT_CONDITIONS,
} from "@/lib/estructuras/nsr10"

export const beamSizingSchema = z
  .object({
    elementType: z.enum(ELEMENT_TYPES),
    supportCondition: z.enum(SUPPORT_CONDITIONS),
    capacity: z.enum(DISSIPATION_CAPACITIES),
    span: z.preprocess(
      parseNumericInput,
      z
        .number("Ingresa un número válido")
        .finite("Ingresa un número válido")
        .positive("La luz debe ser mayor que cero")
        .max(100, "La luz debe ser como máximo 100 m"),
    ),
    fy: z.preprocess(
      parseNumericInput,
      z
        .number("Ingresa un número válido")
        .finite("Ingresa un número válido")
        .min(200, "El fy debe estar entre 200 y 600 MPa")
        .max(600, "El fy debe estar entre 200 y 600 MPa"),
    ),
    lightweight: z.boolean(),
    concreteDensity: z.preprocess(
      parseNumericInput,
      z
        .number("Ingresa un número válido")
        .finite("Ingresa un número válido")
        .positive("La densidad debe ser mayor que cero"),
    ),
    fragilePartitions: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (
      data.lightweight &&
      (data.concreteDensity < LIGHTWEIGHT_DENSITY_MIN ||
        data.concreteDensity > LIGHTWEIGHT_DENSITY_MAX)
    ) {
      ctx.addIssue({
        code: "custom",
        message: `La densidad del concreto liviano debe estar entre ${LIGHTWEIGHT_DENSITY_MIN} y ${LIGHTWEIGHT_DENSITY_MAX} kg/m³`,
        path: ["concreteDensity"],
      })
    }
  })

export type BeamSizingInput = z.infer<typeof beamSizingSchema>
