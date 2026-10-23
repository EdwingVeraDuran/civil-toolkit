"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { AreaDiagram } from "@/components/tools/area-diagram"
import { UnitSelect } from "@/components/tools/unit-select"
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
import { areaCalculatorDefinition } from "@/lib/tools/area-calculator/definition"
import {
  AREA_SHAPES,
  AREA_SHAPE_LABELS,
  CIRCLE_MEASURES,
  type AreaShape,
  type CircleMeasure,
} from "@/lib/tools/area-calculator/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"
import { getUnit, unitsByDimension } from "@/lib/units/units"

const LENGTH_UNITS = unitsByDimension("length")
const AREA_UNITS = unitsByDimension("area")
const LENGTH_UNIT_IDS = new Set(LENGTH_UNITS.map((unit) => unit.id))
const AREA_UNIT_IDS = new Set(AREA_UNITS.map((unit) => unit.id))

const SHAPE_ITEMS = AREA_SHAPES.map((value) => ({
  value,
  label: AREA_SHAPE_LABELS[value],
}))

const CIRCLE_MEASURE_LABELS: Record<CircleMeasure, string> = {
  radius: "Radio",
  diameter: "Diámetro",
}

const CIRCLE_MEASURE_ITEMS = CIRCLE_MEASURES.map((value) => ({
  value,
  label: CIRCLE_MEASURE_LABELS[value],
}))

function isAreaShape(value: string): value is AreaShape {
  return (AREA_SHAPES as readonly string[]).includes(value)
}

