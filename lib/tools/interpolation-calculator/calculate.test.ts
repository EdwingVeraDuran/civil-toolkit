import { describe, expect, it } from "vitest"

import {
  calculateDouble,
  calculateInterpolation,
  calculateLinear,
  type DoubleResult,
  type LinearResult,
} from "@/lib/tools/interpolation-calculator/calculate"
import { interpolationCalculatorDefinition } from "@/lib/tools/interpolation-calculator/definition"
import type {
  DoubleInput,
  LinearInput,
} from "@/lib/tools/interpolation-calculator/schema"

function linearInput(overrides: Partial<LinearInput> = {}): LinearInput {
  return {
    mode: "linear",
    direction: "y-from-x",
    x1: 2,
    y1: 10,
    x2: 4,
    y2: 20,
    target: 3,
    ...overrides,
  }
}

function doubleInput(overrides: Partial<DoubleInput> = {}): DoubleInput {
  return {
    mode: "double",
    x1: 0,
    x2: 10,
    y1: 0,
    y2: 10,
    z11: 0,
    z21: 10,
    z12: 20,
    z22: 30,
    targetX: 5,
    targetY: 5,
    ...overrides,
  }
}

function expectLinear(
  result: ReturnType<typeof calculateInterpolation>
): LinearResult {
  expect(result.mode).toBe("linear")
  if (result.mode !== "linear") {
    throw new Error("Se esperaba un resultado lineal")
  }
  return result
}

function expectDouble(
  result: ReturnType<typeof calculateInterpolation>
): DoubleResult {
  expect(result.mode).toBe("double")
  if (result.mode !== "double") {
    throw new Error("Se esperaba un resultado doble")
  }
  return result
}

describe("calculateLinear", () => {
  it("interpola y a partir de x", () => {
    const result = expectLinear(calculateInterpolation(linearInput()))

    expect(result.value).toBe(15)
    expect(result.targetX).toBe(3)
    expect(result.targetY).toBe(15)
    expect(result.t).toBe(0.5)
    expect(result.deltaX).toBe(2)
    expect(result.deltaY).toBe(10)
    expect(result.slope).toBe(5)
    expect(result.resultVariable).toBe("y")
    expect(result.targetVariable).toBe("x")
    expect(result.formula).toBe("y = y₁ + (y₂ − y₁) · (x − x₁) / (x₂ − x₁)")
  })

  it("interpola x a partir de y", () => {
    const result = expectLinear(
      calculateLinear(linearInput({ direction: "x-from-y", target: 15 }))
    )

    expect(result.value).toBe(3)
    expect(result.targetX).toBe(3)
    expect(result.targetY).toBe(15)
    expect(result.t).toBe(0.5)
    expect(result.slope).toBe(5)
    expect(result.resultVariable).toBe("x")
    expect(result.targetVariable).toBe("y")
    expect(result.formula).toBe("x = x₁ + (x₂ − x₁) · (y − y₁) / (y₂ − y₁)")
  })

  it("funciona con intervalos invertidos", () => {
    const result = expectLinear(
      calculateLinear(linearInput({ x1: 4, y1: 20, x2: 2, y2: 10 }))
    )

    expect(result.value).toBe(15)
    expect(result.t).toBe(0.5)
  })

  it("devuelve exactamente los valores conocidos en los extremos", () => {
    const start = expectLinear(calculateLinear(linearInput({ target: 2 })))
    const end = expectLinear(calculateLinear(linearInput({ target: 4 })))

    expect(start.value).toBe(10)
    expect(start.t).toBe(0)
    expect(end.value).toBe(20)
    expect(end.t).toBe(1)
  })

  it("admite una recta horizontal", () => {
    const result = expectLinear(
      calculateLinear(linearInput({ y1: 10, y2: 10 }))
    )

    expect(result.value).toBe(10)
    expect(result.slope).toBe(0)
  })

  it("admite una recta vertical al calcular x a partir de y", () => {
    const result = expectLinear(
      calculateLinear(
        linearInput({
          direction: "x-from-y",
          x1: 3,
          x2: 3,
          y1: 10,
          y2: 20,
          target: 15,
        })
      )
    )

    expect(result.value).toBe(3)
    expect(result.slope).toBeNull()
  })

  it("rechaza x₁ = x₂ al calcular y a partir de x", () => {
    expect(() => calculateLinear(linearInput({ x2: 2 }))).toThrow(
      "x₁ y x₂ deben ser diferentes"
    )
  })

  it("rechaza y₁ = y₂ al calcular x a partir de y", () => {
    expect(() =>
      calculateLinear(
        linearInput({ direction: "x-from-y", y2: 10, target: 10 })
      )
    ).toThrow("y₁ e y₂ deben ser diferentes")
  })

  it("rechaza un objetivo fuera del intervalo", () => {
    expect(() => calculateLinear(linearInput({ target: 5 }))).toThrow(
      "El valor de x debe estar entre x₁ y x₂"
    )
  })

  it("rechaza un objetivo fuera del intervalo al calcular x a partir de y", () => {
    expect(() =>
      calculateLinear(linearInput({ direction: "x-from-y", target: 25 }))
    ).toThrow("El valor de y debe estar entre y₁ e y₂")
  })
})

