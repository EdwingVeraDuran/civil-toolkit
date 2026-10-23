"use client"

import { useState } from "react"

import { SectionDiagram } from "@/components/tools/section-diagram"
import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
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
  DISSIPATION_CAPACITIES,
  DISSIPATION_CAPACITY_LABELS,
  ELEMENT_TYPES,
  ELEMENT_TYPE_LABELS,
  NSR10_REFERENCES,
  SUPPORT_CONDITIONS,
  SUPPORT_CONDITION_LABELS,
  type DissipationCapacity,
  type ElementType,
  type SupportCondition,
} from "@/lib/estructuras/nsr10"
import { beamSizingDefinition } from "@/lib/tools/beam-sizing/definition"
import type { ToolComponentProps } from "@/lib/tools/types"

const BOOLEAN_ITEMS = [
  { value: "false", label: "No" },
  { value: "true", label: "Sí" },
]

const ELEMENT_ITEMS = ELEMENT_TYPES.map((value) => ({
  value,
  label: ELEMENT_TYPE_LABELS[value],
}))

const SUPPORT_ITEMS = SUPPORT_CONDITIONS.map((value) => ({
  value,
  label: SUPPORT_CONDITION_LABELS[value],
}))

const CAPACITY_ITEMS = DISSIPATION_CAPACITIES.map((value) => ({
  value,
  label: DISSIPATION_CAPACITY_LABELS[value],
}))

function isElementType(value: string): value is ElementType {
  return (ELEMENT_TYPES as readonly string[]).includes(value)
}

function isSupportCondition(value: string): value is SupportCondition {
  return (SUPPORT_CONDITIONS as readonly string[]).includes(value)
}

function isDissipationCapacity(value: string): value is DissipationCapacity {
  return (DISSIPATION_CAPACITIES as readonly string[]).includes(value)
}

