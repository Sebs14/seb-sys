```
 ┌─ SEB.SYS ──────────────────────────────────────────────┐
 │   ░▒▓ portafolio renderizado en caracteres ▓▒░         │
 └────────────────────────────────────────────────────────┘
```

Portafolio personal con estética de terminal: fondo oscuro, fósforo verde
y **todo** — layout, marcos, gráficos y hasta el 3D — dibujado con
caracteres.

## Cómo correrlo

```bash
npm install
npm run dev     # http://localhost:3000
```

## Las dos ideas que sostienen el diseño

### 1. Grilla de caracteres real

Lo que separa un sitio ASCII intencional de uno accidental es que todo se
alinee a una celda monoespaciada. Horizontal en unidades `ch`, vertical en
`--lh` (px exactos, definido en `app/globals.css`).

Los marcos **no** usan `border` de CSS: son glifos (`┌─┐│└┘`). Para que
sean responsivos, una tira larga de `─` vive dentro de un contenedor con
`overflow:hidden` y el navegador la recorta al ancho disponible. Como `─` y
`│` son glifos continuos, el corte a mitad de caracter es invisible.

> Nota de fuente: JetBrains Mono **no** incluye los box-drawing pesados
> (`┏━┓┃`). Caen a una fuente fallback con otro ancho de avance y parten la
> grilla. Si cambiás de fuente, revalidá antes de agregar esa variante.

### 2. ASCII por post-proceso en GPU

`components/three/ascii-pass.tsx` convierte la escena 3D en glifos en tres
pasos:

1. La escena se renderiza a un render target diminuto — **un texel por celda
   de caracter** (~190×40).
2. Un quad a pantalla completa lee cada texel, calcula su luminancia y elige
   el glifo correspondiente del atlas (`lib/glyph-atlas.ts`).
3. El glifo se pinta tintado según esa misma luminancia.

Deliberadamente no se usa el `AsciiEffect` de los ejemplos de Three.js: ese
genera un `<table>` del DOM con miles de nodos y se arrastra. Esto vive
entero en la GPU.

## Accesibilidad

El ASCII es decorativo y se trata como tal. Todo glifo animado va con
`aria-hidden`, y el texto real se expone en un nodo `sr-only` paralelo. Un
lector de pantalla nunca recibe la sopa de símbolos intermedia. El sitio
respeta `prefers-reduced-motion` y hay fallback estático si no hay WebGL.

## Dónde se edita el contenido

Todo en **`lib/content.ts`** — un solo archivo. Identidad, proyectos, stack,
experiencia y links. Los textos son pares `{ es, en }`; el toggle de idioma
vive en `lib/i18n.tsx`.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · react-three-fiber · motion
