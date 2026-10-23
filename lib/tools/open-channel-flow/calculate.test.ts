import { describe, expect, it } from "vitest"

import {
  calculateOpenChannelFlow,
  type OpenChannelFlowResult,
} from "@/lib/tools/open-channel-flow/calculate"
import { openChannelFlowDefinition } from "@/lib/tools/open-channel-flow/definition"
import {
  openChannelFlowSchema,
  type OpenChannelFlowInput,
} from "@/lib/tools/open-channel-flow/schema"

function rawInput(overrides: Record<string, unknown> = {}) {
  return {
    mode: "discharge",
    geometry: { section: "rectangular", bottomWidth: "5" },
    discharge: "10",
    slope: "0,001",
    manning: "0,015",
    ...overrides,
  }
}

function parseInput(
  overrides: Record<string, unknown> = {}
): OpenChannelFlowInput {
  return openChannelFlowSchema.parse(rawInput(overrides))
}

function resultFor(
  overrides: Record<string, unknown> = {}
): OpenChannelFlowResult {
  return calculateOpenChannelFlow(parseInput(overrides))
}

function fieldErrors(
  result: ReturnType<typeof openChannelFlowDefinition.validate>
) {
  if (result.valid) return []
  return result.errors.map((error) => error.field)
}

describe("canales abiertos con caudal conocido", () => {
  it("resuelve profundidad normal, velocidad, Froude y régimen", () => {
    const result = resultFor()

    expect(result.normalDepth).not.toBeNull()
    expect(result.normalDepth).toBeCloseTo(1.1240168823139918, 6)
    expect(result.discharge).toBeCloseTo(10, 12)
    expect(result.velocity).toBeCloseTo(1.7793327052905459, 6)
    expect(result.criticalDepth).toBeCloseTo(0.7415327354153678, 6)
    expect(result.froude).toBeCloseTo(0.5358413700862462, 6)
    expect(result.regime).toBe("subcritical")
    expect(result.criticalSlope).toBeCloseTo(0.003447904966425707, 8)
    expect(result.slopeClassification).toBe("mild")
    expect(result.iterations.normalDepth).toBeGreaterThan(0)
    expect(result.iterations.criticalDepth).toBeGreaterThan(0)
    expect(result.converged.normalDepth).toBe(true)
    expect(result.converged.criticalDepth).toBe(true)
    expect(result.warnings).toEqual([])
  })

  it("calcula las propiedades hidráulicas en la profundidad normal", () => {
    const result = resultFor()
    expect(result.properties).not.toBeNull()
    if (!result.properties) return

    expect(result.properties.area).toBeCloseTo(5.620084411569959, 6)
    expect(result.properties.topWidth).toBeCloseTo(5, 12)
    expect(result.properties.hydraulicDepth).toBeCloseTo(1.1240168823139918, 6)
    expect(result.properties.hydraulicRadius).toBeCloseTo(
      5.620084411569959 / (5 + 2 * 1.1240168823139918),
      6
    )
  })

  it("identifica un flujo supercrítico y una pendiente fuerte", () => {
    const result = resultFor({ slope: "0,01" })

    expect(result.regime).toBe("supercritical")
    expect(result.slopeClassification).toBe("steep")
    expect(
      result.warnings.some((warning) => warning.includes("supercrítico"))
    ).toBe(true)
  })

  it("advierte cuando el flujo queda cerca del régimen crítico", () => {
    const result = resultFor({
      discharge: "10",
      slope: "0,003447904966425707",
    })

    expect(result.froude).not.toBeNull()
    if (result.froude === null) return
    expect(Math.abs(result.froude - 1)).toBeLessThanOrEqual(0.05)
    expect(result.regime).toBe("critical")
    expect(result.slopeClassification).toBe("critical")
    expect(
      result.warnings.some((warning) => warning.includes("régimen crítico"))
    ).toBe(true)
  })

  it("advierte cuando n está fuera del intervalo típico", () => {
    const result = resultFor({ manning: "0,005" })

    expect(
      result.warnings.some((warning) => warning.includes("intervalo típico"))
    ).toBe(true)
  })
})

describe("canales abiertos con profundidad conocida", () => {
  it("calcula el caudal con Manning a partir de la profundidad", () => {
    const result = resultFor({
      mode: "depth",
      depth: "1",
    })

    expect(result.normalDepth).toBeCloseTo(1, 12)
    expect(result.discharge).toBeCloseTo(8.422869167193808, 8)
    expect(result.velocity).toBeCloseTo(1.6845738334387614, 8)
    expect(result.criticalDepth).toBeCloseTo(0.6613586394704147, 8)
    expect(result.regime).toBe("subcritical")
    expect(result.iterations.normalDepth).toBe(0)
    expect(result.iterations.criticalDepth).toBeGreaterThan(0)
  })

  it("advierte en la rama superior de una sección circular", () => {
    const result = resultFor({
      mode: "depth",
      geometry: { section: "circular", diameter: "4" },
      depth: "3,9",
    })

    expect(result.normalDepth).toBeCloseTo(3.9, 12)
    expect(result.discharge).toBeGreaterThan(0)
    expect(
      result.warnings.some((warning) => warning.includes("rama superior"))
    ).toBe(true)
  })
})

