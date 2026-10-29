"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { clsx } from "@/lib/clsx";
import { motionIsStill, onMotionChange } from "@/lib/use-motion-preference";

/* ══════════════════════════════════════════════════════════════
   TITULAR LÍQUIDO

   El texto es HTML real (lo lee el lector de pantalla, lo indexa el
   buscador y es el LCP). Encima va un canvas WebGL del mismo tamaño
   que pinta seda en movimiento recortada por la forma de las letras.

   Cómo se recorta: cada carácter se ubica con un Range del DOM (así
   el canvas respeta el kerning, el tracking y los saltos de línea que
   ya decidió el navegador) y se dibuja en un canvas 2D que sube como
   textura de máscara. El shader sólo trabaja donde la máscara tiene
   tinta.

   Sin WebGL, con contexto perdido o antes del primer cuadro, el texto
   se ve con un degradado CSS de la misma paleta: nunca hay un hueco.
   Sin GPU (render por software) se queda el degradado CSS. Con
   movimiento reducido o en una máquina que no sostiene ~24 fps se
   dibuja un cuadro quieto. Clic: siguiente paleta, con transición y un
   remolino breve.
   ══════════════════════════════════════════════════════════════ */

export type LiquidPalette = readonly [deep: string, mid: string, light: string];

/* Cobalto (el acento del sitio), aluminio (la escultura), violeta y
   fósforo (la terminal). Cada clic pasa a la siguiente. */
export const PALETTES: readonly LiquidPalette[] = [
  ["#08134a", "#2f6bff", "#b6d6ff"],
  ["#202328", "#8f99a3", "#f2f4f6"],
  ["#1d0b4a", "#7b4dff", "#e1d3ff"],
  ["#05261a", "#2bb673", "#c8f7dc"],
];

/** La misma rueda empezando por el aluminio: para el cierre. */
export const PALETTES_METAL: readonly LiquidPalette[] = [...PALETTES.slice(1), PALETTES[0]];

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* Ruido de gradiente con interpolación quíntica, fbm de tres octavas
   rotadas y doble deformación de dominio, todo a escala de la letra
   (las unidades son "em"): flujos anchos, nada de grano. Las bandas
   lentas son los pliegues de la tela; la derivada en pantalla de la
   altura da la normal para un brillo suave. */
const FRAG = (derivatives: boolean) => `
${derivatives ? "#extension GL_OES_standard_derivatives : enable\n#define HAS_DERIV" : ""}
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uMask;
uniform vec2 uSize;
uniform float uScale;
uniform float uTime;
uniform float uStir;
uniform vec3 uPointer;
uniform vec3 uFrom0;
uniform vec3 uFrom1;
uniform vec3 uFrom2;
uniform vec3 uTo0;
uniform vec3 uTo1;
uniform vec3 uTo2;
uniform float uMix;
varying vec2 vUv;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.55;
  for (int i = 0; i < 3; i++) {
    s += a * gnoise(p);
    p = ROT * p * 1.9;
    a *= 0.45;
  }
  return s;
}

vec3 ramp(float x, vec3 c0, vec3 c1, vec3 c2) {
  vec3 low = mix(c0, c1, smoothstep(0.05, 0.55, x));
  return mix(low, c2, smoothstep(0.55, 0.98, x));
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float m = texture2D(uMask, uv).a;
  if (m < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 p = uv * uSize / uScale;

  vec2 d = p - uPointer.xy / uScale;
  float fall = exp(-dot(d, d) * 1.2) * uPointer.z;
  p += vec2(-d.y, d.x) * fall * 0.5;

  float t = uTime * 0.45;
  vec2 sp = p * vec2(0.34, 0.62);
  vec2 q = vec2(fbm(sp + vec2(0.0, t * 0.5)), fbm(sp + vec2(5.2, 1.3) - vec2(t * 0.4, 0.0)));
  vec2 r = vec2(
    fbm(sp + 1.6 * q + vec2(1.7, 9.2) + t * 0.3),
    fbm(sp + 1.6 * q + vec2(8.3, 2.8) - t * 0.25)
  );
  float v = fbm(sp + (1.8 + uStir) * r);

  // Pliegues: bandas lentas que recorren la tela.
  float folds = sin(v * 4.2 + sp.x * 1.6 - t * 1.1 + uStir * 2.0);
  float x = clamp(0.52 + 0.85 * v + 0.2 * folds, 0.0, 1.0);

  vec3 c0 = mix(uFrom0, uTo0, uMix);
  vec3 c1 = mix(uFrom1, uTo1, uMix);
  vec3 c2 = mix(uFrom2, uTo2, uMix);
  vec3 col = ramp(x, c0, c1, c2);

#ifdef HAS_DERIV
  float h = v + 0.12 * folds;
  // Acotada: la derivada se calcula por bloques de 2×2 y un salto suelto brillaría como chispa.
  vec2 g = clamp(vec2(dFdx(h), -dFdy(h)) * uScale * 2.4, vec2(-1.6), vec2(1.6));
  vec3 n = normalize(vec3(-g, 1.0));
  vec3 L = normalize(vec3(-0.4, 0.5, 0.77));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 10.0);
  col *= 0.7 + 0.42 * diff;
  col += mix(c1, c2, 0.7) * spec * 0.35;
#endif

  gl_FragColor = vec4(col * m, m);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

type GLState = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer | null;
  texture: WebGLTexture;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Render por software (sin GPU): compilar y dibujar el shader en CPU le
    quita el hilo a todo lo demás, así que ahí manda el degradado CSS. */
function isSoftwareRenderer(gl: WebGLRenderingContext) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}

function initGL(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl || isSoftwareRenderer(gl)) return null;
  const derivatives = !!gl.getExtension("OES_standard_derivatives");
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG(derivatives));
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const names = ["uMask", "uSize", "uScale", "uTime", "uStir", "uPointer", "uFrom0", "uFrom1", "uFrom2", "uTo0", "uTo1", "uTo2", "uMix"];
  const uniforms = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)]));
  gl.uniform1i(uniforms.uMask, 0);
  gl.clearColor(0, 0, 0, 0);
  return { gl, program, buffer, texture, uniforms };
}

/** Dibuja cada carácter donde el navegador lo puso. Devuelve el tamaño en px CSS del canvas y el de la fuente en px de dispositivo. */
function paintMask(text: HTMLElement, mask: HTMLCanvasElement, pad: number, dpr: number) {
  const box = text.getBoundingClientRect();
  const style = getComputedStyle(text);
  const fontSize = parseFloat(style.fontSize);
  const width = box.width + pad * 2;
  const height = box.height + pad * 2;
  mask.width = Math.max(1, Math.round(width * dpr));
  mask.height = Math.max(1, Math.round(height * dpr));
  const result = { width, height, scale: fontSize * dpr };
  const ctx = mask.getContext("2d");
  if (!ctx) return result;
  ctx.clearRect(0, 0, mask.width, mask.height);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontSize * dpr}px ${style.fontFamily}`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText("Hg");
  const ascent = (metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent) / dpr;
  const descent = (metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent) / dpr;

  const range = document.createRange();
  const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const value = node.nodeValue ?? "";
    for (let i = 0; i < value.length; i += 1) {
      const ch = value[i];
      if (/\s/.test(ch)) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      // El navegador centra el área de contenido en la caja de línea (half-leading).
      const baseline = r.top + (r.height - (ascent + descent)) / 2 + ascent;
      ctx.fillText(ch, (r.left - box.left + pad) * dpr, (baseline - box.top + pad) * dpr);
    }
  }
  return result;
}

