# QA — seb.sys rediseño (2026-09-08)

Registro de qué se verificó, cómo y con qué límites. Los números vienen de
corridas reales en esta máquina; nada de estimaciones.

## Entorno

| Elemento        | Valor                                                         |
| --------------- | ------------------------------------------------------------- |
| Equipo          | MacBook con Apple M4, macOS (Darwin 25.5)                     |
| Node / npm      | 24.11.1 / 11.6.2 (lockfile regenerado y validado con npm 11.18.0) |
| Navegador E2E   | Chromium 153 (Playwright 1.63), proyectos `desktop` 1440×900 y `mobile` Pixel 7 390×844 |
| GPU en pruebas  | SwiftShader (software) en E2E; ANGLE Metal / Apple M4 en la sonda de rendimiento y Lighthouse |

## Instalación (BUG-09)

- Reproducido: con npm 11.18.0, `npm ci` sobre el lockfile de `39d2f64`
  fallaba con `Missing: @emnapi/runtime@1.11.3 / @emnapi/core@1.11.3`. Con
  npm 11.6.2 pasaba (por eso el fallo dependía del runtime).
- Lockfile regenerado con `npx npm@11.18.0 install`. `npm ci` verificado en
  carpetas limpias con **npm 11.6.2** y **npm 11.18.0**: instala y **no
  modifica** `package-lock.json`.
- `.nvmrc` = 24, `engines` y `packageManager` declarados.

## Checks automáticos

| Check                | Resultado                                                  |
| -------------------- | ---------------------------------------------------------- |
| `npm run lint`       | 0 errores, 0 avisos (excepción acotada a `components/three/**` para `react-hooks/immutability` y `react-hooks/refs`, documentada en `eslint.config.mjs`) |
| `npm run typecheck`  | limpio                                                     |
| `npm run test:unit`  | 29 pruebas (grafo, stack con evidencia, historial, parser, comandos) |
| `npm run build:pages`| export estático en `out/` con `basePath /seb-sys`          |
| `npm run test:e2e`   | ver abajo                                                  |

## E2E (Playwright, contra `out/` servido bajo `/seb-sys`)

| Proyecto | Resultado |
| -------- | --------- |
| desktop (1440×900) + mobile (Pixel 7) | **59 pasadas, 0 fallidas, 1 omitida** (la prueba de menú móvil sólo corre en `mobile`) — 1,6 min |

Corridas previas del mismo día fallaron por: contraste del índice en el
botón presionado (utilidad Tailwind ganándole a la regla de estado),
controles de 40 px (se subieron a 44), lectura de estadísticas antes de
que la escena asentara en SwiftShader y un `@ts-expect-error` sobrante.
Todo corregido; la última corrida quedó verde.

Cobertura por caso de la matriz: RELEASE-01/INT-01 (`smoke.spec`),
INT-01/INT-02 (`projects.spec`), TERM-01 (`terminal.spec`), A11Y-01 y
BUG-08 (`a11y.spec`, axe + teclado + reduced-motion + menú móvil),
GPU-01 (`gpu.spec`: sin WebGL 2, pérdida de contexto con reintento,
segunda pérdida → botón Reintentar, offscreen), CAM-01 (`webcam.spec`,
cámara simulada de Chromium).

## Rendimiento (PERF-01)

Sonda `scripts/probe-frames.mjs` leyendo `window.__sebStats` (cuadros
renderizados por la escena, `gl.info`), 1440×900.

| Medición (GPU real, ANGLE Metal / Apple M4, dpr 1.5)     | Núcleo | Sistemas | ASCII |
| -------------------------------------------------------- | -----: | -------: | ----: |
| Draw calls tras asentar                                  | 14     | 15       | 16    |
| Triángulos                                               | 18 284 | 18 492   | 18 494 |
| Cuadros/s durante la transición de modo                  | 60     | 60       | 60    |
| Celdas ASCII (1440×900, celda 7 px)                      | —      | —        | 82 × 46 |
| Cuadros/s arrastrando                                    | 60 |||
| Cuadros/s en reposo tras asentar                         | **0** (render a demanda) |||

Con SwiftShader (software, lo que usa el E2E) la transición a ASCII baja
a 13–27 cuadros/s y la de Sistemas a ~47; sirve para probar
comportamiento, no rendimiento. Presupuesto de la spec: < 80 draw calls
y < 150 000 triángulos en alta. Fuera del viewport o con la pestaña
oculta: 0 cuadros (medido). Archivos: `docs/evidence/perf-gpu-metal.json`
y `perf-swiftshader.json`.

Lighthouse 13 móvil (simulación: CPU ×4, 1.6 Mbps / 150 ms RTT), GPU real:

| Métrica            | Valor  |
| ------------------ | ------ |
| Performance        | **91** |
| Accessibility      | 100    |
| Best practices     | 100    |
| SEO                | 100    |
| FCP / LCP (simulados) | 0,9 s / 3,2 s |
| LCP observado (sin simulación) | 95 ms |
| CLS                | 0      |
| TBT                | 170 ms |
| Speed Index        | 1,7 s  |
| Transferencia total | 653 KB (gzip) |

Antes de dos ajustes la misma corrida daba 48–50: el servidor local no
comprimía (1,9 MB "en el aire", cosa que Pages sí comprime) y la fuente
Inter en `swap` producía un repintado tardío del `h1`. Ahora
`scripts/serve-pages.mjs` sirve gzip y la fuente va en `optional`.
Archivo: `docs/evidence/lighthouse-mobile.json`.

Lectura: el LCP es el `h1`; con la fuente en `display: optional` no hay
repintado tardío. El TBT lo domina la evaluación del chunk de Three
(~2 s bajo CPU ×4 ≈ 0,5 s reales); la escena se monta tras `load` +
`requestIdleCallback`, así el texto y los CTA no la esperan. Los scores
son de una corrida simulada, no datos de campo; INP no se reporta porque
no hay medición de campo.

## Contraste (BUG-08)

Medido con `scripts/contrast.mjs`; tabla en `DESIGN.md`. Mínimo en texto
informativo: `ink-3` sobre `raised` 5.8:1. Verificado también por axe en
E2E (0 violaciones serias/críticas).

## Manual / visual

Capturas en `docs/evidence/final/` (portada a 1440, 1280, 768, 390 y
320; Sistemas y ASCII; proyecto abierto; terminal; laboratorio; fallback
sin WebGL; zoom 200 %; movimiento reducido). Antes del rediseño:
`docs/evidence/before/`.

## Limitaciones conocidas

- El flash de idioma para visitantes con navegador en inglés dura un
  cuadro tras hidratar (decisión documentada en DESIGN.md).
- La sonda de rendimiento y Lighthouse corren en un M4; no hay medición
  en un móvil físico. La calidad adaptativa baja de nivel tras 40 cuadros
  lentos y como máximo dos veces por sesión.
- La cámara en E2E es simulada por Chromium; no se probó con hardware
  real en esta sesión.
- El workflow de CI existe pero el token actual del repo no tiene scope
  `workflow`; publicar los workflows requiere `gh auth refresh -s workflow`.
