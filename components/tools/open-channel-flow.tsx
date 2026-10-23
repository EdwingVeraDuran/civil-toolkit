"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { ChannelSectionDiagram } from "@/components/tools/channel-section-diagram"
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
import {
  FLOW_REGIME_LABELS,
  SLOPE_CLASS_LABELS,
  type FlowRegime,
} from "@/lib/aguas/canales"
import type { OpenChannelFlowResult } from "@/lib/tools/open-channel-flow/calculate"
import { openChannelFlowDefinition } from "@/lib/tools/open-channel-flow/definition"
import { evaluateTool } from "@/lib/tools/evaluate"
import {
  CHANNEL_MODE_DESCRIPTIONS,
  CHANNEL_MODE_LABELS,
  CHANNEL_MODES,
  CHANNEL_SECTION_DESCRIPTIONS,
  CHANNEL_SECTION_LABELS,
  CHANNEL_SECTIONS,
  DEFAULT_CHANNEL_MODE,
  DEFAULT_CHANNEL_SECTION,
  type ChannelMode,
  type ChannelSectionType,
  type OpenChannelFlowInput,
} from "@/lib/tools/open-channel-flow/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"

const MODE_ITEMS = CHANNEL_MODES.map((value) => ({
  value,
  label: CHANNEL_MODE_LABELS[value],
}))

const SECTION_ITEMS = CHANNEL_SECTIONS.map((value) => ({
  value,
  label: CHANNEL_SECTION_LABELS[value],
}))

