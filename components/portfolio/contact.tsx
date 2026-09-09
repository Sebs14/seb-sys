"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { contactLinks, identity, projects } from "@/lib/content";

/* ══════════════════════════════════════════════════════════════
   CONTACTO Y CIERRE

   Nombre, invitación breve y los enlaces reales de `identity`. El
   correo se puede seleccionar; "Copiar" anuncia éxito sólo después de
   que `clipboard.writeText` resolvió, y si falla dice qué hacer. Sin
   formulario: es un sitio estático.
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
    <section id="contact" className="section-y container-x" aria-labelledby="contact-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
        <div>
          <p className="t-meta uppercase text-ink-3">{t("nav.contact")}</p>
          <h2 id="contact-title" className="t-h2 mt-3 text-ink">
            {identity.name}
          </h2>
          <p className="t-lead measure-narrow mt-4 text-ink-2">{t("contact.lead")}</p>
        </div>

        <div className="panel p-6 md:p-7">
          {email && (
            <>
              <p className="t-meta uppercase text-ink-3">{email.label}</p>
              <a href={email.href} className="link t-body mt-2 block font-semibold text-ink select-all [overflow-wrap:anywhere]">
                {email.value}
              </a>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href={email.href} className="btn btn-primary btn-sm">
                  {t("contact.write")}
                </a>
                <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
                  {t("contact.copy")}
                </button>
              </div>
              <p className="t-small mt-3 min-h-[1.5rem] text-ink-3" role="status">
                {copied === "ok" ? t("contact.copied") : copied === "fail" ? t("contact.copyFailed") : ""}
              </p>
            </>
          )}
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-stroke pt-4">
            {others.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer noopener" className="link t-small text-ink-2">
                  <span className="t-meta mr-2 uppercase text-ink-3">{link.label}</span>
                  {link.value}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const { t } = useLang();
  const site = projects.find((p) => p.id === "ascii-portfolio");
  return (
    <footer className="container-x border-t border-stroke py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="t-small text-ink-3">
          {identity.name} · {new Date().getFullYear()} · {t("footer.made")}
        </p>
        <div className="flex items-center gap-5">
          {site?.source && (
            <a href={site.source} target="_blank" rel="noreferrer noopener" className="link t-small text-ink-2">
              {t("footer.source")}
            </a>
          )}
          <pre aria-hidden className="ascii-art t-meta text-phosphor-dim select-none">{"░▒▓ seb.sys"}</pre>
        </div>
      </div>
    </footer>
  );
}
