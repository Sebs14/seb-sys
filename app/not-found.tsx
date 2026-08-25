import Link from "next/link";

/* El 404 por defecto de Next rompe la ilusión: fuente del sistema,
   fondo blanco. Si el sitio finge ser un monitor, un error también
   tiene que verse como un error de la máquina. */

export const metadata = { title: "404 — segmentation fault" };

const DUMP = [
  "  rax 0x0000000000000000   rbx 0x00007ffee3b0a1c8",
  "  rcx 0x000000000000002a   rdx 0x0000000000000000",
  "  rsi 0x00007ffee3b0a1d0   rdi 0x0000000000000404",
  "  rip 0x000000010a4f2e10   rsp 0x00007ffee3b0a180",
];

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[110ch] px-[2ch] py-[calc(var(--lh)*3)]">
      <p className="text-term-red">
        {"segmentation fault (core dumped)"}
      </p>

      <p className="mt-[var(--lh)] text-term-gray">
        {"la ruta que pediste no existe en este sistema."}
      </p>
      <p className="text-term-gray">
        {"the path you asked for does not exist on this system."}
      </p>

      <pre
        aria-hidden
        className="mt-[var(--lh)] overflow-x-auto whitespace-pre text-term-green-deep"
      >
        {DUMP.join("\n")}
      </pre>

      <p className="mt-[var(--lh)] text-term-green">
        {"$ "}
        <Link href="/" className="underline-offset-4 hover:glow-strong hover:underline">
          cd /
        </Link>
      </p>
    </main>
  );
}
