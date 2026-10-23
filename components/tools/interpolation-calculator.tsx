"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { InterpolationDiagram } from "@/components/tools/interpolation-diagram"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { interpolationCalculatorDefinition } from "@/lib/tools/interpolation-calculator/definition"
import {
  INTERPOLATION_MODES,
  INTERPOLATION_MODE_LABELS,
  LINEAR_DIRECTIONS,
  LINEAR_DIRECTION_LABELS,
  type InterpolationMode,
  type LinearDirection,
} from "@/lib/tools/interpolation-calculator/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"

const MODE_ITEMS = INTERPOLATION_MODES.map((value) => ({
  value,
  label: INTERPOLATION_MODE_LABELS[value],
}))

const DIRECTION_ITEMS = LINEAR_DIRECTIONS.map((value) => ({
  value,
  label: LINEAR_DIRECTION_LABELS[value],
}))

function isInterpolationMode(value: string): value is InterpolationMode {
  return (INTERPOLATION_MODES as readonly string[]).includes(value)
}

function isLinearDirection(value: string): value is LinearDirection {
  return (LINEAR_DIRECTIONS as readonly string[]).includes(value)
}

function readString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function hydrateInterpolationInitialInput(
  initialInput?: Record<string, unknown>
) {
  if (!initialInput) return null

  const mode =
    typeof initialInput.mode === "string" &&
    isInterpolationMode(initialInput.mode)
      ? initialInput.mode
      : "linear"
  const direction =
    typeof initialInput.direction === "string" &&
    isLinearDirection(initialInput.direction)
      ? initialInput.direction
      : "y-from-x"

  const isLinear = mode === "linear"
  const isDouble = mode === "double"
  const rawTarget = readString(
    initialInput.target,
    direction === "y-from-x" ? "3" : "15"
  )

  return {
    mode,
    direction,
    linearX1Input: readString(isLinear ? initialInput.x1 : undefined, "2"),
    linearY1Input: readString(isLinear ? initialInput.y1 : undefined, "10"),
    linearX2Input: readString(isLinear ? initialInput.x2 : undefined, "4"),
    linearY2Input: readString(isLinear ? initialInput.y2 : undefined, "20"),
    linearTargetXInput: isLinear && direction === "y-from-x" ? rawTarget : "3",
    linearTargetYInput: isLinear && direction === "x-from-y" ? rawTarget : "15",
    doubleX1Input: readString(isDouble ? initialInput.x1 : undefined, "0"),
    doubleX2Input: readString(isDouble ? initialInput.x2 : undefined, "10"),
    doubleY1Input: readString(isDouble ? initialInput.y1 : undefined, "0"),
    doubleY2Input: readString(isDouble ? initialInput.y2 : undefined, "10"),
    doubleZ11Input: readString(isDouble ? initialInput.z11 : undefined, "0"),
    doubleZ21Input: readString(isDouble ? initialInput.z21 : undefined, "10"),
    doubleZ12Input: readString(isDouble ? initialInput.z12 : undefined, "20"),
    doubleZ22Input: readString(isDouble ? initialInput.z22 : undefined, "30"),
    doubleTargetXInput: readString(
      isDouble ? initialInput.targetX : undefined,
      "5"
    ),
    doubleTargetYInput: readString(
      isDouble ? initialInput.targetY : undefined,
      "5"
    ),
  }
}

