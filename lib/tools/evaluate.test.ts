import { describe, expect, it } from "vitest"
import { z } from "zod"

import { evaluateTool } from "@/lib/tools/evaluate"
import type { ToolDefinition } from "@/lib/tools/types"
import { createValidator } from "@/lib/tools/validate"

const schema = z.object({
  value: z.number().positive("El valor debe ser mayor que cero"),
})

type Input = z.infer<typeof schema>
type Result = { doubled: number }

function createDefinition(
  calculate: (input: Input) => Result
): ToolDefinition<Input, Result> {
  return {
    info: {
      id: "test-tool",
      name: "Herramienta de prueba",
      description: "Herramienta para probar la evaluación",
      category: "general",
    },
    schema,
    validate: createValidator(schema),
    calculate,
    toSnapshot: (input, result) => ({
      inputs: { ...input },
      result: { doubled: result.doubled },
      summary: `Resultado: ${result.doubled}`,
    }),
  }
}

describe("evaluateTool", () => {
  it("evalúa una sola vez y devuelve validación, resultado y snapshot", () => {
    let calls = 0
    const definition = createDefinition((input) => {
      calls += 1
      return { doubled: input.value * 2 }
    })

    const evaluation = evaluateTool(definition, { value: 2 })

    expect(evaluation.validation).toEqual({ valid: true })
    expect(evaluation.parsedInput).toEqual({ value: 2 })
    expect(evaluation.result).toEqual({ doubled: 4 })
    expect(evaluation.snapshot?.summary).toBe("Resultado: 4")
    expect(evaluation.calculationError).toBeNull()
    expect(calls).toBe(1)
  })

  it("devuelve los errores del schema sin calcular", () => {
    let calls = 0
    const definition = createDefinition((input) => {
      calls += 1
      return { doubled: input.value * 2 }
    })

    const evaluation = evaluateTool(definition, { value: 0 })

    expect(evaluation.validation).toEqual({
      valid: false,
      errors: [{ field: "value", message: "El valor debe ser mayor que cero" }],
    })
    expect(evaluation.parsedInput).toBeNull()
    expect(evaluation.result).toBeNull()
    expect(evaluation.snapshot).toBeNull()
    expect(evaluation.calculationError).toBeNull()
    expect(calls).toBe(0)
  })

  it("captura los errores del cálculo y conserva la entrada parseada", () => {
    const definition = createDefinition(() => {
      throw new Error("Sin solución")
    })

    const evaluation = evaluateTool(definition, { value: 2 })

    expect(evaluation.validation).toEqual({ valid: true })
    expect(evaluation.parsedInput).toEqual({ value: 2 })
    expect(evaluation.result).toBeNull()
    expect(evaluation.snapshot).toBeNull()
    expect(evaluation.calculationError).toBe("Sin solución")
  })
})
