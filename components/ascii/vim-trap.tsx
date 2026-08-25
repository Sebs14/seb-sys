"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";
import { useLang } from "@/lib/i18n";

/* ══════════════════════════════════════════════════════════════
   vim

   El chiste que todo dev entiende: entrás y no sabés salir. Sólo
   `:q!` cierra. Cualquier otro intento contesta lo que contesta vim
   de verdad, y `Escape` no te salva.

   Es una trampa AMABLE: la barra de estado dice cómo salir. La
   gracia es el reconocimiento, no dejar a nadie encerrado.
   ══════════════════════════════════════════════════════════════ */

const BUFFER = [
  "#!/usr/bin/env seb",
  "",
  "// no hay nada que editar acá.",
  "// esto es un portafolio.",
  "",
];

export function VimTrap() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [message, setMessage] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      on((e) => {
        if (e.type === "vim") setOpen(true);
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    boxRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setCmd("");
        setMessage(t("vim.hint"));
        return;
      }
      if (e.key === "Enter") {
        const line = cmd.trim();
        if (line === ":q!" || line === ":quit!" || line === ":qa!") {
          setOpen(false);
          setCmd("");
          setMessage("");
          return;
        }
        if (line === ":q" || line === ":wq" || line === ":x") {
          setMessage(t("vim.nowrite"));
        } else if (line) {
          setMessage(t("vim.hint"));
        }
        setCmd("");
        return;
      }
      if (e.key === "Backspace") {
        setCmd((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key.length === 1) setCmd((prev) => prev + e.key);
    };

    // `capture` para ganarle a la terminal y a cualquier otro atajo.
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [open, cmd, t]);

  if (!open) return null;

  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      role="dialog"
      aria-label="vim"
      className="fixed inset-0 z-[97] bg-term-bg px-[2ch] py-[var(--lh)] outline-none"
    >
      <div className="mx-auto max-w-[110ch]">
        {BUFFER.map((line, i) => (
          <p key={i} className="text-term-white">
            {line || " "}
          </p>
        ))}
        {/* Las tildes de vim: el buffer termina y abajo no hay nada. */}
        {Array.from({ length: 10 }, (_, i) => (
          <p key={`t${i}`} className="text-term-green-deep">
            ~
          </p>
        ))}

        <p className="mt-[var(--lh)] bg-term-line px-[1ch] text-term-white">
          {'"portafolio.txt" [readonly]'}
          <span className="text-term-gray">{"  ─  "}</span>
          <span className="text-term-green">{t("vim.hint")}</span>
        </p>

        <p className="text-term-white">
          {cmd || message}
          <span aria-hidden className="animate-blink text-term-green">
            ▌
          </span>
        </p>
      </div>
    </div>
  );
}
