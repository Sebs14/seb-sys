# DESIGN.md — seb.sys

Dirección: **obsidiana, aluminio y fósforo**. Un estudio oscuro, un objeto
de aluminio que se puede tocar y separar, y un acento verde fósforo que
sólo aparece donde hay interacción o laboratorio. Este documento describe
lo construido, no una maqueta.

## Idea rectora

El visitante entra a un pequeño estudio de ingeniería. En el centro hay un
anillo de siete segmentos de aluminio; cada segmento es un proyecto real.
En **Núcleo** el objeto está compacto. En **Sistemas** las piezas viajan a
un grafo cuyas aristas son tecnologías compartidas de verdad (por `tags`
exactos). En **ASCII** el mismo objeto pasa por el shader de glifos. La
lectura alrededor tiene la calma de una presentación de producto; la
terminal y el laboratorio aportan el carácter.

## Tokens

Definidos una vez en `app/globals.css` (`@theme`).

| Token                   | Valor     | Uso                                   |
| ----------------------- | --------- | ------------------------------------- |
| `--color-base`          | `#090B0D` | fondo principal                       |
| `--color-section`       | `#111417` | secciones alternas                    |
| `--color-raised`        | `#1A1E22` | paneles y controles                   |
| `--color-stroke`        | `#303840` | divisiones y bordes                   |
| `--color-ink`           | `#F5F6F7` | títulos y texto principal             |
| `--color-ink-2`         | `#B8BEC5` | descripciones                         |
| `--color-ink-3`         | `#8F99A3` | metadatos                             |
| `--color-accent`        | `#9EF5B5` | acento; fondo del botón primario      |
| `--color-accent-strong` | `#54DF86` | hover/activo                          |
| `--color-focus`         | `#B6FFD0` | anillo de foco                        |
| `--color-amber`         | `#FFD28B` | avisos                                |
| `--color-error`         | `#FF9D9D` | errores                               |
| `--color-phosphor-*`    | verde/ámbar | terminal, ASCII y laboratorio       |

`theme amber` sólo redefine los tokens `--color-phosphor-*`; los párrafos y
el metal no cambian. El texto sobre el botón verde es `--color-base`.

Contrastes medidos (relación WCAG, calculada con la fórmula de luminancia
relativa; ver `scripts/contrast.mjs`):

| Par                                | Sobre `base` | Sobre `section` | Sobre `raised` |
| ---------------------------------- | -----------: | --------------: | -------------: |
| `ink` `#F5F6F7`                    | 18.2:1       | 17.1:1          | 15.5:1         |
| `ink-2` `#B8BEC5`                  | 10.5:1       | 9.9:1           | 9.0:1          |
| `ink-3` `#8F99A3` (metadatos 13 px)| 6.8:1        | 6.4:1           | 5.8:1          |
| `accent` `#9EF5B5`                 | 15.2:1       | 14.2:1          | 12.9:1         |
| `accent-strong` `#54DF86`          | 11.5:1       | 10.8:1          | 9.8:1          |
| `amber` `#FFD28B`                  | 13.9:1       | 13.1:1          | 11.9:1         |
| `error` `#FF9D9D`                  | 9.9:1        | 9.3:1           | 8.4:1          |
| `phosphor-dim` `#3F9A63` (arte)    | 5.7:1        | 5.3:1           | 4.8:1          |
| `base` sobre botón `accent`        | 15.2:1       |                 |                |

`stroke` (1.7:1) es sólo borde decorativo, nunca texto. La barra
translúcida usa `rgb(9 11 13 / 0.78)` sobre fondos que van de `base` a
`section`: el peor caso efectivo para `ink-2` es ~9.9:1.

## Tipografía

- Texto: `-apple-system, BlinkMacSystemFont, Inter, Segoe UI…`. Inter se
  autoaloja con `next/font` (no se distribuye SF Pro).
- Mono: JetBrains Mono, sólo en terminal, metadatos técnicos, chips y ASCII.
- Escala fluida (`clamp`): display 44→88 px, lh 1.04, tracking −0.035em;
  h2 32→56; h3 22→28; lead 19→22; cuerpo 17→20 con lh 1.6; ui 15;
  meta 13. `rem` en todo; el zoom del navegador funciona.
- Títulos con `text-wrap: balance`; párrafos a la izquierda, 60–72
  caracteres (`.measure`).

## Espaciado y superficies

- Contenido 1240 px máx.; gutter 16/20/32/64 px según ancho.
- Escala 4·8·12·16·24·32·48·64·96·128 (`--s-*`); separación de secciones
  `clamp(64px, 4vw + 40px, 128px)`.
- Paneles radio 16; controles cápsula; botones ≥ 44 px (primario 48).
- Blur sólo en la barra de navegación y la terminal (`.glass`);
  `prefers-reduced-transparency` los vuelve sólidos.
- Sin retícula ni scanlines sobre la lectura: el CRT es un modo del
  laboratorio.

## Composición

- **Portada** (≥1024): copy a la izquierda (≤480 px, alineado arriba),
  escena a la derecha (~60 % del ancho, 460–540 px de alto), debajo el
  selector Núcleo/Sistemas/ASCII, Pausar y Restablecer, y siete botones,
  uno por pieza. La ficha del proyecto seleccionado cierra la columna
  izquierda. En móvil: copy y CTA, escena (340–400 px), controles, botones,
  ficha.