type FormState = {
  mode: ChannelMode
  section: ChannelSectionType
  bottomWidthInput: string
  sideSlopeInput: string
  diameterInput: string
  slopeInput: string
  manningInput: string
  dischargeInput: string
  depthInput: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isChannelMode(value: unknown): value is ChannelMode {
  return (
    typeof value === "string" &&
    (CHANNEL_MODES as readonly string[]).includes(value)
  )
}

function isChannelSection(value: unknown): value is ChannelSectionType {
  return (
    typeof value === "string" &&
    (CHANNEL_SECTIONS as readonly string[]).includes(value)
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

function hydrateFormState(
  initialInput?: Record<string, unknown>
): FormState | null {
  if (!initialInput) return null

  const geometry = isRecord(initialInput.geometry)
    ? initialInput.geometry
    : null

  return {
    mode: isChannelMode(initialInput.mode)
      ? initialInput.mode
      : DEFAULT_CHANNEL_MODE,
    section:
      geometry && isChannelSection(geometry.section)
        ? geometry.section
        : DEFAULT_CHANNEL_SECTION,
    bottomWidthInput: readNumberString(geometry?.bottomWidth, "5"),
    sideSlopeInput: readNumberString(geometry?.sideSlope, "1,5"),
    diameterInput: readNumberString(geometry?.diameter, "4"),
    slopeInput: readNumberString(initialInput.slope, "0,001"),
    manningInput: readNumberString(initialInput.manning, "0,015"),
    dischargeInput: readNumberString(initialInput.discharge, "10"),
    depthInput: readNumberString(initialInput.depth, "1,2"),
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

function regimeBadgeClass(regime: FlowRegime | null): string {
  switch (regime) {
    case "subcritical":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "critical":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "supercritical":
      return "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300"
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

function ResultContent({
  result,
  parsedInput,
}: {
  result: OpenChannelFlowResult
  parsedInput: OpenChannelFlowInput
}) {
  if (result.normalDepth === null) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium">Sin solución de flujo normal</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No se encontró una profundidad normal a superficie libre para el
            caudal y la geometría indicados.
          </p>
          {result.criticalDepth !== null ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Profundidad crítica calculada:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatNumber(result.criticalDepth, 3)} m
              </span>
            </p>
          ) : null}
        </div>
        <WarningsBox warnings={result.warnings} />
      </div>
    )
  }

  const properties = result.properties
  if (!properties) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={regimeBadgeClass(result.regime)}>
          {result.regime ? FLOW_REGIME_LABELS[result.regime] : "Sin clasificar"}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {result.regime === "subcritical"
            ? "El flujo es tranquilo y la profundidad normal supera la crítica."
            : result.regime === "supercritical"
              ? "El flujo es rápido y la profundidad normal es menor que la crítica."
              : "La profundidad normal coincide con la crítica dentro de la tolerancia."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultTile
          label="Profundidad normal, yₙ"
          value={`${formatNumber(result.normalDepth, 3)} m`}
          hint={
            result.mode === "depth"
              ? "Dato de entrada"
              : `${formatNumber(result.iterations.normalDepth, 0)} iteraciones`
          }
        />
        <ResultTile
          label="Caudal, Q"
          value={`${formatNumber(result.discharge, 3)} m³/s`}
        />
        <ResultTile
          label="Velocidad, V"
          value={
            result.velocity !== null
              ? `${formatNumber(result.velocity, 3)} m/s`
              : "—"
          }
        />
        <ResultTile
          label="Número de Froude, Fr"
          value={result.froude !== null ? formatNumber(result.froude, 3) : "—"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultTile
          label="Profundidad crítica, y_c"
          value={
            result.criticalDepth !== null
              ? `${formatNumber(result.criticalDepth, 3)} m`
              : "—"
          }
          hint={
            result.criticalDepth !== null
              ? `${formatNumber(result.iterations.criticalDepth, 0)} iteraciones`
              : undefined
          }
        />
        <ResultTile
          label="Pendiente crítica, S_c"
          value={
            result.criticalSlope !== null
              ? formatNumber(result.criticalSlope, 5)
              : "—"
          }
        />
        <ResultTile
          label="Clasificación de pendiente"
          value={
            result.slopeClassification !== null
              ? SLOPE_CLASS_LABELS[result.slopeClassification]
              : "—"
          }
          hint={`S0 = ${formatNumber(parsedInput.slope, 5)}`}
        />
        <ResultTile
          label="Relación yₙ / y_c"
          value={
            result.criticalDepth !== null &&
            result.criticalDepth > 0 &&
            result.normalDepth !== null
              ? formatNumber(result.normalDepth / result.criticalDepth, 3)
              : "—"
          }
        />
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-3">
            <Detail
              label="Área mojada, A"
              value={`${formatNumber(properties.area, 3)} m²`}
            />
            <Detail
              label="Perímetro mojado, P"
              value={`${formatNumber(properties.wettedPerimeter, 3)} m`}
            />
            <Detail
              label="Radio hidráulico, R"
              value={`${formatNumber(properties.hydraulicRadius, 3)} m`}
            />
            <Detail
              label="Ancho superficial, T"
              value={`${formatNumber(properties.topWidth, 3)} m`}
            />
            <Detail
              label="Profundidad hidráulica, Dₕ"
              value={`${formatNumber(properties.hydraulicDepth, 3)} m`}
            />
            <Detail
              label="Coeficiente de Manning, n"
              value={formatNumber(parsedInput.manning, 3)}
            />
          </dl>

          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Fórmula aplicada</p>
            <p className="mt-1 text-sm font-medium">{result.formula}</p>
          </div>
        </div>

        <ChannelSectionDiagram
          geometry={parsedInput.geometry}
          depth={result.normalDepth}
          criticalDepth={result.criticalDepth}
          className="mx-auto w-full max-w-sm"
        />
      </div>

      <WarningsBox warnings={result.warnings} />
    </div>
  )
}

export function OpenChannelFlow({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateFormState(initialInput)

  const [mode, setMode] = useState<ChannelMode>(
    () => hydrated?.mode ?? DEFAULT_CHANNEL_MODE
  )
  const [section, setSection] = useState<ChannelSectionType>(
    () => hydrated?.section ?? DEFAULT_CHANNEL_SECTION
  )
  const [bottomWidthInput, setBottomWidthInput] = useState(
    () => hydrated?.bottomWidthInput ?? "5"
  )
  const [sideSlopeInput, setSideSlopeInput] = useState(
    () => hydrated?.sideSlopeInput ?? "1,5"
  )
  const [diameterInput, setDiameterInput] = useState(
    () => hydrated?.diameterInput ?? "4"
  )
  const [slopeInput, setSlopeInput] = useState(
    () => hydrated?.slopeInput ?? "0,001"
  )
  const [manningInput, setManningInput] = useState(
    () => hydrated?.manningInput ?? "0,015"
  )
  const [dischargeInput, setDischargeInput] = useState(
    () => hydrated?.dischargeInput ?? "10"
  )
  const [depthInput, setDepthInput] = useState(
    () => hydrated?.depthInput ?? "1,2"
  )

  const rawGeometry: Record<string, unknown> = (() => {
    switch (section) {
      case "rectangular":
        return { section, bottomWidth: bottomWidthInput }
      case "trapezoidal":
        return {
          section,
          bottomWidth: bottomWidthInput,
          sideSlope: sideSlopeInput,
        }
      case "triangular":
        return { section, sideSlope: sideSlopeInput }
      case "circular":
        return { section, diameter: diameterInput }
    }
  })()

  const common = {
    geometry: rawGeometry,
    slope: slopeInput,
    manning: manningInput,
  }

  const rawInput =
    mode === "discharge"
      ? { ...common, mode, discharge: dischargeInput }
      : { ...common, mode, depth: depthInput }

  const {
    validation,
    parsedInput,
    result,
    snapshot: evaluatedSnapshot,
    calculationError,
  } = evaluateTool(openChannelFlowDefinition, rawInput, {
    calculationErrorMessage:
      "No se pudo calcular el canal con los datos suministrados.",
  })
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const snapshot =
    result && result.normalDepth !== null ? evaluatedSnapshot : null

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del canal</CardTitle>
          <CardDescription>
            Trabaja en unidades SI: longitudes en m, caudales en m³/s,
            velocidades en m/s y pendiente en m/m.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="open-channel-mode"
              label="Modo de cálculo"
              items={MODE_ITEMS}
              value={mode}
              onChange={(next) => {
                if (isChannelMode(next)) setMode(next)
              }}
            />
            <SelectField
              id="open-channel-section"
              label="Sección transversal"
              items={SECTION_ITEMS}
              value={section}
              onChange={(next) => {
                if (isChannelSection(next)) setSection(next)
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {CHANNEL_MODE_DESCRIPTIONS[mode]}{" "}
            {CHANNEL_SECTION_DESCRIPTIONS[section]}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {section === "rectangular" || section === "trapezoidal" ? (
              <NumberField
                id="open-channel-bottom-width"
                label="Ancho de fondo, b (m)"
                value={bottomWidthInput}
                onChange={setBottomWidthInput}
                error={fieldError("geometry.bottomWidth")}
                placeholder="Ej. 5"
              />
            ) : null}

            {section === "trapezoidal" || section === "triangular" ? (
              <NumberField
                id="open-channel-side-slope"
                label="Talud, z (H:V)"
                value={sideSlopeInput}
                onChange={setSideSlopeInput}
                error={fieldError("geometry.sideSlope")}
                placeholder="Ej. 1,5"
              />
            ) : null}

            {section === "circular" ? (
              <NumberField
                id="open-channel-diameter"
                label="Diámetro, D (m)"
                value={diameterInput}
                onChange={setDiameterInput}
                error={fieldError("geometry.diameter")}
                placeholder="Ej. 4"
              />
            ) : null}

            <NumberField
              id="open-channel-slope"
              label="Pendiente longitudinal, S0 (m/m)"
              value={slopeInput}
              onChange={setSlopeInput}
              error={fieldError("slope")}
              placeholder="Ej. 0,001"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="open-channel-manning"
              label="Coeficiente de Manning, n (SI)"
              value={manningInput}
              onChange={setManningInput}
              error={fieldError("manning")}
              placeholder="Ej. 0,015"
            />

            {mode === "discharge" ? (
              <NumberField
                id="open-channel-discharge"
                label="Caudal, Q (m³/s)"
                value={dischargeInput}
                onChange={setDischargeInput}
                error={fieldError("discharge")}
                placeholder="Ej. 10"
              />
            ) : (
              <NumberField
                id="open-channel-depth"
                label="Profundidad normal, yₙ (m)"
                value={depthInput}
                onChange={setDepthInput}
                error={fieldError("depth")}
                placeholder="Ej. 1,2"
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            La pendiente se ingresa como cociente adimensional: 0,001
            corresponde a 0,1 %. El coeficiente n debe ser el de Manning en
            unidades SI. Para una sección circular, y debe ser menor que D.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            {calculationError
              ? "No se pudo completar el cálculo."
              : result?.normalDepth === null
                ? "El caudal no tiene solución de flujo normal a superficie libre."
                : result
                  ? `${CHANNEL_SECTION_LABELS[result.section]} — flujo uniforme, profundidad crítica y régimen.`
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
            Supuestos de flujo uniforme, fórmulas y alcance del cálculo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Manning en SI: Q = (1/n) · A · R^(2/3) · S0^(1/2), con R = A/P. La
            velocidad es V = Q/A y el número de Froude es Fr = V/√(gDₕ), con g =
            9,81 m/s² y Dₕ = A/T.
          </p>
          <p>
            La profundidad crítica se obtiene resolviendo Q²T_c/(gA_c³) = 1 por
            bisección. La pendiente crítica es S_c = [nQ/(A_cR_c^(2/3))]². Se
            clasifica como suave si S0 &lt; S_c, crítica si S0 ≈ S_c y fuerte si
            S0 &gt; S_c.
          </p>
          <p>
            El régimen se clasifica con el número de Froude: subcrítico si Fr
            &lt; 1, crítico si Fr ≈ 1 y supercrítico si Fr &gt; 1. Se usa una
            tolerancia de 1 % alrededor de Fr = 1.
          </p>
          <p>
            En secciones circulares, la profundidad normal se resuelve en la
            rama de menor profundidad. El caudal máximo a superficie libre se
            alcanza cerca de y/D = 0,94; por encima de ese valor la curva de
            capacidad tiene dos ramas. Si el caudal supera la capacidad, se
            requiere un análisis de flujo a presión o aumentar el diámetro.
          </p>
          <p>
            La fórmula de Manning es empírica y supone flujo uniforme, sección
            constante y rugosidad distribuida. No verifica remanso, flujo
            gradualmente variado, resalto hidráulico, sedimentación, socavación,
            arrastre ni borde libre. Los resultados son orientativos: verifica
            la normativa y las condiciones de campo antes de usarlos en diseño.
          </p>
          <p>
            Referencia principal: Chow, V. T. Open-Channel Hydraulics.
            McGraw-Hill, 1959.
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
            toolId={openChannelFlowDefinition.info.id}
            toolName={openChannelFlowDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
