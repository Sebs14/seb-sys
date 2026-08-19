import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════
   ATLAS DE GLIFOS

   El shader ASCII necesita los caracteres como textura. Acá los
   dibujamos una sola vez en un canvas: una tira horizontal donde
   cada celda es un glifo, ordenados de menos a más denso.

   El orden importa: el shader mapea luminancia → índice de celda,
   así que la rampa TIENE que ir de vacío a sólido o sale invertido.
   ══════════════════════════════════════════════════════════════ */

/** Rampa por defecto: de vacío a bloque sólido. */
export const RAMP = " .:-=+*#%@█";

/**
 * Relación ancho/alto de una celda de caracter monoespaciado.
 * 0.6 es el avance real de JetBrains Mono. La celda del atlas usa
 * la MISMA proporción que la celda en pantalla; si no, el glifo se
 * estira y se nota al instante.
 */
export const GLYPH_ASPECT = 0.6;

export type AtlasResult = {
  texture: THREE.CanvasTexture;
  count: number;
};

/**
 * Espera a que la webfont esté disponible antes de rasterizar.
 * Sin esto el atlas puede salir dibujado con la fuente fallback,
 * que es exactamente el bug que rompe la estética.
 */
async function ensureFont(font: string): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.load(`700 64px "${font}"`);
    await document.fonts.ready;
  } catch {
    // Si falla, seguimos: el fallback es feo pero no rompe nada.
  }
}

export async function buildGlyphAtlas({
  ramp = RAMP,
  cellHeight = 64,
  fontFamily = "JetBrains Mono",
}: {
  ramp?: string;
  /** alto de cada celda del atlas en px */
  cellHeight?: number;
  fontFamily?: string;
} = {}): Promise<AtlasResult> {
  await ensureFont(fontFamily);

  const chars = [...ramp];
  const cw = Math.round(cellHeight * GLYPH_ASPECT);
  const ch = cellHeight;

  const canvas = document.createElement("canvas");
  canvas.width = cw * chars.length;
  canvas.height = ch;

  const ctx = canvas.getContext("2d")!;
  // Fondo negro: el shader usa el canal rojo como máscara de tinta,
  // así que "sin tinta" tiene que valer 0.
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = `700 ${Math.round(ch * 0.82)}px "${fontFamily}", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  chars.forEach((glyph, i) => {
    ctx.fillText(glyph, i * cw + cw / 2, ch / 2 + ch * 0.03);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return { texture, count: chars.length };
}
