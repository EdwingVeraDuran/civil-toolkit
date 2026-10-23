import { describe, expect, it } from "vitest"

import { calculatePipeHydraulics } from "@/lib/tools/pipe-hydraulics/calculate"
import { pipeHydraulicsDefinition } from "@/lib/tools/pipe-hydraulics/definition"
import {
  pipeHydraulicsSchema,
  type PipeHydraulicsInput,
} from "@/lib/tools/pipe-hydraulics/schema"

const DEFAULT_ACCESSORIES = [
  { type: "sharp-entrance", quantity: "1", k: "0.5" },
  { type: "elbow-90-short", quantity: "2", k: "0.9" },
  { type: "gate-valve-open", quantity: "1", k: "0.2" },
  { type: "exit", quantity: "1", k: "1" },
]

const BASE_INPUT: Record<string, unknown> = {
  method: "hazen-williams",
  mode: "loss",
  length: "100",
  diameter: "150",
  discharge: "0,015",
  headLoss: "0,5",
  hazenC: "140",
  roughness: "0,045",
  viscosity: "0,000001004",
  accessories: DEFAULT_ACCESSORIES,
}

function parseInput(
  overrides: Record<string, unknown> = {}
): PipeHydraulicsInput {
  return pipeHydraulicsSchema.parse({ ...BASE_INPUT, ...overrides })
}

function rawInput(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return { ...BASE_INPUT, ...overrides }
}

describe("cálculo de tuberías a presión", () => {
  it("calcula la pérdida total con Hazen-Williams", () => {
    const result = calculatePipeHydraulics(parseInput({ mode: "loss" }))

    expect(result.method).toBe("hazen-williams")
    expect(result.mode).toBe("loss")
    expect(result.diameterMm).toBeCloseTo(150, 9)
    expect(result.discharge).toBeCloseTo(0.015, 12)
    expect(result.headLoss).toBeCloseTo(0.6173569052, 9)
    expect(result.frictionLoss).toBeCloseTo(0.4888262384, 9)
    expect(result.localLoss).toBeCloseTo(0.1285306668, 9)
    expect(result.velocity).toBeCloseTo(0.8488263632, 9)
    expect(result.totalK).toBeCloseTo(3.5, 12)
    expect(result.hazenC).toBe(140)
    expect(result.roughnessMm).toBeNull()
    expect(result.reynolds).toBeNull()
    expect(result.converged).toBe(true)
  })

  it("calcula la pérdida total con Darcy-Weisbach", () => {
    const result = calculatePipeHydraulics(
      parseInput({
        mode: "loss",
        method: "darcy-weisbach",
      })
    )

    expect(result.method).toBe("darcy-weisbach")
    expect(result.headLoss).toBeCloseTo(0.588708347, 9)
    expect(result.frictionLoss).toBeCloseTo(0.4601776802, 9)
    expect(result.localLoss).toBeCloseTo(0.1285306668, 9)
    expect(result.reynolds).toBeCloseTo(126816.6877, 3)
    expect(result.relativeRoughness).toBeCloseTo(0.0003, 12)
    expect(result.frictionFactor).toBeCloseTo(0.0187965478, 9)
    expect(result.flowRegime).toBe("turbulent")
    expect(result.frictionConverged).toBe(true)
    expect(result.hazenC).toBeNull()
    expect(result.roughnessMm).toBe(0.045)
    expect(result.viscosity).toBeCloseTo(1.004e-6, 12)
  })

  it("recupera el diámetro de Hazen-Williams a partir de la pérdida total", () => {
    const loss = calculatePipeHydraulics(parseInput({ mode: "loss" }))
    const result = calculatePipeHydraulics(
      parseInput({
        mode: "diameter",
        headLoss: String(loss.headLoss),
      })
    )

    expect(result.diameterMm).not.toBeNull()
    expect(result.diameterMm).toBeCloseTo(150, 1)
    expect(result.discharge).toBeCloseTo(0.015, 12)
    expect(result.headLoss).toBeCloseTo(0.6173569052, 6)
    expect(result.iterations).toBeGreaterThan(0)
    expect(result.converged).toBe(true)
  })

  it("recupera el caudal de Hazen-Williams a partir de la pérdida total", () => {
    const loss = calculatePipeHydraulics(parseInput({ mode: "loss" }))
    const result = calculatePipeHydraulics(
      parseInput({
        mode: "flow",
        headLoss: String(loss.headLoss),
      })
    )

    expect(result.discharge).not.toBeNull()
    expect(result.discharge).toBeCloseTo(0.015, 8)
    expect(result.diameterMm).toBeCloseTo(150, 9)
    expect(result.headLoss).toBeCloseTo(0.6173569052, 6)
    expect(result.iterations).toBeGreaterThan(0)
    expect(result.converged).toBe(true)
  })

  it("resuelve ida y vuelta con Darcy-Weisbach", () => {
    const loss = calculatePipeHydraulics(
      parseInput({ mode: "loss", method: "darcy-weisbach" })
    )
    const diameter = calculatePipeHydraulics(
      parseInput({
        mode: "diameter",
        method: "darcy-weisbach",
        headLoss: String(loss.headLoss),
      })
    )
    const flow = calculatePipeHydraulics(
      parseInput({
        mode: "flow",
        method: "darcy-weisbach",
        headLoss: String(loss.headLoss),
      })
    )

    expect(diameter.diameterMm).toBeCloseTo(150, 1)
    expect(flow.discharge).toBeCloseTo(0.015, 8)
    expect(flow.headLoss).toBeCloseTo(loss.headLoss ?? 0, 5)
  })
})

