# DESIGN.md — seb.sys

Dirección: **negro puro, tipografía apretada y un solo acento**. Tomada
de la estética de Planes (useplanes.com): la superficie no compite, y lo
que se mueve es el titular, la escultura y lo que el visitante toca.
Ningún componente de Planes está instalado: cada efecto se escribió acá
desde cero. Este documento describe lo construido, no una maqueta.

## Idea rectora

La portada es una sola idea: el titular **es** la imagen. Seda líquida
fluye dentro de las letras (WebGL propio) y con un clic cambia de
paleta. Debajo, una esfera de puntos partida en siete regiones (una por
proyecto) vive en un **escenario**: un marco de doble bisel, como una
pieza en exhibición, con un índice de proyectos dibujado como regla. El
resto es lectura tranquila sobre negro. La terminal y el laboratorio
conservan el fósforo verde: es su carácter, no el del sitio.

## Tokens

Definidos una vez en `app/globals.css` (`@theme`).

| Token                   | Valor     | Uso                                        |
| ----------------------- | --------- | ------------------------------------------ |
| `--color-base`          | `#000000` | fondo                                      |
| `--color-section`       | `#060607` | superficies apenas elevadas                |
| `--color-raised`        | `#0B0B0E` | núcleo de tarjetas y paneles               |
| `--color-stroke`        | `#1F1F24` | filetes (los bordes de tarjeta son blanco 7–9 %) |
| `--color-ink`           | `#F5F5F7` | títulos, texto principal, botón primario   |
| `--color-ink-2`         | `#A1A1A8` | descripciones                              |
| `--color-ink-3`         | `#85858C` | metadatos                                  |
| `--color-accent`        | `#5B8CFF` | cobalto: marca activa, filetes de antetítulo, foco de la escena |
| `--color-accent-strong` | `#2F6BFF` | selección de texto                         |
| `--color-accent-soft`   | `#B6D6FF` | anillo de foco, índice activo              |
| `--color-phosphor-*`    | verde/ámbar | terminal, ASCII y laboratorio            |

`theme amber` sólo redefine los tokens `--color-phosphor-*`.

Contrastes medidos (WCAG, `node scripts/contrast.mjs`):

| Par                       | Sobre `base` | Sobre `section` | Sobre `raised` |
| ------------------------- | -----------: | --------------: | -------------: |
| `ink` `#F5F5F7`           | 19.3:1       | 18.6:1          | 18.1:1         |
| `ink-2` `#A1A1A8`         | 8.2:1        | 7.9:1           | 7.7:1          |
| `ink-3` `#85858C`         | 5.7:1        | 5.5:1           | 5.4:1          |
| `accent` `#5B8CFF`        | 6.6:1        | 6.4:1           | 6.2:1          |
| `accent-soft` `#B6D6FF`   | 14.1:1       | 13.6:1          | 13.2:1         |
| `phosphor-dim` (arte)     | 6.0:1        | 5.8:1           | 5.6:1          |
| texto `#0B0B10` sobre botón `ink` | 18.0:1 |               |                |

`stroke` (1.3:1) es sólo borde decorativo, nunca texto.

## Tipografía

- Texto: `-apple-system, BlinkMacSystemFont, Inter, Segoe UI…` (Inter
  autoalojada con `next/font`). Mono: JetBrains Mono, sólo en terminal,
  metadatos, chips y ASCII.
- Titular líquido: 700, tracking −0.045em, interlineado 1.02, tamaño
  `clamp(42px, 0.4rem + 9.6vw, 104px)`.
- h2 30→52 (600, −0.04em, lh 1.05); h3 20→24; lead 17→20; cuerpo 16→17
  (lh 1.65); ui 14; meta 12 en mono con tracking +0.04em.
- Antetítulo de sección: un filete cobalto de 24 px y el nombre en
  `ink-3`; es la misma marca que el índice con regla.

## Superficies

- Contenido 1200 px máx.; gutter 16/20/32/48.
- **Doble bisel** (`bezel` + `bezel-core`): marco de 5 px con borde
  blanco 7 % y núcleo `raised` con borde 8 % y luz superior interna. El
  radio del núcleo se **deriva** del marco (`20 − 5`) para que las curvas
  sean concéntricas. Se usa en el escenario, los esquemas de sistema y la
  ficha "De un vistazo".
- `panel`: tarjeta de una capa (laboratorio).
- Botones radio 10: primario blanco con canto inferior (`inset 0 −2px`)
  y sombra corta; secundario blanco 5 % con borde 14 % y luz superior.
- Fondo: retícula de puntos de 22 px que se disuelve con una máscara
  radial (portada y laboratorio) y grano estático en la portada.
- Blur sólo en la barra de navegación y la terminal (`glass`).

## Composición

- **Navegación**: una píldora translúcida centrada: marca (siete puntos
  en círculo, uno en cobalto), filete, enlaces, filete, idioma, terminal y
  Contacto en blanco. En móvil ocupa el ancho con menú desplegable.
- **Portada**: centrada y a pantalla completa. Pastilla con nombre y rol,
  titular líquido en dos renglones fijos, bajada y dos acciones. Detrás,
  un resplandor radial que **toma el color de la paleta activa**
  (`@property --glow` animable, 900 ms).
