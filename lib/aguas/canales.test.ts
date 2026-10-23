import { describe, expect, it } from "vitest"

import {
  GRAVITY,
  classifyFlowRegime,
  classifySlope,
  criticalSlope,
  froudeNumber,
  manningDischarge,
  manningVelocity,
  sectionProperties,
  solveCriticalDepth,
  solveNormalDepth,
} from "@/lib/aguas/canales"

const rectangular = {
  section: "rectangular" as const,
  bottomWidth: 5,
}

const trapezoidal = {
  section: "trapezoidal" as const,
  bottomWidth: 6,
  sideSlope: 2,
}

const triangular = {
  section: "triangular" as const,
  sideSlope: 2,
}

const circular = {
  section: "circular" as const,
  diameter: 2,
}

describe("geometría hidráulica de canales", () => {
  it("calcula las propiedades de una sección rectangular", () => {
    const properties = sectionProperties(rectangular, 1)

    expect(properties.area).toBeCloseTo(5, 12)
    expect(properties.wettedPerimeter).toBeCloseTo(7, 12)
    expect(properties.topWidth).toBeCloseTo(5, 12)
    expect(properties.hydraulicRadius).toBeCloseTo(5 / 7, 12)
    expect(properties.hydraulicDepth).toBeCloseTo(1, 12)
  })

  it("calcula las propiedades de una sección trapezoidal", () => {
    const properties = sectionProperties(trapezoidal, 1.5)

    expect(properties.area).toBeCloseTo(13.5, 12)
    expect(properties.wettedPerimeter).toBeCloseTo(6 + 3 * Math.sqrt(5), 12)
    expect(properties.topWidth).toBeCloseTo(12, 12)
    expect(properties.hydraulicRadius).toBeCloseTo(
      13.5 / (6 + 3 * Math.sqrt(5)),
      12
    )
    expect(properties.hydraulicDepth).toBeCloseTo(13.5 / 12, 12)
  })

  it("calcula las propiedades de una sección triangular", () => {
    const properties = sectionProperties(triangular, 1)

    expect(properties.area).toBeCloseTo(2, 12)
    expect(properties.wettedPerimeter).toBeCloseTo(2 * Math.sqrt(5), 12)
    expect(properties.topWidth).toBeCloseTo(4, 12)
    expect(properties.hydraulicRadius).toBeCloseTo(2 / (2 * Math.sqrt(5)), 12)
    expect(properties.hydraulicDepth).toBeCloseTo(0.5, 12)
  })

  it("calcula la sección circular a media capacidad", () => {
    const properties = sectionProperties(circular, 1)

    expect(properties.area).toBeCloseTo(Math.PI / 2, 12)
    expect(properties.wettedPerimeter).toBeCloseTo(Math.PI, 12)
    expect(properties.topWidth).toBeCloseTo(2, 12)
    expect(properties.hydraulicRadius).toBeCloseTo(0.5, 12)
    expect(properties.hydraulicDepth).toBeCloseTo(Math.PI / 4, 12)
  })

  it("rechaza una profundidad mayor o igual que el diámetro", () => {
    expect(() => sectionProperties(circular, 2)).toThrow(
      "menor que el diámetro"
    )
  })
})

describe("Manning y régimen de flujo", () => {
  it("calcula el caudal y la velocidad con Manning en SI", () => {
    const properties = sectionProperties(rectangular, 1)
    const discharge = manningDischarge(properties, 0.015, 0.001)
    const velocity = manningVelocity(properties, 0.015, 0.001)

    expect(discharge).toBeCloseTo(8.422869167193808, 10)
    expect(velocity).toBeCloseTo(8.422869167193808 / 5, 10)
    expect(discharge).toBeCloseTo(properties.area * velocity, 12)
  })

  it("clasifica el régimen con el número de Froude", () => {
    expect(classifyFlowRegime(0.5)).toBe("subcritical")
    expect(classifyFlowRegime(1.005)).toBe("critical")
    expect(classifyFlowRegime(1.5)).toBe("supercritical")
  })

  it("calcula el número de Froude", () => {
    expect(froudeNumber(2, 1)).toBeCloseTo(2 / Math.sqrt(GRAVITY), 12)
  })

  it("clasifica la pendiente frente a la pendiente crítica", () => {
    expect(classifySlope(0.001, 0.0034)).toBe("mild")
    expect(classifySlope(0.0034, 0.0034)).toBe("critical")
    expect(classifySlope(0.01, 0.0034)).toBe("steep")
  })
})

