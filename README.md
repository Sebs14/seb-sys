# seb.sys

Portafolio de **Sebastián Flores**, ingeniero de software en El Salvador.
Publicado en <https://sebs14.github.io/seb-sys/>.

Una escultura Three.js de siete piezas de aluminio, una por proyecto, que
se abre en el mapa de los sistemas que ha construido y puede verse como
ASCII. El texto, la navegación y la terminal son HTML. Los tres modos
— **Núcleo**, **Sistemas** y **ASCII** — son estados del mismo objeto,
no tres demos.

## Requisitos

| Herramienta | Versión                                   |
| ----------- | ----------------------------------------- |
| Node        | 24 LTS (`.nvmrc`)                          |
| npm         | ≥ 11.6 (lockfile validado con npm 11.18.0) |

El lockfile se regeneró con `npm@11.18.0` porque versiones anteriores
omitían las entradas de `@emnapi/*` que npm ≥ 11.18 exige. `npm ci` pasa
con 11.6.2 y con 11.18.0 sin modificar el lockfile. Para cambiar
dependencias usar `npx npm@11.18.0 install …` (o npm ≥ 11.18).

## Scripts

```bash
npm ci                 # instalación reproducible
npm run dev            # http://localhost:3000
npm run lint           # ESLint (flat config de Next 16)
npm run typecheck      # next typegen + tsc --noEmit
npm run test:unit      # Vitest: grafo, stack, historial, parser, comandos
npm run build:pages    # export estático con basePath /seb-sys → out/
npm run serve:pages    # sirve out/ en http://localhost:4173/seb-sys/
npm run test:e2e       # Playwright contra el export servido (requiere build:pages)
npm run check          # lint + typecheck + unit + build:pages
scripts/qa-run.sh      # build + E2E + sonda de rendimiento + Lighthouse + capturas
```

`scripts/serve-pages.mjs` sirve `out/` con gzip para que las mediciones
locales se parezcan a Pages. Resultados y límites en `docs/QA.md`.

`build` (sin `GITHUB_PAGES`) sigue produciendo un build normal para
desarrollo local en `/`.

## Estructura

```
app/                    layout (fuentes, metadatos), página, 404, iconos
components/portfolio/   navegación, portada, explorador, casos, lista,
                        enfoque/stack, experiencia, laboratorio, contacto
components/three/       scene-shell (estado y recuperación), portfolio-scene
                        (Canvas), core-assembly (7 piezas), studio-environment,
                        scene-controls, ascii-pass, webcam-plane, fallback
components/ascii/       terminal y experiencias voluntarias (gato, matrix,
                        tren, vim, salvapantallas, poweroff, CRT)
lib/                    content.ts (única fuente de contenido), i18n,
                        project-graph, expertise, scene-config, spring,
                        terminal/ (parser, historial, comandos puros)
tests/unit              Vitest      tests/e2e   Playwright
scripts/                serve-pages, capturas, generación de iconos/OG
```

## Dónde se edita el contenido

Todo en **`lib/content.ts`**: identidad, proyectos, casos destacados,
stack, experiencia y enlaces. Los textos son pares `{ es, en }`. Las
etiquetas de interfaz viven en `lib/i18n.tsx`.

Las aristas del mapa se calculan desde `projects[].tags` por coincidencia
exacta; el stack muestra en qué proyectos aparece cada tecnología, no
porcentajes.

## Cómo funciona la escena

- **Una sola instancia WebGL**, render a demanda: cada parte pide cuadros
  mientras algo se mueve y deja de pedirlos al asentar. Fuera de pantalla
  o con la pestaña oculta no dibuja.
- **Siete piezas** procedurales (sección redondeada barrida por un arco)
  con `MeshPhysicalMaterial` metálico y un entorno PMREM generado en el
  cliente. Sin HDR remoto.
- **Sistemas**: las piezas viajan a las posiciones de un grafo
  determinista; las aristas son una malla instanciada.
- **ASCII**: post-proceso en GPU, un texel por celda de caracter y un
  atlas de glifos de JetBrains Mono. La transición material → ASCII usa un
  segundo render sólo durante la mezcla.
- **Recuperación**: pérdida de contexto → fallback en la misma caja, un
  reintento automático y botón "Reintentar 3D". Sin WebGL 2, la escultura
  se muestra como SVG y la lista HTML de proyectos hace lo mismo.
- **Movimiento reducido** y "Pausar movimiento" detienen resortes,
  shader y efectos; todo se dibuja en su estado final.

## Terminal y laboratorio

`~` abre la terminal (también hay botones). Comandos: `help ls cd open cat
whoami neofetch lang htop theme mode matrix webcam coffee sl screensaver
vim poweroff clear exit`. Los efectos no se encienden solos; el modo CRT y
el gato se activan desde el laboratorio. La cámara pide permiso sólo al
tocar el botón y el video no sale del navegador.

## Publicación

GitHub Pages sirve `out/` bajo `/seb-sys`. `next.config.ts` activa
`output: "export"`, `basePath` y `assetPrefix` sólo con `GITHUB_PAGES=true`.
`.github/workflows/ci.yml` valida (lint, tipos, unit, build, E2E) con
permisos de solo lectura; `pages.yml` publica desde `main`. Nota: el
token actual del repo no tiene el scope `workflow`, así que subir cambios
a los workflows requiere `gh auth refresh -s workflow` antes.

Ver `DESIGN.md` para las decisiones visuales y `PRODUCT.md` para el
contexto del producto.
