# seb.sys — especificación de rediseño e implementación

Fecha: 8 de septiembre de 2026. Base inspeccionada: `39d2f64`.

Este documento es un encargo ejecutable para Claude u otro agente de implementación. Describe el resultado completo, el orden de trabajo, los archivos afectados y las condiciones de aceptación. No es un registro de funcionalidades ya construidas.

## 1. Encargo y estado real

### Lo que pidió Sebastián

Aplicar todas las mejoras de la revisión y transformar su portafolio en una página más entretenida, con personalidad, con un acabado comparable al de Apple y con un uso ambicioso de Three.js.

La referencia Apple se debe traducir en composición, tipografía, materiales, respuesta inmediata, movimiento físico y ejecución consistente. La experiencia debe seguir siendo reconocible como el portafolio de Sebastián.

### Lo que ya se hizo

- Se inspeccionaron el código y el sitio publicado, incluyendo escritorio y móvil.
- Se actualizó este checkout mediante fast-forward: pasó de `ec0ebaa` a `39d2f64`, después de consultar el remoto.
- Se creó `PRODUCT.md` con el contexto del producto.
- Se identificaron y reprodujeron fallos concretos, detallados más adelante.

### Lo que NO está implementado

Al redactar esta spec, `git status --short` mostraba únicamente `PRODUCT.md` sin seguimiento. No hay un rediseño parcial, cambios de componentes, correcciones del lockfile, pruebas nuevas ni CI implementado en este checkout. Un intento de delegar la preparación técnica terminó por límite de uso antes de entregar cambios.

El trabajo debe continuar en `/Users/sebasflores/orca/seb-sys`. Hay otro worktree en `/Users/sebasflores/orca/workspaces/seb-sys/prowfish`; no editarlo en paralelo ni asumir que sus dependencias son la instalación de este checkout.

### Decisiones confirmadas y decisiones propuestas

Confirmado por el usuario: acabado Apple, personalidad propia, Three.js protagonista, correcciones de la revisión, portafolio funcional y entretenido.

Dirección propuesta para ejecutar: **obsidiana, aluminio y fósforo**, con una escultura de siete piezas que representa los siete proyectos. Se preguntó por una variante oscura o clara, pero no se recibió respuesta. Por eso la paleta oscura es una decisión de diseño de esta spec, no una preferencia expresamente confirmada por Sebastián.

No existe una maqueta visual aprobada. Las medidas y reglas siguientes son la referencia de construcción. Si se produce una maqueta durante la implementación, debe respetar este contenido, estos estados y esta interacción; una imagen estática no sustituye la escena real.

## 2. Resultado que debe entregar el agente

Una versión completa, navegable y probada del portafolio, con:

1. Una portada editorial limpia y una escultura Three.js de calidad visual alta.
2. Tres presentaciones del mismo sistema: **Núcleo**, **Sistemas** y **ASCII**.
3. Exploración de los siete proyectos mediante el mapa y mediante HTML accesible.
4. Dos casos destacados con evidencia tomada del contenido existente.
5. Navegación móvil cómoda, lectura clara y contacto directo.
6. Terminal conservada, corregida y adaptada a la nueva interfaz.
7. Experiencias lúdicas disponibles de forma voluntaria y coordinada.
8. Fallback útil sin WebGL, movimiento reducido real y limpieza de recursos.
9. Instalación reproducible, lint y tipos en verde, build estático y pruebas automáticas.
10. `DESIGN.md`, documentación de ejecución y evidencia visual del resultado.

La implementación debe ser completa en local y quedar preparada para GitHub Pages. Publicar una versión nueva es un paso posterior a la entrega local; no convertir la escritura de la spec en autorización para publicar.

## 3. Producto y contenido que se preservan

### Identidad y fuentes de verdad

- Nombre: Sebastián Flores.
- Rol: Ingeniero de Software / Software Engineer.
- Marca: `seb.sys`.
- Ubicación: El Salvador.
- Contenido profesional: `lib/content.ts`.
- Idioma: `lib/i18n.tsx`, español e inglés.
- URL existente: `https://sebs14.github.io/seb-sys/`.
- Mantener correo, GitHub y LinkedIn de `identity` y `contactLinks`; no volver a copiarlos como cadenas dispersas.

Los nombres de clientes, instituciones, empleos, años y contribuciones se conservan. Las métricas profesionales solo pueden salir del contenido existente o de información nueva proporcionada por Sebastián. No inventar testimonios, premios, usuarios, mejoras porcentuales, certificaciones ni credenciales.

### Proyectos y claves estables

- `fluidez-lectora`: Evaluación de fluidez lectora.
- `gamificacion-lxp`: Motor de gamificación.
- `horarios-escolares`: Horarios escolares.
- `video-pipeline`: Pipeline de cortos animados.
- `tp-rental`: TP Rental.
- `uassistme`: Sitio de marketing.
- `ascii-portfolio`: seb.sys.

Estas claves deben seguir identificando selección, navegación, terminal y contenido. No reemplazarlas por índices como identidad persistente. El número presentado por `open 1` sí conserva el orden actual de `projects`.

Los proyectos destacados iniciales son fluidez lectora y gamificación, como ya indica `featured`. No hace falta inventar un resultado numérico para el primero. El segundo ya incluye en su contenido la comparación de 1.3 millones de filas sin diferencias y 362 pruebas: se pueden citar como evidencia existente del proyecto, sin afirmar que se verificaron de nuevo en esta sesión.

### Texto que cambia porque cambia el producto

La ficha `ascii-portfolio`, el README y los metadatos actualmente dicen que todo el sitio se renderiza en caracteres. Eso dejará de ser cierto. Actualizarlos en ES/EN para describir el nuevo portafolio de materiales 3D, mapa interactivo y modo ASCII. Mantener la explicación del shader ASCII como una capacidad real.

No usar capturas inventadas de sistemas de clientes. Si se necesitan visuales de un caso sin assets disponibles, dibujar un diagrama de su proceso con etiquetas reales, identificado como esquema del sistema.

## 4. Dirección visual: obsidiana, aluminio y fósforo

### Idea rectora

El visitante entra a un pequeño estudio de ingeniería. En el centro hay un objeto de aluminio que puede tocar, separar y explorar. Sus siete piezas corresponden a proyectos reales. La lectura tiene la calma y precisión de una presentación de producto Apple; el núcleo interactivo y la terminal aportan el carácter de Sebastián.

El recuerdo buscado es concreto: «la página donde una pieza metálica se abre y se convierte en los sistemas que él ha construido».

### Qué significa el acabado Apple en este proyecto

- Una sola composición protagonista por viewport, con espacio suficiente para entenderla.
- Materiales definidos por luz, volumen y reflejos coherentes.
- Tipografía con jerarquía y ajuste óptico; texto sin glow para el contenido principal.
- Controles con respuesta de presión, foco claro y estados previsibles.
- Transiciones continuas que parten del estado visible y pueden revertirse.
- Capas translúcidas únicamente para navegación y herramientas flotantes.
- El contenido permanece legible durante y después de las animaciones.
- El sitio se siente completo en móvil, incluso cuando se reduce la calidad gráfica.

Los principios de movimiento y materiales se apoyan en [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) y [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials). Los tokens y la composición que siguen son decisiones propias de seb.sys, no valores oficiales de Apple.

### Paleta propuesta

Definir los valores una sola vez en `app/globals.css` y exponerlos también a Three cuando corresponda:

- `--surface-base: #090B0D`: fondo principal neutro, casi negro.
- `--surface-section: #111417`: cambios suaves de sección.
- `--surface-raised: #1A1E22`: paneles y controles.
- `--text-primary: #F5F6F7`: títulos y contenido principal.
- `--text-secondary: #B8BEC5`: descripciones y texto de apoyo.
- `--text-muted: #8F99A3`: metadatos que siguen siendo informativos.
- `--accent: #9EF5B5`: acento verde suave.
- `--accent-strong: #54DF86`: interacción activa, usado con fondo oscuro cuando sea texto.
- `--stroke: #303840`: divisiones y límites de controles.
- `--focus: #B6FFD0`: anillo visible de teclado.
- `--signal-amber: #FFD28B`: variante ámbar opcional del laboratorio y terminal.
- `--signal-error: #FF9D9D`: texto de error sobre superficie oscura.

