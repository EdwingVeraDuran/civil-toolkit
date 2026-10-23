import { z } from "zod"

import { parseNumericInput } from "@/lib/tools/parse-numeric"

export const DEFAULT_DIRECT_COST = 10_000_000
export const DEFAULT_MONTHLY_SALARY = 2_000_000
export const DEFAULT_TRANSPORT_ALLOWANCE = 200_000
export const DEFAULT_MONTHLY_HOURS = 240
export const MAX_MONTHLY_HOURS = 744

function positiveNumber(message: string) {
  return z
    .number("Ingresa un número válido")
    .finite("Ingresa un número válido")
    .positive(message)
}

function nonNegativeNumber(message: string) {
  return z
    .number("Ingresa un número válido")
    .finite("Ingresa un número válido")
    .min(0, message)
}

function percentage() {
  return z.preprocess(
    parseNumericInput,
    z
      .number("Ingresa un porcentaje válido")
      .finite("Ingresa un porcentaje válido")
      .min(0, "El porcentaje no puede ser negativo")
      .max(100, "El porcentaje debe ser como máximo 100 %")
  )
}

export const aiuLaborCostSchema = z.object({
  directCost: z.preprocess(
    parseNumericInput,
    positiveNumber("Los costos directos deben ser mayores que cero")
  ),
  administrationPercent: percentage(),
  contingencyPercent: percentage(),
  profitPercent: percentage(),
  monthlySalary: z.preprocess(
    parseNumericInput,
    positiveNumber("El salario mensual debe ser mayor que cero")
  ),
  transportAllowance: z.preprocess(
    parseNumericInput,
    nonNegativeNumber("El auxilio de transporte no puede ser negativo")
  ),
  monthlyHours: z.preprocess(
    parseNumericInput,
    positiveNumber("Las horas laborales al mes deben ser mayores que cero").max(
      MAX_MONTHLY_HOURS,
      `Las horas laborales al mes deben ser como máximo ${MAX_MONTHLY_HOURS}`
    )
  ),
  severancePercent: percentage(),
  severanceInterestAnnualPercent: percentage(),
  serviceBonusPercent: percentage(),
  vacationPercent: percentage(),
  healthPercent: percentage(),
  pensionPercent: percentage(),
  arlPercent: percentage(),
  senaPercent: percentage(),
  icbfPercent: percentage(),
  familyCompensationPercent: percentage(),
})

export type AiuLaborCostInput = z.infer<typeof aiuLaborCostSchema>

export const aiuSchema = aiuLaborCostSchema.pick({
  directCost: true,
  administrationPercent: true,
  contingencyPercent: true,
  profitPercent: true,
})

export const laborSchema = aiuLaborCostSchema.pick({
  monthlySalary: true,
  transportAllowance: true,
  monthlyHours: true,
  severancePercent: true,
  severanceInterestAnnualPercent: true,
  serviceBonusPercent: true,
  vacationPercent: true,
  healthPercent: true,
  pensionPercent: true,
  arlPercent: true,
  senaPercent: true,
  icbfPercent: true,
  familyCompensationPercent: true,
})

export type AiuInput = z.infer<typeof aiuSchema>
export type LaborInput = z.infer<typeof laborSchema>
