"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { PipeLossDiagram } from "@/components/tools/pipe-loss-diagram"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DEFAULT_WATER_VISCOSITY,
  PIPE_ACCESSORY_LABELS,
  PIPE_ACCESSORY_PRESETS,
  PIPE_FLOW_REGIME_LABELS,
  PIPE_METHOD_DESCRIPTIONS,
  PIPE_METHOD_LABELS,
  PIPE_METHODS,
  accessoryPresetK,
  type PipeAccessoryType,
  type PipeFlowRegime,
  type PipeMethod,
} from "@/lib/aguas/tuberias"
import type { PipeHydraulicsResult } from "@/lib/tools/pipe-hydraulics/calculate"
import { pipeHydraulicsDefinition } from "@/lib/tools/pipe-hydraulics/definition"
import { evaluateTool } from "@/lib/tools/evaluate"
import {
  DEFAULT_PIPE_METHOD,
  DEFAULT_PIPE_MODE,
  PIPE_MODE_DESCRIPTIONS,
  PIPE_MODE_LABELS,
  PIPE_MODES,
  type PipeHydraulicsInput,
  type PipeMode,
} from "@/lib/tools/pipe-hydraulics/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"

const MODE_ITEMS = PIPE_MODES.map((value) => ({
  value,
  label: PIPE_MODE_LABELS[value],
}))

const METHOD_ITEMS = PIPE_METHODS.map((value) => ({
  value,
  label: PIPE_METHOD_LABELS[value],
}))

const ACCESSORY_ITEMS = PIPE_ACCESSORY_PRESETS.map((preset) => ({
  value: preset.type,
  label: preset.label,
}))

const DEFAULT_LENGTH_INPUT = "100"
const DEFAULT_DIAMETER_INPUT = "150"
const DEFAULT_DISCHARGE_INPUT = "0,015"
const DEFAULT_HEAD_LOSS_INPUT = "0,5"
const DEFAULT_HAZEN_C_INPUT = "140"
const DEFAULT_ROUGHNESS_INPUT = "0,045"
const DEFAULT_VISCOSITY_INPUT = String(DEFAULT_WATER_VISCOSITY).replace(
  ".",
  ","
)

type AccessoryRow = {
  id: string
  type: PipeAccessoryType
  quantityInput: string
  kInput: string
}

