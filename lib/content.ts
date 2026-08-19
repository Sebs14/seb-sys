import type { Bi } from "./i18n";

/* ══════════════════════════════════════════════════════════════
   CONTENIDO DEL PORTAFOLIO
   Este es el único archivo que tocás para cambiar qué dice el
   sitio. Todo lo marcado con TODO son placeholders míos: cambialos
   por lo tuyo real. La estructura ya está lista.
   ══════════════════════════════════════════════════════════════ */

export const identity = {
  name: "Sebastián Flores",
  handle: "sebs14",
  // TODO: ajustá el rol a como te querés presentar
  role: {
    es: "Desarrollador de Software",
    en: "Software Developer",
  } satisfies Bi,
  location: { es: "El Salvador", en: "El Salvador" } satisfies Bi,
  email: "floresirahetasebastian@hotmail.com",
  // TODO: confirmá/ajustá estos links
  github: "https://github.com/Sebs14",
  linkedin: "",
  // TODO: poné tu dominio final cuando lo compres
  site: "https://seb.sys",
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
  // TODO: reescribí esto con tu voz. Dejé la estructura: 3 párrafos
  // cortos funcionan mejor que uno largo en una grilla monoespaciada.
  paragraphs: [
    {
      es: "Desarrollador salvadoreño. Trabajo en sistemas de gobierno, donde el software tiene que funcionar para todos y no solo para el caso feliz.",
      en: "Salvadoran developer. I work on government systems, where software has to work for everyone and not just the happy path.",
    },
    {
      es: "Me interesa la parte poco glamorosa: migraciones, datos sucios, procesos que nadie quiere tocar. Ahí es donde se nota el oficio.",
      en: "I'm drawn to the unglamorous parts: migrations, dirty data, processes nobody wants to touch. That's where craft shows.",
    },
    {
      es: "Fuera del trabajo construyo cosas como esta: experimentos donde la interfaz es el punto.",
      en: "Outside work I build things like this: experiments where the interface is the point.",
    },
  ] satisfies Bi[],
};

/* ── stack ────────────────────────────────────────────────────
   `level` alimenta la barra de bloques ░▒▓█ (0-100).
   TODO: ajustá niveles y agregá/quitá lo que corresponda.        */

export type StackItem = { name: string; level: number };
export type StackGroup = { label: Bi; items: StackItem[] };

export const stack: StackGroup[] = [
  {
    label: { es: "LENGUAJES", en: "LANGUAGES" },
    items: [
      { name: "TypeScript", level: 90 },
      { name: "JavaScript", level: 90 },
      { name: "Python", level: 75 },
      { name: "SQL", level: 80 },
    ],
  },
  {
    label: { es: "FRONTEND", en: "FRONTEND" },
    items: [
      { name: "React", level: 90 },
      { name: "Next.js", level: 85 },
      { name: "Tailwind", level: 85 },
      { name: "Three.js", level: 55 },
    ],
  },
  {
    label: { es: "BACKEND / DATOS", en: "BACKEND / DATA" },
    items: [
      { name: "Node.js", level: 85 },
      { name: "PostgreSQL", level: 80 },
      { name: "Docker", level: 70 },
      { name: "Git", level: 88 },
    ],
  },
];

/* ── proyectos ────────────────────────────────────────────────
   TODO: reemplazá con tus proyectos reales. `art` es el glifo
   grande que se muestra en la card (opcional, hay fallback).     */

export type Project = {
  id: string;
  name: string;
  year: string;
  tagline: Bi;
  description: Bi;
  tags: string[];
  live?: string;
  source?: string;
  /** Marca el proyecto como destacado (card doble ancho). */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "ascii-portfolio",
    name: "seb.sys",
    year: "2026",
    featured: true,
    tagline: {
      es: "Portafolio renderizado enteramente en caracteres",
      en: "A portfolio rendered entirely in characters",
    },
    description: {
      es: "Este sitio. Un motor de post-proceso en WebGL convierte una escena 3D en glifos, y toda la interfaz se alinea a una grilla monoespaciada real. Incluye una terminal funcional.",
      en: "This site. A WebGL post-processing engine turns a 3D scene into glyphs, and the whole interface snaps to a real monospaced grid. Includes a working terminal.",
    },
    tags: ["Next.js", "Three.js", "GLSL", "TypeScript"],
    source: "https://github.com/Sebs14",
  },
  {
    id: "placeholder-2",
    name: "proyecto-dos",
    year: "2025",
    tagline: {
      es: "TODO: una línea que lo resuma",
      en: "TODO: a one-line summary",
    },
    description: {
      es: "TODO: dos o tres líneas sobre qué problema resolvía, qué construiste y qué resultado tuvo. Los números concretos pegan más que los adjetivos.",
      en: "TODO: two or three lines on what problem it solved, what you built, and the outcome. Concrete numbers land harder than adjectives.",
    },
    tags: ["TODO", "TODO"],
  },
  {
    id: "placeholder-3",
    name: "proyecto-tres",
    year: "2025",
    tagline: { es: "TODO", en: "TODO" },
    description: { es: "TODO", en: "TODO" },
    tags: ["TODO"],
  },
];

/* ── experiencia ──────────────────────────────────────────────
   TODO: llenar con tu trayectoria real.                          */

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
    company: "GOES",
    role: {
      es: "Desarrollador de Software",
      en: "Software Developer",
    },
    from: "2024",
    to: null,
    bullets: [
      {
        es: "TODO: un logro medible. Qué construiste, para quién, con qué impacto.",
        en: "TODO: one measurable win. What you built, for whom, with what impact.",
      },
      {
        es: "TODO: una responsabilidad técnica concreta.",
        en: "TODO: one concrete technical responsibility.",
      },
    ],
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
  // TODO: descomentá y llená cuando tengas el link
  // { label: "LINKEDIN", value: "/in/...", href: identity.linkedin },
];
