"use client";

import dynamic from "next/dynamic";
import { Frame, Divider, Shade } from "@/components/ascii/frame";
import { Typewriter, Scramble, Cursor } from "@/components/ascii/text";
import { LevelBar } from "@/components/ascii/bar";
import { Section } from "@/components/ascii/section";
import { ProjectCard } from "@/components/ascii/project-card";
import { Nav } from "@/components/ascii/nav";
import { ScrollRail } from "@/components/ascii/scroll-rail";
import { useLang } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";
import {
  identity,
  hero,
  about,
  facts,
  stack,
  projects,
  experience,
  contactLinks,
} from "@/lib/content";

// El motor WebGL sólo existe en el cliente: nada que prerenderizar,
// y así no entra en el bundle inicial de quien nunca llega al hero.
const AsciiHero = dynamic(
  () => import("@/components/three/ascii-hero").then((m) => m.AsciiHero),
  { ssr: false },
);

export default function Home() {
  const { t, b } = useLang();

  return (
    <>
      <ScrollRail />

      <main
        id="main"
        className="mx-auto max-w-[110ch] px-[2ch] pb-[calc(var(--lh)*3)]"
      >
        <Nav />

        {/* ── hero ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 items-center gap-[2ch] py-[calc(var(--lh)*2)] md:grid-cols-[1fr_56ch]">
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

          <Frame title="MAPA" meta="proyectos/gpu" variant="single" bodyClassName="p-0!">
            <AsciiHero className="h-[calc(var(--lh)*18)] w-full" />
          </Frame>
        </section>

        <div className="space-y-[calc(var(--lh)*2)]">
          {/* ── sobre mí ───────────────────────────────────────── */}
          <Section id="about" index={1} title={t("nav.about")} meta={b(identity.location)}>
            <p aria-hidden className="text-term-green-dim">
              {"$ cat "}
              {t("nav.about")}
              {".txt"}
            </p>
            <div className="mt-[var(--lh)] grid grid-cols-1 gap-[2ch] md:grid-cols-[1fr_36ch]">
              <div className="space-y-[var(--lh)] text-term-white">
                {about.paragraphs.map((p, i) => (
                  <p key={i}>{b(p)}</p>
                ))}
              </div>

              <Frame title="whoami" variant="round" className="self-start">
                <dl className="space-y-[calc(var(--lh)/3)]">
                  {facts.map((fact) => (
                    <div key={fact.label.en} className="flex gap-[1ch]">
                      <dt className="w-[8ch] shrink-0 text-term-green-dim">
                        {b(fact.label)}
                      </dt>
                      <dd className="min-w-0 flex-1 text-term-white">
                        <span aria-hidden className="text-term-green-deep">
                          {"· "}
                        </span>
                        {b(fact.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Frame>
            </div>
          </Section>

          {/* ── proyectos ──────────────────────────────────────── */}
          <Section
            id="work"
            index={2}
            title={t("nav.work")}
            meta={`n=${projects.length}`}
          >
            <div className="grid grid-cols-1 gap-[var(--lh)] md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Section>

          {/* ── stack ──────────────────────────────────────────── */}
          <Section id="stack" index={3} title={t("nav.stack")}>
            <Frame variant="single">
              <div className="grid grid-cols-1 gap-[var(--lh)] md:grid-cols-3">
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
          </Section>

          {/* ── experiencia ────────────────────────────────────── */}
          <Section id="experience" index={4} title={t("nav.experience")}>
            <div className="space-y-[var(--lh)]">
              {experience.map((job) => (
                <div key={job.company} className="flex gap-[1ch]">
                  {/* El riel de la línea de tiempo: años arriba, glifos
                      de continuidad abajo. Decorativo, va oculto. */}
                  <div
                    aria-hidden
                    className="w-[12ch] shrink-0 select-none whitespace-pre text-term-green-deep"
                  >
                    {job.from}
                    {" ─┬"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-term-green">
                      {job.company}
                      <span className="text-term-gray">
                        {"  "}
                        {job.from}
                        {job.to === job.from
                          ? ""
                          : `—${job.to ?? t("ui.present")}`}
                      </span>
                    </p>
                    <p className="text-term-white">{b(job.role)}</p>
                    <ul
                      className={clsx(
                        "space-y-[calc(var(--lh)/2)]",
                        job.bullets.length > 0 && "mt-[calc(var(--lh)/2)]",
                      )}
                    >
                      {job.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-[1ch] text-term-gray">
                          <span
                            aria-hidden
                            className="shrink-0 select-none text-term-green-deep"
                          >
                            ├─
                          </span>
                          <span className="min-w-0">{b(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── contacto ───────────────────────────────────────── */}
          <Section id="contact" index={5} title={t("nav.contact")}>
            <Frame variant="double" tone="green" glow>
              <ul className="space-y-[calc(var(--lh)/2)]">
                {contactLinks.map((link) => (
                  <li key={link.label} className="flex gap-[1ch]">
                    <span className="w-[9ch] shrink-0 text-term-green-dim">
                      {link.label}
                    </span>
                    <a
                      href={link.href}
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noreferrer noopener"
                      className="min-w-0 break-all text-term-white hover:glow-strong hover:text-term-green"
                    >
                      {link.value}
                    </a>
                  </li>
                ))}
              </ul>
            </Frame>
          </Section>
        </div>

        <Divider char="═" className="mt-[calc(var(--lh)*2)]" />
        <p className="flex flex-wrap items-baseline justify-between gap-x-[2ch] pt-[var(--lh)] text-term-green-deep">
          <span>
            {identity.name} · {new Date().getFullYear()} ·{" "}
            <span className="text-term-green-dim">hecho con caracteres</span>
          </span>
          <span className="text-term-green-dim">{t("term.hint")}</span>
        </p>
      </main>
    </>
  );
}
