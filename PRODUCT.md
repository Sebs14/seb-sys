# seb.sys

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Portafolio personal de Sebastián Flores, ingeniero de software en El Salvador. Permite conocer su trabajo, explorar sus proyectos reales y contactarlo.

## Capabilities and Constraints

- Conservar el contenido real bilingüe de `lib/content.ts`, los siete proyectos, la trayectoria y los enlaces existentes.
- Conservar la terminal navegable, sus comandos y las experiencias opcionales. La webcam requiere una acción explícita del visitante.
- Next.js 16, React 19, Three.js y React Three Fiber (sin drei); despliegue estático compatible con GitHub Pages bajo `/seb-sys`. Node 24 LTS, npm ≥ 11.6.
- El contenido y la navegación deben funcionar sin WebGL y con movimiento reducido.
- No inventar resultados, cifras, clientes ni logros profesionales.

## Brand Commitments

Nombre: seb.sys. El usuario pide una página más entretenida, con personalidad, un acabado comparable al de Apple y un uso ambicioso de Three.js. Autoriza aplicar todas las mejoras de la revisión: robustez, instalación, lint, accesibilidad, contraste, móvil, accesos a proyectos/contacto y prueba del trabajo mediante contenido real.

## Delivered (2026-09-08)

Rediseño completo: portada editorial con escultura de siete piezas (Núcleo / Sistemas / ASCII), dos casos destacados con esquema del sistema, lista de proyectos con detalle accesible, stack con evidencia por proyecto, experiencia, laboratorio voluntario y contacto. Terminal refactorizada (parser, historial y comandos puros con pruebas). Instalación reproducible (Node 24, lockfile válido con npm 11.18), lint y tipos en verde, Vitest y Playwright, CI de validación. Ver `DESIGN.md` y `README.md`.

## Evidence on Hand

`lib/content.ts` contiene proyectos, descripciones, tecnologías, contribuciones y trayectoria. El sitio existente incluye un mapa de proyectos conectado por tecnologías compartidas y una terminal. La revisión reprodujo el fallo de recuperación WebGL y el atasco del historial después de pulsar flecha abajo.

## Product Principles

- La exploración debe mostrar el trabajo real.
- El movimiento responde al visitante y mantiene controles accesibles.
- El estilo experimental convive con lectura clara y acceso directo al contacto.
- Las mejoras se verifican en escritorio, móvil y condiciones de capacidad reducida.
