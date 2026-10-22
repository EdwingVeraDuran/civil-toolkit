<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Normativa de diseño — NSR-10

Todo cálculo estructural del proyecto se rige por la **NSR-10** (Reglamento Colombiano de Construcción Sismo Resistente). Reglas al implementar herramientas de estructuras:

- Citar siempre la sección o tabla exacta de la NSR-10 en el código, la UI y los tests (p. ej. `Tabla C.9.5(a)`, `C.21.5.1.3`).
- Usar unidades SI: longitudes en m y mm, esfuerzos en MPa, fuerzas en kN.
- Centralizar tablas, factores y citas reutilizables en `lib/estructuras/` y cubrirlos con tests (vitest) que validen los valores normativos.
- Cada herramienta declara su norma en el campo `reference` de `ToolInfo` (se muestra en `ToolShell`).
- Marcar todo predimensionado como orientativo y recordar la verificación de deflexiones y resistencia.

Referencias ya implementadas: `lib/estructuras/nsr10.ts` (control de deflexiones, Tabla C.9.5(a) y CR.9.5; anchos mínimos sísmicos C.21.5.1.3 / C.21.3.4 / C.21.2).
