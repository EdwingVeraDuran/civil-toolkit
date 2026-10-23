import type {
  DoubleInput,
  InterpolationInput,
  LinearDirection,
  LinearInput,
} from "@/lib/tools/interpolation-calculator/schema"

export type LinearResult = {
  mode: "linear"
  direction: LinearDirection
  resultVariable: "x" | "y"
  targetVariable: "x" | "y"
  value: number
  targetX: number
  targetY: number
  t: number
  deltaX: number
  deltaY: number
  slope: number | null
  formula: string
}

export type DoubleResult = {
  mode: "double"
  value: number
  targetX: number
  targetY: number
  tx: number
  ty: number
  zAtY1: number
  zAtY2: number
  formula: string
}

export type InterpolationResult = LinearResult | DoubleResult

function assertInUnitInterval(value: number, message: string) {
  if (value < 0 || value > 1) {
    throw new Error(message)
  }
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function calculateLinear(input: LinearInput): LinearResult {
  const deltaX = input.x2 - input.x1
  const deltaY = input.y2 - input.y1

  if (input.direction === "y-from-x") {
    if (deltaX === 0) {
      throw new Error("x₁ y x₂ deben ser diferentes para interpolar")
    }

    const t = (input.target - input.x1) / deltaX
    assertInUnitInterval(
      t,
      "El valor de x debe estar entre x₁ y x₂ para interpolar"
    )

    const value = lerp(input.y1, input.y2, t)

    return {
      mode: "linear",
      direction: input.direction,
      resultVariable: "y",
      targetVariable: "x",
      value,
      targetX: input.target,
      targetY: value,
      t,
      deltaX,
      deltaY,
      slope: deltaX === 0 ? null : deltaY / deltaX,
      formula: "y = y₁ + (y₂ − y₁) · (x − x₁) / (x₂ − x₁)",
    }
  }

  if (deltaY === 0) {
    throw new Error("y₁ e y₂ deben ser diferentes para interpolar")
  }

  const t = (input.target - input.y1) / deltaY
  assertInUnitInterval(
    t,
    "El valor de y debe estar entre y₁ e y₂ para interpolar"
  )

  const value = lerp(input.x1, input.x2, t)

  return {
    mode: "linear",
    direction: input.direction,
    resultVariable: "x",
    targetVariable: "y",
    value,
    targetX: value,
    targetY: input.target,
    t,
    deltaX,
    deltaY,
    slope: deltaX === 0 ? null : deltaY / deltaX,
    formula: "x = x₁ + (x₂ − x₁) · (y − y₁) / (y₂ − y₁)",
  }
}

export function calculateDouble(input: DoubleInput): DoubleResult {
  const deltaX = input.x2 - input.x1
  const deltaY = input.y2 - input.y1

  if (deltaX === 0) {
    throw new Error("x₁ y x₂ deben ser diferentes para interpolar")
  }
  if (deltaY === 0) {
    throw new Error("y₁ e y₂ deben ser diferentes para interpolar")
  }

  const tx = (input.targetX - input.x1) / deltaX
  const ty = (input.targetY - input.y1) / deltaY

  assertInUnitInterval(
    tx,
    "El valor de x debe estar entre x₁ y x₂ para interpolar"
  )
  assertInUnitInterval(
    ty,
    "El valor de y debe estar entre y₁ e y₂ para interpolar"
  )

  const zAtY1 = lerp(input.z11, input.z21, tx)
  const zAtY2 = lerp(input.z12, input.z22, tx)
  const value = lerp(zAtY1, zAtY2, ty)

  return {
    mode: "double",
    value,
    targetX: input.targetX,
    targetY: input.targetY,
    tx,
    ty,
    zAtY1,
    zAtY2,
    formula:
      "z = (1 − tₓ)(1 − t_y) z₁₁ + tₓ(1 − t_y) z₂₁ + (1 − tₓ) t_y z₁₂ + tₓ t_y z₂₂",
  }
}

export function calculateInterpolation(
  input: InterpolationInput
): InterpolationResult {
  return input.mode === "linear"
    ? calculateLinear(input)
    : calculateDouble(input)
}