describe("calculateDouble", () => {
  it("interpola el centro de una tabla 2×2", () => {
    const result = expectDouble(calculateInterpolation(doubleInput()))

    expect(result.value).toBe(15)
    expect(result.tx).toBe(0.5)
    expect(result.ty).toBe(0.5)
    expect(result.zAtY1).toBe(5)
    expect(result.zAtY2).toBe(25)
    expect(result.targetX).toBe(5)
    expect(result.targetY).toBe(5)
  })

  it("interpola un punto no central de la tabla", () => {
    const result = expectDouble(
      calculateDouble(doubleInput({ targetX: 2.5, targetY: 7.5 }))
    )

    expect(result.tx).toBeCloseTo(0.25, 12)
    expect(result.ty).toBeCloseTo(0.75, 12)
    expect(result.zAtY1).toBeCloseTo(2.5, 12)
    expect(result.zAtY2).toBeCloseTo(22.5, 12)
    expect(result.value).toBeCloseTo(17.5, 12)
  })

  it("devuelve los valores de las cuatro esquinas", () => {
    const topLeft = expectDouble(
      calculateDouble(doubleInput({ targetX: 0, targetY: 0 }))
    )
    const topRight = expectDouble(
      calculateDouble(doubleInput({ targetX: 10, targetY: 0 }))
    )
    const bottomLeft = expectDouble(
      calculateDouble(doubleInput({ targetX: 0, targetY: 10 }))
    )
    const bottomRight = expectDouble(
      calculateDouble(doubleInput({ targetX: 10, targetY: 10 }))
    )

    expect(topLeft.value).toBe(0)
    expect(topRight.value).toBe(10)
    expect(bottomLeft.value).toBe(20)
    expect(bottomRight.value).toBe(30)
  })

  it("funciona con coordenadas invertidas", () => {
    const result = expectDouble(
      calculateDouble(
        doubleInput({
          x1: 10,
          x2: 0,
          y1: 10,
          y2: 0,
          z11: 30,
          z21: 20,
          z12: 10,
          z22: 0,
        })
      )
    )

    expect(result.value).toBe(15)
    expect(result.tx).toBe(0.5)
    expect(result.ty).toBe(0.5)
  })

  it("rechaza x₁ = x₂ y y₁ = y₂", () => {
    expect(() => calculateDouble(doubleInput({ x2: 0 }))).toThrow(
      "x₁ y x₂ deben ser diferentes"
    )
    expect(() => calculateDouble(doubleInput({ y2: 0 }))).toThrow(
      "y₁ e y₂ deben ser diferentes"
    )
  })

  it("rechaza objetivos fuera de la tabla", () => {
    expect(() => calculateDouble(doubleInput({ targetX: 11 }))).toThrow(
      "El valor de x debe estar entre x₁ y x₂"
    )
    expect(() => calculateDouble(doubleInput({ targetY: -1 }))).toThrow(
      "El valor de y debe estar entre y₁ e y₂"
    )
  })
})

describe("interpolationCalculatorDefinition", () => {
  it("valida entradas con coma decimal", () => {
    const validation = interpolationCalculatorDefinition.validate({
      mode: "linear",
      direction: "y-from-x",
      x1: "2,5",
      y1: "10",
      x2: "4,5",
      y2: "20",
      target: "3,5",
    })

    expect(validation).toEqual({ valid: true })
  })

  it("reporta el campo del objetivo fuera de rango", () => {
    const validation = interpolationCalculatorDefinition.validate({
      mode: "linear",
      direction: "y-from-x",
      x1: 2,
      y1: 10,
      x2: 4,
      y2: 20,
      target: 5,
    })

    expect(validation.valid).toBe(false)
    if (validation.valid) return
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ field: "target" })
    )
  })

  it("reporta los ejes repetidos y los objetivos fuera de rango en la tabla doble", () => {
    const repeatedAxis = interpolationCalculatorDefinition.validate({
      ...doubleInput(),
      y2: 0,
    })
    const outOfRange = interpolationCalculatorDefinition.validate({
      ...doubleInput(),
      targetX: 11,
    })

    expect(repeatedAxis.valid).toBe(false)
    if (!repeatedAxis.valid) {
      expect(repeatedAxis.errors).toContainEqual(
        expect.objectContaining({ field: "y2" })
      )
    }

    expect(outOfRange.valid).toBe(false)
    if (!outOfRange.valid) {
      expect(outOfRange.errors).toContainEqual(
        expect.objectContaining({ field: "targetX" })
      )
    }
  })

  it("genera el resumen de una interpolación lineal", () => {
    const input = interpolationCalculatorDefinition.schema.parse(linearInput())
    const result = interpolationCalculatorDefinition.calculate(input)
    const snapshot = interpolationCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Interpolación lineal: y = 15,000 (x = 3,000 entre 2,000 y 4,000)"
    )
  })

  it("genera el resumen de una interpolación lineal inversa", () => {
    const input = interpolationCalculatorDefinition.schema.parse(
      linearInput({ direction: "x-from-y", target: 15 })
    )
    const result = interpolationCalculatorDefinition.calculate(input)
    const snapshot = interpolationCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Interpolación lineal: x = 3,000 (y = 15,000 entre 10,000 y 20,000)"
    )
  })

  it("genera el resumen de una interpolación doble", () => {
    const input = interpolationCalculatorDefinition.schema.parse(doubleInput())
    const result = interpolationCalculatorDefinition.calculate(input)
    const snapshot = interpolationCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Interpolación doble: z = 15,000 (x = 5,000, y = 5,000)"
    )
  })
})
