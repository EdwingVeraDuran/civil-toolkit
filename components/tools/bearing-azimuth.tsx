"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { BearingCompassDiagram } from "@/components/tools/bearing-compass-diagram"
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
import {
  formatBearingDecimal,
  formatBearingDms,
  formatDecimalDegrees,
  formatDms,
} from "@/lib/tools/bearing-azimuth/calculate"
import { bearingAzimuthDefinition } from "@/lib/tools/bearing-azimuth/definition"
import { evaluateTool } from "@/lib/tools/evaluate"
import {
  ANGLE_FORMATS,
  ANGLE_FORMAT_LABELS,
  BEARING_QUADRANTS,
  BEARING_QUADRANT_DESCRIPTIONS,
  BEARING_QUADRANT_LABELS,
  ORIENTATION_MODES,
  ORIENTATION_MODE_LABELS,
  type AngleFormat,
  type BearingQuadrant,
  type OrientationMode,
} from "@/lib/tools/bearing-azimuth/schema"
import type { ToolComponentProps } from "@/lib/tools/types"

const MODE_ITEMS = ORIENTATION_MODES.map((value) => ({
  value,
  label: ORIENTATION_MODE_LABELS[value],
}))

const FORMAT_ITEMS = ANGLE_FORMATS.map((value) => ({
  value,
  label: ANGLE_FORMAT_LABELS[value],
}))

const QUADRANT_ITEMS = BEARING_QUADRANTS.map((value) => ({
  value,
  label: BEARING_QUADRANT_LABELS[value],
}))

function isOrientationMode(value: string): value is OrientationMode {
  return (ORIENTATION_MODES as readonly string[]).includes(value)
}

function isAngleFormat(value: string): value is AngleFormat {
  return (ANGLE_FORMATS as readonly string[]).includes(value)
}

function isBearingQuadrant(value: string): value is BearingQuadrant {
  return (BEARING_QUADRANTS as readonly string[]).includes(value)
}

