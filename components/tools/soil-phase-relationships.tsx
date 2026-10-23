"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { SoilPhaseDiagram } from "@/components/tools/soil-phase-diagram"
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
import { parseNumericInput } from "@/lib/tools/parse-numeric"
import { soilPhaseRelationshipsDefinition } from "@/lib/tools/soil-phase-relationships/definition"
import {
  DEFAULT_FORCE_UNIT,
  DEFAULT_UNIT_WEIGHT_UNIT,
  DEFAULT_VOLUME_UNIT,
  SOIL_PHASE_MODES,
  SOIL_PHASE_MODE_DESCRIPTIONS,
  SOIL_PHASE_MODE_LABELS,
  type SoilPhaseMode,
} from "@/lib/tools/soil-phase-relationships/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"
import { Measurement } from "@/lib/units/measurement"
import { getUnit, unitsByDimension } from "@/lib/units/units"

const UNIT_WEIGHT_UNITS = unitsByDimension("unitWeight")
const VOLUME_UNITS = unitsByDimension("volume")
const FORCE_UNITS = unitsByDimension("force")

const MODE_ITEMS = SOIL_PHASE_MODES.map((value) => ({
  value,
  label: SOIL_PHASE_MODE_LABELS[value],
}))

function isSoilPhaseMode(value: string): value is SoilPhaseMode {
  return (SOIL_PHASE_MODES as readonly string[]).includes(value)
}

function readString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function readMode(value: unknown): SoilPhaseMode {
  return typeof value === "string" && isSoilPhaseMode(value) ? value : "e-w"
}

function readUnit(value: unknown, dimension: string, fallback: string): string {
  if (typeof value !== "string") return fallback
  return getUnit(value)?.dimension === dimension ? value : fallback
}

function readUnitWeightString(
  value: unknown,
  fallbackKNM3: string,
  unitId: string
): string {
  if (value === undefined || value === null) {
    return convertUnitWeightInput(fallbackKNM3, "knm3", unitId)
  }
  return readString(value, fallbackKNM3)
}

function hydrateSoilPhaseInitialInput(initialInput?: Record<string, unknown>) {
  if (!initialInput) return null

  const unitWeightUnit = readUnit(
    initialInput.unitWeightUnit,
    "unitWeight",
    DEFAULT_UNIT_WEIGHT_UNIT
  )

  return {
    mode: readMode(initialInput.mode),
    unitWeightUnit,
    volumeUnit: readUnit(
      initialInput.volumeUnit,
      "volume",
      DEFAULT_VOLUME_UNIT
    ),
    forceUnit: readUnit(initialInput.forceUnit, "force", DEFAULT_FORCE_UNIT),
    specificGravityInput: readString(initialInput.specificGravity, "2.65"),
    waterUnitWeightInput: readUnitWeightString(
      initialInput.waterUnitWeight,
      "9.81",
      unitWeightUnit
    ),
    voidRatioInput: readString(initialInput.voidRatio, "0.65"),
    waterContentInput: readString(initialInput.waterContent, "15"),
    porosityInput: readString(initialInput.porosity, "39.39"),
    saturationInput: readString(initialInput.saturation, "61.15"),
    unitWeightInput: readUnitWeightString(
      initialInput.unitWeight,
      "18.12",
      unitWeightUnit
    ),
    saturatedUnitWeightInput: readUnitWeightString(
      initialInput.saturatedUnitWeight,
      "19.62",
      unitWeightUnit
    ),
  }
}

function convertUnitWeightInput(
  value: string,
  fromUnitId: string,
  toUnitId: string
): string {
  const parsed = parseNumericInput(value)
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return value

  const fromUnit = getUnit(fromUnitId)
  const toUnit = getUnit(toUnitId)

  if (
    !fromUnit ||
    !toUnit ||
    fromUnit.dimension !== "unitWeight" ||
    toUnit.dimension !== "unitWeight"
  ) {
    return value
  }

  const converted = Measurement.from(parsed, fromUnit).to(toUnit).value
  return String(Number(converted.toPrecision(12)))
}