type FormState = {
  method: PipeMethod
  mode: PipeMode
  lengthInput: string
  diameterInput: string
  dischargeInput: string
  headLossInput: string
  hazenCInput: string
  roughnessInput: string
  viscosityInput: string
  accessories: AccessoryRow[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isPipeMethod(value: unknown): value is PipeMethod {
  return (
    typeof value === "string" &&
    (PIPE_METHODS as readonly string[]).includes(value)
  )
}

function isPipeMode(value: unknown): value is PipeMode {
  return (
    typeof value === "string" &&
    (PIPE_MODES as readonly string[]).includes(value)
  )
}

function isPipeAccessoryType(value: unknown): value is PipeAccessoryType {
  return (
    typeof value === "string" &&
    (PIPE_ACCESSORY_PRESETS as readonly { type: string }[]).some(
      (preset) => preset.type === value
    )
  )
}

function numberToInput(value: number): string {
  return String(value).replace(".", ",")
}

function readNumberString(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return numberToInput(value)
  }
  if (typeof value === "string") {
    return value.trim() === "" ? fallback : value
  }
  return fallback
}

function createAccessoryRow(
  id: string,
  type: PipeAccessoryType,
  quantityInput = "1",
  kInput?: string
): AccessoryRow {
  return {
    id,
    type,
    quantityInput,
    kInput: kInput ?? numberToInput(accessoryPresetK(type)),
  }
}

function createDefaultAccessoryRows(): AccessoryRow[] {
  return [
    createAccessoryRow("accessory-1", "sharp-entrance"),
    createAccessoryRow("accessory-2", "elbow-90-short", "2"),
    createAccessoryRow("accessory-3", "gate-valve-open"),
    createAccessoryRow("accessory-4", "exit"),
  ]
}

function hydrateAccessoryRows(
  initialInput: Record<string, unknown>
): AccessoryRow[] | null {
  if (!Array.isArray(initialInput.accessories)) return null

  const rows: AccessoryRow[] = []

  initialInput.accessories.forEach((value, index) => {
    if (!isRecord(value) || !isPipeAccessoryType(value.type)) return

    rows.push({
      id: `accessory-${index + 1}`,
      type: value.type,
      quantityInput: readNumberString(value.quantity, "1"),
      kInput: readNumberString(
        value.k,
        numberToInput(accessoryPresetK(value.type))
      ),
    })
  })

  return rows
}

function hydrateFormState(
  initialInput?: Record<string, unknown>
): FormState | null {
  if (!initialInput) return null

  return {
    method: isPipeMethod(initialInput.method)
      ? initialInput.method
      : DEFAULT_PIPE_METHOD,
    mode: isPipeMode(initialInput.mode) ? initialInput.mode : DEFAULT_PIPE_MODE,
    lengthInput: readNumberString(initialInput.length, DEFAULT_LENGTH_INPUT),
    diameterInput: readNumberString(
      initialInput.diameter,
      DEFAULT_DIAMETER_INPUT
    ),
    dischargeInput: readNumberString(
      initialInput.discharge,
      DEFAULT_DISCHARGE_INPUT
    ),
    headLossInput: readNumberString(
      initialInput.headLoss,
      DEFAULT_HEAD_LOSS_INPUT
    ),
    hazenCInput: readNumberString(initialInput.hazenC, DEFAULT_HAZEN_C_INPUT),
    roughnessInput: readNumberString(
      initialInput.roughness,
      DEFAULT_ROUGHNESS_INPUT
    ),
    viscosityInput: readNumberString(
      initialInput.viscosity,
      DEFAULT_VISCOSITY_INPUT
    ),
    accessories:
      hydrateAccessoryRows(initialInput) ?? createDefaultAccessoryRows(),
  }
}

function parsePreviewNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".")
  if (normalized === "") return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
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
          if (next) onChange(next)
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
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function AccessoryRowFields({
  row,
  index,
  fieldError,
  onChange,
  onRemove,
}: {
  row: AccessoryRow
  index: number
  fieldError: (field: string) => string | undefined
  onChange: (next: AccessoryRow) => void
  onRemove: () => void
}) {
  const idPrefix = `pipe-${row.id}`
  const quantityError = fieldError(`accessories.${index}.quantity`)
  const kError = fieldError(`accessories.${index}.k`)

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] sm:items-start">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-type`} className="text-xs">
          Accesorio
        </Label>
        <Select
          items={ACCESSORY_ITEMS}
          value={row.type}
          onValueChange={(next) => {
            if (!isPipeAccessoryType(next)) return
            onChange({
              ...row,
              type: next,
              kInput: numberToInput(accessoryPresetK(next)),
            })
          }}
        >
          <SelectTrigger id={`${idPrefix}-type`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCESSORY_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-quantity`} className="text-xs">
          Cantidad
        </Label>
        <Input
          id={`${idPrefix}-quantity`}
          inputMode="numeric"
          autoComplete="off"
          value={row.quantityInput}
          onChange={(event) =>
            onChange({ ...row, quantityInput: event.target.value })
          }
          aria-invalid={quantityError ? true : undefined}
        />
        {quantityError ? (
          <p className="text-sm text-destructive">{quantityError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-k`} className="text-xs">
          K
        </Label>
        <Input
          id={`${idPrefix}-k`}
          inputMode="decimal"
          autoComplete="off"
          value={row.kInput}
          onChange={(event) => onChange({ ...row, kInput: event.target.value })}
          aria-invalid={kError ? true : undefined}
        />
        {kError ? <p className="text-sm text-destructive">{kError}</p> : null}
      </div>

      <div className="flex justify-end sm:pt-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Eliminar ${PIPE_ACCESSORY_LABELS[row.type]}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
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

function regimeBadgeClass(regime: PipeFlowRegime | null): string {
  switch (regime) {
    case "laminar":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "transitional":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "turbulent":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    default:
      return ""
  }
}

