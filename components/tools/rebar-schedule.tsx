"use client"

import { useRef, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  REBAR_REFERENCES,
  REBAR_SIZES_BY_SYSTEM,
  REBAR_SYSTEM_LABELS,
  REBAR_SYSTEMS,
  getRebarSize,
  isRebarId,
  metersPerTon,
  rebarDisplayName,
  type RebarSize,
} from "@/lib/estructuras/nsr10-rebar"
import {
  calculateRebarSchedule,
  type RebarScheduleResult,
} from "@/lib/tools/rebar-schedule/calculate"
import { rebarScheduleDefinition } from "@/lib/tools/rebar-schedule/definition"
import {
  DEFAULT_REBAR_ID,
  DEFAULT_SECTION_BAR_ID,
  DEFAULT_WASTE_PERCENT,
  MAX_REBAR_ROWS,
  type RebarScheduleInput,
} from "@/lib/tools/rebar-schedule/schema"
import { parseNumericInput } from "@/lib/tools/parse-numeric"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"

const REBAR_ITEMS = REBAR_SYSTEMS.flatMap((system) =>
  REBAR_SIZES_BY_SYSTEM[system].map((size) => ({
    value: size.id,
    label: rebarDisplayName(size),
  }))
)

type RebarRow = {
  id: number
  mark: string
  barId: string
  quantityInput: string
  lengthInput: string
}

