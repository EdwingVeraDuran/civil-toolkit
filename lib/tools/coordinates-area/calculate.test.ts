import { describe, expect, it } from "vitest"

import { calculateCoordinatesArea } from "@/lib/tools/coordinates-area/calculate"
import { coordinatesAreaDefinition } from "@/lib/tools/coordinates-area/definition"
import { parseCoordinateList } from "@/lib/tools/coordinates-area/parse-vertices"
import {
  coordinatesAreaSchema,
  type CoordinatesAreaInput,
} from "@/lib/tools/coordinates-area/schema"

type TestVertex = { x: number | string; y: number | string }

function input(
  vertices: TestVertex[],
  overrides: Partial<Pick<CoordinatesAreaInput, "lengthUnit" | "areaUnit">> = {}
): CoordinatesAreaInput {
  return coordinatesAreaSchema.parse({
    lengthUnit: "m",
    areaUnit: "m2",
    vertices,
    ...overrides,
  })
}

function expectInvalid(raw: Record<string, unknown>, field: string) {
  const result = coordinatesAreaSchema.safeParse(raw)

  expect(result.success).toBe(false)
  if (!result.success) {
    expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(
      true
    )
  }
}

describe("calculateCoordinatesArea", () => {
  it("calcula el área y el perímetro de un triángulo", () => {
    const result = calculateCoordinatesArea(
      input([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
      ])
    )

    expect(result.areaM2).toBeCloseTo(6, 12)
    expect(result.area).toBeCloseTo(6, 12)
    expect(result.perimeterM).toBeCloseTo(12, 12)
    expect(result.vertexCount).toBe(3)
    expect(result.orientation).toBe("counterclockwise")
  })

  it("calcula un rectángulo y detecta el sentido antihorario", () => {
    const result = calculateCoordinatesArea(
      input([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 8 },
        { x: 0, y: 8 },
      ])
    )

    expect(result.areaM2).toBeCloseTo(80, 12)
    expect(result.perimeterM).toBeCloseTo(36, 12)
    expect(result.signedAreaM2).toBeCloseTo(80, 12)
    expect(result.orientation).toBe("counterclockwise")
  })

  it("obtiene la misma área con los vértices en sentido horario", () => {
    const result = calculateCoordinatesArea(
      input([
        { x: 0, y: 0 },
        { x: 0, y: 8 },
        { x: 10, y: 8 },
        { x: 10, y: 0 },
      ])
    )

    expect(result.areaM2).toBeCloseTo(80, 12)
    expect(result.signedAreaM2).toBeCloseTo(-80, 12)
    expect(result.orientation).toBe("clockwise")
  })

  it("calcula un polígono irregular con coordenadas negativas", () => {
    const result = calculateCoordinatesArea(
      input([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 3 },
        { x: 2, y: 5 },
        { x: -1, y: 3 },
      ])
    )

    expect(result.areaM2).toBeCloseTo(21, 12)
  })

  it("convierte coordenadas en pies y áreas a la unidad seleccionada", () => {
    const result = calculateCoordinatesArea(
      input(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 8 },
          { x: 0, y: 8 },
        ],
        { lengthUnit: "ft", areaUnit: "ft2" }
      )
    )

    expect(result.areaM2).toBeCloseTo(7.4322432, 12)
    expect(result.area).toBeCloseTo(80, 12)
    expect(result.perimeter).toBeCloseTo(36, 12)
  })

  it("convierte el área a hectáreas", () => {
    const result = calculateCoordinatesArea(
      input(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
        { areaUnit: "ha" }
      )
    )

    expect(result.areaM2).toBeCloseTo(10000, 12)
    expect(result.area).toBeCloseTo(1, 12)
  })
})

describe("validación de coordenadas", () => {
  it("exige al menos tres vértices", () => {
    expectInvalid(
      {
        lengthUnit: "m",
        areaUnit: "m2",
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
      },
      "vertices"
    )
  })

  it("rechaza un polígono con área nula", () => {
    expectInvalid(
      {
        lengthUnit: "m",
        areaUnit: "m2",
        vertices: [
          { x: 0, y: 0 },
          { x: 5, y: 5 },
          { x: 10, y: 10 },
        ],
      },
      "vertices"
    )
  })

  it("acepta coordenadas con coma decimal", () => {
    const parsed = input([
      { x: "0,5", y: "0" },
      { x: "10,5", y: "0" },
      { x: "0", y: "8,5" },
    ])

    expect(parsed.vertices[0].x).toBe(0.5)
    expect(parsed.vertices[2].y).toBe(8.5)
  })

  it("reporta el campo de la coordenada inválida", () => {
    const result = coordinatesAreaDefinition.validate({
      lengthUnit: "m",
      areaUnit: "m2",
      vertices: [
        { x: "abc", y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 8 },
      ],
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(
        result.errors.some((error) => error.field === "vertices.0.x")
      ).toBe(true)
    }
  })
})

describe("parseCoordinateList", () => {
  it("lee coordenadas separadas por coma", () => {
    const result = parseCoordinateList("0,0\n10,0\n10,8\n0,8")

    expect(result.errors).toEqual([])
    expect(result.vertices).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 8 },
      { x: 0, y: 8 },
    ])
  })

  it("lee coma decimal separada por espacio", () => {
    const result = parseCoordinateList("0,5 0\n10,5 0\n0 8,5")

    expect(result.errors).toEqual([])
    expect(result.vertices).toEqual([
      { x: 0.5, y: 0 },
      { x: 10.5, y: 0 },
      { x: 0, y: 8.5 },
    ])
  })

  it("lee coma decimal separada por punto y coma", () => {
    const result = parseCoordinateList("0,5; 0\n10,5; 0\n0; 8,5")

    expect(result.errors).toEqual([])
    expect(result.vertices[0]).toEqual({ x: 0.5, y: 0 })
    expect(result.vertices[2]).toEqual({ x: 0, y: 8.5 })
  })

  it("acepta comas de separación con espacios", () => {
    const result = parseCoordinateList("0.5, 0\n10.5, 0\n0, 8.5")

    expect(result.errors).toEqual([])
    expect(result.vertices).toEqual([
      { x: 0.5, y: 0 },
      { x: 10.5, y: 0 },
      { x: 0, y: 8.5 },
    ])
  })

  it("ignora líneas vacías y comentarios", () => {
    const result = parseCoordinateList(
      "# Vértices del lote\n\n0,0\n10,0\n0,8\n"
    )

    expect(result.errors).toEqual([])
    expect(result.vertices).toHaveLength(3)
  })

  it("reporta líneas con formato o valores inválidos", () => {
    const result = parseCoordinateList("0,0\n10,0,5\n0; abc\n0,8")

    expect(result.vertices).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 8 },
    ])
    expect(result.errors).toHaveLength(2)
    expect(result.errors[0]).toContain("Línea 2")
    expect(result.errors[1]).toContain("coordenada Y")
  })
})

describe("definición", () => {
  it("genera el resumen del cálculo guardado", () => {
    const parsedInput = input([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 8 },
      { x: 0, y: 8 },
    ])
    const result = calculateCoordinatesArea(parsedInput)
    const snapshot = coordinatesAreaDefinition.toSnapshot(parsedInput, result)

    expect(snapshot.summary).toBe(
      "Área por coordenadas: 80,000 m²; perímetro 36,000 m; 4 vértices"
    )
  })
})
