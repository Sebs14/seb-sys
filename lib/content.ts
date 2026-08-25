import type { Bi } from "./i18n";

/* ══════════════════════════════════════════════════════════════
   CONTENIDO DEL PORTAFOLIO
   Este es el único archivo que tocás para cambiar qué dice el
   sitio. Todo son pares { es, en }: la i18n resuelve el idioma
   activo con b(). Nada de copy suelto en los componentes.
   ══════════════════════════════════════════════════════════════ */

export const identity = {
  name: "Sebastián Flores",
  handle: "sebs14",
  role: {
    es: "Ingeniero de Software",
    en: "Software Engineer",
  } satisfies Bi,
  location: { es: "El Salvador", en: "El Salvador" } satisfies Bi,
  email: "floresirahetasebastian@hotmail.com",
  github: "https://github.com/Sebs14",
  linkedin: "https://www.linkedin.com/in/sebsflores/",
  // URL real de publicación: alimenta el metadataBase, o sea las
  // URLs absolutas de las metaetiquetas al compartir el link.
  site: "https://sebs14.github.io/seb-sys",
};

export const hero = {
  // Líneas que se tipean en secuencia en el hero.
  lines: [
    { es: "Construyo sistemas que aguantan.", en: "I build systems that hold up." },
    {
      es: "Backend, interfaces y todo lo que hay en medio.",
      en: "Backend, interfaces, and everything in between.",
    },
  ] satisfies Bi[],
};

export const about = {
  paragraphs: [
    {
      es: "Ingeniero salvadoreño. Trabajo en sistemas públicos de educación: plataformas que usan miles de niños, maestros y directores al mismo tiempo, donde el software tiene que funcionar para todos y no solo para el caso feliz.",
      en: "Salvadoran engineer. I work on public education systems: platforms used by thousands of kids, teachers and principals at once, where software has to work for everyone and not just the happy path.",
    },
    {
      es: "Me toca de punta a punta: el motor de optimización o de IA por dentro, la API que lo orquesta y la pantalla donde alguien que no es técnico entiende el resultado. Casi siempre lo difícil no es el algoritmo, es que el dato real venga sucio.",
      en: "I work end to end: the optimization or AI engine inside, the API that orchestrates it, and the screen where a non-technical person understands the result. The hard part is rarely the algorithm — it's that real data comes in dirty.",
    },
    {
      es: "No entrego sin evidencia. Si digo que un motor da el mismo resultado que el piloto, es porque comparé fila por fila. Fuera del trabajo construyo cosas como esta: experimentos donde la interfaz es el punto.",
      en: "I don't ship without evidence. If I say an engine matches the pilot, it's because I compared it row by row. Outside work I build things like this: experiments where the interface is the point.",
    },
  ] satisfies Bi[],
};

/* ── ficha ────────────────────────────────────────────────────
   Los pares que van al panel `whoami` del bloque "sobre mí": el
   texto largo ocupa una columna y esto la otra, así la sección
   llena el ancho en vez de dejar media pantalla vacía.          */

export type Fact = { label: Bi; value: Bi };

export const facts: Fact[] = [
  {
    label: { es: "rol", en: "role" },
    value: { es: "fullstack", en: "fullstack" },
  },
  {
    label: { es: "base", en: "based" },
    value: { es: "El Salvador", en: "El Salvador" },
  },
  {
    label: { es: "dominio", en: "domain" },
    value: { es: "educación pública", en: "public education" },
  },
  {
    label: { es: "idiomas", en: "languages" },
    value: { es: "español · inglés", en: "Spanish · English" },
  },
  {
    label: { es: "enfoque", en: "focus" },
    value: {
      es: "sistemas con datos reales",
      en: "systems with real data",
    },
  },
  {
    label: { es: "estado", en: "status" },
    value: { es: "abierto a proyectos", en: "open to projects" },
  },
];

/* ── stack ────────────────────────────────────────────────────
   `level` alimenta la barra de bloques ░▒▓█ (0-100).           */

export type StackItem = { name: string; level: number };
export type StackGroup = { label: Bi; items: StackItem[] };