function WarningsBox({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <p className="text-sm font-medium">Advertencias y observaciones</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {warnings.map((warning, index) => (
          <li key={`${warning}-${index}`}>{warning}</li>
        ))}
      </ul>
    </div>
  )
}

function formatNullable(
  value: number | null,
  decimals: number,
  unit: string
): string {
  return value !== null ? `${formatNumber(value, decimals)} ${unit}` : "—"
}

function ResultContent({
  result,
  parsedInput,
}: {
  result: PipeHydraulicsResult
  parsedInput: PipeHydraulicsInput
}) {
  if (
    result.diameterMm === null ||
    result.discharge === null ||
    result.headLoss === null
  ) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium">Sin solución numérica</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.mode === "diameter"
              ? "No se encontró un diámetro interno que produzca la pérdida total indicada."
              : result.mode === "flow"
                ? "No se encontró un caudal que produzca la pérdida total indicada."
                : "No se pudo evaluar la pérdida de carga con los datos indicados."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground tabular-nums">
            D = {formatNullable(result.diameterMm, 1, "mm")}; Q ={" "}
            {formatNullable(result.discharge, 3, "m³/s")}; H ={" "}
            {formatNullable(result.headLoss, 3, "m")}
          </p>
        </div>
        <WarningsBox warnings={result.warnings} />
      </div>
    )
  }

  const diameterMm = result.diameterMm
  const discharge = result.discharge
  const headLoss = result.headLoss
  const frictionLoss = result.frictionLoss ?? 0
  const localLoss = result.localLoss ?? 0
  const velocity = result.velocity ?? 0
  const localFraction = headLoss > 0 ? (localLoss / headLoss) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{PIPE_METHOD_LABELS[result.method]}</Badge>
        {result.flowRegime ? (
          <Badge
            variant="outline"
            className={regimeBadgeClass(result.flowRegime)}
          >
            {PIPE_FLOW_REGIME_LABELS[result.flowRegime]}
          </Badge>
        ) : null}
        {!result.converged ? (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          >
            Aproximado
          </Badge>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {PIPE_MODE_LABELS[result.mode]}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultTile
          label="Diámetro interno, D"
          value={`${formatNumber(diameterMm, 1)} mm`}
          hint={`${formatNumber(diameterMm / 1000, 4)} m`}
        />
        <ResultTile
          label="Caudal, Q"
          value={`${formatNumber(discharge, 4)} m³/s`}
          hint={`${formatNumber(discharge * 1000, 2)} L/s`}
        />
        <ResultTile
          label="Velocidad media, V"
          value={`${formatNumber(velocity, 3)} m/s`}
        />
        <ResultTile
          label="Pérdida total, H"
          value={`${formatNumber(headLoss, 3)} m`}
          hint={result.mode === "loss" ? "Calculada" : "Pérdida total objetivo"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultTile
          label="Pérdida por fricción, h_f"
          value={`${formatNumber(frictionLoss, 3)} m`}
        />
        <ResultTile
          label="Pérdida local, h_m"
          value={`${formatNumber(localLoss, 3)} m`}
          hint={`${formatNumber(localFraction, 1)} % del total`}
        />
        <ResultTile
          label="Coeficiente total, ΣK"
          value={formatNumber(result.totalK, 2)}
        />
        <ResultTile
          label="Gradiente total, H/L"
          value={`${formatNumber(result.hydraulicGradient ?? 0, 5)} m/m`}
        />
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Longitud, L"
              value={`${formatNumber(parsedInput.length, 2)} m`}
            />
            <Detail
              label="Accesorios"
              value={`${parsedInput.accessories.length} tipo(s)`}
            />
            <Detail
              label="Iteraciones del solver"
              value={
                result.mode === "loss"
                  ? "Cálculo directo"
                  : `${formatNumber(result.iterations, 0)}`
              }
            />
            <Detail
              label="Convergencia del solver"
              value={result.converged ? "Sí" : "No"}
            />
            {result.method === "hazen-williams" ? (
              <Detail
                label="Coeficiente C"
                value={formatNumber(result.hazenC ?? 0, 1)}
              />
            ) : (
              <>
                <Detail
                  label="Rugosidad absoluta, ε"
                  value={`${formatNumber(result.roughnessMm ?? 0, 4)} mm`}
                />
                <Detail
                  label="Rugosidad relativa, ε/D"
                  value={formatNumber(result.relativeRoughness ?? 0, 6)}
                />
                <Detail
                  label="Viscosidad cinemática, ν"
                  value={`${formatNumber(result.viscosity ?? 0, 9)} m²/s`}
                />
                <Detail
                  label="Número de Reynolds, Re"
                  value={formatNumber(result.reynolds ?? 0, 0)}
                />
                <Detail
                  label="Factor de fricción, f"
                  value={formatNumber(result.frictionFactor ?? 0, 5)}
                />
                <Detail
                  label="Régimen de flujo"
                  value={
                    result.flowRegime
                      ? PIPE_FLOW_REGIME_LABELS[result.flowRegime]
                      : "—"
                  }
                />
                <Detail
                  label="Convergencia de f"
                  value={result.frictionConverged ? "Sí" : "No"}
                />
              </>
            )}
          </dl>

          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Fórmula aplicada</p>
            <p className="mt-1 text-sm font-medium">{result.formula}</p>
          </div>
        </div>

        <PipeLossDiagram
          length={parsedInput.length}
          diameterMm={diameterMm}
          frictionLoss={frictionLoss}
          localLoss={localLoss}
          totalLoss={headLoss}
          totalK={result.totalK}
          className="mx-auto w-full max-w-md"
        />
      </div>

      <WarningsBox warnings={result.warnings} />
    </div>
  )
}

export function PipeHydraulics({ initialInput, editMode }: ToolComponentProps) {
  const hydrated = hydrateFormState(initialInput)

  const [method, setMethod] = useState<PipeMethod>(
    () => hydrated?.method ?? DEFAULT_PIPE_METHOD
  )
  const [mode, setMode] = useState<PipeMode>(
    () => hydrated?.mode ?? DEFAULT_PIPE_MODE
  )
  const [lengthInput, setLengthInput] = useState(
    () => hydrated?.lengthInput ?? DEFAULT_LENGTH_INPUT
  )
  const [diameterInput, setDiameterInput] = useState(
    () => hydrated?.diameterInput ?? DEFAULT_DIAMETER_INPUT
  )
  const [dischargeInput, setDischargeInput] = useState(
    () => hydrated?.dischargeInput ?? DEFAULT_DISCHARGE_INPUT
  )
  const [headLossInput, setHeadLossInput] = useState(
    () => hydrated?.headLossInput ?? DEFAULT_HEAD_LOSS_INPUT
  )
  const [hazenCInput, setHazenCInput] = useState(
    () => hydrated?.hazenCInput ?? DEFAULT_HAZEN_C_INPUT
  )
  const [roughnessInput, setRoughnessInput] = useState(
    () => hydrated?.roughnessInput ?? DEFAULT_ROUGHNESS_INPUT
  )
  const [viscosityInput, setViscosityInput] = useState(
    () => hydrated?.viscosityInput ?? DEFAULT_VISCOSITY_INPUT
  )
  const [accessories, setAccessories] = useState<AccessoryRow[]>(
    () => hydrated?.accessories ?? createDefaultAccessoryRows()
  )
  const [nextAccessoryId, setNextAccessoryId] = useState(
    () => (hydrated?.accessories.length ?? 4) + 1
  )

  const rawAccessories = accessories.map((row) => ({
    type: row.type,
    quantity: row.quantityInput,
    k: row.kInput,
  }))

  const methodFields =
    method === "hazen-williams"
      ? { hazenC: hazenCInput }
      : { roughness: roughnessInput, viscosity: viscosityInput }

  const common = {
    method,
    length: lengthInput,
    accessories: rawAccessories,
    ...methodFields,
  }

  const rawInput =
    mode === "diameter"
      ? {
          ...common,
          mode,
          discharge: dischargeInput,
          headLoss: headLossInput,
        }
      : mode === "flow"
        ? {
            ...common,
            mode,
            diameter: diameterInput,
            headLoss: headLossInput,
          }
        : {
            ...common,
            mode,
            diameter: diameterInput,
            discharge: dischargeInput,
          }

  const {
    validation,
    parsedInput,
    result,
    snapshot: evaluatedSnapshot,
    calculationError,
  } = evaluateTool(pipeHydraulicsDefinition, rawInput, {
    calculationErrorMessage:
      "No se pudo calcular la tubería con los datos suministrados.",
  })
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const hasSolution =
    result !== null &&
    result.diameterMm !== null &&
    result.discharge !== null &&
    result.headLoss !== null

  const snapshot = result && hasSolution ? evaluatedSnapshot : null

  const previewTotalK = accessories.reduce((total, row) => {
    const quantity = parsePreviewNumber(row.quantityInput)
    const k = parsePreviewNumber(row.kInput)
    return total + (quantity ?? 0) * (k ?? 0)
  }, 0)

  const accessoriesError = fieldError("accessories")

  const handleAddAccessory = () => {
    if (accessories.length >= 50) return
    const id = `accessory-${nextAccessoryId}`
    setNextAccessoryId((current) => current + 1)
    setAccessories((current) => [
      ...current,
      createAccessoryRow(id, "elbow-90-short"),
    ])
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de la tubería</CardTitle>
          <CardDescription>
            Trabaja en unidades SI: diámetro en mm, caudal en m³/s, longitudes y
            pérdidas en m, velocidad en m/s, rugosidad en mm y viscosidad en
            m²/s.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="pipe-hydraulics-method"
              label="Método de pérdida por fricción"
              items={METHOD_ITEMS}
              value={method}
              onChange={(next) => {
                if (isPipeMethod(next)) setMethod(next)
              }}
            />
            <SelectField
              id="pipe-hydraulics-mode"
              label="Modo de cálculo"
              items={MODE_ITEMS}
              value={mode}
              onChange={(next) => {
                if (isPipeMode(next)) setMode(next)
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {PIPE_METHOD_DESCRIPTIONS[method]} {PIPE_MODE_DESCRIPTIONS[mode]}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="pipe-hydraulics-length"
              label="Longitud de la tubería, L (m)"
              value={lengthInput}
              onChange={setLengthInput}
              error={fieldError("length")}
              placeholder="Ej. 100"
            />

            {mode === "flow" || mode === "loss" ? (
              <NumberField
                id="pipe-hydraulics-diameter"
                label="Diámetro interno, D (mm)"
                value={diameterInput}
                onChange={setDiameterInput}
                error={fieldError("diameter")}
                placeholder="Ej. 150"
              />
            ) : null}

            {mode === "diameter" || mode === "loss" ? (
              <NumberField
                id="pipe-hydraulics-discharge"
                label="Caudal, Q (m³/s)"
                value={dischargeInput}
                onChange={setDischargeInput}
                error={fieldError("discharge")}
                placeholder="Ej. 0,015"
              />
            ) : null}

            {mode === "diameter" || mode === "flow" ? (
              <NumberField
                id="pipe-hydraulics-head-loss"
                label="Pérdida total objetivo, H (m)"
                value={headLossInput}
                onChange={setHeadLossInput}
                error={fieldError("headLoss")}
                placeholder="Ej. 0,5"
              />
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {method === "hazen-williams" ? (
              <NumberField
                id="pipe-hydraulics-hazen-c"
                label="Coeficiente C de Hazen-Williams"
                value={hazenCInput}
                onChange={setHazenCInput}
                error={fieldError("hazenC")}
                placeholder="Ej. 140"
              />
            ) : (
              <>
                <NumberField
                  id="pipe-hydraulics-roughness"
                  label="Rugosidad absoluta, ε (mm)"
                  value={roughnessInput}
                  onChange={setRoughnessInput}
                  error={fieldError("roughness")}
                  placeholder="Ej. 0,045"
                />
                <NumberField
                  id="pipe-hydraulics-viscosity"
                  label="Viscosidad cinemática, ν (m²/s)"
                  value={viscosityInput}
                  onChange={setViscosityInput}
                  error={fieldError("viscosity")}
                  placeholder="Ej. 0,000001004"
                />
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            El diámetro se ingresa en milímetros y el caudal en m³/s (1 m³/s =
            1.000 L/s). En los modos de diámetro y caudal, H es la pérdida total
            objetivo e incluye las pérdidas locales. Para agua a 20 °C se
            sugiere ν = 1,004×10⁻⁶ m²/s.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>Accesorios y pérdidas locales</CardTitle>
              <CardDescription>
                Agrega cada accesorio con su cantidad y coeficiente K. Los
                valores predefinidos son orientativos y se pueden editar.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAccessory}
              disabled={accessories.length >= 50}
            >
              <Plus className="size-4" />
              Agregar accesorio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {accessories.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No hay accesorios. La pérdida total será solo por fricción.
            </p>
          ) : (
            accessories.map((row, index) => (
              <AccessoryRowFields
                key={row.id}
                row={row}
                index={index}
                fieldError={fieldError}
                onChange={(next) =>
                  setAccessories((current) =>
                    current.map((item) => (item.id === row.id ? next : item))
                  )
                }
                onRemove={() =>
                  setAccessories((current) =>
                    current.filter((item) => item.id !== row.id)
                  )
                }
              />
            ))
          )}

          <p className="text-xs text-muted-foreground tabular-nums">
            ΣK actual = {formatNumber(previewTotalK, 2)}. Incluye entrada,
            codos, válvulas, tee y salida según corresponda.
          </p>
          {accessoriesError ? (
            <p className="text-sm text-destructive">{accessoriesError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            {calculationError
              ? "No se pudo completar el cálculo."
              : result && !hasSolution
                ? "No se encontró una solución numérica para los datos indicados."
                : result
                  ? `${PIPE_METHOD_LABELS[result.method]} — pérdidas por fricción y locales.`
                  : "Completa los datos y corrige los errores para calcular."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculationError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {calculationError}
            </div>
          ) : result && parsedInput ? (
            <ResultContent result={result} parsedInput={parsedInput} />
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Completa los datos y corrige los errores para calcular.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas y criterios</CardTitle>
          <CardDescription>
            Supuestos, alcance y referencias del cálculo hidráulico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Hazen-Williams en SI: V = 0,849 · C · (D/4)^0,63 · S^0,54, con h_f =
            S · L. Es una fórmula empírica para agua en flujo turbulento; C
            suele estar entre 70 y 160 según el material y el estado de la
            tubería.
          </p>
          <p>
            Darcy-Weisbach: h_f = f · (L/D) · V²/(2g). El factor f se obtiene
            con f = 64/Re en régimen laminar y con Colebrook-White en régimen
            turbulento. En la transición 2000 ≤ Re &lt; 4000 se interpola entre
            ambos regímenes y el resultado es aproximado.
          </p>
          <p>
            Las pérdidas locales se calculan como h_m = ΣK · V²/(2g). Los
            coeficientes K de los accesorios son valores orientativos basados en
            Crane TP-410; varían con el diámetro, el fabricante y las
            condiciones de flujo. Edita K cuando tengas datos del fabricante.
          </p>
          <p>
            El diámetro calculado es el diámetro interno requerido. No se
            redondea automáticamente a un diámetro comercial: adopta el diámetro
            normalizado y verifica la pérdida total, la presión de trabajo y la
            velocidad resultante. Se sugiere revisar velocidades fuera del
            intervalo 0,6–3,0 m/s.
          </p>
          <p>
            El cálculo no verifica clase de presión, golpe de ariete, régimen
            transitorio, sedimentación, incrustaciones, aire atrapado,
            cavitación ni resistencia estructural. Los resultados son
            orientativos: verifica la normativa y las condiciones de campo antes
            de usarlos en diseño.
          </p>
          <p>
            Referencias: Hazen-Williams; Darcy-Weisbach y Colebrook-White;
            Crane, Flow of Fluids Through Valves, Fittings, and Pipe (TP-410).
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
            toolId={pipeHydraulicsDefinition.info.id}
            toolName={pipeHydraulicsDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