function isCircleMeasure(value: string): value is CircleMeasure {
  return (CIRCLE_MEASURES as readonly string[]).includes(value)
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

function readAreaUnit(value: unknown, fallback: string): string {
  return typeof value === "string" && AREA_UNIT_IDS.has(value)
    ? value
    : fallback
}

function hydrateAreaInitialInput(initialInput?: Record<string, unknown>) {
  if (!initialInput) return null

  return {
    shape:
      typeof initialInput.shape === "string" && isAreaShape(initialInput.shape)
        ? initialInput.shape
        : "rectangle",
    lengthUnit: readLengthUnit(initialInput.lengthUnit, "m"),
    areaUnit: readAreaUnit(initialInput.areaUnit, "m2"),
    sideInput: readString(initialInput.side, "5"),
    baseInput: readString(initialInput.base, "4"),
    heightInput: readString(initialInput.height, "3"),
    circleMeasure:
      typeof initialInput.circleMeasure === "string" &&
      isCircleMeasure(initialInput.circleMeasure)
        ? initialInput.circleMeasure
        : "radius",
    circleSizeInput: readString(initialInput.circleSize, "5"),
    baseMajorInput: readString(initialInput.baseMajor, "6"),
    baseMinorInput: readString(initialInput.baseMinor, "4"),
    diagonalMajorInput: readString(initialInput.diagonalMajor, "8"),
    diagonalMinorInput: readString(initialInput.diagonalMinor, "5"),
    sidesInput: readString(initialInput.sides, "6"),
    polygonSideInput: readString(initialInput.side, "3"),
  }
}

function SelectField({
  id,
  label,
  items,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  error?: string
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
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={error ? true : undefined}
        >
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
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
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

export function AreaCalculator({ initialInput, editMode }: ToolComponentProps) {
  const hydrated = hydrateAreaInitialInput(initialInput)

  const [shape, setShape] = useState<AreaShape>(hydrated?.shape ?? "rectangle")
  const [lengthUnit, setLengthUnit] = useState(hydrated?.lengthUnit ?? "m")
  const [areaUnit, setAreaUnit] = useState(hydrated?.areaUnit ?? "m2")
  const [sideInput, setSideInput] = useState(hydrated?.sideInput ?? "5")
  const [baseInput, setBaseInput] = useState(hydrated?.baseInput ?? "4")
  const [heightInput, setHeightInput] = useState(hydrated?.heightInput ?? "3")
  const [circleMeasure, setCircleMeasure] = useState<CircleMeasure>(
    hydrated?.circleMeasure ?? "radius"
  )
  const [circleSizeInput, setCircleSizeInput] = useState(
    hydrated?.circleSizeInput ?? "5"
  )
  const [baseMajorInput, setBaseMajorInput] = useState(
    hydrated?.baseMajorInput ?? "6"
  )
  const [baseMinorInput, setBaseMinorInput] = useState(
    hydrated?.baseMinorInput ?? "4"
  )
  const [diagonalMajorInput, setDiagonalMajorInput] = useState(
    hydrated?.diagonalMajorInput ?? "8"
  )
  const [diagonalMinorInput, setDiagonalMinorInput] = useState(
    hydrated?.diagonalMinorInput ?? "5"
  )
  const [sidesInput, setSidesInput] = useState(hydrated?.sidesInput ?? "6")
  const [polygonSideInput, setPolygonSideInput] = useState(
    hydrated?.polygonSideInput ?? "3"
  )

  const rawInput =
    shape === "square"
      ? {
          shape,
          lengthUnit,
          areaUnit,
          side: sideInput,
        }
      : shape === "rectangle" ||
          shape === "triangle" ||
          shape === "parallelogram"
        ? {
            shape,
            lengthUnit,
            areaUnit,
            base: baseInput,
            height: heightInput,
          }
        : shape === "circle"
          ? {
              shape,
              lengthUnit,
              areaUnit,
              circleMeasure,
              circleSize: circleSizeInput,
            }
          : shape === "trapezoid"
            ? {
                shape,
                lengthUnit,
                areaUnit,
                baseMajor: baseMajorInput,
                baseMinor: baseMinorInput,
                height: heightInput,
              }
            : shape === "rhombus"
              ? {
                  shape,
                  lengthUnit,
                  areaUnit,
                  diagonalMajor: diagonalMajorInput,
                  diagonalMinor: diagonalMinorInput,
                }
              : {
                  shape,
                  lengthUnit,
                  areaUnit,
                  sides: sidesInput,
                  side: polygonSideInput,
                }

  const validation = areaCalculatorDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput = validation.valid
    ? areaCalculatorDefinition.schema.parse(rawInput)
    : null

  const result = parsedInput
    ? areaCalculatorDefinition.calculate(parsedInput)
    : null

  const snapshot =
    parsedInput && result
      ? areaCalculatorDefinition.toSnapshot(parsedInput, result)
      : null

  const lengthSymbol = getUnit(lengthUnit)?.symbol ?? "m"
  const areaSymbol = result
    ? (getUnit(result.areaUnitId)?.symbol ?? "m²")
    : "m²"

  const sideError = fieldError("side")
  const baseError = fieldError("base")
  const heightError = fieldError("height")
  const circleSizeError = fieldError("circleSize")
  const baseMajorError = fieldError("baseMajor")
  const baseMinorError = fieldError("baseMinor")
  const diagonalMajorError = fieldError("diagonalMajor")
  const diagonalMinorError = fieldError("diagonalMinor")
  const sidesError = fieldError("sides")
  const lengthUnitError = fieldError("lengthUnit")
  const areaUnitError = fieldError("areaUnit")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de la figura</CardTitle>
          <CardDescription>
            Elige la figura y usa la misma unidad de longitud para todas sus
            dimensiones.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SelectField
              id="area-shape"
              label="Figura"
              items={SHAPE_ITEMS}
              value={shape}
              onChange={(next) => {
                if (isAreaShape(next)) {
                  setShape(next)
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area-length-unit">Unidad de longitud</Label>
            <UnitSelect
              id="area-length-unit"
              units={LENGTH_UNITS}
              value={lengthUnit}
              onValueChange={setLengthUnit}
              aria-label="Unidad de longitud"
            />
            {lengthUnitError ? (
              <p className="text-sm text-destructive">{lengthUnitError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area-area-unit">Unidad de área</Label>
            <UnitSelect
              id="area-area-unit"
              units={AREA_UNITS}
              value={areaUnit}
              onValueChange={setAreaUnit}
              aria-label="Unidad de área"
            />
            {areaUnitError ? (
              <p className="text-sm text-destructive">{areaUnitError}</p>
            ) : null}
          </div>

          {shape === "square" ? (
            <NumberField
              id="area-side"
              label={`Lado (${lengthSymbol})`}
              value={sideInput}
              onChange={setSideInput}
              error={sideError}
            />
          ) : null}

          {shape === "rectangle" ||
          shape === "triangle" ||
          shape === "parallelogram" ? (
            <>
              <NumberField
                id="area-base"
                label={`Base (${lengthSymbol})`}
                value={baseInput}
                onChange={setBaseInput}
                error={baseError}
              />
              <NumberField
                id="area-height"
                label={`Altura (${lengthSymbol})`}
                value={heightInput}
                onChange={setHeightInput}
                error={heightError}
              />
            </>
          ) : null}

          {shape === "circle" ? (
            <>
              <SelectField
                id="area-circle-measure"
                label="Medida del círculo"
                items={CIRCLE_MEASURE_ITEMS}
                value={circleMeasure}
                onChange={(next) => {
                  if (isCircleMeasure(next)) {
                    setCircleMeasure(next)
                  }
                }}
              />
              <NumberField
                id="area-circle-size"
                label={`${CIRCLE_MEASURE_LABELS[circleMeasure]} (${lengthSymbol})`}
                value={circleSizeInput}
                onChange={setCircleSizeInput}
                error={circleSizeError}
              />
            </>
          ) : null}

          {shape === "trapezoid" ? (
            <>
              <NumberField
                id="area-base-major"
                label={`Base mayor (${lengthSymbol})`}
                value={baseMajorInput}
                onChange={setBaseMajorInput}
                error={baseMajorError}
              />
              <NumberField
                id="area-base-minor"
                label={`Base menor (${lengthSymbol})`}
                value={baseMinorInput}
                onChange={setBaseMinorInput}
                error={baseMinorError}
              />
              <NumberField
                id="area-height-trapezoid"
                label={`Altura (${lengthSymbol})`}
                value={heightInput}
                onChange={setHeightInput}
                error={heightError}
              />
            </>
          ) : null}

          {shape === "rhombus" ? (
            <>
              <NumberField
                id="area-diagonal-major"
                label={`Diagonal mayor (${lengthSymbol})`}
                value={diagonalMajorInput}
                onChange={setDiagonalMajorInput}
                error={diagonalMajorError}
              />
              <NumberField
                id="area-diagonal-minor"
                label={`Diagonal menor (${lengthSymbol})`}
                value={diagonalMinorInput}
                onChange={setDiagonalMinorInput}
                error={diagonalMinorError}
              />
            </>
          ) : null}

          {shape === "regular-polygon" ? (
            <>
              <NumberField
                id="area-sides"
                label="Número de lados"
                value={sidesInput}
                onChange={setSidesInput}
                error={sidesError}
                inputMode="numeric"
              />
              <NumberField
                id="area-polygon-side"
                label={`Longitud del lado (${lengthSymbol})`}
                value={polygonSideInput}
                onChange={setPolygonSideInput}
                error={sideError}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {result
              ? `${AREA_SHAPE_LABELS[result.shape]} — ${result.formula}`
              : "Ingresa dimensiones válidas para calcular el área."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && parsedInput ? (
            <div className="grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {formatNumber(result.area, 3)}{" "}
                    <span className="text-lg font-medium">{areaSymbol}</span>
                  </p>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">Figura</dt>
                    <dd className="text-sm font-medium">
                      {AREA_SHAPE_LABELS[result.shape]}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs text-muted-foreground">Fórmula</dt>
                    <dd className="text-sm font-medium">{result.formula}</dd>
                  </div>
                  {result.areaUnitId !== "m2" ? (
                    <div className="space-y-1">
                      <dt className="text-xs text-muted-foreground">
                        Equivalencia
                      </dt>
                      <dd className="text-sm font-medium tabular-nums">
                        {formatNumber(result.areaM2, 3)} m²
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <AreaDiagram
                input={parsedInput}
                lengthSymbol={lengthSymbol}
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
            Consideraciones del cálculo geométrico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Todas las dimensiones usan la misma unidad de longitud; el área se
            convierte a la unidad seleccionada.
          </p>
          <p>
            El triángulo se calcula con base y altura. El círculo admite radio o
            diámetro, y el polígono regular usa el número de lados y la longitud
            del lado.
          </p>
          <p>
            Las figuras del diagrama son esquemáticas y no están a escala. Para
            polígonos con más de 12 lados, el diagrama usa una aproximación.
          </p>
          <p>
            Cálculo de geometría básica; no incluye verificación de límites
            normativos.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {editMode ? (
          <UpdateCalculationButton
            calculationId={editMode.calculationId}
            title={editMode.title}
            projectId={editMode.projectId}
            toolId={areaCalculatorDefinition.info.id}
            snapshot={snapshot}
          />
        ) : (
          <SaveCalculationButton
            toolId={areaCalculatorDefinition.info.id}
            toolName={areaCalculatorDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
