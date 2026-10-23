"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { SlopeDiagram } from "@/components/tools/slope-diagram"
import { UnitSelect } from "@/components/tools/unit-select"
import { Badge } from "@/components/ui/badge"
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
import type { SlopeDirectionResult } from "@/lib/tools/slope-calculator/calculate"
import { slopeCalculatorDefinition } from "@/lib/tools/slope-calculator/definition"
import { evaluateTool } from "@/lib/tools/evaluate"
import {
  SLOPE_DIRECTIONS,
  SLOPE_FORMATS,
  SLOPE_MODES,
  type SlopeDirection,
  type SlopeFormat,
  type SlopeMode,
} from "@/lib/tools/slope-calculator/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"
import { Measurement } from "@/lib/units/measurement"
import { getUnit, unitsByDimension } from "@/lib/units/units"

const LENGTH_UNITS = unitsByDimension("length")
const LENGTH_UNIT_IDS = new Set(LENGTH_UNITS.map((unit) => unit.id))

const MODE_LABELS: Record<SlopeMode, string> = {
  "rise-run": "Desnivel y distancia",
  "slope-run": "Pendiente y distancia",
  elevations: "Dos cotas y distancia",
}

const FORMAT_LABELS: Record<SlopeFormat, string> = {
  percent: "Porcentaje (%)",
  permille: "Por mil (‰)",
  ratio: "Relación 1:n",
  angle: "Ángulo (°)",
}

const DIRECTION_LABELS: Record<SlopeDirection, string> = {
  ascending: "Ascendente",
  descending: "Descendente",
}

const RESULT_DIRECTION_LABELS: Record<SlopeDirectionResult, string> = {
  ascendente: "Ascendente",
  descendente: "Descendente",
  plano: "Plano",
}

const MODE_ITEMS = SLOPE_MODES.map((value) => ({
  value,
  label: MODE_LABELS[value],
}))

const FORMAT_ITEMS = SLOPE_FORMATS.map((value) => ({
  value,
  label: FORMAT_LABELS[value],
}))

const DIRECTION_ITEMS = SLOPE_DIRECTIONS.map((value) => ({
  value,
  label: DIRECTION_LABELS[value],
}))

function isSlopeMode(value: string): value is SlopeMode {
  return (SLOPE_MODES as readonly string[]).includes(value)
}

function isSlopeFormat(value: string): value is SlopeFormat {
  return (SLOPE_FORMATS as readonly string[]).includes(value)
}

function isSlopeDirection(value: string): value is SlopeDirection {
  return (SLOPE_DIRECTIONS as readonly string[]).includes(value)
}

function readString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function readLengthUnit(value: unknown, fallback: string): string {
  return typeof value === "string" && LENGTH_UNIT_IDS.has(value)
    ? value
    : fallback
}

function hydrateSlopeInitialInput(initialInput?: Record<string, unknown>) {
  if (!initialInput) return null

  return {
    mode:
      typeof initialInput.mode === "string" && isSlopeMode(initialInput.mode)
        ? initialInput.mode
        : "rise-run",
    runInput: readString(initialInput.run, "10"),
    runUnit: readLengthUnit(initialInput.runUnit, "m"),
    riseInput: readString(initialInput.rise, "1"),
    riseUnit: readLengthUnit(initialInput.riseUnit, "m"),
    slopeInput: readString(initialInput.slopeValue, "2"),
    slopeFormat:
      typeof initialInput.slopeFormat === "string" &&
      isSlopeFormat(initialInput.slopeFormat)
        ? initialInput.slopeFormat
        : "percent",
    direction:
      typeof initialInput.direction === "string" &&
      isSlopeDirection(initialInput.direction)
        ? initialInput.direction
        : "ascending",
    startElevationInput: readString(initialInput.startElevation, "100"),
    endElevationInput: readString(initialInput.endElevation, "101"),
    elevationUnit: readLengthUnit(initialInput.elevationUnit, "m"),
  }
}

function convertMeters(valueM: number, unitId: string): number {
  const unit = getUnit(unitId)

  if (!unit || unit.dimension !== "length") return valueM

  return Measurement.from(valueM, "m").to(unit).value
}

function formatLength(valueM: number, unitId: string): string {
  const unit = getUnit(unitId)
  const value = convertMeters(valueM, unitId)

  return `${formatNumber(value, 3)} ${unit?.symbol ?? "m"}`
}