function displayUnitWeight(value: number, unitId: string): number {
  const unit = getUnit(unitId)
  if (!unit || unit.dimension !== "unitWeight") return value
  return Measurement.from(value, "knm3").to(unit).value
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

function UnitField({
  id,
  label,
  units,
  value,
  onValueChange,
}: {
  id: string
  label: string
  units: ReturnType<typeof unitsByDimension>
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <UnitSelect
        id={id}
        units={units}
        value={value}
        onValueChange={onValueChange}
      />
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
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          {hint}
        </p>
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

function FormulaBlock({ formula }: { formula: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">Fórmula aplicada</p>
      <p className="mt-1 text-sm font-medium">{formula}</p>
    </div>
  )
}

export function SoilPhaseRelationships({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateSoilPhaseInitialInput(initialInput)

  const [mode, setMode] = useState<SoilPhaseMode>(hydrated?.mode ?? "e-w")
  const [unitWeightUnitId, setUnitWeightUnitId] = useState(
    hydrated?.unitWeightUnit ?? DEFAULT_UNIT_WEIGHT_UNIT
  )
  const [volumeUnitId, setVolumeUnitId] = useState(
    hydrated?.volumeUnit ?? DEFAULT_VOLUME_UNIT
  )
  const [forceUnitId, setForceUnitId] = useState(
    hydrated?.forceUnit ?? DEFAULT_FORCE_UNIT
  )

  const [specificGravityInput, setSpecificGravityInput] = useState(
    hydrated?.specificGravityInput ?? "2.65"
  )
  const [waterUnitWeightInput, setWaterUnitWeightInput] = useState(
    hydrated?.waterUnitWeightInput ?? "9.81"
  )
  const [voidRatioInput, setVoidRatioInput] = useState(
    hydrated?.voidRatioInput ?? "0.65"
  )
  const [waterContentInput, setWaterContentInput] = useState(
    hydrated?.waterContentInput ?? "15"
  )
  const [porosityInput, setPorosityInput] = useState(
    hydrated?.porosityInput ?? "39.39"
  )
  const [saturationInput, setSaturationInput] = useState(
    hydrated?.saturationInput ?? "61.15"
  )
  const [unitWeightInput, setUnitWeightInput] = useState(
    hydrated?.unitWeightInput ?? "18.12"
  )
  const [saturatedUnitWeightInput, setSaturatedUnitWeightInput] = useState(
    hydrated?.saturatedUnitWeightInput ?? "19.62"
  )

  const rawInput = (() => {
    const common = {
      unitWeightUnit: unitWeightUnitId,
      volumeUnit: volumeUnitId,
      forceUnit: forceUnitId,
      specificGravity: specificGravityInput,
      waterUnitWeight: waterUnitWeightInput,
    }

    switch (mode) {
      case "e-w":
        return {
          ...common,
          mode,
          voidRatio: voidRatioInput,
          waterContent: waterContentInput,
        }
      case "n-w":
        return {
          ...common,
          mode,
          porosity: porosityInput,
          waterContent: waterContentInput,
        }
      case "w-s":
        return {
          ...common,
          mode,
          waterContent: waterContentInput,
          saturation: saturationInput,
        }
      case "gamma-w":
        return {
          ...common,
          mode,
          unitWeight: unitWeightInput,
          waterContent: waterContentInput,
        }
      case "gamma-sat":
        return {
          ...common,
          mode,
          saturatedUnitWeight: saturatedUnitWeightInput,
        }
    }
  })()

  const validation = soilPhaseRelationshipsDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput = validation.valid
    ? soilPhaseRelationshipsDefinition.schema.parse(rawInput)
    : null

  const result = parsedInput
    ? soilPhaseRelationshipsDefinition.calculate(parsedInput)
    : null

  const snapshot =
    parsedInput && result
      ? soilPhaseRelationshipsDefinition.toSnapshot(parsedInput, result)
      : null

  const unitWeightSymbol = getUnit(unitWeightUnitId)?.symbol ?? "kN/m³"
  const displayedUnitWeight =
    result && parsedInput
      ? displayUnitWeight(result.unitWeight, parsedInput.unitWeightUnit)
      : 0
  const displayedDryUnitWeight =
    result && parsedInput
      ? displayUnitWeight(result.dryUnitWeight, parsedInput.unitWeightUnit)
      : 0
  const displayedSaturatedUnitWeight =
    result && parsedInput
      ? displayUnitWeight(
          result.saturatedUnitWeight,
          parsedInput.unitWeightUnit
        )
      : 0
  const displayedSubmergedUnitWeight =
    result && parsedInput
      ? displayUnitWeight(
          result.submergedUnitWeight,
          parsedInput.unitWeightUnit
        )
      : 0

  const handleUnitWeightUnitChange = (next: string) => {
    if (next === unitWeightUnitId) return
    const nextUnit = getUnit(next)
    if (!nextUnit || nextUnit.dimension !== "unitWeight") return

    setWaterUnitWeightInput((current) =>
      convertUnitWeightInput(current, unitWeightUnitId, next)
    )
    setUnitWeightInput((current) =>
      convertUnitWeightInput(current, unitWeightUnitId, next)
    )
    setSaturatedUnitWeightInput((current) =>
      convertUnitWeightInput(current, unitWeightUnitId, next)
    )
    setUnitWeightUnitId(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de entrada</CardTitle>
          <CardDescription>
            Elige los datos conocidos. La herramienta calcula las relaciones de
            fase restantes a partir de Gs y γw.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SelectField
            id="soil-phase-mode"
            label="Datos conocidos"
            items={MODE_ITEMS}
            value={mode}
            onChange={(next) => {
              if (isSoilPhaseMode(next)) {
                setMode(next)
              }
            }}
          />

          <p className="text-xs text-muted-foreground">
            {SOIL_PHASE_MODE_DESCRIPTIONS[mode]}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="soil-phase-specific-gravity"
              label="Gravedad específica de sólidos, Gs"
              value={specificGravityInput}
              onChange={setSpecificGravityInput}
              error={fieldError("specificGravity")}
            />
            <NumberField
              id="soil-phase-water-unit-weight"
              label={`Peso unitario del agua, γw (${unitWeightSymbol})`}
              value={waterUnitWeightInput}
              onChange={setWaterUnitWeightInput}
              error={fieldError("waterUnitWeight")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <UnitField
              id="soil-phase-unit-weight-unit"
              label="Unidad de peso unitario"
              units={UNIT_WEIGHT_UNITS}
              value={unitWeightUnitId}
              onValueChange={handleUnitWeightUnitChange}
            />
            <UnitField
              id="soil-phase-volume-unit"
              label="Unidad de volumen del diagrama"
              units={VOLUME_UNITS}
              value={volumeUnitId}
              onValueChange={setVolumeUnitId}
            />
            <UnitField
              id="soil-phase-force-unit"
              label="Unidad de fuerza del diagrama"
              units={FORCE_UNITS}
              value={forceUnitId}
              onValueChange={setForceUnitId}
            />
          </div>

          {mode === "e-w" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="soil-phase-void-ratio"
                label="Relación de vacíos, e"
                value={voidRatioInput}
                onChange={setVoidRatioInput}
                error={fieldError("voidRatio")}
              />
              <NumberField
                id="soil-phase-water-content"
                label="Contenido de agua, w (%)"
                value={waterContentInput}
                onChange={setWaterContentInput}
                error={fieldError("waterContent")}
              />
            </div>
          ) : null}

          {mode === "n-w" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="soil-phase-porosity"
                label="Porosidad, n (%)"
                value={porosityInput}
                onChange={setPorosityInput}
                error={fieldError("porosity")}
              />
              <NumberField
                id="soil-phase-water-content"
                label="Contenido de agua, w (%)"
                value={waterContentInput}
                onChange={setWaterContentInput}
                error={fieldError("waterContent")}
              />
            </div>
          ) : null}

          {mode === "w-s" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="soil-phase-water-content"
                label="Contenido de agua, w (%)"
                value={waterContentInput}
                onChange={setWaterContentInput}
                error={fieldError("waterContent")}
              />
              <NumberField
                id="soil-phase-saturation"
                label="Grado de saturación, S (%)"
                value={saturationInput}
                onChange={setSaturationInput}
                error={fieldError("saturation")}
              />
            </div>
          ) : null}

          {mode === "gamma-w" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="soil-phase-unit-weight"
                label={`Peso unitario natural, γ (${unitWeightSymbol})`}
                value={unitWeightInput}
                onChange={setUnitWeightInput}
                error={fieldError("unitWeight")}
              />
              <NumberField
                id="soil-phase-water-content"
                label="Contenido de agua, w (%)"
                value={waterContentInput}
                onChange={setWaterContentInput}
                error={fieldError("waterContent")}
              />
            </div>
          ) : null}

          {mode === "gamma-sat" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="soil-phase-saturated-unit-weight"
                label={`Peso unitario saturado, γsat (${unitWeightSymbol})`}
                value={saturatedUnitWeightInput}
                onChange={setSaturatedUnitWeightInput}
                error={fieldError("saturatedUnitWeight")}
              />
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            e es adimensional. n, S y w se ingresan en porcentaje. Al cambiar la
            unidad de peso unitario se convierten automáticamente γw, γ y γsat.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {result
              ? `${SOIL_PHASE_MODE_LABELS[result.mode]} — relaciones volumétricas y gravimétricas.`
              : "Ingresa valores válidos para calcular las relaciones de fase."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && parsedInput ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ResultTile
                  label="Relación de vacíos, e"
                  value={formatNumber(result.voidRatio, 3)}
                />
                <ResultTile
                  label="Porosidad, n"
                  value={`${formatNumber(result.porosity * 100, 2)} %`}
                  hint={`n = ${formatNumber(result.porosity, 3)}`}
                />
                <ResultTile
                  label="Grado de saturación, S"
                  value={`${formatNumber(result.saturation * 100, 2)} %`}
                />
                <ResultTile
                  label="Peso unitario natural, γ"
                  value={`${formatNumber(displayedUnitWeight, 3)} ${unitWeightSymbol}`}
                />
                <ResultTile
                  label="Contenido de agua, w"
                  value={`${formatNumber(result.waterContent * 100, 2)} %`}
                />
              </div>

              <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Detail
                      label="Peso unitario seco, γd"
                      value={`${formatNumber(displayedDryUnitWeight, 3)} ${unitWeightSymbol}`}
                    />
                    <Detail
                      label="Peso unitario saturado, γsat"
                      value={`${formatNumber(displayedSaturatedUnitWeight, 3)} ${unitWeightSymbol}`}
                    />
                    <Detail
                      label="Peso unitario sumergido, γ'"
                      value={`${formatNumber(displayedSubmergedUnitWeight, 3)} ${unitWeightSymbol}`}
                    />
                  </dl>

                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Detail
                      label="Gravedad específica, Gs"
                      value={formatNumber(result.specificGravity, 3)}
                    />
                    <Detail
                      label="Peso unitario del agua, γw"
                      value={`${formatNumber(
                        displayUnitWeight(
                          result.waterUnitWeight,
                          parsedInput.unitWeightUnit
                        ),
                        3
                      )} ${unitWeightSymbol}`}
                    />
                    <Detail
                      label="Modo de cálculo"
                      value={SOIL_PHASE_MODE_LABELS[result.mode]}
                    />
                  </dl>

                  <FormulaBlock formula={result.formula} />
                </div>

                <SoilPhaseDiagram
                  result={result}
                  volumeUnitId={parsedInput.volumeUnit}
                  forceUnitId={parsedInput.forceUnit}
                  className="mx-auto w-full max-w-sm"
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
            Convenciones y alcance del cálculo de relaciones de fase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            e es la relación de vacíos; n, S y w se expresan en porcentaje. Las
            fórmulas usan w y S como decimales.
          </p>
          <p>
            γ es el peso unitario natural total. γd, γsat y γ′ son resultados
            complementarios; γ′ = γsat − γw.
          </p>
          <p>
            El peso del aire se toma como cero. El diagrama de fases se
            normaliza para Vs = 1 m³ de sólidos y es esquemático, no a escala.
          </p>
          <p>
            El valor típico de Gs está entre 2,6 y 2,8. El peso unitario del
            agua se toma como 9,81 kN/m³ salvo que se ajuste.
          </p>
          <p>
            Los resultados son orientativos. Verifica los datos con ensayos de
            laboratorio y la normativa aplicable antes de usarlos en diseño.
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
            toolId={soilPhaseRelationshipsDefinition.info.id}
            toolName={soilPhaseRelationshipsDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