function readString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function hydrateBearingAzimuthInitialInput(
  initialInput?: Record<string, unknown>
) {
  if (!initialInput) return null

  return {
    mode:
      typeof initialInput.mode === "string" &&
      isOrientationMode(initialInput.mode)
        ? initialInput.mode
        : "bearing-to-azimuth",
    format:
      typeof initialInput.format === "string" &&
      isAngleFormat(initialInput.format)
        ? initialInput.format
        : "decimal",
    quadrant:
      typeof initialInput.quadrant === "string" &&
      isBearingQuadrant(initialInput.quadrant)
        ? initialInput.quadrant
        : "NE",
    angleInput: readString(initialInput.angle, "30"),
    degreesInput: readString(initialInput.degrees, "30"),
    minutesInput: readString(initialInput.minutes, "0"),
    secondsInput: readString(initialInput.seconds, "0"),
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
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function ResultTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
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

export function BearingAzimuth({ initialInput, editMode }: ToolComponentProps) {
  const hydrated = hydrateBearingAzimuthInitialInput(initialInput)

  const [mode, setMode] = useState<OrientationMode>(
    hydrated?.mode ?? "bearing-to-azimuth"
  )
  const [format, setFormat] = useState<AngleFormat>(
    hydrated?.format ?? "decimal"
  )
  const [quadrant, setQuadrant] = useState<BearingQuadrant>(
    hydrated?.quadrant ?? "NE"
  )
  const [angleInput, setAngleInput] = useState(hydrated?.angleInput ?? "30")
  const [degreesInput, setDegreesInput] = useState(
    hydrated?.degreesInput ?? "30"
  )
  const [minutesInput, setMinutesInput] = useState(
    hydrated?.minutesInput ?? "0"
  )
  const [secondsInput, setSecondsInput] = useState(
    hydrated?.secondsInput ?? "0"
  )

  const rawInput =
    format === "decimal"
      ? {
          mode,
          format,
          quadrant,
          angle: angleInput,
        }
      : {
          mode,
          format,
          quadrant,
          degrees: degreesInput,
          minutes: minutesInput,
          seconds: secondsInput,
        }

  const { validation, result, snapshot } = evaluateTool(
    bearingAzimuthDefinition,
    rawInput
  )
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const isBearing = mode === "bearing-to-azimuth"

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de entrada</CardTitle>
          <CardDescription>
            Elige el tipo de conversión y el formato del ángulo de entrada. El
            resultado muestra el rumbo y el azimut en ambos formatos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="bearing-azimuth-mode"
              label="Conversión"
              items={MODE_ITEMS}
              value={mode}
              onChange={(next) => {
                if (isOrientationMode(next)) {
                  setMode(next)
                }
              }}
            />
            <SelectField
              id="bearing-azimuth-format"
              label="Formato del ángulo"
              items={FORMAT_ITEMS}
              value={format}
              onChange={(next) => {
                if (isAngleFormat(next)) {
                  setFormat(next)
                }
              }}
            />
          </div>

          {isBearing ? (
            <div className="space-y-2">
              <SelectField
                id="bearing-azimuth-quadrant"
                label="Cuadrante del rumbo"
                items={QUADRANT_ITEMS}
                value={quadrant}
                onChange={(next) => {
                  if (isBearingQuadrant(next)) {
                    setQuadrant(next)
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {BEARING_QUADRANT_DESCRIPTIONS[quadrant]}
              </p>
            </div>
          ) : null}

          {format === "decimal" ? (
            <NumberField
              id="bearing-azimuth-angle"
              label={
                isBearing
                  ? "Rumbo (grados decimales, 0°–90°)"
                  : "Azimut (grados decimales, 0°–360°)"
              }
              value={angleInput}
              onChange={setAngleInput}
              error={fieldError("angle")}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                id="bearing-azimuth-degrees"
                label="Grados (°)"
                value={degreesInput}
                onChange={setDegreesInput}
                error={fieldError("degrees")}
              />
              <NumberField
                id="bearing-azimuth-minutes"
                label="Minutos (′)"
                value={minutesInput}
                onChange={setMinutesInput}
                error={fieldError("minutes")}
              />
              <NumberField
                id="bearing-azimuth-seconds"
                label="Segundos (″)"
                value={secondsInput}
                onChange={setSecondsInput}
                error={fieldError("seconds")}
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {isBearing
              ? "El rumbo se mide desde el norte o el sur hacia el este u oeste y debe estar entre 0° y 90°. El azimut se mide desde el norte en sentido horario."
              : "El azimut se mide desde el norte en sentido horario y debe estar entre 0° y 360°. El rumbo equivalente se mide desde el norte o el sur hacia el este u oeste."}
            {format === "dms"
              ? " Los grados y minutos son enteros; los segundos admiten decimales."
              : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {result
              ? "Orientación de la línea en las cuatro representaciones."
              : "Ingresa valores válidos para convertir la orientación."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultTile
                  label="Azimut decimal"
                  value={formatDecimalDegrees(result.azimuthDeg, 6)}
                  hint="Desde el norte, sentido horario"
                />
                <ResultTile
                  label="Azimut sexagesimal"
                  value={formatDms(result.azimuthDms)}
                />
                <ResultTile
                  label="Rumbo decimal"
                  value={formatBearingDecimal(
                    result.bearingQuadrant,
                    result.bearingAngleDeg,
                    6
                  )}
                />
                <ResultTile
                  label="Rumbo sexagesimal"
                  value={formatBearingDms(
                    result.bearingQuadrant,
                    result.bearingDms
                  )}
                />
              </div>

              <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="space-y-4">
                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Detail
                      label="Cuadrante"
                      value={BEARING_QUADRANT_LABELS[result.bearingQuadrant]}
                    />
                    <Detail
                      label="Ángulo del rumbo"
                      value={formatDecimalDegrees(result.bearingAngleDeg, 4)}
                    />
                    <Detail
                      label="Azimut normalizado"
                      value={formatDecimalDegrees(result.azimuthDeg, 4)}
                    />
                  </dl>

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      Fórmula aplicada
                    </p>
                    <p className="mt-1 text-sm font-medium">{result.formula}</p>
                  </div>
                </div>

                <BearingCompassDiagram
                  azimuthDeg={result.azimuthDeg}
                  className="mx-auto w-full max-w-xs"
                />
              </div>
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
            Convenciones para interpretar rumbos y azimuts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            El azimut se mide desde el norte en sentido horario, de 0° a 360°.
            El rumbo se mide desde el norte o el sur hacia el este u oeste y
            siempre está entre 0° y 90°.
          </p>
          <p>
            Las líneas cardinales admiten más de un rumbo equivalente. Por
            ejemplo, el este puede expresarse como N 90° E o S 90° E. En los
            límites se muestra una representación canónica.
          </p>
          <p>
            La salida sexagesimal redondea los segundos a dos decimales. El
            diagrama es esquemático y no está a escala.
          </p>
          <p>
            La herramienta no corrige declinación magnética ni transforma entre
            norte magnético y norte geográfico.
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
            toolId={bearingAzimuthDefinition.info.id}
            toolName={bearingAzimuthDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