function SelectField({
  id,
  label,
  items,
  value,
  onChange,
}: {
  id: string
  label: string
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          if (next) {
            onChange(next)
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  inputMode = "decimal",
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  inputMode?: "decimal" | "numeric"
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  )
}

function FormulaBlock({ formula }: { formula: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">Fórmula</p>
      <p className="mt-1 text-sm font-medium">{formula}</p>
    </div>
  )
}

export function InterpolationCalculator({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateInterpolationInitialInput(initialInput)

  const [mode, setMode] = useState<InterpolationMode>(
    hydrated?.mode ?? "linear"
  )
  const [direction, setDirection] = useState<LinearDirection>(
    hydrated?.direction ?? "y-from-x"
  )
  const [linearX1Input, setLinearX1Input] = useState(
    hydrated?.linearX1Input ?? "2"
  )
  const [linearY1Input, setLinearY1Input] = useState(
    hydrated?.linearY1Input ?? "10"
  )
  const [linearX2Input, setLinearX2Input] = useState(
    hydrated?.linearX2Input ?? "4"
  )
  const [linearY2Input, setLinearY2Input] = useState(
    hydrated?.linearY2Input ?? "20"
  )
  const [linearTargetXInput, setLinearTargetXInput] = useState(
    hydrated?.linearTargetXInput ?? "3"
  )
  const [linearTargetYInput, setLinearTargetYInput] = useState(
    hydrated?.linearTargetYInput ?? "15"
  )

  const [doubleX1Input, setDoubleX1Input] = useState(
    hydrated?.doubleX1Input ?? "0"
  )
  const [doubleX2Input, setDoubleX2Input] = useState(
    hydrated?.doubleX2Input ?? "10"
  )
  const [doubleY1Input, setDoubleY1Input] = useState(
    hydrated?.doubleY1Input ?? "0"
  )
  const [doubleY2Input, setDoubleY2Input] = useState(
    hydrated?.doubleY2Input ?? "10"
  )
  const [doubleZ11Input, setDoubleZ11Input] = useState(
    hydrated?.doubleZ11Input ?? "0"
  )
  const [doubleZ21Input, setDoubleZ21Input] = useState(
    hydrated?.doubleZ21Input ?? "10"
  )
  const [doubleZ12Input, setDoubleZ12Input] = useState(
    hydrated?.doubleZ12Input ?? "20"
  )
  const [doubleZ22Input, setDoubleZ22Input] = useState(
    hydrated?.doubleZ22Input ?? "30"
  )
  const [doubleTargetXInput, setDoubleTargetXInput] = useState(
    hydrated?.doubleTargetXInput ?? "5"
  )
  const [doubleTargetYInput, setDoubleTargetYInput] = useState(
    hydrated?.doubleTargetYInput ?? "5"
  )

  const rawInput =
    mode === "linear"
      ? {
          mode,
          direction,
          x1: linearX1Input,
          y1: linearY1Input,
          x2: linearX2Input,
          y2: linearY2Input,
          target:
            direction === "y-from-x" ? linearTargetXInput : linearTargetYInput,
        }
      : {
          mode,
          x1: doubleX1Input,
          x2: doubleX2Input,
          y1: doubleY1Input,
          y2: doubleY2Input,
          z11: doubleZ11Input,
          z21: doubleZ21Input,
          z12: doubleZ12Input,
          z22: doubleZ22Input,
          targetX: doubleTargetXInput,
          targetY: doubleTargetYInput,
        }

  const validation = interpolationCalculatorDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput = validation.valid
    ? interpolationCalculatorDefinition.schema.parse(rawInput)
    : null

  const result = parsedInput
    ? interpolationCalculatorDefinition.calculate(parsedInput)
    : null

  const snapshot =
    parsedInput && result
      ? interpolationCalculatorDefinition.toSnapshot(parsedInput, result)
      : null

  const linearInput = parsedInput?.mode === "linear" ? parsedInput : null
  const doubleInput = parsedInput?.mode === "double" ? parsedInput : null
  const linearResult = result?.mode === "linear" ? result : null
  const doubleResult = result?.mode === "double" ? result : null

  const x1Error = fieldError("x1")
  const x2Error = fieldError("x2")
  const y1Error = fieldError("y1")
  const y2Error = fieldError("y2")
  const z11Error = fieldError("z11")
  const z21Error = fieldError("z21")
  const z12Error = fieldError("z12")
  const z22Error = fieldError("z22")
  const targetError = fieldError("target")
  const targetXError = fieldError("targetX")
  const targetYError = fieldError("targetY")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de entrada</CardTitle>
          <CardDescription>
            Elige el tipo de interpolación e ingresa los valores conocidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={mode === "double" ? "sm:col-span-2" : undefined}>
              <SelectField
                id="interpolation-mode"
                label="Tipo de interpolación"
                items={MODE_ITEMS}
                value={mode}
                onChange={(next) => {
                  if (isInterpolationMode(next)) {
                    setMode(next)
                  }
                }}
              />
            </div>

            {mode === "linear" ? (
              <SelectField
                id="interpolation-direction"
                label="Dirección del cálculo"
                items={DIRECTION_ITEMS}
                value={direction}
                onChange={(next) => {
                  if (isLinearDirection(next)) {
                    setDirection(next)
                  }
                }}
              />
            ) : null}
          </div>

          {mode === "linear" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="text-sm font-medium">Punto conocido 1</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <NumberField
                      id="interpolation-x1"
                      label="x₁"
                      value={linearX1Input}
                      onChange={setLinearX1Input}
                      error={x1Error}
                    />
                    <NumberField
                      id="interpolation-y1"
                      label="y₁"
                      value={linearY1Input}
                      onChange={setLinearY1Input}
                      error={y1Error}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="text-sm font-medium">Punto conocido 2</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <NumberField
                      id="interpolation-x2"
                      label="x₂"
                      value={linearX2Input}
                      onChange={setLinearX2Input}
                      error={x2Error}
                    />
                    <NumberField
                      id="interpolation-y2"
                      label="y₂"
                      value={linearY2Input}
                      onChange={setLinearY2Input}
                      error={y2Error}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="interpolation-target"
                  label={
                    direction === "y-from-x"
                      ? "Valor de x a interpolar"
                      : "Valor de y a interpolar"
                  }
                  value={
                    direction === "y-from-x"
                      ? linearTargetXInput
                      : linearTargetYInput
                  }
                  onChange={
                    direction === "y-from-x"
                      ? setLinearTargetXInput
                      : setLinearTargetYInput
                  }
                  error={targetError}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {direction === "y-from-x"
                  ? "El valor de x debe estar entre x₁ y x₂."
                  : "El valor de y debe estar entre y₁ e y₂."}{" "}
                No se permite extrapolar.
              </p>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">
                    Coordenadas de la tabla
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    x₁ y x₂ son las columnas; y₁ e y₂ son las filas.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    id="interpolation-double-x1"
                    label="x₁ (columna izquierda)"
                    value={doubleX1Input}
                    onChange={setDoubleX1Input}
                    error={x1Error}
                  />
                  <NumberField
                    id="interpolation-double-x2"
                    label="x₂ (columna derecha)"
                    value={doubleX2Input}
                    onChange={setDoubleX2Input}
                    error={x2Error}
                  />
                  <NumberField
                    id="interpolation-double-y1"
                    label="y₁ (fila superior)"
                    value={doubleY1Input}
                    onChange={setDoubleY1Input}
                    error={y1Error}
                  />
                  <NumberField
                    id="interpolation-double-y2"
                    label="y₂ (fila inferior)"
                    value={doubleY2Input}
                    onChange={setDoubleY2Input}
                    error={y2Error}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Valores conocidos</h3>
                  <p className="text-xs text-muted-foreground">
                    Ingresa los cuatro valores de la tabla. Se interpola primero
                    en x y luego en y.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    id="interpolation-z11"
                    label="z₁₁ = f(x₁, y₁)"
                    value={doubleZ11Input}
                    onChange={setDoubleZ11Input}
                    error={z11Error}
                  />
                  <NumberField
                    id="interpolation-z21"
                    label="z₂₁ = f(x₂, y₁)"
                    value={doubleZ21Input}
                    onChange={setDoubleZ21Input}
                    error={z21Error}
                  />
                  <NumberField
                    id="interpolation-z12"
                    label="z₁₂ = f(x₁, y₂)"
                    value={doubleZ12Input}
                    onChange={setDoubleZ12Input}
                    error={z12Error}
                  />
                  <NumberField
                    id="interpolation-z22"
                    label="z₂₂ = f(x₂, y₂)"
                    value={doubleZ22Input}
                    onChange={setDoubleZ22Input}
                    error={z22Error}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Valor a interpolar</h3>
                  <p className="text-xs text-muted-foreground">
                    Los valores deben estar dentro de los rangos de la tabla.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    id="interpolation-target-x"
                    label="x"
                    value={doubleTargetXInput}
                    onChange={setDoubleTargetXInput}
                    error={targetXError}
                  />
                  <NumberField
                    id="interpolation-target-y"
                    label="y"
                    value={doubleTargetYInput}
                    onChange={setDoubleTargetYInput}
                    error={targetYError}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                No se permite extrapolar: x debe estar entre x₁ y x₂, e y entre
                y₁ e y₂.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {linearResult
              ? `${LINEAR_DIRECTION_LABELS[linearResult.direction]} — interpolación lineal.`
              : doubleResult
                ? "Interpolación doble — interpolación bilineal en una tabla 2×2."
                : "Ingresa valores válidos para calcular la interpolación."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linearResult && linearInput ? (
            <div className="grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Valor interpolado
                  </p>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {linearResult.resultVariable} ={" "}
                    {formatNumber(linearResult.value, 3)}
                  </p>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <Detail
                    label="Factor de interpolación"
                    value={`t = ${formatNumber(linearResult.t, 4)}`}
                  />
                  <Detail
                    label="Δx = x₂ − x₁"
                    value={formatNumber(linearResult.deltaX, 3)}
                  />
                  <Detail
                    label="Δy = y₂ − y₁"
                    value={formatNumber(linearResult.deltaY, 3)}
                  />
                  <Detail
                    label="Pendiente m = Δy / Δx"
                    value={
                      linearResult.slope === null
                        ? "Vertical"
                        : formatNumber(linearResult.slope, 3)
                    }
                  />
                  <Detail
                    label="Punto objetivo"
                    value={`(${formatNumber(
                      linearResult.targetX,
                      3
                    )}; ${formatNumber(linearResult.targetY, 3)})`}
                  />
                </dl>

                <FormulaBlock formula={linearResult.formula} />
              </div>

              <InterpolationDiagram
                input={linearInput}
                result={linearResult}
                className="mx-auto w-full max-w-sm"
              />
            </div>
          ) : doubleResult && doubleInput ? (
            <div className="grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Valor interpolado
                  </p>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    z = {formatNumber(doubleResult.value, 3)}
                  </p>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <Detail
                    label="Factor tₓ"
                    value={`tₓ = ${formatNumber(doubleResult.tx, 4)}`}
                  />
                  <Detail
                    label="Factor t_y"
                    value={`t_y = ${formatNumber(doubleResult.ty, 4)}`}
                  />
                  <Detail
                    label="z(x, y₁)"
                    value={formatNumber(doubleResult.zAtY1, 3)}
                  />
                  <Detail
                    label="z(x, y₂)"
                    value={formatNumber(doubleResult.zAtY2, 3)}
                  />
                  <Detail
                    label="Punto objetivo"
                    value={`(${formatNumber(
                      doubleInput.targetX,
                      3
                    )}; ${formatNumber(doubleInput.targetY, 3)})`}
                  />
                </dl>

                <FormulaBlock formula={doubleResult.formula} />
              </div>

              <InterpolationDiagram
                input={doubleInput}
                result={doubleResult}
                className="mx-auto w-full max-w-sm"
              />
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
          <CardDescription>
            Consideraciones de los cálculos de interpolación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            La interpolación lineal supone una variación constante entre los dos
            puntos conocidos.
          </p>
          <p>
            La interpolación doble es bilineal: interpola en x para cada fila y
            luego interpola esos resultados en y.
          </p>
          <p>
            Solo se interpola dentro del intervalo de los datos. No se realiza
            extrapolación.
          </p>
          <p>
            Los valores son adimensionales; si la tabla tiene unidades, ingresa
            todos los valores en la misma unidad.
          </p>
          <p>
            El diagrama es esquemático y no está a escala. La interpolación
            bilineal es una aproximación lineal de una tabla que puede no ser
            lineal.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {editMode ? (
          <UpdateCalculationButton
            calculationId={editMode.calculationId}
            title={editMode.title}
            projectId={editMode.projectId}
            toolId={interpolationCalculatorDefinition.info.id}
            snapshot={snapshot}
          />
        ) : (
          <SaveCalculationButton
            toolId={interpolationCalculatorDefinition.info.id}
            toolName={interpolationCalculatorDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