function defaultRows(): RebarRow[] {
  return [
    {
      id: 0,
      mark: "V-1",
      barId: "no-4",
      quantityInput: "4",
      lengthInput: "6",
    },
    {
      id: 1,
      mark: "V-1",
      barId: "no-3",
      quantityInput: "20",
      lengthInput: "1,6",
    },
  ]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function readNumberString(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string") {
    return value.trim() === "" ? fallback : value
  }
  return fallback
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function isPositiveInput(value: string): boolean {
  const parsed = parseNumericInput(value)
  return typeof parsed === "number" && Number.isFinite(parsed) && parsed > 0
}

function isPositiveIntegerInput(value: string): boolean {
  const parsed = parseNumericInput(value)
  return (
    typeof parsed === "number" &&
    Number.isFinite(parsed) &&
    Number.isInteger(parsed) &&
    parsed > 0
  )
}

function readRows(value: unknown): RebarRow[] {
  if (!Array.isArray(value)) return defaultRows()

  const rows = value
    .map((entry, index) => {
      if (!isRecord(entry)) return null

      return {
        id: index,
        mark: readString(entry.mark, ""),
        barId: isRebarId(entry.barId) ? entry.barId : DEFAULT_REBAR_ID,
        quantityInput: readNumberString(entry.quantity, "1"),
        lengthInput: readNumberString(entry.length, "6"),
      }
    })
    .filter((row): row is RebarRow => row !== null)

  return rows.length > 0 ? rows : defaultRows()
}

function hydrateRebarScheduleInput(initialInput?: Record<string, unknown>) {
  if (!initialInput) return null

  return {
    rows: readRows(initialInput.rows),
    wasteInput: readNumberString(
      initialInput.wastePercent,
      String(DEFAULT_WASTE_PERCENT)
    ),
    concreteVolumeInput: readNumberString(initialInput.concreteVolume, ""),
    concreteAreaInput: readNumberString(initialInput.concreteArea, ""),
    sectionEnabled: readBoolean(initialInput.sectionEnabled, false),
    sectionWidthInput: readNumberString(initialInput.sectionWidth, "300"),
    sectionEffectiveDepthInput: readNumberString(
      initialInput.sectionEffectiveDepth,
      "450"
    ),
    sectionBarId:
      typeof initialInput.sectionBarId === "string" &&
      isRebarId(initialInput.sectionBarId)
        ? initialInput.sectionBarId
        : DEFAULT_SECTION_BAR_ID,
    sectionBarCountInput: readNumberString(initialInput.sectionBarCount, "3"),
  }
}

function rebarItemLabel(size: RebarSize): string {
  return rebarDisplayName(size)
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  optional = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
  optional?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground"> (opcional)</span>
        ) : null}
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
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
      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function RebarTable({
  sizes,
  usedBarIds,
}: {
  sizes: RebarSize[]
  usedBarIds: ReadonlySet<string>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Designación</TableHead>
          <TableHead className="text-right">Ø nominal (mm)</TableHead>
          <TableHead className="text-right">Área nominal (mm²)</TableHead>
          <TableHead className="text-right">Perímetro (mm)</TableHead>
          <TableHead className="text-right">Masa nominal (kg/m)</TableHead>
          <TableHead className="text-right">m/t</TableHead>
          <TableHead className="w-20">
            <span className="sr-only">Uso</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sizes.map((size) => {
          const used = usedBarIds.has(size.id)

          return (
            <TableRow
              key={size.id}
              className={used ? "bg-primary/5" : undefined}
            >
              <TableCell className="font-medium">
                {rebarDisplayName(size)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(size.diameterMm, 1)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(size.areaMm2, 1)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(size.perimeterMm, 2)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(size.massKgPerM, 3)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(metersPerTon(size), 1)}
              </TableCell>
              <TableCell>
                {used ? <Badge variant="secondary">Usada</Badge> : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function RebarSchedule({ initialInput, editMode }: ToolComponentProps) {
  const hydrated = hydrateRebarScheduleInput(initialInput)
  const [rows, setRows] = useState<RebarRow[]>(
    () => hydrated?.rows ?? defaultRows()
  )
  const [wasteInput, setWasteInput] = useState(
    hydrated?.wasteInput ?? String(DEFAULT_WASTE_PERCENT)
  )
  const [concreteVolumeInput, setConcreteVolumeInput] = useState(
    hydrated?.concreteVolumeInput ?? ""
  )
  const [concreteAreaInput, setConcreteAreaInput] = useState(
    hydrated?.concreteAreaInput ?? ""
  )
  const [sectionEnabled, setSectionEnabled] = useState(
    hydrated?.sectionEnabled ?? false
  )
  const [sectionWidthInput, setSectionWidthInput] = useState(
    hydrated?.sectionWidthInput ?? "300"
  )
  const [sectionEffectiveDepthInput, setSectionEffectiveDepthInput] = useState(
    hydrated?.sectionEffectiveDepthInput ?? "450"
  )
  const [sectionBarId, setSectionBarId] = useState(
    hydrated?.sectionBarId ?? DEFAULT_SECTION_BAR_ID
  )
  const [sectionBarCountInput, setSectionBarCountInput] = useState(
    hydrated?.sectionBarCountInput ?? "3"
  )
  const nextRowId = useRef(rows.length)

  const rawInput = {
    rows: rows.map((row) => ({
      mark: row.mark,
      barId: row.barId,
      quantity: row.quantityInput,
      length: row.lengthInput,
    })),
    wastePercent: wasteInput,
    concreteVolume: concreteVolumeInput,
    concreteArea: concreteAreaInput,
    sectionEnabled,
    sectionWidth: sectionWidthInput,
    sectionEffectiveDepth: sectionEffectiveDepthInput,
    sectionBarId,
    sectionBarCount: sectionBarCountInput,
  }

  const validation = rebarScheduleDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput: RebarScheduleInput | null = validation.valid
    ? rebarScheduleDefinition.schema.parse(rawInput)
    : null

  const result: RebarScheduleResult | null = parsedInput
    ? calculateRebarSchedule(parsedInput)
    : null

  const snapshot =
    parsedInput && result
      ? rebarScheduleDefinition.toSnapshot(parsedInput, result)
      : null

  const updateRow = (
    id: number,
    field: "mark" | "barId" | "quantityInput" | "lengthInput",
    value: string
  ) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const addRow = () => {
    if (rows.length >= MAX_REBAR_ROWS) return

    const id = nextRowId.current
    nextRowId.current += 1
    setRows((current) => [
      ...current,
      {
        id,
        mark: "",
        barId: DEFAULT_REBAR_ID,
        quantityInput: "1",
        lengthInput: "6",
      },
    ])
  }

  const removeRow = (id: number) => {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.id !== id)
    )
  }

  const handleSectionEnabledChange = (checked: boolean) => {
    setSectionEnabled(checked)

    if (!checked) {
      setSectionWidthInput((current) =>
        isPositiveInput(current) ? current : "300"
      )
      setSectionEffectiveDepthInput((current) =>
        isPositiveInput(current) ? current : "450"
      )
      setSectionBarId((current) =>
        isRebarId(current) ? current : DEFAULT_SECTION_BAR_ID
      )
      setSectionBarCountInput((current) =>
        isPositiveIntegerInput(current) ? current : "3"
      )
    }
  }

  const rowsError = fieldError("rows")
  const wasteError = fieldError("wastePercent")
  const volumeError = fieldError("concreteVolume")
  const areaError = fieldError("concreteArea")
  const sectionWidthError = fieldError("sectionWidth")
  const sectionDepthError = fieldError("sectionEffectiveDepth")
  const sectionBarError = fieldError("sectionBarId")
  const sectionCountError = fieldError("sectionBarCount")

  const usedBarIds = new Set(rows.map((row) => row.barId))
  const section = result?.section ?? null

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Despiece de refuerzo</CardTitle>
          <CardDescription>
            Cada fila es el total de barras de un grupo. La longitud de corte
            debe incluir ganchos, dobleces y traslapos definidos por el usuario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Marcado</TableHead>
                <TableHead className="min-w-56">Varilla</TableHead>
                <TableHead className="w-28 text-right">Cantidad</TableHead>
                <TableHead className="w-32 text-right">
                  Longitud de corte (m)
                </TableHead>
                <TableHead className="w-28 text-right">Peso (kg)</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => {
                const markError = fieldError(`rows.${index}.mark`)
                const barError = fieldError(`rows.${index}.barId`)
                const quantityError = fieldError(`rows.${index}.quantity`)
                const lengthError = fieldError(`rows.${index}.length`)
                const size = getRebarSize(row.barId)
                const rowResult = result?.rows[index]

                return (
                  <TableRow key={row.id}>
                    <TableCell className="align-top whitespace-normal">
                      <Input
                        value={row.mark}
                        autoComplete="off"
                        placeholder="V-1"
                        aria-label={`Marcado de la fila ${index + 1}`}
                        aria-invalid={markError ? true : undefined}
                        onChange={(event) =>
                          updateRow(row.id, "mark", event.target.value)
                        }
                      />
                      {markError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {markError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="min-w-56 align-top whitespace-normal">
                      <Select
                        items={REBAR_ITEMS}
                        value={row.barId}
                        onValueChange={(next) => {
                          if (isRebarId(next)) {
                            updateRow(row.id, "barId", next)
                          }
                        }}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`Varilla de la fila ${index + 1}`}
                          aria-invalid={barError ? true : undefined}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-56">
                          {REBAR_SYSTEMS.map((system) => (
                            <SelectGroup key={system}>
                              <SelectLabel>
                                {REBAR_SYSTEM_LABELS[system]}
                              </SelectLabel>
                              {REBAR_SIZES_BY_SYSTEM[system].map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {rebarItemLabel(item)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      {barError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {barError}
                        </p>
                      ) : size ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ø{formatNumber(size.diameterMm, 1)} mm ·{" "}
                          {formatNumber(size.massKgPerM, 3)} kg/m
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <Input
                        value={row.quantityInput}
                        inputMode="numeric"
                        autoComplete="off"
                        className="text-right"
                        aria-label={`Cantidad de barras de la fila ${index + 1}`}
                        aria-invalid={quantityError ? true : undefined}
                        onChange={(event) =>
                          updateRow(row.id, "quantityInput", event.target.value)
                        }
                      />
                      {quantityError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {quantityError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <Input
                        value={row.lengthInput}
                        inputMode="decimal"
                        autoComplete="off"
                        className="text-right"
                        aria-label={`Longitud de corte de la fila ${index + 1}`}
                        aria-invalid={lengthError ? true : undefined}
                        onChange={(event) =>
                          updateRow(row.id, "lengthInput", event.target.value)
                        }
                      />
                      {lengthError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {lengthError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right align-top font-medium tabular-nums">
                      {rowResult ? formatNumber(rowResult.weightKg, 3) : "—"}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={rows.length <= 1}
                        aria-label={`Eliminar fila ${index + 1}`}
                        title="Eliminar fila"
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              La cantidad es el total de barras; no se multiplica por elementos
              iguales. La longitud no se calcula automáticamente.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={rows.length >= MAX_REBAR_ROWS}
              onClick={addRow}
            >
              <Plus />
              Agregar fila
            </Button>
          </div>

          {rowsError ? (
            <p className="text-sm text-destructive">{rowsError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desperdicio y cuantía de obra</CardTitle>
          <CardDescription>
            El desperdicio se aplica al peso neto total. Los indicadores kg/m³ y
            kg/m² usan el peso final con desperdicio.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="rebar-waste"
            label="Desperdicio global (%)"
            value={wasteInput}
            error={wasteError}
            hint="Usa 0 si no deseas aplicar desperdicio."
            onChange={setWasteInput}
          />
          <NumberField
            id="rebar-concrete-volume"
            label="Volumen de concreto (m³)"
            value={concreteVolumeInput}
            error={volumeError}
            hint="Opcional. Activa el indicador kg/m³."
            placeholder="Ej. 2,5"
            optional
            onChange={setConcreteVolumeInput}
          />
          <NumberField
            id="rebar-concrete-area"
            label="Área de concreto (m²)"
            value={concreteAreaInput}
            error={areaError}
            hint="Opcional. Activa el indicador kg/m²."
            placeholder="Ej. 20"
            optional
            onChange={setConcreteAreaInput}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuantía de sección</CardTitle>
          <CardDescription>
            Calcula As y ρ para una sección rectangular con refuerzo en
            tracción. Es una cuantía informativa; no verifica mínimos ni
            máximos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="rebar-section-enabled"
              checked={sectionEnabled}
              className="mt-0.5"
              onCheckedChange={(value) =>
                handleSectionEnabledChange(value === true)
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="rebar-section-enabled"
                className="text-sm font-medium"
              >
                Calcular cuantía de sección
              </Label>
              <p className="text-xs text-muted-foreground">
                ρ = As/(b·d), según NSR-10 C.2.1. Usa el peralte efectivo d, no
                el peralte total h.
              </p>
            </div>
          </div>

          {sectionEnabled ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField
                  id="rebar-section-width"
                  label="Ancho b (mm)"
                  value={sectionWidthInput}
                  error={sectionWidthError}
                  onChange={setSectionWidthInput}
                />
                <NumberField
                  id="rebar-section-depth"
                  label="Peralte efectivo d (mm)"
                  value={sectionEffectiveDepthInput}
                  error={sectionDepthError}
                  onChange={setSectionEffectiveDepthInput}
                />
                <div className="space-y-2">
                  <Label htmlFor="rebar-section-bar">Varilla en tracción</Label>
                  <Select
                    items={REBAR_ITEMS}
                    value={sectionBarId}
                    onValueChange={(next) => {
                      if (isRebarId(next)) setSectionBarId(next)
                    }}
                  >
                    <SelectTrigger
                      id="rebar-section-bar"
                      className="w-full"
                      aria-invalid={sectionBarError ? true : undefined}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="min-w-56">
                      {REBAR_SYSTEMS.map((system) => (
                        <SelectGroup key={system}>
                          <SelectLabel>
                            {REBAR_SYSTEM_LABELS[system]}
                          </SelectLabel>
                          {REBAR_SIZES_BY_SYSTEM[system].map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {rebarItemLabel(item)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  {sectionBarError ? (
                    <p className="text-sm text-destructive">
                      {sectionBarError}
                    </p>
                  ) : null}
                </div>
                <NumberField
                  id="rebar-section-count"
                  label="Cantidad de barras en tracción"
                  value={sectionBarCountInput}
                  error={sectionCountError}
                  onChange={setSectionBarCountInput}
                />
              </div>

              {section ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <ResultTile
                    label="As total"
                    value={`${formatNumber(section.totalAreaMm2, 1)} mm²`}
                    hint={`${formatNumber(section.totalAreaCm2, 2)} cm²`}
                  />
                  <ResultTile
                    label="ρ = As/(b·d)"
                    value={formatNumber(section.ratio, 6)}
                    hint="Cuantía geométrica"
                  />
                  <ResultTile
                    label="ρ en porcentaje"
                    value={`${formatNumber(section.ratioPercent, 3)} %`}
                  />
                  <ResultTile
                    label="Refuerzo"
                    value={section.displayName}
                    hint={`${section.barCount} × ${formatNumber(
                      section.areaPerBarMm2,
                      1
                    )} mm²`}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Completa los datos de la sección y corrige cualquier error del
                  despiece para calcular la cuantía.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Activa la cuantía de sección para calcular As y ρ.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados del despiece</CardTitle>
          <CardDescription>
            {result
              ? "Longitudes y pesos calculados con la masa nominal de la tabla NSR-10."
              : "Completa el despiece para calcular longitudes y pesos."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Barras totales"
                  value={String(result.totalBars)}
                  hint="Suma de cantidades"
                />
                <ResultTile
                  label="Longitud total"
                  value={`${formatNumber(result.totalLengthM, 2)} m`}
                  hint="Longitud de corte acumulada"
                />
                <ResultTile
                  label="Peso neto"
                  value={`${formatNumber(result.netWeightKg, 2)} kg`}
                  hint="Sin desperdicio"
                />
                <ResultTile
                  label="Peso con desperdicio"
                  value={`${formatNumber(result.totalWeightKg, 2)} kg`}
                  hint={`${formatNumber(result.wasteWeightKg, 2)} kg de desperdicio`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Peso total"
                  value={`${formatNumber(result.totalWeightT, 3)} t`}
                  hint="Peso final con desperdicio"
                />
                {result.weightPerVolumeKgM3 !== null ? (
                  <ResultTile
                    label="Cuantía por volumen"
                    value={`${formatNumber(result.weightPerVolumeKgM3, 1)} kg/m³`}
                    hint={`${formatNumber(result.concreteVolumeM3 ?? 0, 2)} m³ de concreto`}
                  />
                ) : null}
                {result.weightPerAreaKgM2 !== null ? (
                  <ResultTile
                    label="Cuantía por área"
                    value={`${formatNumber(result.weightPerAreaKgM2, 1)} kg/m²`}
                    hint={`${formatNumber(result.concreteAreaM2 ?? 0, 2)} m² de concreto`}
                  />
                ) : null}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Resumen por varilla</p>
                  <p className="text-xs text-muted-foreground">
                    Los pesos de esta tabla son netos, sin desperdicio.
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Varilla</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Longitud (m)</TableHead>
                      <TableHead className="text-right">Peso (kg)</TableHead>
                      <TableHead className="text-right">% del peso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.groups.map((group) => (
                      <TableRow key={group.barId}>
                        <TableCell className="font-medium">
                          {group.displayName}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {group.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(group.totalLengthM, 2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(group.weightKg, 2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(group.percentOfWeight, 1)} %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de pesos de varillas</CardTitle>
          <CardDescription>
            Tablas C.3.5.3-1 y C.3.5.3-2 de la NSR-10. Los metros por tonelada
            se calculan como 1000 / masa nominal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metric">
            <TabsList>
              <TabsTrigger value="metric">Métrico (M)</TabsTrigger>
              <TabsTrigger value="imperial">Pulgadas (No.)</TabsTrigger>
            </TabsList>
            <TabsContent value="metric" className="mt-4">
              <p className="mb-3 text-xs text-muted-foreground">
                {REBAR_REFERENCES.metricTable}.
              </p>
              <RebarTable
                sizes={REBAR_SIZES_BY_SYSTEM.metric}
                usedBarIds={usedBarIds}
              />
            </TabsContent>
            <TabsContent value="imperial" className="mt-4">
              <p className="mb-3 text-xs text-muted-foreground">
                {REBAR_REFERENCES.imperialTable}.
              </p>
              <RebarTable
                sizes={REBAR_SIZES_BY_SYSTEM.imperial}
                usedBarIds={usedBarIds}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referencias y notas</CardTitle>
          <CardDescription>
            Base normativa y alcance del despiece.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Cada fila representa el total de barras de un grupo. La longitud
            ingresada es la longitud de corte e incluye los ganchos, dobleces y
            traslapos que definas; la herramienta no los calcula
            automáticamente.
          </p>
          <p>
            El peso neto se obtiene con la masa nominal de la tabla. El
            desperdicio es un porcentaje global opcional y se aplica al peso
            neto total. No se incluye alambre de amarre, malla electrosoldada,
            insertos ni pérdidas por corte.
          </p>
          <p>
            La cuantía de sección usa una sola designación de barra en tracción:
            As = n × área y ρ = As/(b·d). Es informativa; no verifica cuantías
            mínimas o máximas de C.10.5 ni los requisitos sísmicos de C.21.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>{REBAR_REFERENCES.metricTable}.</li>
            <li>{REBAR_REFERENCES.imperialTable}.</li>
            <li>{REBAR_REFERENCES.ntc2289}.</li>
            <li>{REBAR_REFERENCES.sectionRatio}.</li>
            <li>{REBAR_REFERENCES.minFlexuralReinforcement}.</li>
            <li>{REBAR_REFERENCES.seismicDetailing}.</li>
            <li>{REBAR_REFERENCES.hooks}.</li>
            <li>{REBAR_REFERENCES.development}.</li>
          </ul>
          <p>
            La disponibilidad comercial de diámetros y longitudes varía según el
            fabricante y la región. Verifica la designación y la masa nominal
            antes de comprar.
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
            toolId={rebarScheduleDefinition.info.id}
            toolName={rebarScheduleDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