El negro del texto sobre un botón verde será `--surface-base`. No usar texto blanco sobre el botón verde sin medir contraste. No usar verde oscuro para información; ese fue un problema verificado en la versión anterior.

Medir los pares realmente renderizados: texto normal mínimo 4.5:1, texto grande 3:1. La transparencia puede cambiar el contraste efectivo; medir también con la escena debajo. Referencia: [WCAG 2.2, contraste mínimo](https://www.w3.org/TR/WCAG22/#contrast-minimum).

El tema verde/ámbar existente debe modificar los acentos del laboratorio y la terminal de forma coherente. No teñir todos los párrafos ni cambiar la exposición del metal.

### Tipografía

- Texto principal: stack de sistema Apple con Inter como alternativa autoalojada donde sea necesario: `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif`.
- No distribuir archivos de SF Pro sin revisar su licencia. La tipografía de sistema en dispositivos Apple no requiere copiarla al proyecto.
- JetBrains Mono permanece en terminal, comandos, metadatos técnicos y ASCII; deja de ser la fuente de todos los párrafos.
- Las fuentes descargadas deben quedar autoalojadas, con licencia, sin dependencia de un CDN en tiempo de visita.
- Título hero: escritorio 80–88 px, móvil 44–48 px; `line-height` 1.02–1.08; tracking entre -0.03em y -0.04em.
- Encabezados de sección: 48–56 px escritorio, 32–36 px móvil.
- Subtítulos: 24–28 px escritorio, 22–24 px móvil.
- Cuerpo: 18–20 px; altura de línea 1.5–1.65; párrafos de 60–72 caracteres por línea.
- Navegación y botones: 14–16 px, peso 500–600.
- Metadatos: 13–14 px; no bajar de 13 px para información útil.
- Usar `rem` y tamaños fluidos; no fijar `html` a 14 px ni impedir el zoom.
- Títulos balanceados, párrafos alineados a la izquierda; no justificar texto.

### Espaciado, contenedores y superficies

- Ancho máximo de contenido: 1240 px.
- Márgenes laterales: 64 px desde 1280 px; 32 px en tablet; 20 px en teléfono; 16 px a 320 px.
- Escala de espacios: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px, expresada con tokens.
- Separación de secciones: 112–128 px escritorio, 64–80 px móvil.
- Separación dentro de un grupo: 12–24 px.
- Paneles: radio 16 px. Controles pequeños y selector segmentado pueden ser cápsulas.
- Botones: mínimo 44 px de alto, principal 48 px. Área táctil mínima 44 × 44 px aunque el icono visible mida 18–20 px.
- Sombras únicamente donde haya una capa elevada: por ejemplo `0 16px 48px rgb(0 0 0 / 0.24)` para la terminal flotante.
- Barra flotante: fondo oscuro de opacidad suficiente y blur de 16–20 px; no aplicar blur a toda la página.
- No aplicar una retícula, viñeta o scanlines a los párrafos. El tratamiento CRT queda acotado al modo ASCII/laboratorio.

### Iconografía

Usar un sistema consistente de SVG de trazo 1.5–1.75 px, tamaño 18–20 px. Reutilizar una librería si se incorpora por una necesidad real; también sirven SVG geométricos propios. No usar caracteres Unicode como sustituto de iconos fuera de la terminal/ASCII. Todo botón que solo tenga icono necesita nombre accesible.

## 5. Composición y recorrido completos

Orden recomendado: portada y explorador → proyectos destacados → resto del trabajo → enfoque y stack → experiencia → laboratorio → contacto.

Conservar los destinos existentes `#main`, `#about`, `#work`, `#stack`, `#experience`, `#contact` para enlaces y comandos. Se puede añadir `#lab`. El orden visual puede cambiar sin romper esos identificadores.

### 5.1 Navegación

Escritorio: marca `seb.sys` a la izquierda, enlaces Proyectos / Enfoque / Experiencia, selector ES/EN y acción Contacto a la derecha. Laboratorio y terminal son accesos secundarios disponibles, no compiten con Contacto.

Barra centrada de máximo 1240 px, alto aproximado de 64 px, margen superior de 16–24 px. Se mantiene disponible al desplazar, con contraste suficiente sobre cualquier sección. Las anclas deben tener `scroll-margin-top` para no quedar bajo ella.

Móvil: marca, idioma y botón Menú en una fila. El menú se despliega debajo con enlaces de alto táctil suficiente. No comprimir cinco enlaces de 21 px en dos líneas. Usar un disclosure no modal si el menú solo empuja o cubre una región pequeña; Escape lo cierra y vuelve al botón. Marcar la sección activa con texto/estado accesible, además del color.

La terminal se abre desde un control visible con nombre `Abrir terminal`, accesible tanto en escritorio como móvil. Mantener `~` como atajo, pero no depender de él.

### 5.2 Primer viewport: una composición específica

A 1440 × 900 px:

- Barra de navegación arriba, sin superponerse al título.
- Hero de aproximadamente 760–820 px desde debajo de la barra; el inicio de la sección siguiente debe insinuarse cerca del borde inferior.
- Columna de texto a la izquierda, ancho 440–480 px, centrada aproximadamente en el tercio vertical medio.
- Escena a la derecha, ocupando alrededor del 58–62% del ancho disponible y 600–680 px de alto. Puede invadir visualmente el espacio central, pero nunca tapar texto o botones.
- El objeto metálico llena el 65–75% de la región de la escena. Evitar una pequeña figura en un enorme recuadro negro.
- Debajo de la escena: selector Núcleo / Sistemas / ASCII y botón Pausar movimiento. Se mantiene la misma caja de layout en todos los estados.
- El nombre y el rol deben ser visibles desde el primer render.

Copy de referencia ES:

> Sebastián Flores · Ingeniero de Software
>
> Construyo sistemas
> que aguantan.
>
> Backend, interfaces y todo lo que hay en medio.
>
> Ver proyectos · Contactarme

Copy EN:

> Sebastián Flores · Software Engineer
>
> I build systems
> that hold up.
>
> Backend, interfaces, and everything in between.
>
> View projects · Get in touch

El nombre/rol es una línea de identidad, no una etiqueta decorativa minúscula. Puede resolverse como texto secundario contiguo al título; no añadir encima mensajes ficticios como “PORTFOLIO 2026 / V2.0 / AVAILABLE FOR THE FUTURE”.

A 390 × 844 px: navegación compacta, texto y CTA primero; después escena de 340–400 px de alto; luego selector y ayuda. El contacto y el acceso a proyectos deben ser visibles antes de tener que explorar el 3D. El hero puede superar un viewport en móvil; no reducir el texto a tamaños ilegibles para forzar que quepa.

### 5.3 Selección de proyecto desde la escena

La selección muestra debajo del explorador una ficha breve: nombre, organización, tagline, tecnologías compartidas si aplica y acción `Ver proyecto`. Reservar una altura mínima estable para esa franja y permitir crecimiento del texto; no usar una altura fija que recorte traducciones o zoom.

`Ver proyecto` desplaza a la ficha correspondiente en `#work`, la abre y mueve el foco al encabezado de detalle. Una acción secundaria `Leer en terminal` conserva la experiencia anterior y usa el evento de impresión de proyecto.

Mostrar un proyecto seleccionado por defecto en modo Sistemas, preferentemente `fluidez-lectora`. No mostrar un panel vacío con instrucciones genéricas donde debería haber contenido.

### 5.4 Casos destacados

Dos bloques editoriales de ancho completo, con composición alternada; no dos tarjetas idénticas llenas de texto.

**Fluidez lectora:** título, problema de lectura oral, rol/aporte basado en los highlights existentes y esquema `app → storage → cola → motor IA → panel`. La visualización debe explicar procesamiento asíncrono. No inventar una onda de audio de un niño real ni una puntuación como si fuera un resultado real.

**Gamificación:** título, reglas configurables y prueba existente de comparación con el piloto. Mostrar el recorrido `ingesta → reglas → XP → billetera → canje` y la relación entre cambiar una regla y simular su resultado. Las cifras del contenido pueden tener jerarquía tipográfica dentro de este caso, no convertirse en métricas genéricas del hero.

Cada caso tiene: contexto, decisión técnica, evidencia o resultado disponible y tecnologías. El detalle completo se abre en el mismo flujo mediante disclosure accesible. Usar `aria-expanded`/`aria-controls`, un identificador estable y encabezados reales. Mantener solo el contenido existente si falta prueba adicional.

Los diagramas deben ser legibles en HTML/SVG. No abrir otro canvas WebGL por caso. Si se añade una demostración con datos sintéticos, debe rotularse claramente como demostración y no atribuir resultados al proyecto real.

### 5.5 Resto de proyectos

Lista editorial o grilla asimétrica de cinco entradas, con nombre, tagline, año y acceso al detalle. Las entradas se diferencian por contenido y jerarquía, no por siete colores arbitrarios.

Al expandir una entrada: mantener visible el disparador, mostrar descripción/highlights/flow/tags/enlaces, conservar el estado al cambiar idioma y evitar saltos excesivos. En pantallas angostas, transformar los flujos largos en pasos apilados; si un diagrama necesita scroll horizontal, limitarlo al propio diagrama y anunciarlo.

### 5.6 Enfoque, stack y experiencia

Reutilizar los tres párrafos de `about` con mejor ritmo, sin duplicar el hero. Convertir `facts` en una lista de definición bien alineada; las etiquetas también deben ser accesibles y contrastadas.

Reemplazar en la interfaz pública las barras de “dominio 90/82/62” por tecnologías con evidencia: cada tecnología indica en qué proyectos aparece. Calcularlo desde `projects[].tags`, no desde una lista de asociaciones inventada. La presencia de una tecnología en varios proyectos no es un porcentaje de maestría.

Mantener `stack` como fuente de categorías cuando sea útil. Los niveles antiguos pueden conservarse en los datos por compatibilidad, pero no presentarse como una métrica objetiva en la página nueva ni en `cat stack`.

Experiencia: trayectoria en una columna editorial con fecha, empresa, rol y contribuciones existentes. En móvil la fecha pasa sobre el texto; no reservar una columna de 12 caracteres que estrangule el contenido. No completar puestos ni logros faltantes con conjeturas.

### 5.7 Laboratorio y personalidad

Un espacio identificable al final de la narración invita a jugar: `Abrir terminal`, `Probar ASCII`, `Usar cámara` y `Ver comandos`. El sitio puede ser raro sin interrumpir automáticamente a quien está leyendo.

- Conservar gato, `sl`, `matrix`, `vim`, `coffee`, `poweroff`, `theme` y otros comandos existentes.
- Gato y salvapantallas automáticos quedan desactivados en la experiencia principal. Se pueden activar desde laboratorio/terminal. No borrarlos como atajo para terminar el rediseño.
- Desactivar por defecto el desgarro VHold y el campo de estrellas sobre el contenido editorial. Si se conservan, pertenecen al modo laboratorio voluntario.
- No añadir sonido automático. No solicitar cámara al cargar.
- Solo un efecto que cubra la pantalla a la vez. Una nueva activación cancela y limpia el anterior.
- Un efecto recreativo no debe capturar el teclado global fuera de su estado activo. Proporcionar salida visible, además de Escape, incluso en `vim`.
- Después de cerrar el laboratorio o apagar un efecto, la lectura, el scroll y el foco vuelven a un estado útil.

### 5.8 Contacto y cierre

Cerrar con el nombre, una invitación breve y los enlaces reales. Acción principal de correo; enlaces secundarios GitHub y LinkedIn. El correo debe poder seleccionarse/copiarse; si se incorpora botón Copiar, anunciar éxito solo después de resolver `clipboard.writeText` y mostrar alternativa si falla.

No añadir un formulario con backend innecesario para un sitio estático. El cierre puede tener una pequeña firma ASCII estática. Ninguna animación debe dificultar seleccionar el correo.

## 6. Three.js: especificación del objeto y sus modos

### 6.1 Una sola escena, siete piezas reales

Nombre conceptual: **núcleo de sistemas**. Construir una escultura procedural de siete segmentos curvos de aluminio, separados por juntas finas. Cada segmento representa un proyecto. Debe parecer una pieza diseñada, con espesor, cantos suaves y reflejos; no siete esferas aleatorias, un toro genérico ni un fondo de partículas sin significado.

Geometría de arranque reproducible:

- Siete arcos alrededor de un anillo de radio central aproximado 1.35 unidades.
- Paso angular `2π / 7`; dejar una junta de unos 0.045 radianes entre segmentos.
- Sección de cinta redondeada de aproximadamente 0.30 unidades de ancho por 0.12 de espesor.
- Curvatura axial suave de hasta 0.16 unidades para que los reflejos revelen volumen y asimetría controlada.
- Anillo inclinado unos 24° respecto de la cámara, con una rotación adicional de 12° que evite frontalidad plana.
- Construir una sección redondeada barrida por la curva con `BufferGeometry`, normales correctas y un número de segmentos ajustable por calidad. Valores de inicio: 64 segmentos longitudinales × 12–16 puntos de sección por pieza.
- Reutilizar una geometría base y transformaciones cuando la forma lo permita. No crear geometrías nuevas en cada render de React o cuadro.
- Una junta o pequeño detalle emisivo puede identificar la pieza seleccionada. No convertir todas las superficies en neón.

Estas medidas son un punto de partida técnico; se deben ajustar juntas en una prueba visual para conseguir una silueta legible, sin intersecciones ni reflejos quemados. La identidad de siete piezas y su continuidad entre modos sí es obligatoria.

### 6.2 Materiales e iluminación

- Metal principal con `MeshPhysicalMaterial`: `metalness` alrededor de 0.95–1, `roughness` 0.20–0.32, clearcoat moderado o cero si aporta aspecto plástico.
- Crear reflejos de estudio con iluminación de área y un entorno de paneles claros/oscuros. Usar `RoomEnvironment`/PMREM o un entorno procedural compatible; un entorno remoto no debe ser requisito para que aparezca el objeto.
- Un reflector principal amplio, un recorte lateral y una luz suave de relleno. Los reflejos deben dibujar los cantos y la curva.
- Una textura procedural de rugosidad fina puede sugerir aluminio cepillado. Evitar ruido visible, grano cinematográfico global y texturas de varios megabytes para una diferencia casi imperceptible.
- Fondo transparente integrado con la página; sin un rectángulo negro distinto detrás del canvas.
- Tonemapping y gestión de color explícitos. Comprobar que el pase de postproceso no aplica dos veces exposición/tonemapping o conversión de color.
- La escena inicial debe verse bien sin bloom. Si se usa bloom, será localizado al detalle emisivo, con presupuesto y fallback; no lavar el metal ni los bordes.
- No usar sombras de alta resolución en tiempo real por defecto. Preferir iluminación y oclusión visual suficiente; un plano de sombra de contacto solo si mejora materialmente el objeto y pasa el presupuesto.

### 6.3 Modo Núcleo

Los siete segmentos forman el objeto compacto. Una entrada única de 700–900 ms los asienta desde posiciones cercanas, con un máximo de unos 12° de giro; el texto y los CTA ya son visibles e interactivos.

Se puede arrastrar para rotarlo con inercia suave. Hover sobre una pieza levanta su brillo y muestra el nombre del proyecto en HTML. Seleccionarla muestra su ficha breve; no requiere abrir la terminal.

No mantener rotación perpetua por defecto. Después de unos segundos sin interacción, el objeto reposa y el render pasa a demanda. La sensación de vida viene de la respuesta y del material, no de consumir GPU continuamente.

### 6.4 Modo Sistemas

Las mismas siete piezas se separan y se colocan en el grafo de proyectos. Conservar su identidad material durante la transición; no esconder el objeto para reemplazarlo por siete círculos de otra aplicación.

Reutilizar la lógica determinista de `buildGraph()` en `components/three/project-graph.tsx`, extrayéndola a una función pura. Los enlaces representan intersecciones reales de `tags`. Guardar en cada enlace los nombres de las tecnologías compartidas, además del peso.

- Posiciones calculadas una vez por conjunto de proyectos, no simuladas continuamente.
- Al seleccionar una pieza, enfatizar sus conexiones y atenuar con moderación las otras.
- Mostrar en HTML nombre del proyecto y tecnologías que justifican la conexión seleccionada/inspeccionada.
- Las aristas siguen siendo visibles; no entregar un mapa de nodos aislados.
- Para ASCII, usar tubos/cilindros con espesor suficiente para contribuir a la luminancia de una celda, como ya hace el código.
- Evitar colisiones de etiquetas. Mostrar siempre la selección y, como máximo, una etiqueta de hover adicional.
- Un enlace DOM equivalente por proyecto permite operar todo con teclado y sin WebGL.

La transición Núcleo ↔ Sistemas dura aproximadamente 700 ms, con resortes amortiguados y posibilidad de invertirla en cualquier momento. No bloquear los selectores durante la animación.

### 6.5 Modo ASCII

Aplicar el motor ASCII al mapa de los mismos proyectos. Conservar el atlas GPU y el render target de una muestra por celda; no convertir el resultado a una tabla DOM ni leer los píxeles de la GPU en cada frame.

- Celda de 6–8 px escritorio; 8–10 px móvil/calidad baja, ajustada para que los enlaces se reconozcan.
- Glifos de JetBrains Mono realmente cargada; fallback de fuente definido.
- Acento fósforo verde o ámbar según preferencia del laboratorio.
- Interpolación de salida material → ASCII de 350–500 ms si el presupuesto lo permite. Si requiere un segundo render, limitarlo al intervalo de transición y liberar sus recursos al terminar.
- Navegación, texto y controles siguen en HTML, con la misma tipografía y contraste de la página principal. Solo el área de la escena cambia a ASCII.
- El efecto temporal de luminancia debe poder desactivarse sin congelar cambios de selección, tamaño o fuente.

Tres controles segmentados accesibles, con estado seleccionado y nombres traducidos: Núcleo / Sistemas / ASCII; Core / Systems / ASCII. No implementar ARIA tabs parcialmente: usar tabs completos con teclado o un grupo de botones con `aria-pressed`.

### 6.6 Cámara, puntero, touch y selección

- Punto de partida de cámara: perspectiva de 32–36°, posición aproximada `[0, 0, 6]`, objetivo en el centro del conjunto.
- Encuadrar por bounding sphere y relación de aspecto; no mantener una posición fija que recorte en móvil.
- Limitar zoom y pan; por defecto no interceptar la rueda del documento.
- Arrastrar requiere un umbral de 6–10 px antes de considerarse drag; soltar después de drag no selecciona un nodo por accidente.
- Capturar el puntero mientras dure el gesto. Ignorar un segundo contacto hasta terminar el primero.
- En móvil preservar scroll vertical: `touch-action: pan-y`; permitir rotación horizontal, o un control explícito de manipulación que no bloquee la navegación.
- Velocidad e interpolación dependen de `delta` de tiempo, no de una cantidad fija por frame. Limitar delta al volver de una pestaña oculta.
- La inercia se amortigua; no acumular velocidad ilimitada.
- Mantener un botón `Restablecer vista`, útil con touch y teclado.
- Una selección con teclado no debe perderse cuando el mouse se mueve casualmente sobre otro elemento.

### 6.7 Relación con el scroll

Usar scroll nativo. Mientras el hero sale del viewport, puede inclinarse levemente el objeto y reducirse su protagonismo. La transformación debe ser pequeña, local al hero y reversible.

No instalar scroll hijacking, scroll horizontal de toda la página, pinning de varios viewports, ni obligar a completar una secuencia 3D antes de llegar a proyectos/contacto. Desactivar este movimiento en reduced-motion. Al salir de pantalla, detener render y temporizadores de escena.

### 6.8 Cámara web opcional

`Usar cámara` o `webcam` solicita permiso; nunca hacerlo al montar la página ni por seleccionar ASCII.

Estados visibles y traducidos: disponible/inactiva, solicitando, activa, permiso denegado, sin soporte y error. Mostrar `Detener cámara` mientras esté activa.

La webcam sustituye temporalmente la fuente del pase ASCII y mantiene el espejado ya existente. Al detener, volver al modo anterior; no olvidar selección ni ángulo del mapa.

Detener todas las pistas y liberar `VideoTexture`, video y `srcObject` al salir. Si el usuario sale antes de que resuelva `getUserMedia`, detener también el stream que llegue tarde. Escuchar fin de pistas para actualizar la UI. El video se procesa en el navegador y no se sube a ningún servidor.

### 6.9 Calidad adaptativa y presupuesto

Estos son objetivos de aceptación a medir, no resultados ya obtenidos:

- Una sola instancia WebGL activa para la experiencia principal.
- Objetivo de 60 fps en escritorio de referencia y movimiento estable de al menos 30 fps en móvil de referencia; documentar dispositivo, navegador y modo.
- DPR inicial máximo 1.5 en escritorio, 1 en móvil o calidad baja. No usar sin límite `devicePixelRatio`.
- Escena principal objetivo: menos de 80 draw calls y 150 000 triángulos en calidad alta; menos de 45 draw calls y 60 000 triángulos en baja. Contar también postprocesos al reportar costo.
- No transmitir un HDR grande ni dependencias 3D en el camino crítico del texto.
- Shaders y geometrías reutilizados; materiales compartidos donde sea correcto.
- Ajustar calidad con ventanas de medida, histéresis y un máximo de pocos cambios por sesión; no oscilar DPR cada segundo.
- En inactividad estable, `frameloop="demand"`; `invalidate()` al cambiar tamaño, selección, textura, material o animación pendiente. Mientras se asienta una animación a demanda, seguir invalidando hasta alcanzar tolerancia.
- Fuera de viewport o con `document.hidden`, pausar. Al volver, revalidar tamaño y solicitar un cuadro.
- Bajo movimiento reducido o pausa manual, renderizar estados estáticos completos; no dejar un canvas sin primer cuadro.
- `useFrame` modifica refs/objetos Three; no ejecutar `setState` de React en cada frame.
- No crear `Vector3`, geometrías, arrays grandes, materiales o listeners dentro del bucle por comodidad.
- Partículas solo si aportan al cambio entre modos y caben en el presupuesto: hasta 1200 desktop / 400 móvil, en una sola geometría de puntos o instancia, sin DOM por partícula. No son necesarias para aprobar la silueta principal.

Referencia técnica: [R3F: scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) y [performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls). El uso a demanda y de objetos reutilizados debe seguir la API de las versiones instaladas.

## 7. Movimiento e interacción de la interfaz

- Presión de botón: feedback inmediato en `pointerdown`/`:active`, escala aproximada 0.97; cancelación normal si el usuario arrastra fuera antes de soltar.
- Hover: cambios de color y elevación mínima, 140–180 ms; solo en dispositivos con hover real.
- Navegación y foco: respuesta inmediata, sin esperar animaciones del hero.
- Paneles/disclosures: 220–320 ms; reversibles. Evitar animar altura de una gran sección con mediciones en cada frame.
- Terminal: entrada desde su posición final próxima, escala 0.98–1 y desplazamiento máximo 16 px; 220–280 ms. Salida por la misma trayectoria en unos 180–220 ms.
- Transiciones de escena: 650–900 ms, separadas del presupuesto de controles frecuentes.
- Resortes: damping cercano a crítico; usar el API verificado de Motion. Como inicio, stiffness 170, damping 26, mass 1 para paneles; no aplicar esos mismos números a cámara sin calibrar.
- Un único momento de entrada bien compuesto. El resto del contenido debe ser visible por defecto; nada de opacidad cero permanente si falla JavaScript.
- El cambio de idioma no vuelve a reproducir todo el espectáculo ni vacía la página.
- No seguir el cursor con un cursor falso global. La respuesta al puntero pertenece a la escena y a los controles reales.
- Las animaciones se interrumpen desde el valor actual, manteniendo velocidad razonable. Cambiar rápidamente de modo no debe teletransportar las piezas al inicio.
- Reduced-motion: sustituir movimientos espaciales por un cambio directo o crossfade corto de 100–150 ms. Sin scramble, tipeo obligatorio, parallax, giro de cámara, rebote ni parpadeo del shader.
- Reduced-transparency: fondo sólido en navegación y terminal. Prefers-contrast: bordes y texto reforzados.

## 8. Correcciones obligatorias de la revisión

Las líneas citadas corresponden a `39d2f64`; localizar los símbolos si cambian durante el refactor. Una corrección cuenta cuando el comportamiento se verifica, no cuando desaparece una advertencia.

### BUG-01 — Recuperación WebGL con hero vacío

Archivo: `components/three/ascii-hero.tsx`, efecto de visibilidad cerca de la línea 84, fallback cerca de la 125, frameloop cerca de la 137.

Problema reproducido: el evento de pérdida de contexto activa `lost`; el componente sustituye todo el contenedor por `StaticFallback`. El `IntersectionObserver` sigue observando el contenedor eliminado porque su efecto tiene dependencias vacías. El canvas nuevo puede quedar con `active=false` y `frameloop="never"`.

Corrección:

1. Mantener estable el contenedor al que se asocian observadores y medidas.
2. Cambiar únicamente el contenido interno entre escena, fallback y recuperación.
3. Modelar estados explícitos: `loading`, `ready`, `unsupported`, `recovering`, `failed`.
4. Al perder contexto: `preventDefault`, detener render y mostrar fallback en la misma caja.
5. Permitir un reintento automático controlado; si falla otra vez, mantener fallback y ofrecer `Reintentar 3D`.
6. Limpiar listener y temporizador al desmontar o reemplazar renderer. Una recuperación vieja no debe modificar una instancia nueva.
7. Tras recuperar: comprobar visibilidad actual, reconstruir recursos necesarios y solicitar el primer cuadro.

Aceptación: forzar `WEBGL_lose_context`, esperar el reintento y comprobar visualmente que la escena vuelve a dibujar; repetir fuera del viewport y volver a él. El caso con fallo persistente conserva proyectos y contacto.

### BUG-02 — Probe acepta WebGL1 incompatible

Archivo: `components/three/ascii-hero.tsx`, cerca de la línea 112.

La versión instalada de Three usa WebGL2; comprobar `webgl2 || webgl` puede declarar soporte que el renderer no tiene. Comprobar WebGL2 y contener también errores reales de creación del renderer. Un probe exitoso no garantiza que la GPU permita otro contexto.

Preferir un único camino controlado de inicialización. Si se mantiene un canvas de prueba, liberar su contexto y evitar acumular probes al remontar. Usar un límite de errores local para mostrar `SceneFallback`, no la página global de error de Next.

### BUG-03 — Recursos de webcam sin liberar

Archivo: `components/three/webcam-plane.tsx`, creación de `VideoTexture` cerca de la línea 63 y cleanup cerca de la 68.

Guardar la referencia a la textura creada y llamar `dispose()` al cerrar la sesión. Detener tracks, pausar el video y vaciar `srcObject`. El cleanup debe cubrir resoluciones tardías del permiso, errores de reproducción y desmontaje del canvas. El release del material no sustituye al de la textura.

Aceptación: activar/desactivar webcam repetidamente con un stream de prueba. Tras estabilizar, el conteo de texturas del renderer vuelve al nivel base; no evaluar esto por el heap global del navegador.

### BUG-04 — Historial de terminal atascado

Archivo: `components/ascii/terminal.tsx`, manejo ArrowDown cerca de la línea 643.

Reproducción verificada: ejecutar `help`, pulsar ↓ y luego ↑. `cursor` baja de -1 a -2 y ya no permite recuperar el comando anterior.

Corrección: el cursor válido está entre -1 y `history.length - 1`. Limitar ArrowDown a `Math.max(-1, cursor - 1)` y cubrir historial vacío. Conservar el borrador que el usuario estaba escribiendo antes de entrar al historial y restaurarlo al volver a -1.

Aceptación: historial vacío, un comando, varios comandos, límites superior/inferior y borrador recuperable.

### BUG-05 — Movimiento reducido incompleto

Archivos: `components/ascii/text.tsx`, `components/ascii/bar.tsx`, `components/three/ascii-pass.tsx`, `components/three/ascii-hero.tsx`.

El CSS actual no detiene los timers de Typewriter/Scramble/GlitchText/LevelBar. La escena congela el grafo, pero el shader sigue avanzando `uTime` y modificando luminancia.

Crear una fuente compartida de preferencia de movimiento, compatible con SSR y cambios en vivo. En reduced-motion, mostrar directamente texto final, cancelar timers pendientes y desactivar el tiempo del shader. La preferencia afecta también a comandos recreativos; puede mantenerse un resultado estático y un mensaje que explique el estado.

No usar el parche global de `animation-duration: 0.01ms` como única implementación. Una actualización de tamaño, selección o idioma debe seguir siendo visible.

### BUG-06 — Semántica y foco de la terminal

Archivo: `components/ascii/terminal.tsx`, log cerca de la línea 587 y cierre cerca de la 674.

- Guardar el elemento que abre la terminal.
- Enfocar el input al abrir por intención del usuario; no robar foco por mensajes informativos de fondo.
- Al cerrar con Escape, botón o comando, devolver foco al disparador si sigue montado; de lo contrario al control estable `Abrir terminal`.
- En escritorio, usar una región complementaria no modal; no bloquear toda la página ni exigir un focus trap si permite interacción paralela.
- Si en móvil se decide usar un diálogo que cubre la interacción, implementarlo como diálogo completo con foco, cierre y comportamiento de fondo correctos. No poner solo `aria-modal` como decoración.
- Anunciar resultados completos con `role="log"` o una región viva adecuada. El fragmento que se tipea no debe anunciarse carácter por carácter.
- Mantener una salida estructurada accesible y permitir seleccionar/copiar el texto.

### BUG-07 — Títulos informativos escondidos con ASCII

Archivo: `components/ascii/frame.tsx`, cerca de la línea 67.

`aria-hidden` cubre bordes, `title` y `meta`. Ocultar solo los glifos decorativos. Si se reutiliza Frame en terminal/laboratorio, su título debe seguir disponible como encabezado o etiqueta de región sin duplicarse para lectores de pantalla.

### BUG-08 — Legibilidad y controles móviles

El verde tenue antiguo medía aproximadamente 3.95:1 y el oscuro 1.91:1 sobre el fondo base; la navegación y el selector de idioma medían 21 px de alto en 390 px de ancho. Reemplazar los tokens informativos y dar área táctil suficiente. El rótulo bajo el mapa debe poder envolver; no truncar la única explicación del gesto.

### BUG-09 — Instalación y lint

Con Node 26.6.0 / npm 11.18.0, `npm ci` falló incluso con acceso a red confirmado: faltaban entradas de `@emnapi/runtime@1.11.3` y `@emnapi/core@1.11.3`. El primer intento también tuvo ENOTFOUND por sandbox; no confundir esa restricción con el fallo posterior del lockfile.

La revisión de la versión reciente ejecutó TypeScript correctamente, pero ESLint produjo 9 errores y 1 advertencia:

- `text.tsx`: actualizaciones de estado en efectos, prefer-const y dependencia faltante.
- `ascii-hero.tsx`: actualización de estado en efecto.
- `ascii-pass.tsx`: regla de inmutabilidad aplicada a uniforms/recursos Three.
- `i18n.tsx`: actualización de estado en efecto.

Leer los diagnósticos actuales; no asumir que todos son bugs funcionales. Reestructurar derivaciones y suscripciones cuando corresponda. Las mutaciones imperativas de Three pueden requerir una excepción local y documentada; no desactivar globalmente las reglas de React para ocultar el problema.

## 9. Arquitectura de implementación

### Límites

Conservar Next.js, TypeScript, React, R3F, Three y Motion. No migrar el proyecto de framework ni introducir backend, CMS, autenticación o estado global pesado para este alcance.

Antes de escribir código Next, leer las guías relevantes de la versión instalada en `node_modules/next/dist/docs/`; el repo lo exige en `AGENTS.md`. En particular: componentes servidor/cliente, exportación estática, dynamic imports y generación de tipos. Usar el grafo de código antes de descubrimiento por grep, según las instrucciones del repo.

`app/layout.tsx` conserva metadatos, idioma inicial, fuentes y proveedores. `app/page.tsx` compone la página. El contexto de idioma necesita componentes cliente, pero eso no obliga a mezclar GPU, comandos y todo el contenido en un componente monolítico. Los componentes cliente pueden producir HTML inicial; comprobar el HTML servido en lugar de asumir que `use client` lo impide.

### Estructura objetivo

La siguiente es una propuesta concreta de archivos nuevos. Se puede ajustar un nombre si hay una convención mejor, pero conservar responsabilidades claras:

```text
app/
  layout.tsx                  metadatos, fuentes, proveedores y shell
  page.tsx                    composición del portafolio
  globals.css                 tokens, tipografía, layout y estados
  not-found.tsx               404 coherente con el nuevo diseño
components/portfolio/
  portfolio-nav.tsx           navegación responsive e idioma
  hero.tsx                    copy, CTA y shell de escena
  project-explorer.tsx        selección DOM y preview del proyecto
  project-case.tsx            casos destacados y detalle accesible
  project-list.tsx            resto de proyectos
  expertise.tsx               stack respaldado por proyectos
  experience.tsx              trayectoria
  playground.tsx              acceso explícito a experiencias
  contact.tsx                 cierre y enlaces
components/three/
  scene-shell.tsx             contenedor estable, capability y recovery
  portfolio-scene.tsx         Canvas, cámara y composición de modos
  core-assembly.tsx           siete piezas y poses Núcleo/Sistemas
  studio-environment.tsx      luces y entorno local
  scene-controls.tsx          drag/inercia/cámara, sin UI DOM duplicada
  scene-fallback.tsx          visual estático y alternativa accesible
  ascii-pass.tsx              pase GPU existente, corregido y reutilizado
  webcam-plane.tsx            webcam y cleanup completo
components/ascii/
  terminal.tsx               UI de terminal y foco; sin parser gigante
  ...                         primitivas/experiencias que se conservan
lib/
  content.ts                  identidad y datos reales
  i18n.tsx                    traducciones y preferencia
  project-graph.ts            construcción pura del grafo y sharedTags
  scene-config.ts             parámetros por nivel de calidad
  scene-types.ts              tipos de modos, selección y estado
  use-motion-preference.ts    preferencia reactiva y SSR estable
  terminal/
    parse-command.ts          parseo sin efectos
    history.ts                movimiento de cursor y borrador
    commands.ts               registro/ejecución de comandos
    types.ts                  resultados tipados
tests/
  unit/                       parseo, historial y grafo
  e2e/                        recorridos reales y degradación
.github/workflows/ci.yml
playwright.config.ts
PRODUCT.md
DESIGN.md
README.md
```

No añadir todos los archivos como esqueletos vacíos. Crear cada uno cuando tenga una responsabilidad real; evitar wrappers que solo pasan props.

### Contrato de estado

Mantener separados:

- `mode`: `core | systems | ascii`.
- `selectedProjectId`: clave estable de un proyecto.
- `hoveredProjectId`: efímero, no cambia selección ni URL por sí solo.
- `motionPreference`: sistema + pausa manual de esta sesión.
- `sceneStatus`: carga, lista, sin soporte, recuperación, fallo.
- `qualityTier`: alta, media, baja.
- `webcamStatus`: inactiva, solicitando, activa, denegada, sin soporte, error.
- Estado del laboratorio/terminal y efecto recreativo activo.

La selección de proyecto tiene una única fuente de verdad. La escena, los controles HTML y la ficha usan ese ID. No mantener tres selecciones distintas sincronizadas con efectos.

Las rotaciones, velocidades, progreso de interpolación y objetos matemáticos viven en refs/objetos Three, no como estado React actualizado por frame. El estado React comunica cambios discretos visibles en la interfaz.

El grafo derivado usa `projects` como entrada. Normalizar etiquetas solo con reglas explícitas; no deducir que React y Next.js son la misma tecnología. Conservar conexiones por coincidencia exacta de tags salvo que se incorpore un mapa de equivalencias aprobado y probado.

### Bus de eventos existente

`lib/bus.ts` ya define eventos de terminal, proyecto, webcam, notices y efectos. Preservar la compatibilidad de los comandos durante el refactor.

- `open-project`: abre el detalle del proyecto identificado.
- `print-project`: abre la terminal y escribe su ficha por intención explícita.
- `webcam`: activa/desactiva captura voluntaria.
- `terminal`: comunica apertura/cierre.
- `notice`: anuncia una operación real sin inventar estado.

Si se añade `select-project`, tiparlo y distinguir selección de apertura/scroll. No usar listeners anónimos sin cleanup ni eventos que provoquen un bucle escena → ficha → escena.

### Terminal: comandos que deben seguir funcionando

Inventariar antes y después: `help`, `ls`, `cd`/`goto`, `open`, `cat`, `nocat`, `whoami`, `neofetch`, `lang`, `matrix`, `webcam`, `coffee`, `sudo`, `rm`, `htop`, `theme`, `sl`, `vim`/`vi`, `poweroff`/`shutdown`, `clear`, `exit`/`q`.

`cd` desplaza; `open` escribe la ficha y abre su detalle; `cat <sección>` imprime contenido. Mantener alias ES/EN. Los comandos ficticios como `rm` siguen siendo chistes locales, nunca operaciones sobre archivos.

Extraer historial y parseo a funciones puras y probarlos. Corregir también argumentos vacíos o ambiguos: `open` sin argumento no debe elegir el primer proyecto porque todo nombre contiene la cadena vacía; `open 1abc` no debe aceptarse como `open 1`. Mostrar uso o resultados candidatos.

Al enviar otro comando durante tipeo, conservar el comportamiento existente: completar la salida pendiente y procesar el nuevo comando sin bloquear el input. Limitar razonablemente el historial y el log, por ejemplo a 100 comandos y 500 líneas, eliminando primero lo más antiguo; `clear` cancela también la cola pendiente para que no reaparezca texto borrado.

`htop` debe describir mediciones reales. Contar frames efectivamente renderizados por la escena, draw calls, triángulos, calidad y estado; no etiquetar el `requestAnimationFrame` general de la página como FPS del renderer. En modo metal, `celdas ASCII` debe decir no aplicable. Si no hay canvas o una API no existe, mostrar no disponible, no cero como supuesto dato real.

### SSR, idioma y almacenamiento

- Servir HTML inicial con nombre, presentación, proyectos y contacto. No dejar todo oculto hasta que termine la GPU.
- Elegir un idioma inicial determinista (español) y aplicar preferencia guardada/navegador sin mismatch. Si se conserva autodetección, comprobar explícitamente su flash y estrategia de hidratación.
- `lang` del documento, etiquetas accesibles, texto visible y controles cambian juntos.
- El cambio de idioma conserva selección, detalles abiertos y estado de terminal.
- Wrap de `localStorage` en manejo de errores: navegación privada o bloqueo del almacenamiento no pueden romper el sitio.
- Persistir solo idioma/acento y preferencias no sensibles; no guardar permiso de cámara ni activarla desde una preferencia persistida.
- No introducir `suppressHydrationWarning` general como solución a errores de hidratación.

## 10. Instalación, build estático y CI

### Instalación reproducible

1. Registrar Node/npm actuales y reproducir el fallo antes de alterar el lockfile.
2. Estandarizar Node 24 LTS para desarrollo/CI, con `.nvmrc` y `engines` coherentes. Registrar la versión exacta de npm con la que se valide el lockfile en `packageManager` y README. La elección de 24 LTS se basa en el [calendario oficial de Node](https://github.com/nodejs/Release).
3. Regenerar correctamente `package-lock.json` con el runtime elegido, resolviendo las entradas faltantes.
4. No ocultar el fallo con `--force`, `--legacy-peer-deps` ni borrando dependencias arbitrarias.
5. Probar `npm ci` en una instalación limpia y confirmar que no cambia el lockfile.
6. No actualizar Next, React o Three a otra versión mayor durante el rediseño salvo un bloqueo técnico demostrado y documentado.

### Scripts esperados

- `dev`: desarrollo Next.
- `build`: build normal.
- `build:pages`: exportación estática existente con `GITHUB_PAGES=true`.
- `lint`: ESLint con advertencias resueltas o excepciones puntuales justificadas.
- `typecheck`: generación de tipos de rutas con el CLI local de Next y `tsc --noEmit`; debe funcionar después de un checkout limpio, sin depender de una carpeta `.next` vieja.
- `test:unit`: pruebas del grafo y terminal.
- `test:e2e`: Playwright contra una app servida.
- `check`: puede agrupar validaciones; no debe ejecutar silenciosamente un deploy.

Usar una herramienta de unit tests compatible con TS y el proyecto; Vitest es una opción razonable. Añadir Playwright para recorridos de navegador. No introducir otra biblioteca de UI solo para resolver las pruebas.

### GitHub Pages

Conservar `output: "export"`, `basePath: "/seb-sys"` y la separación entre desarrollo local y modo Pages en `next.config.ts`.

- Los assets propios de `public` deben resolver bajo el basePath; crear una utilidad de ruta si hace falta. No asumir que `assetPrefix` corrige automáticamente cualquier `/archivo` escrito a mano.
- No incorporar Server Actions, cookies de servidor, middleware dependiente de request ni endpoints que requieran un servidor de aplicación para funcionar.
- Mantener metadatos coherentes, favicon propio y 404 con retorno que funcione bajo `/seb-sys`.
- Generar imagen social desde el resultado real final, con sus recursos locales y rutas correctas. Evitar una URL de imagen que no existe.
- Si el método de publicación de Pages lo requiere, incluir `.nojekyll` en el artefacto para servir `_next` correctamente.
- Probar el export servido bajo el subdirectorio real, no únicamente `next dev` en `/`.

Las guías locales de Next inspeccionadas confirman que los Server Components pueden ejecutarse al construir un export estático. Verificar las limitaciones de la versión instalada antes de diseñar nuevas rutas.

### CI

Workflow de validación en pull request y cambios a main:

1. Checkout y Node según `.nvmrc`; cache npm keyed por lockfile.
2. `npm ci`.
3. Lint y typecheck.
4. Unit tests.
5. `npm run build:pages`.
6. Servir `out/` bajo `/seb-sys` y ejecutar smoke tests E2E de producción.
7. Guardar reporte/trazas/capturas de fallo como artefactos.

Usar permisos mínimos de lectura para CI. Mantener la publicación en otro job/flujo explícito. No cambiar cuentas de GitHub, tokens o configuración global de git como parte de arreglar el código.

## 11. Matriz de aceptación

Cada punto debe tener evidencia o una limitación declarada. Una captura bonita no sustituye una prueba de funcionamiento; un build verde tampoco demuestra calidad visual.

### VIS-01 — Composición

- Capturas de escritorio a 1440 × 900 y 1280 × 800.
- Capturas móviles a 390 × 844 y 320 × 740; tablet a 768 × 1024.
- A 1440 px: texto y objeto tienen las proporciones de la sección 5.2; la pieza no parece un icono flotante diminuto.
- En 320 px: no hay overflow horizontal del documento, CTA recortados, etiquetas superpuestas ni controles que dependan de hover.
- Ningún estado de carga/recuperación cambia bruscamente la altura del hero.
- Contraste real de texto y controles medido, incluyendo navegación translúcida.
- Zoom 200%: contenido y controles operables; sin texto escondido por alturas fijas.
- El lenguaje visual continúa en terminal, detalles de proyecto, mensajes de error y 404.

### INT-01 — Navegación y proyecto

- Ver proyectos llega a `#work`; Contactarme llega a contacto real.
- Todos los enlaces de navegación tienen destino y no quedan escondidos tras la barra.
- Seleccionar los siete proyectos desde la lista DOM actualiza escena y preview correctamente.
- Selección mediante raycasting coincide con la pieza visible; un drag no dispara selección accidental.
- Ver proyecto abre y enfoca el detalle correcto.
- Abrir una ficha, cambiar idioma y volver conserva su estado.
- URL con ancla existente funciona al recargar.

### INT-02 — Modos 3D

- Núcleo, Sistemas y ASCII funcionan y tienen estado seleccionado accesible.
- Cambiar de modo tres veces rápidamente deja la escena en el último solicitado, sin flashes ni recursos duplicados.
- Las aristas se generan por tags reales y corresponden al mismo grafo en todos los modos.
- Reset restablece cámara y rotación, conservando una selección coherente.
- Pausar detiene movimiento automático sin impedir elegir otro proyecto o cambiar tamaño.
- Después de inactividad, la escena reposa; una interacción vuelve a solicitar render.

### A11Y-01 — Teclado y movimiento

- Recorrido completo con Tab/Shift+Tab, Enter/Espacio y Escape.
- Skip link funcional y foco siempre visible.
- La escena tiene una alternativa DOM equivalente; todos los proyectos y acciones se alcanzan sin ratón.
- Reduced-motion activo antes de cargar: texto final visible, escena estática dibujada, ningún tipeo/parallax/glitch temporal obligatorio.
- Cambiar reduced-motion con la página abierta cancela lo pendiente sin desmontar todo el contenido.
- Abrir/cerrar terminal devuelve el foco y anuncia resultados completos una sola vez.
- Menú móvil opera por teclado y no deja el foco perdido.
- Revisar semántica con axe u otra herramienta más una pasada manual; no anunciar conformidad total con WCAG únicamente porque un scanner dé verde.

### TERM-01 — Regresiones de terminal

- `help`, ↓, ↑ devuelve `help`; repetir flechas nunca sale del rango válido.
- Historial vacío no genera errores; borrador se recupera al salir del historial.
- `open 1` imprime el proyecto correcto y abre su detalle.
- `open`, `open 0`, `open 99` y `open 1abc` muestran uso/error coherente.
- `cd proyectos`, `cat contacto`, `lang en`, `lang es`, `clear` y `exit` conservan su intención.
- Enviar un comando mientras se imprime otro no bloquea ni mezcla líneas.
- `clear` durante tipeo cancela la salida pendiente.
- `theme amber`/`theme green` cambia acentos y sigue legible.
- El comando recreativo activo se puede cerrar y deja el sitio funcional.

### GPU-01 — Degradación y recuperación

- WebGL2 no disponible: fallback completo, contenido y contacto operables, sin error global.
- Creación del renderer falla aunque el probe funcionó: mismo resultado útil.
- Forzar pérdida de contexto con `WEBGL_lose_context`: fallback, recuperación y escena realmente visible.
- Pérdida de contexto fuera de viewport + regreso: escena visible o fallback explícito, nunca canvas vacío silencioso.
- Segunda pérdida con fallo persistente: no reintentos infinitos; botón Reintentar disponible.
- Cambiar tamaño/rotar móvil después de recuperar: encuadre y targets se actualizan.
- Pestaña oculta o escena offscreen: se detiene el trabajo de render; volver la reactiva correctamente.

### CAM-01 — Webcam

- No hay solicitud de permiso al cargar ni al cambiar simplemente a modo ASCII.
- Permiso concedido: aparece imagen ASCII y control Detener cámara.
- Permiso denegado/sin dispositivo/error: mensaje traducido y mapa disponible.
- Salir durante permiso pendiente no deja un stream vivo cuando la promesa resuelve.
- Activar/desactivar diez veces con stream de prueba: tracks finalizados y texturas regresan al nivel base tras cleanup.
- Detener pista desde el navegador actualiza la interfaz.
- En CI usar stream/cámara simulada o mocks específicos; no depender de cámara física.

### PERF-01 — Presupuesto y evidencia

- Medir escena en los tres modos, con hardware y navegador documentados.
- Registrar draw calls, triángulos, DPR y estado de frameloop. No confundir FPS de la página con frames de la escena.
- Comprobar ausencia de crecimiento sostenido de recursos después de alternar modos y webcam; considerar caches estables por separado.
- Medir build de producción con Lighthouse móvil; objetivo orientativo de performance ≥90 y accesibilidad ≥95, documentando condiciones y limitaciones. Los scores no sustituyen los casos manuales.
- Objetivos web de referencia: CLS <0.1, LCP ≤2.5 s e INP ≤200 ms cuando haya medición apropiada. No inventar INP de campo desde una sola corrida de Lighthouse.
- El contenido textual y los CTA no esperan carga de Three, atlas ni cámara.

### RELEASE-01 — Construcción y rutas

- `npm ci` limpio termina bien y no modifica `package-lock.json`.
- Lint, typecheck, unit tests y build:pages terminan bien.
- La página exportada carga assets desde `/seb-sys` sin 404.
- Navegación, idioma, proyectos y terminal funcionan en ese export.
- 404 y metadatos no contienen referencias al viejo sitio “enteramente ASCII” que ya no sean ciertas.
- No se han añadido secretos ni enlaces internos a recursos no públicos.

## 12. Plan de trabajo por fases

### Fase 0 — Base reproducible y evidencia inicial

Revisar estado git sin sobrescribir cambios ajenos. Leer `AGENTS.md`, `PRODUCT.md`, esta spec y docs locales Next. Inventariar comandos/eventos, registrar captura actual y resolver Node/npm/lockfile.

Entregable: instalación limpia y una lista corta de checks de partida. No empezar a añadir dependencias visuales si todavía no es posible reproducir la instalación.

### Fase 1 — Reparaciones y responsabilidades

Corregir BUG-01 a BUG-09. Extraer grafo e historial a funciones puras. Crear pruebas de las regresiones reproducidas. Preparar motion preference y shell estable de escena.

Entregable: la experiencia actual deja de tener esos fallos, con pruebas relevantes. Esta fase debe poder revisarse sin depender de que el rediseño visual esté terminado.

### Fase 2 — Sistema visual y primer viewport

Implementar tokens, tipografía, navegación, hero, CTA, scene shell y fallback. Construir el núcleo con materiales y luz. Probar escritorio y móvil antes de extender la estética al resto del sitio.

Checkpoint: un screenshot a 1440 × 900 debe demostrar la escala, el material y la composición prometidos; otro a 390 × 844 debe demostrar lectura y control táctil. Si la pieza parece un toro básico o un conjunto de esferas, la fase no está terminada aunque compile.

### Fase 3 — Sistema interactivo Three.js

Completar las poses Núcleo/Sistemas, transición reversible, raycasting, selección DOM, ASCII, pause/reset, calidad adaptativa y recuperación. Integrar webcam sin duplicar escenas.

Entregable: los tres modos y todos sus estados funcionan con los siete proyectos reales. Verificar presupuesto y cleanup antes de añadir partículas opcionales.

### Fase 4 — Narrativa completa y personalidad

Construir destacados, resto de proyectos, enfoque/stack basado en evidencia, experiencia, laboratorio y contacto. Adaptar terminal y experiencias al nuevo sistema. Actualizar ficha del propio sitio, metadatos, README y 404.

Entregable: toda la página está terminada, no solo el hero. Los textos ES/EN y los estados secundarios reciben el mismo cuidado.

### Fase 5 — QA y automatización

Ejecutar la matriz de aceptación. Corregir hallazgos en un lote coherente. Probar el export bajo basePath real. Añadir/terminar CI y conservar trazas de fallos útiles.

Entregable: checks verdes, capturas válidas, evidencia de GPU/fallback y limitaciones documentadas con precisión.

### Fase 6 — Revisión final y entrega

Comparar la página con el contrato de esta spec, no solamente con el código anterior. Hacer revisión independiente de diseño si las herramientas lo permiten. Corregir los hallazgos materiales, volver a capturar y registrar `DESIGN.md` desde el resultado construido.

Entregable: preview local accesible, diff revisable, informe breve de qué se implementó y cómo se probó. Registrar cualquier requisito no cumplido; no llamarlo terminado si faltan escena, móvil, fallback o contenido.

La publicación no sustituye a esta revisión. Dejar el artefacto estático preparado y realizar el deploy cuando Sebastián lo indique en el flujo de implementación.

## 13. Qué revisar en cada archivo existente

- `app/page.tsx`: sustituir la composición ASCII monolítica por las secciones descritas; conservar anchors e identidad real.
- `app/layout.tsx`: retirar los efectos globales automáticos de la experiencia principal, cargar proveedor/laboratorio apropiadamente, fuentes y metadatos nuevos.
- `app/globals.css`: reemplazar la grilla global, mono universal, glow de lectura y tokens de bajo contraste; mantener estilos ASCII acotados.
- `components/ascii/nav.tsx`: reemplazar por navegación responsive o adaptar su responsabilidad; conservar scroll-spy accesible.
- `components/ascii/project-card.tsx`: preservar estado/semántica y eventos al migrar a casos/proyectos nuevos.
- `components/ascii/frame.tsx`: corregir títulos accesibles; usar en terminal/laboratorio, no como contenedor universal de la página.
- `components/ascii/text.tsx`: reduced-motion y cleanup; no mantener la identidad/CTA detrás de animaciones de tipeo.
- `components/ascii/bar.tsx`: corregir si se conserva; no usar como porcentaje de dominio en la UI pública nueva.
- `components/ascii/terminal.tsx`: extraer historial/parser/comandos, corregir foco/log, conservar comportamiento y adaptar estilos.
- `components/ascii/{cat,matrix,train,vhold,vim-trap,screensaver,poweroff,starfield}.tsx`: activación voluntaria, exclusión entre efectos, cleanup y salida accesible.
- `components/crt-overlay.tsx`: limitar al contexto ASCII/laboratorio o reemplazar su montaje; no oscurecer todo el contenido.
- `components/three/ascii-hero.tsx`: migrar a shell estable; si queda temporalmente, corregir recovery/probe y evitar dos heroes activos.
- `components/three/project-graph.tsx`: extraer construcción pura; reutilizar conectividad y adaptar piezas/materiales.
- `components/three/ascii-pass.tsx`: mantener pipeline GPU, control temporal, gestión de color y cleanup.
- `components/three/webcam-plane.tsx`: cubrir todos los estados y liberar texturas/streams.
- `lib/glyph-atlas.ts`: fuente correcta, carga/cancelación y propiedad explícita de la textura.
- `lib/content.ts`: conservar hechos, enriquecer estructura de presentación sin inventar; actualizar descripción del propio sitio.
- `lib/i18n.tsx`: ampliar etiquetas nuevas, preferencia robusta y SSR estable.
- `lib/bus.ts`: compatibilidad de eventos y nuevos eventos estrictamente tipados si hacen falta.
- `next.config.ts`: preservar export/basePath; revisar assets y 404 nuevos.
- `package.json`/`package-lock.json`: instalación reproducible, scripts y dependencias justificadas.
- `eslint.config.mjs`: excepciones específicas solamente cuando la mutación Three sea legítima.
- `README.md`: comandos reales, runtime, modos, QA y publicación estática.

## 14. Criterio de calidad visual y límites de interpretación

Se considera insuficiente entregar cualquiera de estos resultados:

- El mismo sitio ASCII con algunos bordes redondeados y una fuente diferente.
- Una landing genérica con un objeto 3D sin relación con los proyectos.
- Una escena vistosa con textos pequeños, menús incómodos o contacto escondido.
- Una nube de nodos sin conexiones reales.
- Un supuesto metal que se ve negro por falta de entorno, o plástico por exceso de brillo y bloom.
- Una imagen/video pregrabado presentado como escena interactiva.
- Tres canvases independientes para representar los tres modos.
- Un hero terminado seguido de secciones viejas sin adaptar.
- Una interfaz que solo funciona con mouse, GPU potente o animaciones habilitadas.
- “Todos los checks pasan” cuando solo se ejecutó TypeScript o se vio HTTP 200.

La ambición está en la combinación: escultura reconocible, transformación con significado, comportamiento físico, contenido profesional bien contado y ejecución sólida. Si hay que reducir costo, bajar geometría/postproceso/partículas conservando esa idea y su accesibilidad.

## 15. Entrega final exigida

- Código completo en el checkout correcto y cambios ajenos preservados.
- `PRODUCT.md` coherente con el producto y `DESIGN.md` derivado del resultado real.
- README con instalación, scripts, preview, export Pages y pruebas.
- Capturas de portada escritorio/móvil, modo Sistemas, modo ASCII, proyecto abierto, terminal y fallback.
- Resultado de lint, tipos, unit tests, E2E y build estático.
- Registro breve de dispositivos/condiciones de rendimiento; no cifras estimadas presentadas como medidas.
- Estado explícito: implementado, verificado y cualquier punto pendiente.
- Ningún commit, push o deploy presentado como hecho si no se realizó y verificó.

## 16. Prompt de arranque para Claude

> Trabaja en `/Users/sebasflores/orca/seb-sys`. Lee `AGENTS.md`, `PRODUCT.md` y `SPEC-REDISENO-SEB-SYS.md` antes de implementar. Ejecuta la spec completa por fases. El objetivo es un portafolio de Sebastián Flores con acabado comparable al de Apple, personalidad propia y una escena Three.js de siete piezas conectada a sus proyectos reales. La dirección de ejecución es obsidiana, aluminio y fósforo: Núcleo, Sistemas y ASCII son estados del mismo objeto, no tres demos independientes. Conserva contenido ES/EN, terminal, experiencias opcionales y compatibilidad con GitHub Pages. Corrige las regresiones detalladas, crea una instalación reproducible y verifica la matriz de aceptación. No te detengas en un plan ni en el hero; entrega toda la página y evidencia. No inventes logros ni métricas, no sobrescribas trabajo ajeno y no publiques sin una instrucción de publicación. Si falta una decisión menor, toma una opción coherente con la spec y documéntala; consulta solo cuando falte un hecho necesario o haya una contradicción que cambie el alcance.

