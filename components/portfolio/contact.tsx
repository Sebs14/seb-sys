"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { contactLinks, identity, projects } from "@/lib/content";
import { LiquidHeadline, PALETTES_METAL } from "@/components/fx/liquid-headline";

/* ══════════════════════════════════════════════════════════════
   CONTACTO Y CIERRE

   El nombre como titular líquido (la misma pieza que la portada, en
   aluminio), invitación breve y los enlaces reales de `identity`. El
   correo se puede seleccionar; "Copiar" anuncia éxito sólo después de
   que `clipboard.writeText` resolvió, y si falla dice qué hacer. Sin
   formulario: es un sitio estático. Abajo, la marca grande cortada
   por el borde de la página.
   ══════════════════════════════════════════════════════════════ */

export function Contact() {
  const { t } = useLang();
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    if (copied === "idle") return;
    const timer = window.setTimeout(() => setCopied("idle"), 2600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  };

  const email = contactLinks.find((l) => l.href.startsWith("mailto:"));
  const others = contactLinks.filter((l) => !l.href.startsWith("mailto:"));

  return (
    <section id="contact" className="section-y container-x text-center" aria-labelledby="contact-title">
      <p className="t-ui flex items-center justify-center gap-3 text-ink-3">
        <span aria-hidden className="h-px w-6 bg-accent" />
        {t("nav.contact")}
        <span aria-hidden className="h-px w-6 bg-accent" />
      </p>
      <LiquidHeadline
        id="contact-title"
        as="h2"
        lines={[identity.name]}
        palettes={PALETTES_METAL}
        className="mt-6 [--liquid-size:clamp(2.5rem,1rem+6.4vw,6rem)]"
      />
      <p className="t-lead measure-narrow mx-auto mt-6 text-ink-2">{t("contact.lead")}</p>

      {email && (
        <div className="mt-10">
          <a href={email.href} className="link t-lead font-medium text-ink select-all [overflow-wrap:anywhere]">
            {email.value}
          </a>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={email.href} className="btn btn-primary">
              {t("contact.write")}
            </a>
            <button type="button" className="btn btn-secondary" onClick={copy}>
              {t("contact.copy")}
            </button>
          </div>
          <p className="t-small mt-3 min-h-[1.6em] text-ink-3" role="status">
            {copied === "ok" ? t("contact.copied") : copied === "fail" ? t("contact.copyFailed") : ""}
          </p>
        </div>
      )}
      <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {others.map((link) => (
          <li key={link.label}>
            <a href={link.href} target="_blank" rel="noreferrer noopener" className="link t-small text-ink-2">
              <span className="t-meta mr-2 uppercase text-ink-3">{link.label}</span>
              {link.value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SiteFooter() {
  const { t } = useLang();
  const site = projects.find((p) => p.id === "ascii-portfolio");
  return (
    <footer className="overflow-hidden border-t border-stroke">
      <div className="container-x flex flex-wrap items-center justify-between gap-4 py-8">
        <p className="t-small text-ink-3">
          {identity.name} · {new Date().getFullYear()} · {t("footer.made")}
        </p>
        {site?.source && (
          <a href={site.source} target="_blank" rel="noreferrer noopener" className="link t-small text-ink-2">
            {t("footer.source")}
          </a>
        )}
      </div>
      <p aria-hidden className="wordmark">
        seb.sys
      </p>
    </footer>
  );
}