export const stack: StackGroup[] = [
  {
    label: { es: "LENGUAJES", en: "LANGUAGES" },
    items: [
      { name: "TypeScript", level: 90 },
      { name: "Python", level: 82 },
      { name: "SQL", level: 80 },
      { name: "Dart", level: 62 },
      { name: "GLSL", level: 45 },
    ],
  },
  {
    label: { es: "INTERFAZ", en: "INTERFACE" },
    items: [
      { name: "React", level: 90 },
      { name: "Next.js", level: 88 },
      { name: "Tailwind", level: 85 },
      { name: "Expo / RN", level: 70 },
      { name: "Three.js", level: 55 },
    ],
  },
  {
    label: { es: "SERVIDOR / DATOS", en: "SERVER / DATA" },
    items: [
      { name: "FastAPI", level: 85 },
      { name: "NestJS", level: 80 },
      { name: "PostgreSQL", level: 82 },
      { name: "GCP", level: 72 },
      { name: "Docker", level: 70 },
    ],
  },
];

/* ── proyectos ────────────────────────────────────────────────
   `flow` es un diagrama de una línea, en caracteres: la idea es
   que la card no solo se vea bien, también explique la forma del
   sistema. Se dibuja tal cual, así que conviene mantenerlo corto
   (~46 caracteres) para que no rompa la grilla en móvil.        */