describe("advertencias del cálculo de tuberías", () => {
  it("advierte cuando el coeficiente C está fuera del rango típico", () => {
    const result = calculatePipeHydraulics(parseInput({ hazenC: "200" }))

    expect(
      result.warnings.some((warning) => warning.includes("intervalo típico"))
    ).toBe(true)
  })

  it("advierte cuando la velocidad está fuera del intervalo recomendado", () => {
    const result = calculatePipeHydraulics(parseInput({ discharge: "0,1" }))

    expect(result.velocity).not.toBeNull()
    expect(result.velocity).toBeGreaterThan(3)
    expect(
      result.warnings.some((warning) => warning.includes("velocidad media"))
    ).toBe(true)
  })

  it("advierte cuando el régimen es transitorio", () => {
    const result = calculatePipeHydraulics(
      parseInput({
        method: "darcy-weisbach",
        diameter: "50",
        discharge: "0,00012",
      })
    )

    expect(result.flowRegime).toBe("transitional")
    expect(
      result.warnings.some((warning) => warning.includes("régimen transitorio"))
    ).toBe(true)
  })

  it("informa cuando no hay solución numérica", () => {
    const input = parseInput({
      mode: "diameter",
      headLoss: "0,000000000001",
    })
    const result = calculatePipeHydraulics(input)

    expect(result.diameterMm).toBeNull()
    expect(result.converged).toBe(false)
    expect(
      result.warnings.some((warning) =>
        warning.includes("No se encontró un diámetro")
      )
    ).toBe(true)

    const snapshot = pipeHydraulicsDefinition.toSnapshot(input, result)
    expect(snapshot.summary).toContain("Sin solución")
  })
})

describe("accesorios y validaciones", () => {
  it("suma correctamente los coeficientes K y permite no tener accesorios", () => {
    const withAccessories = calculatePipeHydraulics(
      parseInput({ mode: "loss" })
    )
    const withoutAccessories = calculatePipeHydraulics(
      parseInput({ mode: "loss", accessories: [] })
    )

    expect(withAccessories.totalK).toBeCloseTo(3.5, 12)
    expect(withAccessories.localLoss).toBeCloseTo(0.1285306668, 9)
    expect(withoutAccessories.totalK).toBe(0)
    expect(withoutAccessories.localLoss).toBe(0)
    expect(withoutAccessories.headLoss).toBeCloseTo(0.4888262384, 9)
  })

  it("rechaza longitudes vacías", () => {
    const validation = pipeHydraulicsDefinition.validate(
      rawInput({ length: "" })
    )

    expect(validation.valid).toBe(false)
    if (!validation.valid) {
      expect(validation.errors.some((error) => error.field === "length")).toBe(
        true
      )
    }
  })

  it("rechaza una cantidad de accesorios no positiva", () => {
    const validation = pipeHydraulicsDefinition.validate(
      rawInput({
        accessories: [{ type: "elbow-90-short", quantity: "0", k: "0.9" }],
      })
    )

    expect(validation.valid).toBe(false)
    if (!validation.valid) {
      expect(
        validation.errors.some(
          (error) => error.field === "accessories.0.quantity"
        )
      ).toBe(true)
    }
  })

  it("rechaza un coeficiente K negativo", () => {
    const validation = pipeHydraulicsDefinition.validate(
      rawInput({
        accessories: [{ type: "elbow-90-short", quantity: "1", k: "-0.5" }],
      })
    )

    expect(validation.valid).toBe(false)
    if (!validation.valid) {
      expect(
        validation.errors.some((error) => error.field === "accessories.0.k")
      ).toBe(true)
    }
  })

  it("rechaza rugosidad negativa y viscosidad cero", () => {
    const roughnessValidation = pipeHydraulicsDefinition.validate(
      rawInput({ method: "darcy-weisbach", roughness: "-0.1" })
    )
    const viscosityValidation = pipeHydraulicsDefinition.validate(
      rawInput({ method: "darcy-weisbach", viscosity: "0" })
    )

    expect(roughnessValidation.valid).toBe(false)
    expect(viscosityValidation.valid).toBe(false)
    if (!roughnessValidation.valid) {
      expect(
        roughnessValidation.errors.some((error) => error.field === "roughness")
      ).toBe(true)
    }
    if (!viscosityValidation.valid) {
      expect(
        viscosityValidation.errors.some((error) => error.field === "viscosity")
      ).toBe(true)
    }
  })
})

describe("resumen y snapshot", () => {
  it("genera un resumen corto y un snapshot serializable", () => {
    const input = parseInput({ mode: "loss" })
    const result = calculatePipeHydraulics(input)
    const snapshot = pipeHydraulicsDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toContain("D = 150,0 mm")
    expect(snapshot.summary).toContain("Q = 0,015 m³/s")
    expect(snapshot.summary).toContain("H = 0,617 m")
    expect(snapshot.summary).toContain("Hazen-Williams")
    expect(snapshot.summary.length).toBeLessThanOrEqual(120)
    expect(snapshot.inputs.accessories).not.toBe(input.accessories)
    expect((snapshot.inputs.accessories as unknown[]).length).toBe(4)
    expect(Array.isArray(snapshot.result.warnings)).toBe(true)
    expect(() => JSON.stringify(snapshot)).not.toThrow()
  })
})