- **Escenario** (`#explore`): escritorio con índice (regla) y controles a
  la izquierda, escena a la derecha y la ficha del proyecto en una franja
  de ancho completo que reserva su altura (elegir otro proyecto no mueve
  la página). Móvil: escena, controles, índice, ficha.
- **Casos destacados**, **Más trabajo**, **Enfoque y stack**,
  **Experiencia** y **Laboratorio**: el mismo contenido de antes sobre
  negro continuo; viñetas como trazo corto, no puntos de color.
- **Contacto**: centrado, con el nombre como titular líquido en aluminio.
- **Pie**: créditos y, debajo, la marca `seb.sys` gigante con degradado
  al negro, cortada por el borde de la página.

## El titular líquido (`components/fx/liquid-headline.tsx`)

- El texto es HTML real (lector de pantalla, buscador, LCP). Encima va un
  canvas WebGL 1 del tamaño de la caja más un margen de 0.22 em para las
  colas.
- **Máscara**: cada carácter se ubica con un `Range` del DOM y se dibuja
  en un canvas 2D en esa posición; así el canvas respeta kerning,
  tracking y saltos de línea del navegador. Sube como textura.
- **Shader**: ruido de gradiente con interpolación quíntica, fbm de tres
  octavas rotadas y doble deformación de dominio, en unidades de "em"
  (flujos anchos, sin grano). Bandas lentas de pliegue, rampa de tres
  colores y una normal por derivadas en pantalla (acotada para evitar
  chispas) para un brillo suave.
- **Interacción**: el puntero empuja la tela (remolino gaussiano); clic
  pasa a la siguiente paleta con mezcla de 900 ms y un remolino breve.
  Paletas: cobalto, aluminio, violeta, fósforo.
- **Costo**: el contexto se crea cuando el titular se acerca a la
  pantalla (el del contacto no compite con la carga); dibuja sólo
  visible y con la pestaña activa; DPR máx. 1.75.
- **Respaldo**: sin WebGL, con render por software (SwiftShader,
  llvmpipe: compilar y dibujar el shader en CPU frenaba el scroll y la
  escena), antes del primer cuadro o con contexto perdido, el texto se
  ve con un degradado CSS de la misma paleta. Con movimiento reducido o
  si la máquina no sostiene ~24 fps durante 40 cuadros, se queda en un
  cuadro fijo; el clic sigue cambiando la paleta. `forced-colors`
  muestra el texto plano.

## La escena

Una **esfera de puntos** (`components/three/dot-sphere.tsx`, geometría
pura en `lib/dot-sphere.ts`) reemplazó al anillo de aluminio: el metal
cromado no iba con la estética.

- **Núcleo**: espiral de Fibonacci (2200 / 1600 / 1100 puntos según el
  nivel) sobre una esfera de radio 1.35, repartida entre siete semillas
  (una por proyecto). Los puntos de la frontera se quitan (diferencia de
  coseno < 0.085): esa franja vacía es la junta entre regiones. La región
  elegida se pinta cobalto, se agranda y se asoma un 4.5 %; la de abajo
  del puntero se aclara. Una marca circular de 1 px señala cada región.
- **Elegir un proyecto gira la esfera** por la vuelta más corta hasta
  mostrar su región de frente (`facingSpin`); esa es también la vista a
  la que vuelve "Restablecer". Al cargar ya arranca mirando a la elegida.
- **Sistemas**: los MISMOS puntos se contraen en siete cúmulos esféricos
  (radio 0.24) que viajan a los nodos del grafo; un solo resorte
  (`rig.spread`) interpola en el shader. Las tecnologías compartidas son
  líneas de puntos; las del proyecto elegido, cobalto.
- **Toque**: en Núcleo responde la esfera entera (el punto tocado se
  lleva a la región más cercana); en Sistemas, los cúmulos. Las zonas de
  toque son mallas invisibles.
- **Sin luces ni entorno**: todo es `Points` con `ShaderMaterial`. El
  tamaño del punto se pide en unidades de escena y se convierte a píxeles
  del destino actual en `onBeforeRender`, así que el mismo material sirve
  en el canvas y en el render target de una celda por texel del ASCII
  (donde los puntos crecen ×2.6 para registrar luminancia).
- Sin cambios en ASCII, cámara, render a demanda, recuperación de
  contexto ni niveles de calidad. No dibuja hasta que el visitante llega
  al escenario.

## Movimiento de interfaz

- Botones: `:active` escala 0.97; hover 160 ms sólo con `hover: hover`.
- Índice con regla: la marca elegida se alarga de 14 a 30 px y el nombre
  se corre 18 px (240 ms).
- Disclosures: `grid-template-rows 0fr → 1fr`, 260 ms.
- `prefers-reduced-motion`: además del CSS, la preferencia vive en
  `lib/use-motion-preference` y la consultan la escena, el titular, la
  terminal y los efectos.

## Decisiones tomadas en la implementación

- Paleta oscura única (sin tema claro).
- El titular líquido es propio, no el de Planes (componente de pago): se
  reprodujo el efecto a partir de cómo se ve, sin leer su código.
- La escultura dejó la portada: la portada es tipográfica y la escena
  vive en su escenario. El laboratorio ("Probar ASCII", "Usar cámara")
  lleva al escenario en vez de a la parte superior.
- `cd explorar` en la terminal lleva al escenario.
