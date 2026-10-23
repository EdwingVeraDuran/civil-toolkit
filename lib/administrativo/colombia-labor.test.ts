import { describe, expect, it } from "vitest"

import {
  AIU_LABOR_REFERENCES,
  ARL_RISK_CLASSES,
  DEFAULT_AIU_PERCENTAGES,
  DEFAULT_LABOR_RATES,
} from "@/lib/administrativo/colombia-labor"

describe("tasas administrativas y laborales", () => {
  it("usa porcentajes de ejemplo para el AIU", () => {
    expect(DEFAULT_AIU_PERCENTAGES).toEqual({
      administration: 10,
      contingency: 5,
      profit: 5,
    })
  })

  it("suma las prestaciones sociales mensuales", () => {
    const monthlyInterest = DEFAULT_LABOR_RATES.severanceInterestAnnual / 12
    const total =
      DEFAULT_LABOR_RATES.severance +
      monthlyInterest +
      DEFAULT_LABOR_RATES.serviceBonus +
      DEFAULT_LABOR_RATES.vacation

    expect(total).toBeCloseTo(21.83, 6)
  })

  it("suma los aportes patronales y parafiscales", () => {
    const total =
      DEFAULT_LABOR_RATES.health +
      DEFAULT_LABOR_RATES.pension +
      DEFAULT_LABOR_RATES.arl +
      DEFAULT_LABOR_RATES.sena +
      DEFAULT_LABOR_RATES.icbf +
      DEFAULT_LABOR_RATES.familyCompensation

    expect(total).toBeCloseTo(30.022, 6)
  })

  it("define las cinco clases de riesgo de la ARL", () => {
    expect(ARL_RISK_CLASSES).toHaveLength(5)
    expect(ARL_RISK_CLASSES.map((item) => item.id)).toEqual([
      "I",
      "II",
      "III",
      "IV",
      "V",
    ])
    expect(ARL_RISK_CLASSES.map((item) => item.ratePercent)).toEqual([
      0.522, 1.044, 2.436, 4.35, 6.96,
    ])
  })

  it("cita las normas de AIU, prestaciones y parafiscales", () => {
    expect(AIU_LABOR_REFERENCES.aiu).toContain("Ley 80 de 1993")
    expect(AIU_LABOR_REFERENCES.labor).toContain(
      "Código Sustantivo del Trabajo"
    )
    expect(AIU_LABOR_REFERENCES.socialSecurity).toContain("Ley 100 de 1993")
    expect(AIU_LABOR_REFERENCES.parafiscales).toContain("Ley 21 de 1982")
    expect(AIU_LABOR_REFERENCES.exemptions).toContain("Ley 1607 de 2012")
  })
})
