import { describe, expect, it } from "vitest"

import {
  calculateAtterbergLimits,
  type AtterbergLimitsResult,
} from "@/lib/tools/atterberg-limits/calculate"
import { atterbergLimitsDefinition } from "@/lib/tools/atterberg-limits/definition"
import {
  atterbergLimitsSchema,
  type AtterbergLimitsInput,
} from "@/lib/tools/atterberg-limits/schema"

function rawInput(overrides: Record<string, unknown> = {}) {
  return {
    liquidLimitPoints: [
      { blows: "16", moisture: "52" },
      { blows: "22", moisture: "48,5" },
      { blows: "28", moisture: "46" },
      { blows: "34", moisture: "43,5" },
    ],
    plasticLimitValues: ["20", "20,5"],
    ...overrides,
  }
}

function parseInput(
  overrides: Record<string, unknown> = {}
): AtterbergLimitsInput {
  return atterbergLimitsSchema.parse(rawInput(overrides))
}

function fieldErrors(
  result: ReturnType<typeof atterbergLimitsDefinition.validate>
) {
  if (result.valid) return []
  return result.errors.map((error) => error.field)
}

function resultFor(
  overrides: Record<string, unknown> = {}
): AtterbergLimitsResult {
  return calculateAtterbergLimits(parseInput(overrides))
}

function exactLiquidLimitPoints(liquidLimit: number, slope: number) {
  const intercept = liquidLimit - slope * Math.log10(25)

  return [10, 20, 30, 40].map((blows) => ({
    blows: String(blows),
    moisture: String(intercept + slope * Math.log10(blows)),
  }))
}

describe("límites de Atterberg", () => {
  it("calcula LL, LP e IP con el ejemplo multipunto", () => {
    const result = resultFor()

    expect(result.liquidLimit).toBeCloseTo(47.07, 1)
    expect(result.plasticLimit).toBeCloseTo(20.25, 6)
    expect(result.plasticityIndex).toBeCloseTo(26.82, 1)
    expect(result.liquidLimitRounded).toBe(47)
    expect(result.plasticLimitRounded).toBe(20)
    expect(result.plasticityIndexRounded).toBe(27)
    expect(result.nonPlastic).toBe(false)
    expect(result.classification.symbol).toBe("CL")
    expect(result.classification.aboveALine).toBe(true)
    expect(result.regression.rSquared).toBeGreaterThan(0.99)
    expect(result.flowCurvePoints).toHaveLength(4)
  })

  it("reporta NP cuando el límite plástico supera el líquido", () => {
    const result = resultFor({
      plasticLimitValues: ["60", "60"],
    })

    expect(result.nonPlastic).toBe(true)
    expect(result.plasticityIndex).toBe(0)
    expect(result.plasticityIndexRounded).toBe(0)
    expect(result.classification.symbol).toBe("NP")
    expect(result.warnings).toContain(
      "El límite plástico es mayor o igual que el límite líquido; se reporta como no plástico (NP)."
    )
  })

  it("usa valores reportados redondeados para la clasificación", () => {
    const result = resultFor({
      liquidLimitPoints: exactLiquidLimitPoints(49.6, -12),
      plasticLimitValues: ["10", "10"],
    })

    expect(result.liquidLimitRounded).toBe(50)
    expect(result.plasticLimitRounded).toBe(10)
    expect(result.plasticityIndexRounded).toBe(40)
    expect(result.classification.symbol).toBe("CH")
  })

  it("advierte cuando los puntos no cubren ambos lados de 25 golpes", () => {
    const result = resultFor({
      liquidLimitPoints: [
        { blows: "30", moisture: "45" },
        { blows: "35", moisture: "44" },
        { blows: "40", moisture: "43" },
      ],
    })

    expect(
      result.warnings.some((warning) => warning.includes("ambos lados de 25"))
    ).toBe(true)
  })

  it("advierte por un ajuste con R² bajo", () => {
    const result = resultFor({
      liquidLimitPoints: [
        { blows: "10", moisture: "20" },
        { blows: "20", moisture: "80" },
        { blows: "30", moisture: "25" },
        { blows: "40", moisture: "75" },
      ],
    })

    expect(result.regression.rSquared).toBeLessThan(0.95)
    expect(result.warnings.some((warning) => warning.includes("R²"))).toBe(true)
  })

  it("advierte cuando el rango del límite plástico supera 1,4 puntos", () => {
    const result = resultFor({
      plasticLimitValues: ["20", "22"],
    })

    expect(result.plasticLimitSummary.range).toBeCloseTo(2, 6)
    expect(
      result.warnings.some((warning) => warning.includes("criterio de 1,4"))
    ).toBe(true)
  })

  it("advierte cuando el punto queda por encima de la línea U", () => {
    const result = resultFor({
      liquidLimitPoints: exactLiquidLimitPoints(50, -10),
      plasticLimitValues: ["10", "10"],
    })

    expect(result.classification.symbol).toBe("CH")
    expect(result.classification.aboveULine).toBe(true)
    expect(result.warnings.some((warning) => warning.includes("línea U"))).toBe(
      true
    )
  })
})