type Props = {
  id?: string;
  as?: "h1" | "h2";
  lines: string[];
  palettes: readonly LiquidPalette[];
  className?: string;
  /** Avisa la paleta activa (por ejemplo, para teñir un resplandor detrás). */
  onPaletteChange?: (palette: LiquidPalette) => void;
};

export function LiquidHeadline({ id, as: Tag = "h1", lines, palettes, className, onPaletteChange }: Props) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Lo que el bucle lee por cuadro vive en refs, no en estado.
  const motion = useRef({ from: 0, to: 0, mix: 1, mixStart: 0, stir: 0, lowPower: false, pointer: { x: 0, y: 0, z: 0, tz: 0 } });
  const requestFrame = useRef<() => void>(() => {});
  const relayout = useRef<() => void>(() => {});
  const palettesRef = useRef(palettes);

  const palette = palettes[paletteIndex % palettes.length];
  const textKey = lines.join("\n");

  useEffect(() => {
    palettesRef.current = palettes;
    requestFrame.current();
  }, [palettes]);

  useEffect(() => {
    onPaletteChange?.(palette);
  }, [palette, onPaletteChange]);

  /* El contexto se crea la primera vez que el titular se acerca a la
     pantalla (el del cierre no compite con la carga) y vive lo que vive
     el canvas: no se suelta en la limpieza, porque en desarrollo React
     monta dos veces sobre el MISMO canvas y un contexto perdido a mano
     no vuelve. */
  useEffect(() => {
    const text = textRef.current;
    const canvas = canvasRef.current;
    if (!text || !canvas) return;

    let state: GLState | null = null;
    let unsupported = false;
    const mask = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let scale = 1;
    let pad = 0;
    let raf = 0;
    let visible = false;
    let time = Math.random() * 40;
    let last = 0;
    let disposed = false;
    let shownFirst = false;
    let slowFrames = 0;
    let bornAt = 0;
    const m = motion.current;

    const layout = () => {
      if (!state) return;
      const fontSize = parseFloat(getComputedStyle(text).fontSize);
      // Margen para colas (g, q, y) y el sobrante de los trazos fuera de la caja.
      pad = Math.ceil(fontSize * 0.22);
      const size = paintMask(text, mask, pad, dpr);
      scale = size.scale;
      canvas.width = mask.width;
      canvas.height = mask.height;
      canvas.style.left = canvas.style.top = `${-pad}px`;
      canvas.style.width = `${size.width}px`;
      canvas.style.height = `${size.height}px`;
      const { gl, texture } = state;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
    };

    const draw = () => {
      if (!state) return;
      const { gl, uniforms: u } = state;
      const list = palettesRef.current;
      const from = list[m.from % list.length].map(hexToRgb);
      const to = list[m.to % list.length].map(hexToRgb);
      gl.uniform2f(u.uSize, canvas.width, canvas.height);
      gl.uniform1f(u.uScale, scale);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uStir, m.stir);
      gl.uniform3f(u.uPointer, (m.pointer.x + pad) * dpr, (m.pointer.y + pad) * dpr, m.pointer.z);
      gl.uniform3fv(u.uFrom0, from[0]);
      gl.uniform3fv(u.uFrom1, from[1]);
      gl.uniform3fv(u.uFrom2, from[2]);
      gl.uniform3fv(u.uTo0, to[0]);
      gl.uniform3fv(u.uTo1, to[1]);
      gl.uniform3fv(u.uTo2, to[2]);
      gl.uniform1f(u.uMix, m.mix);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!shownFirst) {
        shownFirst = true;
        setLive(true);
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const reduced = motionIsStill();
      // Quieto también en una máquina que no sostiene el flujo.
      const idle = reduced || m.lowPower;
      if (!idle) {
        time += dt;
        // Vigilante: pasado el arranque, 40 cuadros seguidos bajo ~24 fps
        // dejan el titular en un cuadro fijo el resto de la visita.
        if (now - bornAt > 1500 && dt > 0.042) {
          if (++slowFrames > 40) m.lowPower = true;
        } else slowFrames = 0;
      }

      // Paleta: interpolación de 900 ms con ease in-out (la pidió el visitante).
      if (m.mix < 1) {
        const k = reduced ? 1 : Math.min((now - m.mixStart) / 900, 1);
        m.mix = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        if (k >= 1) {
          m.mix = 1;
          m.from = m.to;
        }
      }
      m.stir = reduced ? 0 : m.stir * Math.exp(-2.4 * dt);
      m.pointer.z += (m.pointer.tz - m.pointer.z) * (1 - Math.exp(-6 * dt));

      draw();
      const settling = m.mix < 1 || m.stir > 0.002 || Math.abs(m.pointer.tz - m.pointer.z) > 0.002;
      if (visible && !document.hidden && (!idle || settling)) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const boot = () => {
      if (state || unsupported) return;
      state = initGL(canvas);
      if (!state) {
        unsupported = true;
        return;
      }
      bornAt = performance.now();
      layout();
    };

    const start = () => {
      if (disposed || raf || !visible) return;
      boot();
      if (!state) return;
      raf = requestAnimationFrame(tick);
    };
    requestFrame.current = start;
    relayout.current = () => {
      layout();
      start();
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      state = null;
      setLive(false);
      shownFirst = false;
    };
    const onRestored = () => {
      state = initGL(canvas);
      if (!state) return;
      layout();
      start();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { rootMargin: "240px" },
    );
    io.observe(text);

    const ro = new ResizeObserver(() => {
      layout();
      start();
    });
    ro.observe(text);

    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const offMotion = onMotionChange(start);

    // La máscara necesita la fuente definitiva, no la de respaldo.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      layout();
      start();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      offMotion();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (state) {
        state.gl.deleteTexture(state.texture);
        state.gl.deleteBuffer(state.buffer);
        state.gl.deleteProgram(state.program);
      }
      requestFrame.current = () => {};
      relayout.current = () => {};
    };
  }, []);

  // El texto cambia con el idioma: la máscara se vuelve a dibujar.
  useEffect(() => {
    relayout.current();
  }, [textKey]);

  const nextPalette = useCallback(() => {
    const m = motion.current;
    const next = (m.to + 1) % palettes.length;
    m.from = m.mix < 1 ? m.to : m.from;
    m.to = next;
    m.mix = 0;
    m.mixStart = performance.now();
    m.stir = 1;
    setPaletteIndex(next);
    requestFrame.current();
  }, [palettes.length]);

  const onPointer = useCallback((e: React.PointerEvent, inside: boolean) => {
    const text = textRef.current;
    if (!text) return;
    const r = text.getBoundingClientRect();
    const p = motion.current.pointer;
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    p.tz = inside && e.pointerType === "mouse" && !motion.current.lowPower ? 1 : 0;
    requestFrame.current();
  }, []);

  const vars = {
    "--lq-deep": palette[0],
    "--lq-mid": palette[1],
    "--lq-light": palette[2],
  } as CSSProperties;

  return (
    <div
      className={clsx("liquid", className)}
      data-live={live || undefined}
      style={vars}
      onClick={nextPalette}
      onPointerMove={(e) => onPointer(e, true)}
      onPointerLeave={(e) => onPointer(e, false)}
    >
      <Tag id={id} ref={textRef} className="liquid-text">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
            {i < lines.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
      <canvas ref={canvasRef} aria-hidden className="liquid-canvas" />
    </div>
  );
}
