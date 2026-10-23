import { describe, expect, it } from "vitest"

import {
  ATTERBERG_REFERENCES,
  PLASTIC_LIMIT_RANGE_LIMIT,
  aLineValue,
  classifyPlasticity,
  formatFlowCurveEquation,
  liquidLimitFromFlowCurve,
  plasticLimitFromDeterminations,
  plasticityChartMax,
  uLineValue,
  type FlowCurvePoint,
} from "@/lib/suelos/atterberg"

function exactFlowCurvePoints(
  liquidLimit: number,
  slope: number
): FlowCurvePoint[] {
  const intercept = liquidLimit - slope * Math.log10(25)

  return [10, 20, 30, 40].map((blows) => ({
    blows,
    moisture: intercept + slope * Math.log10(blows),
  }))
}

describe("carta de plasticidad", () => {
  it("evalúa las líneas A y U en límites conocidos", () => {
    expect(aLineValue(20)).toBeCloseTo(0, 10)
    expect(aLineValue(30)).toBeCloseTo(7.3, 10)
    expect(aLineValue(50)).toBeCloseTo(21.9, 10)
    expect(aLineValue(100)).toBeCloseTo(58.4, 10)

    expect(uLineValue(8)).toBeCloseTo(0, 10)
    expect(uLineValue(50)).toBeCloseTo(37.8, 10)
    expect(uLineValue(100)).toBeCloseTo(82.8, 10)
  })

  it("amplía la carta manteniendo una escala mínima de 100", () => {
    expect(plasticityChartMax(47, 27)).toBe(100)
    expect(plasticityChartMax(105, 40)).toBe(110)
    expect(plasticityChartMax(40, 65)).toBe(100)
    expect(plasticityChartMax(120, 70)).toBe(120)
  })

  it("clasifica arcillas CL y CH sobre la línea A", () => {
    const cl = classifyPlasticity(40, 20)
    expect(cl.symbol).toBe("CL")
    expect(cl.aboveALine).toBe(true)
    expect(cl.aboveULine).toBe(false)

    const ch = classifyPlasticity(60, 30)
    expect(ch.symbol).toBe("CH")
    expect(ch.aboveALine).toBe(true)
    expect(ch.aboveULine).toBe(false)
  })

  it("clasifica la zona CL-ML para IP entre 4 y 7", () => {
    expect(classifyPlasticity(25, 5).symbol).toBe("CL-ML")
    expect(classifyPlasticity(20, 4).symbol).toBe("CL-ML")
    expect(classifyPlasticity(29, 7).symbol).toBe("CL-ML")
  })

  it("clasifica limos por debajo de la línea A o con IP menor que 4", () => {
    expect(classifyPlasticity(30, 5).symbol).toBe("ML/OL")
    expect(classifyPlasticity(20, 2).symbol).toBe("ML/OL")
    expect(classifyPlasticity(60, 15).symbol).toBe("MH/OH")
    expect(classifyPlasticity(70, 3).symbol).toBe("MH/OH")
  })

  it("marca los puntos por encima de la línea U", () => {
    const result = classifyPlasticity(50, 40)

    expect(result.symbol).toBe("CH")
    expect(result.aboveULine).toBe(true)
  })

  it("reporta NP cuando no hay plasticidad", () => {
    expect(classifyPlasticity(20, 10, true).symbol).toBe("NP")
    expect(classifyPlasticity(20, 0).symbol).toBe("NP")
  })
})

describe("regresión de la curva de fluidez", () => {
  it("recupera un límite líquido exacto de una recta conocida", () => {
    const result = liquidLimitFromFlowCurve(exactFlowCurvePoints(50, -10))

    expect(result).not.toBeNull()
    expect(result?.liquidLimit).toBeCloseTo(50, 10)
    expect(result?.slope).toBeCloseTo(-10, 10)
    expect(result?.intercept).toBeCloseTo(50 + 10 * Math.log10(25), 10)
    expect(result?.flowIndex).toBeCloseTo(10, 10)
    expect(result?.rSquared).toBeCloseTo(1, 10)
    expect(result?.pointCount).toBe(4)
  })

  it("calcula la ecuación de la recta de ajuste", () => {
    expect(formatFlowCurveEquation({ intercept: 60, slope: -15 })).toBe(
      "w = 60,00 − 15,00 · log10(N)"
    )
    expect(formatFlowCurveEquation({ intercept: 40, slope: 2 })).toBe(
      "w = 40,00 + 2,00 · log10(N)"
    )
  })

  it("devuelve null si no hay dos golpes distintos", () => {
    expect(
      liquidLimitFromFlowCurve([
        { blows: 20, moisture: 40 },
        { blows: 20, moisture: 42 },
      ])
    ).toBeNull()
  })

  it("calcula R² menor que uno con datos dispersos", () => {
    const result = liquidLimitFromFlowCurve([
      { blows: 10, moisture: 45 },
      { blows: 20, moisture: 41 },
      { blows: 30, moisture: 38 },
      { blows: 40, moisture: 36 },
    ])

    expect(result?.rSquared).toBeGreaterThan(0.99)
    expect(result?.rSquared).toBeLessThan(1)
  })
})

describe("límite plástico", () => {
  it("promedia las determinaciones y calcula el rango", () => {
    const result = plasticLimitFromDeterminations([20, 20.5, 21])

    expect(result).not.toBeNull()
    expect(result?.plasticLimit).toBeCloseTo(20.5, 10)
    expect(result?.min).toBe(20)
    expect(result?.max).toBe(21)
    expect(result?.range).toBeCloseTo(1, 10)
    expect(result?.count).toBe(3)
  })

  it("expone el criterio de repetibilidad de 1,4 puntos", () => {
    expect(PLASTIC_LIMIT_RANGE_LIMIT).toBe(1.4)
  })
})

describe("referencias", () => {
  it("cita las normas y la carta de Casagrande", () => {
    expect(ATTERBERG_REFERENCES.limits).toContain("NTC 4630")
    expect(ATTERBERG_REFERENCES.limits).toContain("ASTM D4318")
    expect(ATTERBERG_REFERENCES.classification).toContain("ASTM D2487")
    expect(ATTERBERG_REFERENCES.chart).toContain("línea A")
    expect(ATTERBERG_REFERENCES.chart).toContain("línea U")
    expect(ATTERBERG_REFERENCES.index).toContain("NP")
  })
})
