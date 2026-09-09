"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { identity } from "@/lib/content";

/* 404 con el mismo lenguaje visual: tipografía, tokens y un guiño en
   mono. `Link href="/"` respeta el basePath bajo /seb-sys. */
export function NotFoundContent() {
  const { t } = useLang();
  return (
    <main id="main" className="container-x flex min-h-[80vh] flex-col justify-center py-24">
      <p className="t-meta uppercase text-ink-3">404 · seb.sys</p>
      <h1 className="t-display mt-4 text-ink">{t("notFound.title")}</h1>
      <p className="t-lead measure-narrow mt-6 text-ink-2">{t("notFound.lead")}</p>
      <pre aria-hidden className="ascii-art t-meta mt-10 text-phosphor-dim">
        {"$ cd /\n> " + identity.handle + "@seb.sys"}
      </pre>
      <div className="mt-8">
        <Link href="/" className="btn btn-primary">
          {t("notFound.back")}
        </Link>
      </div>
    </main>
  );
}