describe("secciones trapezoidales, triangulares y circulares", () => {
  it("calcula una sección trapezoidal", () => {
    const result = resultFor({
      geometry: {
        section: "trapezoidal",
        bottomWidth: "6",
        sideSlope: "2",
      },
    })

    expect(result.normalDepth).not.toBeNull()
    expect(result.properties).not.toBeNull()
    expect(result.regime).not.toBeNull()
  })

  it("calcula una sección triangular", () => {
    const result = resultFor({
      geometry: { section: "triangular", sideSlope: "2" },
    })

    expect(result.normalDepth).not.toBeNull()
    expect(result.properties).not.toBeNull()
    expect(result.regime).not.toBeNull()
  })

  it("resuelve una sección circular parcialmente llena", () => {
    const result = resultFor({
      geometry: { section: "circular", diameter: "4" },
    })

    expect(result.normalDepth).toBeCloseTo(1.7032697742234495, 4)
    expect(result.velocity).toBeCloseTo(1.9605408399017512, 4)
    expect(result.criticalDepth).toBeCloseTo(1.2502833183475541, 4)
    expect(result.regime).toBe("subcritical")
    expect(result.normalDepth).toBeLessThan(4 * 0.94)
  })

  it("reporta la falta de solución a superficie libre en una sección circular", () => {
    const result = resultFor({
      geometry: { section: "circular", diameter: "2" },
      discharge: "1000",
    })

    expect(result.normalDepth).toBeNull()
    expect(result.velocity).toBeNull()
    expect(result.froude).toBeNull()
    expect(result.regime).toBeNull()
    expect(
      result.warnings.some((warning) => warning.includes("capacidad máxima"))
    ).toBe(true)
  })
})

describe("validación de canales abiertos", () => {
  it("acepta comas decimales y convierte la geometría", () => {
    const input = parseInput({
      geometry: {
        section: "trapezoidal",
        bottomWidth: "5,5",
        sideSlope: "1,5",
      },
      discharge: "10,5",
      slope: "0,002",
      manning: "0,014",
    })

    expect(input.geometry).toEqual({
      section: "trapezoidal",
      bottomWidth: 5.5,
      sideSlope: 1.5,
    })
    expect(input.mode).toBe("discharge")
    if (input.mode !== "discharge") return
    expect(input.discharge).toBe(10.5)
    expect(input.slope).toBe(0.002)
  })

  it("rechaza dimensiones, pendiente y Manning no positivos", () => {
    const errors = fieldErrors(
      openChannelFlowDefinition.validate(
        rawInput({
          geometry: { section: "rectangular", bottomWidth: "0" },
          discharge: "0",
          slope: "0",
          manning: "0",
        })
      )
    )

    expect(errors).toContain("geometry.bottomWidth")
    expect(errors).toContain("discharge")
    expect(errors).toContain("slope")
    expect(errors).toContain("manning")
  })

  it("exige que la profundidad circular sea menor que el diámetro", () => {
    const errors = fieldErrors(
      openChannelFlowDefinition.validate({
        mode: "depth",
        geometry: { section: "circular", diameter: "2" },
        depth: "2",
        slope: "0,001",
        manning: "0,015",
      })
    )

    expect(errors).toContain("depth")
  })

  it("rechaza un modo o una sección desconocidos", () => {
    const errors = fieldErrors(
      openChannelFlowDefinition.validate(
        rawInput({ mode: "otro", geometry: { section: "otra" } })
      )
    )

    expect(errors.length).toBeGreaterThan(0)
  })
})

describe("resumen y snapshot de canales abiertos", () => {
  it("genera el resumen del cálculo guardado", () => {
    const input = parseInput()
    const result = calculateOpenChannelFlow(input)
    const snapshot = openChannelFlowDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Rectangular: y = 1,12 m; Q = 10,00 m³/s; V = 1,78 m/s; y_c = 0,74 m; Fr = 0,54 (subcrítico); pendiente suave"
    )
    expect(snapshot.inputs).toMatchObject({
      mode: "discharge",
      geometry: { section: "rectangular", bottomWidth: 5 },
      discharge: 10,
      slope: 0.001,
      manning: 0.015,
    })
    expect(snapshot.result).toMatchObject({
      section: "rectangular",
      regime: "subcritical",
      slopeClassification: "mild",
    })
  })

  it("genera un resumen sin solución de flujo normal", () => {
    const input = parseInput({
      geometry: { section: "circular", diameter: "2" },
      discharge: "1000",
    })
    const result = calculateOpenChannelFlow(input)
    const snapshot = openChannelFlowDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toContain("sin solución de flujo normal")
  })

  it("usa una etiqueta corta para la sección circular en el resumen", () => {
    const input = parseInput({
      geometry: { section: "circular", diameter: "4" },
    })
    const result = calculateOpenChannelFlow(input)
    const snapshot = openChannelFlowDefinition.toSnapshot(input, result)

    expect(snapshot.summary.startsWith("Circular:")).toBe(true)
    expect(snapshot.summary.length).toBeLessThanOrEqual(120)
  })

  it("produce un resultado serializable", () => {
    const result = resultFor()
    const roundTrip = JSON.parse(JSON.stringify(result))

    expect(roundTrip.normalDepth).toBeCloseTo(result.normalDepth ?? 0, 10)
    expect(roundTrip.regime).toBe("subcritical")
    expect(roundTrip.properties.area).toBeCloseTo(
      result.properties?.area ?? 0,
      10
    )
  })
})
