<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Civil Toolkit

Aplicación Next.js 16 (App Router) + Supabase para herramientas de ingeniería civil. La UI y los mensajes van en español; los cálculos estructurales siguen la NSR-10.

## Comandos

- `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`.
- Un solo test: `npx vitest run lib/estructuras/nsr10.test.ts`.
- Verificación antes de cerrar un cambio: `npm run lint && npm run typecheck && npm test && npm run build`.
- Vitest solo recoge `lib/**/*.test.ts` con entorno `node`: no hay tests de componentes ni jsdom.
- Prettier: sin punto y coma, comillas dobles, 2 espacios y orden de clases Tailwind. El repo no está formateado por completo, así que formatea solo los archivos tocados (`npx prettier --write <archivo>`); no ejecutes `npm run format` sobre todo el repo.

## Arquitectura

- `app/(dashboard)/` es el shell autenticado (`AuthGuard`, sidebar); `app/login` y `app/register` son públicas.
- `proxy.ts` (no `middleware.ts`; Next 16 renombró la convención) valida la sesión con `supabase.auth.getUser()`. Nunca uses `getSession()` en el servidor.
- `.env.local` requiere `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clave publishable, no la anon).
- Los módulos de datos de cliente llevan `"use client"`: `lib/projects.ts`, `lib/tasks.ts`, `lib/calculations.ts`. En Server Components usa las variantes `lib/*-server.ts` (`getAllProjects`, `getCalculationById`, etc.).
- Las consultas no filtran por `owner_id`: la RLS de Supabase lo hace. No agregues filtros manuales ni desactives RLS.
- No hay carpeta de migraciones local; el esquema vive en el proyecto remoto de Supabase. Inspecciona las tablas antes de cualquier DDL.
- En páginas App Router, `params` y `searchParams` son `Promise`: usa `await params` / `await searchParams`.

## Herramientas y cálculos

- Cada herramienta vive en `lib/tools/<id>/`: `schema.ts` (Zod), `calculate.ts` (función pura), `definition.ts` (`ToolDefinition`) y un componente en `components/tools/`.
- `ToolDefinition.toSnapshot` es obligatorio; `validate` se crea con `createValidator(schema)`; `hydrateInput` es opcional.
- Registrar una herramienta nueva exige: añadir su `ToolInfo` a `TOOL_CATALOG` (`lib/tools/catalog.ts`), crear la definición, crear el componente y registrarlo a mano en `TOOL_COMPONENTS` de `components/tools/tool-renderer.tsx`. El campo `component` de `ToolDefinition` existe pero el renderer no lo usa.
- Todas las herramientas se listan en `/herramientas` (secciones por categoría con anchors `#<slug>`); el detalle de cada herramienta es `/herramientas/<toolId>`. `ToolInfo.category` define la sección y el enlace "volver".
- Los componentes de herramienta reciben `ToolComponentProps` (`initialInput`, `editMode`) y deben hidratar el estado con inicializadores de `useState`, no con `useEffect` (regla `react-hooks/set-state-in-effect`).
- Edición: `/herramientas/<toolId>?edit=<calculationId>` carga el cálculo guardado y usa `UpdateCalculationButton` para actualizar el mismo registro. Toda herramienta nueva debe soportar este contrato para ser editable.
- Favoritas y recientes se guardan en `localStorage` (`lib/tools/preferences.ts`) y se comparten vía `useToolPreferences`; no requieren cambios en Supabase.
- Los formularios usan schemas Zod de `lib/schemas/`; los inputs numéricos de herramientas pasan por `parseNumericInput` (acepta coma decimal).

## UI

- shadcn/ui con estilo `base-vega` sobre **Base UI** (`@base-ui/react`), no Radix. Para renderizar algo distinto de `<button>`, usa `render={<Link ... />}` junto con `nativeButton={false}`.
- Añadir primitivas: `npx shadcn@latest add <componente>` (se crean en `components/ui/`).

## Normativa de diseño — NSR-10

Todo cálculo estructural se rige por la **NSR-10** (Reglamento Colombiano de Construcción Sismo Resistente):

- Citar siempre la sección o tabla exacta de la NSR-10 en el código, la UI y los tests (p. ej. `Tabla C.9.5(a)`, `C.21.5.1.3`).
- Usar unidades SI: longitudes en m y mm, esfuerzos en MPa, fuerzas en kN.
- Centralizar tablas, factores y citas reutilizables en `lib/estructuras/` y cubrirlos con tests (vitest) que validen los valores normativos.
- Cada herramienta declara su norma en el campo `reference` de `ToolInfo` (se muestra en `ToolShell`).
- Marcar todo predimensionado como orientativo y recordar la verificación de deflexiones y resistencia.

Referencias ya implementadas: `lib/estructuras/nsr10.ts` (control de deflexiones, Tabla C.9.5(a) y CR.9.5; anchos mínimos sísmicos C.21.5.1.3 / C.21.3.4 / C.21.2).
