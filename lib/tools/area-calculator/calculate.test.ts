import { describe, expect, it } from "vitest"

import { calculateArea } from "@/lib/tools/area-calculator/calculate"
import { areaCalculatorDefinition } from "@/lib/tools/area-calculator/definition"
import type { AreaInput } from "@/lib/tools/area-calculator/schema"

describe("calculateArea", () => {
  it("calcula el área de un cuadrado", () => {
    const result = calculateArea({
      shape: "square",
      lengthUnit: "m",
      areaUnit: "m2",
      side: 5,
    })

    expect(result.areaM2).toBe(25)
    expect(result.area).toBe(25)
    expect(result.areaUnitId).toBe("m2")
    expect(result.formula).toBe("A = L²")
  })

  it("calcula el área de un rectángulo", () => {
    const result = calculateArea({
      shape: "rectangle",
      lengthUnit: "m",
      areaUnit: "m2",
      base: 4,
      height: 3,
    })

    expect(result.areaM2).toBe(12)
    expect(result.area).toBe(12)
    expect(result.formula).toBe("A = b · h")
  })

  it("calcula el área de un triángulo con base y altura", () => {
    const result = calculateArea({
      shape: "triangle",
      lengthUnit: "m",
      areaUnit: "m2",
      base: 4,
      height: 3,
    })

    expect(result.areaM2).toBe(6)
    expect(result.formula).toBe("A = (b · h) / 2")
  })

  it("calcula el área de un círculo con radio", () => {
    const result = calculateArea({
      shape: "circle",
      lengthUnit: "m",
      areaUnit: "m2",
      circleMeasure: "radius",
      circleSize: 2,
    })

    expect(result.areaM2).toBeCloseTo(4 * Math.PI, 10)
    expect(result.formula).toBe("A = π · r²")
  })

  it("calcula el área de un círculo con diámetro", () => {
    const result = calculateArea({
      shape: "circle",
      lengthUnit: "m",
      areaUnit: "m2",
      circleMeasure: "diameter",
      circleSize: 4,
    })

    expect(result.areaM2).toBeCloseTo(4 * Math.PI, 10)
    expect(result.formula).toBe("A = π · (d / 2)²")
  })

  it("calcula el área de un trapecio", () => {
    const result = calculateArea({
      shape: "trapezoid",
      lengthUnit: "m",
      areaUnit: "m2",
      baseMajor: 6,
      baseMinor: 4,
      height: 3,
    })

    expect(result.areaM2).toBe(15)
    expect(result.formula).toBe("A = ((B + b) / 2) · h")
  })

  it("calcula el área de un paralelogramo", () => {
    const result = calculateArea({
      shape: "parallelogram",
      lengthUnit: "m",
      areaUnit: "m2",
      base: 4,
      height: 3,
    })

    expect(result.areaM2).toBe(12)
  })

  it("calcula el área de un rombo", () => {
    const result = calculateArea({
      shape: "rhombus",
      lengthUnit: "m",
      areaUnit: "m2",
      diagonalMajor: 8,
      diagonalMinor: 5,
    })

    expect(result.areaM2).toBe(20)
    expect(result.formula).toBe("A = (D · d) / 2")
  })

  it("calcula el área de un polígono regular", () => {
    const result = calculateArea({
      shape: "regular-polygon",
      lengthUnit: "m",
      areaUnit: "m2",
      sides: 6,
      side: 2,
    })

    expect(result.areaM2).toBeCloseTo((3 * Math.sqrt(3) * 4) / 2, 10)
    expect(result.formula).toBe("A = n · l² / (4 · tan(π / n))")
  })

  it("convierte las longitudes de entrada a metros", () => {
    const result = calculateArea({
      shape: "rectangle",
      lengthUnit: "cm",
      areaUnit: "m2",
      base: 400,
      height: 300,
    })

    expect(result.areaM2).toBeCloseTo(12, 10)
    expect(result.area).toBeCloseTo(12, 10)
  })

  it("convierte el área a la unidad seleccionada", () => {
    const result = calculateArea({
      shape: "square",
      lengthUnit: "m",
      areaUnit: "cm2",
      side: 1,
    })

    expect(result.areaM2).toBe(1)
    expect(result.area).toBeCloseTo(10000, 8)
    expect(result.areaUnitId).toBe("cm2")
  })

  it("convierte el área a pies cuadrados", () => {
    const result = calculateArea({
      shape: "circle",
      lengthUnit: "m",
      areaUnit: "ft2",
      circleMeasure: "radius",
      circleSize: 1,
    })

    expect(result.area).toBeCloseTo(Math.PI / 0.09290304, 8)
  })
})

describe("areaCalculatorDefinition", () => {
  it("acepta entradas válidas con coma decimal", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "square",
      lengthUnit: "m",
      areaUnit: "m2",
      side: "5,5",
    })

    expect(result).toEqual({ valid: true })
  })

  it("rechaza un lado de cero", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "square",
      lengthUnit: "m",
      areaUnit: "m2",
      side: "0",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "side")).toBe(true)
    }
  })

  it("rechaza un círculo sin medida positiva", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "circle",
      lengthUnit: "m",
      areaUnit: "m2",
      circleMeasure: "diameter",
      circleSize: "-2",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "circleSize")).toBe(
        true
      )
    }
  })

  it("rechaza un polígono con menos de tres lados", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "regular-polygon",
      lengthUnit: "m",
      areaUnit: "m2",
      sides: "2",
      side: "1",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "sides")).toBe(true)
    }
  })

  it("rechaza un número de lados no entero", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "regular-polygon",
      lengthUnit: "m",
      areaUnit: "m2",
      sides: "4,5",
      side: "1",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "sides")).toBe(true)
    }
  })

  it("rechaza una unidad que no sea de longitud", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "rectangle",
      lengthUnit: "kg",
      areaUnit: "m2",
      base: "4",
      height: "3",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "lengthUnit")).toBe(
        true
      )
    }
  })

  it("rechaza una unidad que no sea de área", () => {
    const result = areaCalculatorDefinition.validate({
      shape: "rectangle",
      lengthUnit: "m",
      areaUnit: "m",
      base: "4",
      height: "3",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "areaUnit")).toBe(
        true
      )
    }
  })

  it("genera un snapshot JSON plano con el resumen", () => {
    const input: AreaInput = {
      shape: "rectangle",
      lengthUnit: "m",
      areaUnit: "m2",
      base: 4,
      height: 3,
    }
    const result = calculateArea(input)
    const snapshot = areaCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.inputs).toEqual(input)
    expect(snapshot.result.areaM2).toBe(12)
    expect(snapshot.result.area).toBe(12)
    expect(snapshot.summary).toBe(
      "Rectángulo: 12,000 m² (b = 4,000 m, h = 3,000 m)"
    )
    expect(() => JSON.stringify(snapshot)).not.toThrow()
  })

  it("resume un círculo indicando radio o diámetro", () => {
    const input: AreaInput = {
      shape: "circle",
      lengthUnit: "m",
      areaUnit: "m2",
      circleMeasure: "diameter",
      circleSize: 4,
    }
    const result = calculateArea(input)
    const snapshot = areaCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe("Círculo: 12,566 m² (d = 4,000 m)")
  })
})
