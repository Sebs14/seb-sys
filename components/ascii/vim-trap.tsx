"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

/* ══════════════════════════════════════════════════════════════
   vim

   El chiste que todo dev entiende: entrás y no sabés salir. Sólo
   `:q!` cierra. Es una trampa AMABLE: la barra de estado dice cómo
   salir y además hay un botón visible. Es un diálogo de verdad: toma
   el foco, lo mantiene y lo devuelve al cerrar.
   ══════════════════════════════════════════════════════════════ */

const BUFFER = ["#!/usr/bin/env seb", "", "// no hay nada que editar acá.", "// esto es un portafolio.", ""];

export function VimTrap({ onDone }: { onDone: () => void }) {
  const { t } = useLang();
  const [cmd, setCmd] = useState("");
  const [message, setMessage] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previous.current = document.activeElement as HTMLElement | null;
    boxRef.current?.focus();
    return () => {
      const el = previous.current;
      if (el && document.contains(el)) el.focus();
    };
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onKey = (e: KeyboardEvent) => {
      // Sólo captura el teclado mientras el diálogo tiene el foco.
      if (!box.contains(document.activeElement)) return;
      if (e.key === "Tab") return; // el botón de salir sigue alcanzable
      e.preventDefault();
      if (e.key === "Escape") {
        setCmd("");
        setMessage(t("vim.hint"));
        return;
      }
      if (e.key === "Enter") {
        const line = cmd.trim();
        if (line === ":q!" || line === ":quit!" || line === ":qa!") {
          onDone();
          return;
        }
        if (line === ":q" || line === ":wq" || line === ":x") setMessage(t("vim.nowrite"));
        else if (line) setMessage(t("vim.hint"));
        setCmd("");
        return;
      }
      if (e.key === "Backspace") {
        setCmd((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key.length === 1) setCmd((prev) => prev + e.key);
    };
    box.addEventListener("keydown", onKey);
    return () => box.removeEventListener("keydown", onKey);
  }, [cmd, t, onDone]);

  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="vim"
      className="terminal fixed inset-0 z-[97] bg-base px-5 py-6 outline-none"
    >
      <div className="container-x">
        {BUFFER.map((line, i) => (
          <p key={i} className="text-ink">
            {line || " "}
          </p>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <p key={`t${i}`} className="text-phosphor-deep">
            ~
          </p>
        ))}
        <p className="mt-6 bg-raised px-2 text-ink">
          {'"portafolio.txt" [readonly]'}
          <span className="text-ink-3">{"  ─  "}</span>
          <span className="text-phosphor">{t("vim.hint")}</span>
        </p>
        <p className="text-ink">
          {cmd || message}
          <span aria-hidden className="animate-blink text-phosphor">
            ▌
          </span>
        </p>
        <button type="button" onClick={onDone} className="btn btn-secondary btn-sm mt-8">
          {t("vim.exit")} (:q!)
        </button>
      </div>
    </div>
  );
}
