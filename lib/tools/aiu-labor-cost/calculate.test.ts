import { describe, expect, it } from "vitest"

import {
  calculateAiu,
  calculateAiuLaborCost,
  calculateLaborCost,
  type LaborConcept,
} from "@/lib/tools/aiu-labor-cost/calculate"
import { aiuLaborCostDefinition } from "@/lib/tools/aiu-labor-cost/definition"
import {
  aiuLaborCostSchema,
  type AiuLaborCostInput,
} from "@/lib/tools/aiu-labor-cost/schema"

function rawInput(overrides: Record<string, unknown> = {}) {
  return {
    directCost: "10000000",
    administrationPercent: "10",
    contingencyPercent: "5",
    profitPercent: "5",
    monthlySalary: "2000000",
    transportAllowance: "200000",
    monthlyHours: "240",
    severancePercent: "8,33",
    severanceInterestAnnualPercent: "12",
    serviceBonusPercent: "8,33",
    vacationPercent: "4,17",
    healthPercent: "8,5",
    pensionPercent: "12",
    arlPercent: "0,522",
    senaPercent: "2",
    icbfPercent: "3",
    familyCompensationPercent: "4",
    ...overrides,
  }
}

function parseInput(
  overrides: Record<string, unknown> = {}
): AiuLaborCostInput {
  return aiuLaborCostSchema.parse(rawInput(overrides))
}

function fieldErrors(
  result: ReturnType<typeof aiuLaborCostDefinition.validate>
) {
  if (result.valid) return []
  return result.errors.map((error) => error.field)
}

function conceptByKey(
  concepts: LaborConcept[],
  key: string
): LaborConcept | undefined {
  return concepts.find((concept) => concept.key === key)
}

describe("cálculo de AIU", () => {
  it("aplica administración, imprevistos y utilidad sobre los costos directos", () => {
    const result = calculateAiu(parseInput())

    expect(result.administrationValue).toBeCloseTo(1_000_000, 6)
    expect(result.contingencyValue).toBeCloseTo(500_000, 6)
    expect(result.profitValue).toBeCloseTo(500_000, 6)
    expect(result.totalPercent).toBe(20)
    expect(result.totalValue).toBeCloseTo(2_000_000, 6)
    expect(result.totalBudget).toBeCloseTo(12_000_000, 6)
    expect(result.aiuShareOfTotalPercent).toBeCloseTo(16.666667, 6)
  })

  it("acepta porcentajes con coma decimal", () => {
    const input = parseInput({
      directCost: "10000000,5",
      administrationPercent: "10,5",
      contingencyPercent: "0",
      profitPercent: "0",
    })
    const result = calculateAiu(input)

    expect(input.directCost).toBe(10_000_000.5)
    expect(result.administrationValue).toBeCloseTo(1_050_000.0525, 6)
  })
})

describe("cálculo del costo real del trabajador", () => {
  it("calcula prestaciones sociales y aportes con las tasas por defecto", () => {
    const result = calculateLaborCost(parseInput())

    expect(result.benefitsBase).toBeCloseTo(2_200_000, 6)
    expect(result.severance).toBeCloseTo(183_260, 6)
    expect(result.severanceInterest).toBeCloseTo(1_832.6, 6)
    expect(result.serviceBonus).toBeCloseTo(183_260, 6)
    expect(result.vacation).toBeCloseTo(83_400, 6)
    expect(result.totalBenefits).toBeCloseTo(451_752.6, 6)

    expect(result.health).toBeCloseTo(170_000, 6)
    expect(result.pension).toBeCloseTo(240_000, 6)
    expect(result.arl).toBeCloseTo(10_440, 6)
    expect(result.sena).toBeCloseTo(40_000, 6)
    expect(result.icbf).toBeCloseTo(60_000, 6)
    expect(result.familyCompensation).toBeCloseTo(80_000, 6)
    expect(result.totalContributions).toBeCloseTo(600_440, 6)
  })

  it("calcula el costo mensual, anual, diario y por hora", () => {
    const result = calculateLaborCost(parseInput())

    expect(result.monthlyCost).toBeCloseTo(3_252_192.6, 6)
    expect(result.annualCost).toBeCloseTo(39_026_311.2, 6)
    expect(result.dailyCost).toBeCloseTo(108_406.42, 6)
    expect(result.hourlyCost).toBeCloseTo(13_550.8025, 6)
    expect(result.costFactor).toBeCloseTo(1.6260963, 6)
    expect(result.benefitsPercentOfSalary).toBeCloseTo(22.58763, 6)
    expect(result.contributionsPercentOfSalary).toBeCloseTo(30.022, 6)
    expect(result.overheadPercentOfSalary).toBeCloseTo(52.60963, 6)
    expect(result.totalAdditionalCost).toBeCloseTo(1_252_192.6, 6)
    expect(result.totalAdditionalPercentOfSalary).toBeCloseTo(62.60963, 6)
  })

  it("incluye el auxilio en cesantías y prima, pero no en vacaciones ni aportes", () => {
    const withTransport = calculateLaborCost(parseInput())
    const withoutTransport = calculateLaborCost(
      parseInput({ transportAllowance: "0" })
    )

    expect(withTransport.severance - withoutTransport.severance).toBeCloseTo(
      200_000 * 0.0833,
      6
    )
    expect(
      withTransport.serviceBonus - withoutTransport.serviceBonus
    ).toBeCloseTo(200_000 * 0.0833, 6)
    expect(withTransport.vacation).toBeCloseTo(withoutTransport.vacation, 12)
    expect(withTransport.health).toBeCloseTo(withoutTransport.health, 12)
    expect(withTransport.pension).toBeCloseTo(withoutTransport.pension, 12)
  })

  it("permite ajustar tasas a cero por exenciones", () => {
    const result = calculateLaborCost(
      parseInput({
        healthPercent: "0",
        senaPercent: "0",
        icbfPercent: "0",
      })
    )

    expect(result.health).toBe(0)
    expect(result.sena).toBe(0)
    expect(result.icbf).toBe(0)
    expect(result.totalContributions).toBeCloseTo(330_440, 6)
  })

  it("expone el desglose por concepto", () => {
    const result = calculateLaborCost(parseInput())

    expect(result.concepts).toHaveLength(12)
    expect(conceptByKey(result.concepts, "salary")?.base).toBeNull()
    expect(conceptByKey(result.concepts, "transport-allowance")?.value).toBe(
      200_000
    )
    expect(conceptByKey(result.concepts, "severance")?.base).toBe(2_200_000)
    expect(conceptByKey(result.concepts, "vacation")?.base).toBe(2_000_000)
    expect(
      conceptByKey(result.concepts, "severance-interest")?.base
    ).toBeCloseTo(183_260, 6)
    expect(
      conceptByKey(result.concepts, "severance-interest")?.percentSuffix
    ).toBe("anual")
    expect(conceptByKey(result.concepts, "health")?.group).toBe("contributions")
  })

  it("no divide por cero si todas las tasas son cero", () => {
    const result = calculateLaborCost(
      parseInput({
        severancePercent: "0",
        severanceInterestAnnualPercent: "0",
        serviceBonusPercent: "0",
        vacationPercent: "0",
        healthPercent: "0",
        pensionPercent: "0",
        arlPercent: "0",
        senaPercent: "0",
        icbfPercent: "0",
        familyCompensationPercent: "0",
      })
    )

    expect(result.totalBenefits).toBe(0)
    expect(result.totalContributions).toBe(0)
    expect(result.monthlyCost).toBe(2_200_000)
    expect(result.costFactor).toBeCloseTo(1.1, 12)
  })
})

