"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildGlyphAtlas, GLYPH_ASPECT, type AtlasResult } from "@/lib/glyph-atlas";

/* ══════════════════════════════════════════════════════════════
   PASE DE POST-PROCESO ASCII

   Cómo funciona, en tres pasos:

   1. La escena 3D se renderiza a un render target diminuto: UN
      texel por celda de caracter (ej. 190×40). Barato de sobra.
   2. Un quad a pantalla completa lee ese texel, saca su luminancia
      y elige el glifo correspondiente del atlas.
   3. El glifo se pinta tintado según esa misma luminancia.

   Esta es la razón de no usar el AsciiEffect de los ejemplos de
   three: aquel genera un <table> del DOM con miles de nodos y se
   arrastra. Esto vive entero en la GPU.
   ══════════════════════════════════════════════════════════════ */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uScene;
  uniform sampler2D uAtlas;
  uniform vec2  uGrid;        // celdas en x, y
  uniform float uChars;       // glifos en el atlas
  uniform float uTime;
  uniform vec3  uColorDim;
  uniform vec3  uColorMid;
  uniform vec3  uColorHot;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    // Coordenada de celda y posición dentro de la celda.
    vec2 cell   = floor(vUv * uGrid);
    vec2 inCell = fract(vUv * uGrid);

    // Un solo sample por celda, en su centro: eso da el escalonado
    // duro característico en vez de un degradado suave.
    vec2 sampleUv = (cell + 0.5) / uGrid;
    vec3 scene = texture2D(uScene, sampleUv).rgb;

    float lum = dot(scene, vec3(0.2126, 0.7152, 0.0722));

    // Parpadeo sutilísimo por celda: le quita la perfección digital
    // y lo acerca a un monitor de fósforo real.
    float flick = sin(uTime * 2.2 + cell.x * 0.7 + cell.y * 1.3) * 0.012;
    lum = clamp(lum + flick, 0.0, 1.0);

    // Luminancia → índice de glifo en la rampa.
    float idx = floor(lum * (uChars - 1.0) + 0.5);

    vec2 atlasUv = vec2((idx + inCell.x) / uChars, inCell.y);
    float ink = texture2D(uAtlas, atlasUv).r;

    // Tinte en tres tramos: verde profundo → verde → casi blanco.
    vec3 tint = mix(uColorDim, uColorMid, smoothstep(0.10, 0.62, lum));
    tint = mix(tint, uColorHot, smoothstep(0.78, 1.0, lum));

    float alpha = ink * uOpacity;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(tint, alpha);
  }
`;

export function AsciiPass({
  /** ancho de celda en px de CSS. Más chico = más detalle, más celdas. */
  cellWidth = 8,
  opacity = 1,
  colorDim = "#0f4a22",
  colorMid = "#33ff66",
  colorHot = "#e6ffe9",
  ramp,
}: {
  cellWidth?: number;
  opacity?: number;
  colorDim?: string;
  colorMid?: string;
  colorHot?: string;
  ramp?: string;
}) {
  const { size, gl } = useThree();
  const [atlas, setAtlas] = useState<AtlasResult | null>(null);

  // ── atlas ────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    let built: AtlasResult | null = null;
    buildGlyphAtlas({ ramp }).then((result) => {
      built = result;
      if (alive) setAtlas(result);
      else result.texture.dispose();
    });
    return () => {
      alive = false;
      built?.texture.dispose();
    };
  }, [ramp]);

  // ── render target ────────────────────────────────────────────
  const target = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(2, 2, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
      stencilBuffer: false,
    });
    return rt;
  }, []);

  // ── quad de salida ───────────────────────────────────────────
  const { quadScene, quadCamera, material } = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uScene: { value: null },
        uAtlas: { value: null },
        uGrid: { value: new THREE.Vector2(1, 1) },
        uChars: { value: 1 },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uColorDim: { value: new THREE.Color(colorDim) },
        uColorMid: { value: new THREE.Color(colorMid) },
        uColorHot: { value: new THREE.Color(colorHot) },
      },
    });
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return {
      quadScene: s,
      quadCamera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
      material: mat,
    };
    // Se construye una sola vez; los colores se actualizan abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── colores / opacidad en caliente ───────────────────────────
  useEffect(() => {
    material.uniforms.uOpacity.value = opacity;
    (material.uniforms.uColorDim.value as THREE.Color).set(colorDim);
    (material.uniforms.uColorMid.value as THREE.Color).set(colorMid);
    (material.uniforms.uColorHot.value as THREE.Color).set(colorHot);
  }, [material, opacity, colorDim, colorMid, colorHot]);

  useEffect(() => {
    if (!atlas) return;
    material.uniforms.uAtlas.value = atlas.texture;
    material.uniforms.uChars.value = atlas.count;
  }, [atlas, material]);

  // ── grilla y tamaño del render target ────────────────────────
  useEffect(() => {
    const cw = Math.max(4, cellWidth);
    const chh = cw / GLYPH_ASPECT;

    const cols = Math.max(2, Math.round(size.width / cw));
    const rows = Math.max(2, Math.round(size.height / chh));

    // Un texel por celda: el render target es minúsculo a propósito.
    target.setSize(cols, rows);
    (material.uniforms.uGrid.value as THREE.Vector2).set(cols, rows);
  }, [size.width, size.height, cellWidth, target, material]);

  useEffect(() => {
    return () => {
      target.dispose();
      material.dispose();
    };
  }, [target, material]);

  // ── loop ─────────────────────────────────────────────────────
  // priority > 0 desactiva el render automático de r3f y nos deja
  // manejar los dos pases a mano.
  const clock = useRef(0);
  useFrame((state, delta) => {
    if (!atlas) return;
    clock.current += delta;
    material.uniforms.uTime.value = clock.current;

    const prevTarget = gl.getRenderTarget();

    gl.setRenderTarget(target);
    gl.clear();
    gl.render(state.scene, state.camera);

    gl.setRenderTarget(prevTarget);
    material.uniforms.uScene.value = target.texture;
    gl.clear();
    gl.render(quadScene, quadCamera);
  }, 1);

  return null;
}
