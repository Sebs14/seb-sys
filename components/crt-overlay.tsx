/**
 * Capa CRT global: scanlines, viñeta y un barrido lento.
 * Puramente CSS y pointer-events:none, así que no interfiere con
 * nada del sitio. Se desactiva sola con prefers-reduced-motion.
 */
export function CrtOverlay() {
  return (
    <div className="crt-overlay" aria-hidden>
      <div className="crt-scanbar" />
    </div>
  );
}