export type Project = {
  id: string;
  name: string;
  /** Para quién se construyó. */
  org: Bi;
  year: string;
  tagline: Bi;
  description: Bi;
  /** Diagrama de una línea de la arquitectura, en caracteres. */
  flow?: string;
  /** Datos duros. Sin adjetivos: números o decisiones. */
  highlights?: Bi[];
  tags: string[];
  live?: string;
  source?: string;
  /** Marca el proyecto como destacado (card doble ancho). */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "fluidez-lectora",
    name: "Evaluación de fluidez lectora",
    org: { es: "Ministerio de Educación", en: "Ministry of Education" },
    year: "2026",
    featured: true,
    tagline: {
      es: "Un niño lee en voz alta y un motor de IA lo evalúa",
      en: "A child reads out loud and an AI engine grades it",
    },
    description: {
      es: "Plataforma nacional para medir fluidez lectora oral en primaria. El estudiante graba una lectura desde una app móvil; el audio se procesa fuera de línea y vuelve convertido en métricas — precisión, palabras por minuto, prosodia y comprensión. Del otro lado, docentes y directores ven el nivel de cada grado.",
      en: "National platform for measuring oral reading fluency in primary school. The student records a reading from a mobile app; the audio is processed out of band and comes back as metrics — accuracy, words per minute, prosody and comprehension. On the other side, teachers and principals see each grade's level.",
    },
    flow: "app ─▶ storage ─▶ cola ─▶ motor IA ─▶ panel",
    highlights: [
      {
        es: "Pipeline de audio asíncrono: subida firmada, cola de mensajes, job aislado por audio y callback de resultado.",
        en: "Async audio pipeline: signed upload, message queue, one isolated job per audio, result callback.",
      },
      {
        es: "Un panel web para el ministerio y una app aparte para el niño, sobre la misma API y con reglas de sesión distintas.",
        en: "A web panel for the ministry and a separate app for the child, on one API with different session rules.",
      },
      {
        es: "Tres entornos con despliegue automático por rama; yo manejo las promociones.",
        en: "Three environments with automatic per-branch deploys; I own the promotions.",
      },
    ],
    tags: ["Next.js", "Expo", "FastAPI", "PostgreSQL", "GCP", "Pub/Sub"],
  },
  {
    id: "gamificacion-lxp",
    name: "Motor de gamificación",
    org: { es: "Plataforma nacional de aprendizaje", en: "National learning platform" },
    year: "2026",
    featured: true,
    tagline: {
      es: "Reglas de negocio que se editan sin tocar el código",
      en: "Business rules you edit without touching code",
    },
    description: {
      es: "Sistema de puntos, insignias y una billetera canjeable por premios reales. La decisión de diseño que lo define: el motor no tiene fórmulas fijas. Cada regla es métrica + comparador + valor con su efecto y su ventana de tiempo, y se crea, apaga o borra desde el panel. El sistema rechaza las contradicciones — pagar menos por exigir más, por ejemplo — y cita la regla en conflicto.",
      en: "A points, badges and redeemable-wallet system. The defining design decision: the engine has no hardcoded formulas. Every rule is metric + comparator + value with its effect and time window, created, disabled or deleted from the panel. The system rejects contradictions — paying less for demanding more, say — and names the conflicting rule.",
    },
    flow: "ingesta ─▶ reglas ─▶ XP ─▶ billetera ─▶ canje",
    highlights: [
      {
        es: "Certificado contra la entrega del piloto: 0 diferencias en 1.3 millones de filas.",
        en: "Certified against the pilot delivery: 0 mismatches across 1.3 million rows.",
      },
      {
        es: "Simulación en sombra: antes de publicar un cambio de reglas se ve el costo en dinero y el delta de cada billetera.",
        en: "Shadow simulation: before publishing a rule change you see the cost in money and every wallet's delta.",
      },
      {
        es: "Configuración versionada con recálculo retroactivo, y trinquete: lo ya ganado nunca baja.",
        en: "Versioned config with retroactive recalculation, and a ratchet: what was earned never goes down.",
      },
      {
        es: "Tres roles con el alcance impuesto en el servidor, no en la interfaz. 362 pruebas.",
        en: "Three roles with scope enforced on the server, not in the UI. 362 tests.",
      },
    ],
    tags: ["Next.js", "NestJS", "CQRS", "PostgreSQL", "TOTP"],
  },
  {
    id: "horarios-escolares",
    name: "Horarios escolares",
    org: { es: "Ministerio de Educación", en: "Ministry of Education" },
    year: "2026",
    tagline: {
      es: "Un Excel entra, la semana completa sale",
      en: "An Excel goes in, the full week comes out",
    },
    description: {
      es: "Generador de horarios para centros educativos. Un técnico sube el Excel del ministerio y un motor de programación por restricciones (CP-SAT) arma la semana entera por sección: todas las materias a la vez, básica y bachillerato con jornadas distintas.",
      en: "Timetable generator for schools. A staffer uploads the ministry's Excel and a constraint-programming engine (CP-SAT) builds the entire week per section: every subject at once, with different day lengths per school cycle.",
    },
    flow: "excel ─▶ parser ─▶ CP-SAT ─▶ conflictos ─▶ horario",
    highlights: [
      {
        es: "Restricciones duras (nadie en dos aulas a la vez, carga semanal, elegibilidad) separadas de las blandas con peso: no poner matemática a última hora pesa distinto que repartir bien la carga.",
        en: "Hard constraints (nobody in two rooms at once, weekly load, eligibility) kept apart from weighted soft ones: avoiding math in the last period weighs differently than spreading load evenly.",
      },
      {
        es: "Detección de conflictos posterior a la generación, para que el usuario vea por qué un horario no cierra en vez de recibir un error.",
        en: "Post-generation conflict detection, so the user sees why a timetable doesn't close instead of getting an error.",
      },
    ],
    tags: ["Python", "FastAPI", "OR-Tools", "React", "Docker"],
  },
  {
    id: "video-pipeline",
    name: "Pipeline de cortos animados",
    org: { es: "Producto interno", en: "Internal product" },
    year: "2026",
    tagline: {
      es: "De guion a corto animado, con el corte invisible",
      en: "From script to animated short, with an invisible cut",
    },
    description: {
      es: "Pipeline de punta a punta para generar cortos animados con IA: hojas de personajes y sets con estilo bloqueado, luego fotogramas clave, luego imagen-a-video por toma, y al final ensamble con voz en off, subtítulos y música.",
      en: "End-to-end pipeline for AI-generated animated shorts: character and set sheets with locked style, then keyframes, then image-to-video per shot, then assembly with voiceover, subtitles and music.",
    },
    flow: "guion ─▶ anclas ─▶ claves ─▶ tomas ─▶ master",
    highlights: [
      {
        es: "La idea central: el empalme es un fotograma compartido — el final de una toma ES el inicio de la siguiente, así el corte no se ve.",
        en: "The core idea: a splice is a shared frame — the end of one shot IS the start of the next, so the cut is invisible.",
      },
      {
        es: "Grafo de dependencias que marca como desactualizado todo video cuyo fotograma cambió, y bloquea el render final hasta que no queda nada viejo.",
        en: "A dependency graph that marks any video whose keyframe changed as stale, and blocks the final render until nothing is stale.",
      },
      {
        es: "La interfaz muestra los clips a escala de su duración: la línea de tiempo informa además de verse.",
        en: "The UI draws clips scaled to their duration: the timeline informs as well as looks.",
      },
    ],
    tags: ["Python", "FastAPI", "React", "ffmpeg", "fal.ai"],
  },
  {
    id: "tp-rental",
    name: "TP Rental",
    org: { es: "Renta de autos · El Salvador", en: "Car rental · El Salvador" },
    year: "2026",
    tagline: {
      es: "App de renta de autos, del registro a la reserva",
      en: "Car rental app, from signup to booking",
    },
    description: {
      es: "Aplicación móvil de renta de vehículos. Lo interesante estaba en el borde aburrido: un registro que aguanta usuarios reales — código de un solo uso al correo, validación de documento de identidad, recuperación de contraseña — más el catálogo y el flujo de reserva.",
      en: "Mobile car rental app. The interesting part was the boring edge: a signup that survives real users — one-time email codes, ID document validation, password recovery — plus the catalog and booking flow.",
    },
    flow: "registro ─▶ OTP ─▶ catálogo ─▶ reserva",
    highlights: [
      {
        es: "Auditoría inicial y luego cuatro fases de implementación sobre el hallazgo.",
        en: "An initial audit, then four implementation phases built on the findings.",
      },
      {
        es: "Migración de la interfaz a un sistema de componentes consistente, con material tipo vidrio.",
        en: "UI migrated to a consistent component system, with glass-like material.",
      },
    ],
    tags: ["Flutter", "NestJS", "PostgreSQL", "JWT"],
  },
  {
    id: "uassistme",
    name: "Sitio de marketing",
    org: { es: "Cliente · consultoría", en: "Client · consulting" },
    year: "2026",
    tagline: {
      es: "Los formularios perdían los mensajes en silencio",
      en: "The forms were losing messages silently",
    },
    description: {
      es: "Auditoría y ejecución sobre un sitio corporativo hecho por otra agencia. El hallazgo principal: los tres formularios enviaban al CRM con los campos mapeados a un campo genérico, así que el mensaje del prospecto se perdía sin error visible. Se arregló y se verificó en vivo.",
      en: "Audit and execution on a corporate site built by another agency. Main finding: all three forms posted to the CRM with fields mapped to a generic one, so the prospect's message vanished with no visible error. Fixed and verified live.",
    },
    flow: "auditoría ─▶ formularios ─▶ analítica ─▶ SSR",
    highlights: [
      {
        es: "Conversiones instrumentadas y confirmadas en analítica como evento clave.",
        en: "Conversions instrumented and confirmed in analytics as a key event.",
      },
      {
        es: "Cuatro componentes pasados a renderizado en servidor: el contenido ahora existe en el HTML crudo y dejó de viajar al cliente.",
        en: "Four components moved to server rendering: content now exists in the raw HTML and stopped shipping to the client.",
      },
      {
        es: "Sin ambiente de pruebas y con despliegue directo a producción, cada cambio salió con comparación antes/después.",
        en: "With no staging and deploys going straight to production, every change shipped with a before/after comparison.",
      },
    ],
    tags: ["Next.js", "Sanity", "SEO", "GA4", "HubSpot"],
  },
  {
    id: "ascii-portfolio",
    name: "seb.sys",
    org: { es: "Este sitio", en: "This site" },
    year: "2026",
    tagline: {
      es: "Portafolio renderizado enteramente en caracteres",
      en: "A portfolio rendered entirely in characters",
    },
    description: {
      es: "Un motor de post-proceso en WebGL convierte una escena 3D en glifos: la escena se renderiza a un texel por celda de caracter y un shader elige el glifo según la luminancia. Los marcos tampoco son CSS — son tiras de caracteres recortadas al ancho disponible.",
      en: "A WebGL post-processing engine turns a 3D scene into glyphs: the scene renders to one texel per character cell and a shader picks the glyph from its luminance. The frames aren't CSS either — they're character strips clipped to the available width.",
    },
    flow: "escena ─▶ 1 texel/celda ─▶ atlas ─▶ glifo",
    highlights: [
      {
        es: "Todo vive en la GPU: el AsciiEffect de los ejemplos de Three.js genera una tabla con miles de nodos del DOM y se arrastra.",
        en: "It all lives on the GPU: the AsciiEffect from the Three.js examples builds a table with thousands of DOM nodes and crawls.",
      },
      {
        es: "El ASCII decorativo va oculto al lector de pantalla y el texto real se expone en paralelo.",
        en: "Decorative ASCII is hidden from screen readers and the real text is exposed alongside it.",
      },
    ],
    tags: ["Next.js", "Three.js", "GLSL", "TypeScript"],
    source: "https://github.com/Sebs14/seb-sys",
  },
];

