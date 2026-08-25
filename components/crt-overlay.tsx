/**
 * Capa CRT global: scanlines y viñeta. Puramente CSS y
 * pointer-events:none, así que no interfiere con nada del sitio.
 *
 * Ya NO trae el barrido animado. Era una capa del tamaño de la
 * ventana desplazándose sin parar: costo de compositor permanente a
 * cambio de un efecto que en la práctica no se aprecia. Lo que queda
 * se pinta una vez y no cuesta nada por cuadro.
 */
export function CrtOverlay() {
  return <div className="crt-overlay" aria-hidden />;
}