describe("profundidad normal", () => {
  it("resuelve la profundidad normal de una sección rectangular", () => {
    const solution = solveNormalDepth(rectangular, 10, 0.015, 0.001)

    expect(solution).not.toBeNull()
    if (!solution) return

    expect(solution.depth).toBeCloseTo(1.1240168823139918, 8)
    expect(solution.converged).toBe(true)
    expect(solution.iterations).toBeGreaterThan(0)
    expect(Math.abs(solution.residual)).toBeLessThan(1e-7)
  })

  it("recupera la profundidad que generó un caudal conocido", () => {
    const properties = sectionProperties(rectangular, 1)
    const discharge = manningDischarge(properties, 0.015, 0.001)
    const solution = solveNormalDepth(rectangular, discharge, 0.015, 0.001)

    expect(solution).not.toBeNull()
    if (!solution) return
    expect(solution.depth).toBeCloseTo(1, 8)
  })

  it("resuelve la rama inferior en una sección circular", () => {
    const solution = solveNormalDepth(
      { section: "circular", diameter: 4 },
      10,
      0.015,
      0.001
    )

    expect(solution).not.toBeNull()
    if (!solution) return

    expect(solution.depth).toBeCloseTo(1.7032697742234495, 5)
    expect(solution.depth).toBeLessThan(4 * 0.94)
  })

  it("no encuentra solución circular cuando el caudal supera la capacidad", () => {
    const solution = solveNormalDepth(
      { section: "circular", diameter: 2 },
      1000,
      0.015,
      0.001
    )

    expect(solution).toBeNull()
  })

  it("resuelve las secciones trapezoidal y triangular", () => {
    const geometries = [trapezoidal, triangular] as const

    for (const geometry of geometries) {
      const normal = solveNormalDepth(geometry, 10, 0.015, 0.001)
      expect(normal).not.toBeNull()
      if (!normal) continue

      const properties = sectionProperties(geometry, normal.depth)
      const discharge = manningDischarge(properties, 0.015, 0.001)
      expect(discharge).toBeCloseTo(10, 6)

      const critical = solveCriticalDepth(geometry, 10)
      expect(critical).not.toBeNull()
      if (!critical) continue

      const criticalProperties = sectionProperties(geometry, critical.depth)
      const criticality =
        (10 * 10 * criticalProperties.topWidth) /
          (GRAVITY * criticalProperties.area ** 3) -
        1
      expect(Math.abs(criticality)).toBeLessThan(1e-6)
    }
  })
})

describe("profundidad crítica y pendiente crítica", () => {
  it("coincide con la fórmula explícita rectangular", () => {
    const solution = solveCriticalDepth(rectangular, 10)
    const expected = Math.cbrt((10 / 5) ** 2 / GRAVITY)

    expect(solution).not.toBeNull()
    if (!solution) return
    expect(solution.depth).toBeCloseTo(expected, 8)
    expect(solution.converged).toBe(true)
  })

  it("satisface la ecuación de Froude en la profundidad crítica", () => {
    const solution = solveCriticalDepth(rectangular, 10)

    expect(solution).not.toBeNull()
    if (!solution) return

    const properties = sectionProperties(rectangular, solution.depth)
    const value =
      (10 * 10 * properties.topWidth) / (GRAVITY * properties.area ** 3) - 1

    expect(value).toBeCloseTo(0, 7)
  })

  it("calcula la pendiente crítica en una sección rectangular", () => {
    const critical = solveCriticalDepth(rectangular, 10)
    expect(critical).not.toBeNull()
    if (!critical) return

    const properties = sectionProperties(rectangular, critical.depth)
    const value = criticalSlope(0.015, 10, properties)

    expect(value).toBeCloseTo(0.003447904966425707, 10)
  })

  it("satisface la condición de criticalidad en una sección circular", () => {
    const solution = solveCriticalDepth(
      { section: "circular", diameter: 4 },
      10
    )

    expect(solution).not.toBeNull()
    if (!solution) return

    const properties = sectionProperties(
      { section: "circular", diameter: 4 },
      solution.depth
    )
    const value =
      (10 * 10 * properties.topWidth) / (GRAVITY * properties.area ** 3) - 1

    expect(value).toBeCloseTo(0, 8)
  })
})