function formatMm(value: number): string {
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} mm`
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

function hydrateBeamSizingInitialInput(
  initialInput?: Record<string, unknown>,
) {
  if (!initialInput) return null

  const readString = (value: unknown, fallback: string) =>
    typeof value === "string" ? value : fallback
  const readNumberString = (value: unknown, fallback: string) =>
    typeof value === "number" ? String(value) : readString(value, fallback)
  const readBoolean = (value: unknown, fallback: boolean) =>
    typeof value === "boolean" ? value : fallback

  const elementType =
    typeof initialInput.elementType === "string" &&
    (ELEMENT_TYPES as readonly string[]).includes(initialInput.elementType)
      ? (initialInput.elementType as ElementType)
      : "viga"
  const supportCondition =
    typeof initialInput.supportCondition === "string" &&
    (SUPPORT_CONDITIONS as readonly string[]).includes(
      initialInput.supportCondition,
    )
      ? (initialInput.supportCondition as SupportCondition)
      : "simple"
  const capacity =
    typeof initialInput.capacity === "string" &&
    (DISSIPATION_CAPACITIES as readonly string[]).includes(
      initialInput.capacity,
    )
      ? (initialInput.capacity as DissipationCapacity)
      : "DES"

  return {
    elementType,
    supportCondition,
    capacity,
    spanInput: readNumberString(initialInput.span, "6"),
    fyInput: readNumberString(initialInput.fy, "420"),
    lightweight: readBoolean(initialInput.lightweight, false),
    densityInput: readNumberString(initialInput.concreteDensity, "1800"),
    fragilePartitions: readBoolean(initialInput.fragilePartitions, false),
  }
}

export function BeamSizing({ initialInput, editMode }: ToolComponentProps) {
  const hydrated = hydrateBeamSizingInitialInput(initialInput)
  const [elementType, setElementType] = useState<ElementType>(
    hydrated?.elementType ?? "viga",
  )
  const [supportCondition, setSupportCondition] = useState<SupportCondition>(
    hydrated?.supportCondition ?? "simple",
  )
  const [capacity, setCapacity] = useState<DissipationCapacity>(
    hydrated?.capacity ?? "DES",
  )
  const [spanInput, setSpanInput] = useState(hydrated?.spanInput ?? "6")
  const [fyInput, setFyInput] = useState(hydrated?.fyInput ?? "420")
  const [lightweight, setLightweight] = useState(hydrated?.lightweight ?? false)
  const [densityInput, setDensityInput] = useState(hydrated?.densityInput ?? "1800")
  const [fragilePartitions, setFragilePartitions] = useState(
    hydrated?.fragilePartitions ?? false,
  )

  const rawInput = {
    elementType,
    supportCondition,
    capacity,
    span: spanInput,
    fy: fyInput,
    lightweight,
    concreteDensity: densityInput,
    fragilePartitions,
  }

  const validation = beamSizingDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput = validation.valid
    ? beamSizingDefinition.schema.parse(rawInput)
    : null

  const result = parsedInput ? beamSizingDefinition.calculate(parsedInput) : null

  const snapshot =
    parsedInput && result
      ? beamSizingDefinition.toSnapshot(parsedInput, result)
      : null

  const spanError = fieldError("span")
  const fyError = fieldError("fy")
  const densityError = fieldError("concreteDensity")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del elemento</CardTitle>
          <CardDescription>
            Predimensionado por control de deflexiones (NSR-10, Capítulo C.9.5).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="element-type"
            label="Tipo de elemento"
            items={ELEMENT_ITEMS}
            value={elementType}
            onChange={(next) => {
              if (isElementType(next)) setElementType(next)
            }}
          />
          <SelectField
            id="support-condition"
            label="Condición de apoyo"
            items={SUPPORT_ITEMS}
            value={supportCondition}
            onChange={(next) => {
              if (isSupportCondition(next)) setSupportCondition(next)
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="span">Luz l (m)</Label>
            <Input
              id="span"
              inputMode="decimal"
              value={spanInput}
              onChange={(event) => setSpanInput(event.target.value)}
              aria-invalid={spanError ? true : undefined}
            />
            {spanError ? <p className="text-sm text-destructive">{spanError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fy">fy (MPa)</Label>
            <Input
              id="fy"
              inputMode="decimal"
              value={fyInput}
              onChange={(event) => setFyInput(event.target.value)}
              aria-invalid={fyError ? true : undefined}
            />
            {fyError ? <p className="text-sm text-destructive">{fyError}</p> : null}
          </div>
          <SelectField
            id="fragile-partitions"
            label="¿Soporta particiones frágiles?"
            items={BOOLEAN_ITEMS}
            value={String(fragilePartitions)}
            onChange={(next) => setFragilePartitions(next === "true")}
          />
          <SelectField
            id="capacity"
            label="Capacidad de disipación de energía"
            items={CAPACITY_ITEMS}
            value={capacity}
            onChange={(next) => {
              if (isDissipationCapacity(next)) setCapacity(next)
            }}
          />
          <SelectField
            id="lightweight"
            label="Concreto liviano"
            items={BOOLEAN_ITEMS}
            value={String(lightweight)}
            onChange={(next) => setLightweight(next === "true")}
          />
          {lightweight ? (
            <div className="space-y-2">
              <Label htmlFor="density">Densidad del concreto liviano (kg/m³)</Label>
              <Input
                id="density"
                inputMode="decimal"
                value={densityInput}
                onChange={(event) => setDensityInput(event.target.value)}
                aria-invalid={densityError ? true : undefined}
              />
              {densityError ? (
                <p className="text-sm text-destructive">{densityError}</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sección recomendada</CardTitle>
          <CardDescription>
            {result
              ? `${ELEMENT_TYPE_LABELS[result.elementType]} — ${SUPPORT_CONDITION_LABELS[result.supportCondition]}`
              : "Ingresa datos válidos para ver la sección recomendada."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <SectionDiagram
                width={result.b}
                height={result.h}
                className="mx-auto w-full max-w-xs"
              />
              <dl className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Peralte mínimo (exacto)</dt>
                  <dd className="text-sm font-medium tabular-nums">{formatMm(result.hMinExact)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Peralte redondeado (50 mm)</dt>
                  <dd className="text-sm font-medium tabular-nums">{formatMm(result.h)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Ancho mínimo</dt>
                  <dd className="text-sm font-medium tabular-nums">{formatMm(result.bMin)}</dd>
                </div>
                <div className="space-y-1 border-t pt-4">
                  <p className="text-sm text-muted-foreground">Sección recomendada</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {result.b} × {result.h} mm
                  </p>
                </div>
              </dl>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referencias y notas</CardTitle>
          <CardDescription>Basado en la NSR-10, Título C — Concreto estructural.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>{NSR10_REFERENCES.thicknessTable}.</li>
                <li>{NSR10_REFERENCES.thicknessTableRecommended}.</li>
                <li>{NSR10_REFERENCES.fyAdjustment}.</li>
                <li>{NSR10_REFERENCES.lightweightAdjustment}.</li>
                <li>{result.bMinReference}.</li>
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
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
            toolId={beamSizingDefinition.info.id}
            toolName={beamSizingDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