/* ── experiencia ────────────────────────────────────────────── */

export type Job = {
  company: string;
  role: Bi;
  from: string;
  /** null = actual */
  to: string | null;
  bullets: Bi[];
};

export const experience: Job[] = [
  {
    company: "GOES — Gobierno de El Salvador",
    role: {
      es: "Ingeniero de Software Fullstack",
      en: "Fullstack Software Engineer",
    },
    from: "feb 2026",
    to: null,
    bullets: [
      {
        es: "Plataformas de educación pública de punta a punta: interfaz en Next.js y React Native, servicios en FastAPI y NestJS, datos en PostgreSQL sobre Cloud Run.",
        en: "Public education platforms end to end: Next.js and React Native interfaces, FastAPI and NestJS services, PostgreSQL data on Cloud Run.",
      },
      {
        es: "Integración con motores de IA y de optimización hechos por otros equipos: yo defino el contrato, la cola y el camino de vuelta del resultado.",
        en: "Integration with AI and optimization engines built by other teams: I define the contract, the queue and the result's way back.",
      },
      {
        es: "Certificación de resultados contra entregas de referencia antes de dar algo por bueno, y promoción entre entornos dev → qa → producción.",
        en: "Certifying results against reference deliveries before calling anything done, and promoting across dev → qa → production.",
      },
    ],
  },
  {
    company: "UassistME",
    role: {
      es: "Independiente — consultoría y desarrollo Fullstack",
      en: "Freelance — Fullstack consulting and development",
    },
    // TODO: si querés el mes de arranque, decímelo; dejé sólo el año.
    from: "2026",
    to: null,
    bullets: [],
  },
  {
    company: "Cikume Software",
    role: {
      es: "Ingeniero Fullstack",
      en: "Fullstack Engineer",
    },
    from: "ene 2025",
    to: "feb 2026",
    bullets: [],
  },
  {
    company: "Analiza — Veterinarias Centroamericanas",
    role: {
      es: "Gerente de Proyectos",
      en: "Project Manager",
    },
    from: "2024",
    to: "2024",
    bullets: [],
  },
  {
    company: "DataSoft",
    role: {
      es: "Ingeniero Fullstack",
      en: "Fullstack Engineer",
    },
    from: "2023",
    to: "2023",
    bullets: [],
  },
  {
    company: "Elaniin",
    role: {
      es: "Ingeniero Fullstack",
      en: "Fullstack Engineer",
    },
    from: "nov 2022",
    to: "mar 2023",
    bullets: [],
  },
];

/* ── contacto ─────────────────────────────────────────────────── */

export type ContactLink = { label: string; value: string; href: string };

export const contactLinks: ContactLink[] = [
  {
    label: "EMAIL",
    value: identity.email,
    href: `mailto:${identity.email}`,
  },
  { label: "GITHUB", value: "@" + identity.handle, href: identity.github },
  { label: "LINKEDIN", value: "/in/sebsflores", href: identity.linkedin },
];