describe("resumen y snapshot de Atterberg", () => {
  it("genera el resumen del cálculo guardado", () => {
    const input = parseInput()
    const result = calculateAtterbergLimits(input)
    const snapshot = atterbergLimitsDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "LL = 47 %; LP = 20 %; IP = 27 %; clasificación CL"
    )
    expect(snapshot.inputs).toMatchObject({
      liquidLimitPoints: [
        { blows: 16, moisture: 52 },
        { blows: 22, moisture: 48.5 },
        { blows: 28, moisture: 46 },
        { blows: 34, moisture: 43.5 },
      ],
      plasticLimitValues: [20, 20.5],
    })
    expect(snapshot.result).toMatchObject({
      liquidLimitRounded: 47,
      plasticLimitRounded: 20,
      plasticityIndexRounded: 27,
    })
  })

  it("genera un resumen NP sin índice de plasticidad", () => {
    const input = parseInput({ plasticLimitValues: ["60", "60"] })
    const result = calculateAtterbergLimits(input)
    const snapshot = atterbergLimitsDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "LL = 47 %; LP = 60 %; IP = NP; clasificación NP"
    )
  })

  it("produce un resultado serializable", () => {
    const result = resultFor()
    const roundTrip = JSON.parse(JSON.stringify(result))

    expect(roundTrip.liquidLimit).toBeCloseTo(result.liquidLimit, 10)
    expect(roundTrip.classification.symbol).toBe("CL")
  })
})

describe("validación de los límites de Atterberg", () => {
  it("exige al menos tres puntos de límite líquido y dos de límite plástico", () => {
    const errors = fieldErrors(
      atterbergLimitsDefinition.validate(
        rawInput({
          liquidLimitPoints: [
            { blows: "16", moisture: "52" },
            { blows: "22", moisture: "48,5" },
          ],
          plasticLimitValues: ["20"],
        })
      )
    )

    expect(errors).toContain("liquidLimitPoints")
    expect(errors).toContain("plasticLimitValues")
  })

  it("exige al menos dos números de golpes distintos", () => {
    const errors = fieldErrors(
      atterbergLimitsDefinition.validate(
        rawInput({
          liquidLimitPoints: [
            { blows: "25", moisture: "52" },
            { blows: "25", moisture: "48,5" },
            { blows: "25", moisture: "46" },
          ],
        })
      )
    )

    expect(errors).toContain("liquidLimitPoints")
  })

  it("rechaza golpes y contenidos de agua inválidos", () => {
    const errors = fieldErrors(
      atterbergLimitsDefinition.validate(
        rawInput({
          liquidLimitPoints: [
            { blows: "0", moisture: "52" },
            { blows: "25,5", moisture: "0" },
            { blows: "101", moisture: "201" },
          ],
        })
      )
    )

    expect(errors).toContain("liquidLimitPoints.0.blows")
    expect(errors).toContain("liquidLimitPoints.1.blows")
    expect(errors).toContain("liquidLimitPoints.1.moisture")
    expect(errors).toContain("liquidLimitPoints.2.blows")
    expect(errors).toContain("liquidLimitPoints.2.moisture")
  })

  it("acepta comas decimales y calcula los valores numéricos", () => {
    const input = parseInput({
      liquidLimitPoints: [
        { blows: "16", moisture: "52,5" },
        { blows: "22", moisture: "48,5" },
        { blows: "28", moisture: "46,2" },
      ],
      plasticLimitValues: ["20,5", "21"],
    })

    expect(input.liquidLimitPoints[0]?.moisture).toBe(52.5)
    expect(input.plasticLimitValues).toEqual([20.5, 21])
  })
})
