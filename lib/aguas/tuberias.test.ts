import { describe, expect, it } from "vitest"

import {
  computePipeHeadLoss,
  frictionFactor,
  pipeArea,
  pipeVelocity,
  solvePipeDiameter,
  solvePipeDischarge,
  sumAccessoryCoefficient,
  type PipeAccessory,
} from "@/lib/aguas/tuberias"

const accessories = [
  { type: "sharp-entrance", quantity: 1, k: 0.5 },
  { type: "elbow-90-short", quantity: 2, k: 0.9 },
  { type: "gate-valve-open", quantity: 1, k: 0.2 },
  { type: "exit", quantity: 1, k: 1 },
] satisfies PipeAccessory[]

describe("geometría y pérdidas en tuberías", () => {
  it("calcula el área y la velocidad de una tubería llena", () => {
    expect(pipeArea(0.15)).toBeCloseTo((Math.PI * 0.15 ** 2) / 4, 12)
    expect(pipeVelocity(0.015, 0.15)).toBeCloseTo(0.8488263632, 9)
  })

  it("suma los coeficientes K de los accesorios", () => {
    expect(sumAccessoryCoefficient(accessories)).toBeCloseTo(3.5, 12)
    expect(sumAccessoryCoefficient([])).toBe(0)
  })

  it("calcula la pérdida por fricción de Hazen-Williams", () => {
    const result = computePipeHeadLoss({
      method: "hazen-williams",
      hazenC: 140,
      discharge: 0.015,
      diameterM: 0.15,
      length: 100,
      totalK: 3.5,
    })

    expect(result.velocity).toBeCloseTo(0.8488263632, 9)
    expect(result.frictionLoss).toBeCloseTo(0.4888262384, 9)
    expect(result.localLoss).toBeCloseTo(0.1285306668, 9)
    expect(result.totalLoss).toBeCloseTo(0.6173569052, 9)
    expect(result.reynolds).toBeNull()
    expect(result.frictionFactor).toBeNull()
    expect(result.flowRegime).toBeNull()
  })

  it("calcula la pérdida por fricción de Darcy-Weisbach", () => {
    const result = computePipeHeadLoss({
      method: "darcy-weisbach",
      roughnessM: 4.5e-5,
      viscosity: 1.004e-6,
      discharge: 0.015,
      diameterM: 0.15,
      length: 100,
      totalK: 3.5,
    })

    expect(result.velocity).toBeCloseTo(0.8488263632, 9)
    expect(result.reynolds).toBeCloseTo(126816.6877, 3)
    expect(result.relativeRoughness).toBeCloseTo(0.0003, 12)
    expect(result.frictionFactor).toBeCloseTo(0.0187965478, 9)
    expect(result.frictionLoss).toBeCloseTo(0.4601776802, 9)
    expect(result.localLoss).toBeCloseTo(0.1285306668, 9)
    expect(result.totalLoss).toBeCloseTo(0.588708347, 9)
    expect(result.flowRegime).toBe("turbulent")
    expect(result.frictionConverged).toBe(true)
  })
})

describe("factor de fricción de Darcy-Weisbach", () => {
  it("calcula el régimen laminar con f = 64/Re", () => {
    const result = frictionFactor(1000, 0)

    expect(result.factor).toBeCloseTo(0.064, 12)
    expect(result.regime).toBe("laminar")
  })

  it("calcula el factor turbulento de Colebrook para tubo liso", () => {
    expect(frictionFactor(1e5, 0).factor).toBeCloseTo(0.0179897731, 9)
    expect(frictionFactor(1e6, 0).factor).toBeCloseTo(0.011645041, 8)
  })

  it("calcula el factor turbulento con rugosidad relativa", () => {
    const result = frictionFactor(1e5, 0.001)

    expect(result.factor).toBeCloseTo(0.0221745359, 9)
    expect(result.regime).toBe("turbulent")
  })

  it("interpola el régimen transitorio sin discontinuidad", () => {
    const laminarBoundary = frictionFactor(2000, 0)
    const transitional = frictionFactor(3000, 0)
    const turbulentBoundary = frictionFactor(4000, 0)

    expect(laminarBoundary.factor).toBeCloseTo(0.032, 12)
    expect(laminarBoundary.regime).toBe("transitional")
    expect(transitional.regime).toBe("transitional")
    expect(transitional.factor).toBeGreaterThan(0.032)
    expect(transitional.factor).toBeLessThan(turbulentBoundary.factor)
    expect(frictionFactor(3999.999, 0).factor).toBeCloseTo(
      turbulentBoundary.factor,
      5
    )
  })
})

describe("solvers de diámetro y caudal", () => {
  it("recupera el diámetro de Hazen-Williams a partir de la pérdida total", () => {
    const solution = solvePipeDiameter({
      method: "hazen-williams",
      hazenC: 140,
      discharge: 0.015,
      length: 100,
      headLoss: 0.6173569052,
      totalK: 3.5,
    })

    expect(solution).not.toBeNull()
    expect(solution?.value).toBeCloseTo(0.15, 5)
    expect(solution?.converged).toBe(true)
  })

  it("recupera el caudal de Hazen-Williams a partir de la pérdida total", () => {
    const solution = solvePipeDischarge({
      method: "hazen-williams",
      hazenC: 140,
      diameterM: 0.15,
      length: 100,
      headLoss: 0.6173569052,
      totalK: 3.5,
    })

    expect(solution).not.toBeNull()
    expect(solution?.value).toBeCloseTo(0.015, 8)
    expect(solution?.converged).toBe(true)
  })

  it("recupera el diámetro de Darcy-Weisbach a partir de la pérdida total", () => {
    const solution = solvePipeDiameter({
      method: "darcy-weisbach",
      roughnessM: 4.5e-5,
      viscosity: 1.004e-6,
      discharge: 0.015,
      length: 100,
      headLoss: 0.588708347,
      totalK: 3.5,
    })

    expect(solution).not.toBeNull()
    expect(solution?.value).toBeCloseTo(0.15, 5)
    expect(solution?.converged).toBe(true)
  })

  it("recupera el caudal de Darcy-Weisbach a partir de la pérdida total", () => {
    const solution = solvePipeDischarge({
      method: "darcy-weisbach",
      roughnessM: 4.5e-5,
      viscosity: 1.004e-6,
      diameterM: 0.15,
      length: 100,
      headLoss: 0.588708347,
      totalK: 3.5,
    })

    expect(solution).not.toBeNull()
    expect(solution?.value).toBeCloseTo(0.015, 8)
    expect(solution?.converged).toBe(true)
  })

  it("devuelve null cuando la pérdida objetivo queda fuera de los límites", () => {
    expect(
      solvePipeDiameter({
        method: "hazen-williams",
        hazenC: 140,
        discharge: 0.015,
        length: 100,
        headLoss: 1e-12,
        totalK: 3.5,
      })
    ).toBeNull()

    expect(
      solvePipeDischarge({
        method: "hazen-williams",
        hazenC: 140,
        diameterM: 0.15,
        length: 100,
        headLoss: 1e12,
        totalK: 3.5,
      })
    ).toBeNull()
  })
})