function formatRatio(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(value)
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

export function SlopeCalculator({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateSlopeInitialInput(initialInput)

  const [mode, setMode] = useState<SlopeMode>(hydrated?.mode ?? "rise-run")
  const [runInput, setRunInput] = useState(hydrated?.runInput ?? "10")
  const [runUnit, setRunUnit] = useState(hydrated?.runUnit ?? "m")
  const [riseInput, setRiseInput] = useState(hydrated?.riseInput ?? "1")
  const [riseUnit, setRiseUnit] = useState(hydrated?.riseUnit ?? "m")
  const [slopeInput, setSlopeInput] = useState(hydrated?.slopeInput ?? "2")
  const [slopeFormat, setSlopeFormat] = useState<SlopeFormat>(
    hydrated?.slopeFormat ?? "percent"
  )
  const [direction, setDirection] = useState<SlopeDirection>(
    hydrated?.direction ?? "ascending"
  )
  const [startElevationInput, setStartElevationInput] = useState(
    hydrated?.startElevationInput ?? "100"
  )
  const [endElevationInput, setEndElevationInput] = useState(
    hydrated?.endElevationInput ?? "101"
  )
  const [elevationUnit, setElevationUnit] = useState(
    hydrated?.elevationUnit ?? "m"
  )

  const rawInput =
    mode === "rise-run"
      ? {
          mode,
          run: runInput,
          runUnit,
          rise: riseInput,
          riseUnit,
        }
      : mode === "slope-run"
        ? {
            mode,
            run: runInput,
            runUnit,
            slopeValue: slopeInput,
            slopeFormat,
            direction,
          }
        : {
            mode,
            run: runInput,
            runUnit,
            startElevation: startElevationInput,
            endElevation: endElevationInput,
            elevationUnit,
          }

  const { validation, result, snapshot } = evaluateTool(
    slopeCalculatorDefinition,
    rawInput
  )
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const runError = fieldError("run")
  const riseError = fieldError("rise")
  const slopeError = fieldError("slopeValue")
  const startElevationError = fieldError("startElevation")
  const endElevationError = fieldError("endElevation")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de entrada</CardTitle>
          <CardDescription>
            Elige cómo quieres ingresar los datos de la pendiente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SelectField
              id="slope-mode"
              label="Modo de cálculo"
              items={MODE_ITEMS}
              value={mode}
              onChange={(next) => {
                if (isSlopeMode(next)) {
                  setMode(next)
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slope-run">Distancia horizontal</Label>
            <div className="flex gap-2">
              <Input
                id="slope-run"
                inputMode="decimal"
                value={runInput}
                onChange={(event) => setRunInput(event.target.value)}
                aria-invalid={runError ? true : undefined}
                className="flex-1"
              />
              <div className="w-32 shrink-0">
                <UnitSelect
                  units={LENGTH_UNITS}
                  value={runUnit}
                  onValueChange={setRunUnit}
                  aria-label="Unidad de la distancia horizontal"
                />
              </div>
            </div>
            {runError ? (
              <p className="text-sm text-destructive">{runError}</p>
            ) : null}
          </div>

          {mode === "rise-run" ? (
            <div className="space-y-2">
              <Label htmlFor="slope-rise">Desnivel vertical</Label>
              <div className="flex gap-2">
                <Input
                  id="slope-rise"
                  inputMode="decimal"
                  value={riseInput}
                  onChange={(event) => setRiseInput(event.target.value)}
                  aria-invalid={riseError ? true : undefined}
                  className="flex-1"
                />
                <div className="w-32 shrink-0">
                  <UnitSelect
                    units={LENGTH_UNITS}
                    value={riseUnit}
                    onValueChange={setRiseUnit}
                    aria-label="Unidad del desnivel"
                  />
                </div>
              </div>
              {riseError ? (
                <p className="text-sm text-destructive">{riseError}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Positivo si sube; negativo si baja.
              </p>
            </div>
          ) : null}

          {mode === "slope-run" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="slope-value">
                  {slopeFormat === "ratio"
                    ? "n en la relación 1:n"
                    : slopeFormat === "angle"
                      ? "Ángulo (°)"
                      : slopeFormat === "permille"
                        ? "Pendiente (‰)"
                        : "Pendiente (%)"}
                </Label>
                <Input
                  id="slope-value"
                  inputMode="decimal"
                  value={slopeInput}
                  onChange={(event) => setSlopeInput(event.target.value)}
                  aria-invalid={slopeError ? true : undefined}
                />
                {slopeError ? (
                  <p className="text-sm text-destructive">{slopeError}</p>
                ) : null}
              </div>

              <SelectField
                id="slope-format"
                label="Formato de la pendiente"
                items={FORMAT_ITEMS}
                value={slopeFormat}
                onChange={(next) => {
                  if (isSlopeFormat(next)) {
                    setSlopeFormat(next)
                  }
                }}
              />

              {slopeFormat === "ratio" ? (
                <SelectField
                  id="slope-direction"
                  label="Sentido"
                  items={DIRECTION_ITEMS}
                  value={direction}
                  onChange={(next) => {
                    if (isSlopeDirection(next)) {
                      setDirection(next)
                    }
                  }}
                />
              ) : null}

              <p className="text-xs text-muted-foreground sm:col-span-2">
                En porcentaje, por mil o ángulo usa un valor negativo para una
                pendiente descendente.
              </p>
            </>
          ) : null}

          {mode === "elevations" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-elevation">Cota inicial</Label>
                <Input
                  id="start-elevation"
                  inputMode="decimal"
                  value={startElevationInput}
                  onChange={(event) =>
                    setStartElevationInput(event.target.value)
                  }
                  aria-invalid={startElevationError ? true : undefined}
                />
                {startElevationError ? (
                  <p className="text-sm text-destructive">
                    {startElevationError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-elevation">Cota final</Label>
                <Input
                  id="end-elevation"
                  inputMode="decimal"
                  value={endElevationInput}
                  onChange={(event) => setEndElevationInput(event.target.value)}
                  aria-invalid={endElevationError ? true : undefined}
                />
                {endElevationError ? (
                  <p className="text-sm text-destructive">
                    {endElevationError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elevation-unit">Unidad de las cotas</Label>
                <UnitSelect
                  units={LENGTH_UNITS}
                  value={elevationUnit}
                  onValueChange={setElevationUnit}
                  aria-label="Unidad de las cotas"
                />
              </div>

              <p className="text-xs text-muted-foreground sm:col-span-2">
                El desnivel se calcula como cota final − cota inicial.
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {result
              ? `${RESULT_DIRECTION_LABELS[result.direction]} — relación 1:n = 1 vertical por n horizontal.`
              : "Ingresa datos válidos para calcular la pendiente."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid items-center gap-6 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Pendiente</p>
                      <p className="text-3xl font-semibold tracking-tight tabular-nums">
                        {formatNumber(result.percent, 2)}{" "}
                        <span className="text-lg font-medium">%</span>
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {RESULT_DIRECTION_LABELS[result.direction]}
                    </Badge>
                  </div>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">Desnivel</dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {formatLength(result.riseM, runUnit)}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">
                      Longitud inclinada
                    </dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {formatLength(result.slopeLengthM, runUnit)}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">Ángulo</dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {formatNumber(result.angleDeg, 2)}°
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">
                      Relación V:H
                    </dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {result.ratio === null
                        ? "Plano"
                        : `1 : ${formatRatio(result.ratio)}`}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">Por mil</dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {formatNumber(result.permille, 2)} ‰
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">cm/m</dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {formatNumber(result.cmPerM, 2)} cm/m
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">mm/m</dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {formatNumber(result.mmPerM, 2)} mm/m
                    </dd>
                  </div>
                </dl>
              </div>

              <SlopeDiagram
                run={result.runM}
                rise={result.riseM}
                runLabel={`L = ${formatLength(result.runM, runUnit)}`}
                riseLabel={`h = ${formatLength(result.riseM, runUnit)}`}
                slopeLengthLabel={`s = ${formatLength(result.slopeLengthM, runUnit)}`}
                angleLabel={`θ = ${formatNumber(result.angleDeg, 2)}°`}
                className="mx-auto w-full max-w-xs"
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
            Relaciones geométricas utilizadas en el cálculo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Pendiente (%) = (desnivel / distancia horizontal) × 100.</p>
          <p>Ángulo = arctan(desnivel / distancia horizontal).</p>
          <p>Longitud inclinada = √(distancia horizontal² + desnivel²).</p>
          <p>Desnivel = cota final − cota inicial.</p>
          <p>1 % = 1 cm/m = 10 mm/m.</p>
          <p>
            La relación 1:n significa 1 unidad vertical por n unidades
            horizontales.
          </p>
          <p>
            No se verifican límites normativos: estos dependen del uso (drenaje,
            vías, rampas, etc.).
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {editMode ? (
          <UpdateCalculationButton
            calculationId={editMode.calculationId}
            title={editMode.title}
            projectId={editMode.projectId}
            snapshot={snapshot}
          />
        ) : (
          <SaveCalculationButton
            toolId={slopeCalculatorDefinition.info.id}
            toolName={slopeCalculatorDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