- **Casos destacados**: dos bloques alternados; texto (contexto, decisión,
  evidencia, tecnologías) y un esquema SVG del sistema con etiquetas
  reales. Detalle completo con disclosure accesible.
- **Más trabajo**: lista editorial de cinco, cada fila se expande en el
  lugar y conserva su estado al cambiar idioma.
- **Enfoque y stack**: tres párrafos, ficha en lista de definición, y el
  stack por categorías con los proyectos donde aparece cada tecnología.
- **Experiencia**: fecha, empresa, rol y contribuciones existentes.
- **Laboratorio**: terminal, ASCII, cámara, CRT, gato y comandos, todo
  voluntario.
- **Contacto**: correo seleccionable con copiar, GitHub y LinkedIn.

## La escena

- Anillo radio 1.35, siete arcos de 2π/7 con junta de 0.045 rad; sección
  redondeada 0.34 × 0.12 (radio de esquina 0.042); ondulación axial 0.16
  con fase distinta por pieza; inclinación 24° + 12°.
- Geometría: 64 segmentos × 16 puntos de perfil en calidad alta (48×12
  media, 32×10 baja), tapas incluidas, tangentes calculadas para la
  anisotropía. Una geometría por pieza, construida una vez por nivel.
- Material: `MeshPhysicalMaterial` color `#DDE2E7`, metalness 1, roughness
  0.30, anisotropy 0.55, sin clearcoat. Entorno PMREM procedural: sala
  oscura, softbox superior, tira lateral fría, relleno cálido bajo y una
  tira de fósforo tenue detrás. Tres direccionales para los cantos.
- Marca de selección: un pequeño inserto emisivo en la cara superior de
  cada pieza (opacidad 0.18 → 1 al seleccionar). Hover: emisivo 0.18 y
  roughness más baja (reflejo más nítido).
- Modos: `spread` (0 anillo → 1 grafo) es un resorte compartido; cada
  pieza interpola posición y orientación entre `ringPose` y `graphPose`
  (escala 0.78 en el grafo, arcos mirando a la cámara con inclinación distinta por pieza) y llega con resortes (`stiffness 92, damping
  18.5`). Aristas: una `InstancedMesh` de cilindros que sigue a las
  piezas; las conectadas a la selección van en acento, el resto gris.
- Cámara: fov 34, encuadre por esfera envolvente y relación de aspecto,
  distancia con resorte. Arrastre con umbral de 8 px, captura de puntero,
  un contacto a la vez, inercia amortiguada (`e^(−3.2·dt)`), `touch-action:
  pan-y`.
- ASCII: celda 7/8/9 px según calidad; render target de un texel por celda;
  transición 0→1 con resorte; el color de salida pasa una vez por
  `colorspace_fragment`; luminancia comprimida con `1 − e^(−2.4·L)`.
- Render a demanda en todo momento; `frameloop="never"` fuera de pantalla
  o con la pestaña oculta. El parpadeo de luminancia del ASCII vive 4 s
  después de la última interacción y luego la escena reposa.
- El Canvas se monta tras `load` + `requestIdleCallback` (tope 600 ms):
  el texto y los CTA nunca esperan a la GPU; el fallback SVG ocupa la
  caja mientras tanto, sin cambiar la altura. DPR máximo 1.5 / 1.25 / 1 por nivel; el nivel
  baja (máximo dos veces por sesión) tras 40 cuadros lentos consecutivos.
- Entrada: las piezas arrancan 0.32 unidades afuera, giradas ±0.2 rad y
  a escala 0.92; asientan en ~800 ms. Con movimiento reducido o pausa, todo
  se coloca de golpe y el shader no avanza.

## Movimiento de interfaz

- Botones: `:active` escala 0.97; hover 160 ms sólo con `hover: hover`.
- Disclosures: `grid-template-rows 0fr → 1fr`, 260 ms; sin medir alturas.
- Terminal: entrada con resorte 170/26/1 desde 16 px y escala 0.98; con
  movimiento reducido, fundido de 120 ms.
- Cambio de idioma: no reproduce entradas ni vacía la página.
- `prefers-reduced-motion`: además del CSS, la preferencia vive en
  `lib/use-motion-preference` y la consultan la escena, la terminal y los
  efectos.

## Decisiones tomadas en la implementación

- Paleta oscura (la variante clara no se confirmó; queda como decisión de
  diseño documentada).
- Se retiró `@react-three/drei` al no necesitarse: el entorno se genera con
  `PMREMGenerator` de Three y las luces son nativas.
- Los ASCII "frames", el rail de scroll, las barras de nivel y los efectos
  de tipeo/scramble del hero se eliminaron con la estética anterior. La
  terminal conserva su cola de tipeo.
- Idioma inicial determinista (español). La preferencia guardada o del
  navegador se aplica tras hidratar, con un flash de un cuadro para
  visitantes en inglés. Se prefirió eso a ocultar el contenido.
- Los efectos recreativos (`matrix`, `sl`, `vim`, `screensaver`,
  `poweroff`) se excluyen entre sí y tienen salida visible. El gato y el
  salvapantallas ya no se activan solos.
