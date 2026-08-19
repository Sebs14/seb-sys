"use client";

import dynamic from "next/dynamic";
import { Frame, Divider, Shade } from "@/components/ascii/frame";
import { Typewriter, Scramble, GlitchText, Cursor } from "@/components/ascii/text";
import { LevelBar } from "@/components/ascii/bar";
import { useLang } from "@/lib/i18n";
import { identity, hero, stack } from "@/lib/content";

// El motor WebGL sólo existe en el cliente: nada que prerenderizar,
// y así no entra en el bundle inicial de quien nunca llega al hero.
const AsciiHero = dynamic(
  () => import("@/components/three/ascii-hero").then((m) => m.AsciiHero),
  { ssr: false },
);

export default function Home() {
  const { lang, toggleLang, t, b } = useLang();

  return (
    <main id="main" className="mx-auto max-w-[110ch] px-[2ch] py-[calc(var(--lh)*2)]">
      {/* ── barra superior ─────────────────────────────────────── */}
      <div className="flex items-baseline justify-between text-term-green-dim">
        <span>
          <Shade className="text-term-green-deep" /> {identity.handle}@seb.sys
        </span>
        <button
          onClick={toggleLang}
          className="cursor-pointer text-term-green hover:glow-strong"
        >
          [{t("ui.lang")}: {lang.toUpperCase()}]
        </button>
      </div>

      <Divider className="mt-[var(--lh)]" />

      {/* ── hero ───────────────────────────────────────────────── */}
      <section className="grid items-center gap-[2ch] py-[calc(var(--lh)*2)] md:grid-cols-[1fr_48ch]">
        <div>
          <h1 className="glow-strong text-[2.4rem] leading-[calc(var(--lh)*2)] text-term-green">
            <Scramble text={identity.name.toUpperCase()} onView={false} step={45} />
          </h1>
          <p className="mt-[var(--lh)] text-term-white">
            <Typewriter text={b(identity.role)} delay={900} speed={40} />
          </p>
          <div className="mt-[var(--lh)] text-term-gray">
            {hero.lines.map((line, i) => (
              <p key={i}>
                <span className="text-term-green-dim">{"> "}</span>
                <Scramble
                  text={b(line)}
                  delay={1600 + i * 400}
                  onView={false}
                  step={16}
                />
              </p>
            ))}
          </div>
          <p className="mt-[var(--lh)] text-term-green">
            {"$ "}
            <Cursor />
          </p>
        </div>

        <Frame title="RENDER" meta="ascii/gpu" variant="single" bodyClassName="p-0!">
          <AsciiHero className="h-[calc(var(--lh)*14)] w-full" />
        </Frame>
      </section>

      {/* ── prueba de marcos ───────────────────────────────────── */}
      <div className="grid gap-[var(--lh)] md:grid-cols-2">
        <Frame title="MARCO SIMPLE" meta="single" variant="single">
          <p>
            Los bordes son caracteres reales, recortados al ancho del
            contenedor. Redimensioná la ventana: siguen cerrando.
          </p>
        </Frame>

        <Frame title="MARCO DOBLE" meta="double" variant="double" tone="green" glow>
          <p className="text-term-white">
            <GlitchText text="Pasá el mouse por acá para ver el glitch." />
          </p>
        </Frame>

        <Frame title="MARCO REDONDO" variant="round">
          <p>Variante ╭─╮, la más suave del set.</p>
        </Frame>

        <Frame title="MARCO TENUE" variant="single" tone="white">
          <p>Mismo set, tono bajado: para contenido secundario.</p>
        </Frame>
      </div>

      {/* ── barras de nivel ────────────────────────────────────── */}
      <section className="mt-[calc(var(--lh)*2)]">
        <Frame title="STACK" variant="single">
          <div className="grid gap-[var(--lh)] md:grid-cols-3">
            {stack.map((group) => (
              <div key={group.label.en}>
                <h3 className="mb-[var(--lh)] text-term-green">
                  <Shade className="text-term-green-deep" /> {b(group.label)}
                </h3>
                <div className="space-y-[calc(var(--lh)/3)]">
                  {group.items.map((item) => (
                    <LevelBar
                      key={item.name}
                      label={item.name}
                      level={item.level}
                      width={10}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Frame>
      </section>

      <Divider char="═" className="mt-[calc(var(--lh)*2)]" />
      <p className="py-[var(--lh)] text-term-green-deep">
        FASE 0 + 1 · sistema de grilla y primitivas operativas
      </p>
    </main>
  );
}