describe("resultado combinado y snapshot", () => {
  it("calcula AIU y costo laboral en una sola salida", () => {
    const result = calculateAiuLaborCost(parseInput())

    expect(result.aiu.totalBudget).toBeCloseTo(12_000_000, 6)
    expect(result.labor.monthlyCost).toBeCloseTo(3_252_192.6, 6)
  })

  it("genera el resumen del cálculo guardado", () => {
    const input = parseInput()
    const result = calculateAiuLaborCost(input)
    const snapshot = aiuLaborCostDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "AIU 20,00 % · Presupuesto 12.000.000 COP; costo laboral 3.252.193 COP/mes"
    )
    expect(snapshot.inputs).toMatchObject({
      directCost: 10_000_000,
      administrationPercent: 10,
      contingencyPercent: 5,
      profitPercent: 5,
      monthlySalary: 2_000_000,
      transportAllowance: 200_000,
      monthlyHours: 240,
      severancePercent: 8.33,
      severanceInterestAnnualPercent: 12,
      serviceBonusPercent: 8.33,
      vacationPercent: 4.17,
      healthPercent: 8.5,
      pensionPercent: 12,
      arlPercent: 0.522,
      senaPercent: 2,
      icbfPercent: 3,
      familyCompensationPercent: 4,
    })
    expect(snapshot.result).toHaveProperty("aiu")
    expect(snapshot.result).toHaveProperty("labor")
  })

  it("produce un resultado serializable", () => {
    const result = calculateAiuLaborCost(parseInput())
    const roundTrip = JSON.parse(JSON.stringify(result))

    expect(roundTrip.aiu.totalBudget).toBeCloseTo(12_000_000, 6)
    expect(roundTrip.labor.monthlyCost).toBeCloseTo(3_252_192.6, 6)
  })
})

describe("validación administrativa y laboral", () => {
  it("rechaza costos, salarios y horas no positivos", () => {
    const errors = fieldErrors(
      aiuLaborCostDefinition.validate(
        rawInput({
          directCost: "0",
          monthlySalary: "0",
          monthlyHours: "0",
        })
      )
    )

    expect(errors).toContain("directCost")
    expect(errors).toContain("monthlySalary")
    expect(errors).toContain("monthlyHours")
  })

  it("rechaza auxilio negativo y porcentajes fuera de rango", () => {
    const errors = fieldErrors(
      aiuLaborCostDefinition.validate(
        rawInput({
          transportAllowance: "-1",
          administrationPercent: "101",
          contingencyPercent: "-1",
          healthPercent: "abc",
        })
      )
    )

    expect(errors).toContain("transportAllowance")
    expect(errors).toContain("administrationPercent")
    expect(errors).toContain("contingencyPercent")
    expect(errors).toContain("healthPercent")
  })

  it("acepta cero en las tasas editables", () => {
    const input = parseInput({
      healthPercent: "0",
      senaPercent: "0",
      icbfPercent: "0",
      familyCompensationPercent: "0",
    })

    expect(input.healthPercent).toBe(0)
    expect(input.senaPercent).toBe(0)
    expect(input.icbfPercent).toBe(0)
    expect(input.familyCompensationPercent).toBe(0)
  })
})
