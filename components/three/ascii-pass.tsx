"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildGlyphAtlas, GLYPH_ASPECT, type AtlasResult } from "@/lib/glyph-atlas";
import { sceneStats } from "@/lib/scene-stats";

/* ══════════════════════════════════════════════════════════════
   PASE DE POST-PROCESO ASCII

   1. La escena se renderiza a un render target diminuto: UN texel por
      celda de caracter. Barato de sobra.
   2. Un quad a pantalla completa lee ese texel, saca su luminancia y
      elige el glifo correspondiente del atlas.
   3. El glifo se pinta tintado según esa misma luminancia.

   Transición material → ASCII: mientras `blend` está entre 0 y 1 la
   escena se dibuja también a pantalla (segundo render, sólo durante la
   transición) y el quad la va cubriendo. En 1 el metal ya no se dibuja
   y las celdas vacías son transparentes: el fondo es el de la página.

   Gestión de color: el render target guarda valores lineales sin
   tonemapping (three no aplica ninguno de los dos cuando el destino no
   es el canvas). El shader comprime la luminancia con una curva
   exponencial y el color de salida pasa por `colorspace_fragment` UNA
   vez. Los tintes se cargan como THREE.Color (sRGB → lineal), así que
   el resultado en pantalla es el hex que se pidió.

   Todo lo mutable vive en un ref creado una vez: los uniforms cambian
   en `useFrame` sin pasar por estado de React ni disparar la regla de
   inmutabilidad sobre valores devueltos por hooks.
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
  uniform vec2  uGrid;
  uniform float uChars;
  uniform float uTime;
  uniform float uFlicker;
  uniform float uBlend;
  uniform vec3  uColorDim;
  uniform vec3  uColorMid;
  uniform vec3  uColorHot;
  uniform vec3  uBg;

  varying vec2 vUv;

  void main() {
    vec2 cell   = floor(vUv * uGrid);
    vec2 inCell = fract(vUv * uGrid);

    // Un solo sample por celda, en su centro.
    vec2 sampleUv = (cell + 0.5) / uGrid;
    vec3 scene = texture2D(uScene, sampleUv).rgb;
    float lum = dot(scene, vec3(0.2126, 0.7152, 0.0722));
    // Compresión tipo exposición: el metal tiene picos altos.
    lum = 1.0 - exp(-lum * 2.4);

    float flick = sin(uTime * 2.2 + cell.x * 0.7 + cell.y * 1.3) * 0.012 * uFlicker;
    lum = clamp(lum + flick, 0.0, 1.0);

    float idx = floor(lum * (uChars - 1.0) + 0.5);
    vec2 atlasUv = vec2((idx + inCell.x) / uChars, inCell.y);
    float ink = texture2D(uAtlas, atlasUv).r;

    vec3 tint = mix(uColorDim, uColorMid, smoothstep(0.10, 0.62, lum));
    tint = mix(tint, uColorHot, smoothstep(0.78, 1.0, lum));

    float alpha = ink * uBlend;
    if (alpha < 0.01) {
      // Celda vacía: durante la transición tapa el metal con el color
      // de fondo; en ASCII pleno es transparente.
      if (uBlend >= 0.999) discard;
      gl_FragColor = vec4(uBg, uBlend);
    } else {
      gl_FragColor = vec4(tint, alpha);
    }

    #include <colorspace_fragment>
  }
`;

type Resources = {
  target: THREE.WebGLRenderTarget;
  material: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  quadScene: THREE.Scene;
  quadCamera: THREE.OrthographicCamera;
  atlas: AtlasResult | null;
  clock: number;
  blend: number;
  cols: number;
  rows: number;
};

function createResources(colors: { dim: string; mid: string; hot: string; bg: string }): Resources {
  const target = new THREE.WebGLRenderTarget(2, 2, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: true,
    stencilBuffer: false,
  });
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uScene: { value: null },
      uAtlas: { value: null },
      uGrid: { value: new THREE.Vector2(1, 1) },
      uChars: { value: 1 },
      uTime: { value: 0 },
      uFlicker: { value: 1 },
      uBlend: { value: 0 },
      uColorDim: { value: new THREE.Color(colors.dim) },
      uColorMid: { value: new THREE.Color(colors.mid) },
      uColorHot: { value: new THREE.Color(colors.hot) },
      uBg: { value: new THREE.Color(colors.bg) },
    },
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  return {
    target,
    material,
    quad,
    quadScene,
    quadCamera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    atlas: null,
    clock: 0,
    blend: 0,
    cols: 2,
    rows: 2,
  };
}

export type AsciiPassProps = {
  /** 0 = metal, 1 = ASCII pleno. Se lee por cuadro desde un ref. */
  blendRef: React.RefObject<number>;
  /** ancho de celda en px CSS */
  cellWidth: number;
  /** si false, el parpadeo de luminancia no avanza */
  animate: boolean;
  /** marca de tiempo (performance.now) hasta la que el parpadeo sigue vivo */
  animateUntilRef?: { readonly current: number };
  colors: { dim: string; mid: string; hot: string; bg: string };
  /** avisa cuando terminó de cargar el atlas */
  onReady?: () => void;
};

/**
 * Toma el control del render (priority 1). Con blend 0 renderiza la
 * escena tal cual; con blend > 0 aplica el pase.
 */
export function AsciiPass({ blendRef, cellWidth, animate, animateUntilRef, colors, onReady }: AsciiPassProps) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const res = useRef<Resources | null>(null);
  if (res.current === null) res.current = createResources(colors);

  // ── atlas ─────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const r = res.current;
    if (!r) return;
    buildGlyphAtlas().then((result) => {
      if (!alive || !res.current) {
        result.texture.dispose();
        return;
      }
      res.current.atlas = result;
      res.current.material.uniforms.uAtlas.value = result.texture;
      res.current.material.uniforms.uChars.value = result.count;
      // Compilar el shader ahora: cambiar a ASCII no debe tartamudear.
      gl.compile(res.current.quadScene, res.current.quadCamera);
      onReady?.();
      invalidate();
    });
    return () => {
      alive = false;
      if (r.atlas) {
        r.atlas.texture.dispose();
        r.atlas = null;
        r.material.uniforms.uAtlas.value = null;
      }
    };
  }, [invalidate, onReady, gl]);

  // ── colores en caliente ───────────────────────────────────────
  useEffect(() => {
    const r = res.current;
    if (!r) return;
    (r.material.uniforms.uColorDim.value as THREE.Color).set(colors.dim);
    (r.material.uniforms.uColorMid.value as THREE.Color).set(colors.mid);
    (r.material.uniforms.uColorHot.value as THREE.Color).set(colors.hot);
    (r.material.uniforms.uBg.value as THREE.Color).set(colors.bg);
    invalidate();
  }, [colors.dim, colors.mid, colors.hot, colors.bg, invalidate]);

  // ── grilla y tamaño del render target ─────────────────────────
  useEffect(() => {
    const r = res.current;
    if (!r) return;
    const cw = Math.max(4, cellWidth);
    const chh = cw / GLYPH_ASPECT;
    const cols = Math.max(2, Math.round(size.width / cw));
    const rows = Math.max(2, Math.round(size.height / chh));
    r.cols = cols;
    r.rows = rows;
    r.target.setSize(cols, rows);
    (r.material.uniforms.uGrid.value as THREE.Vector2).set(cols, rows);
    invalidate();
  }, [size.width, size.height, cellWidth, invalidate]);

  // ── liberar todo al desmontar ─────────────────────────────────
  useEffect(() => {
    return () => {
      const r = res.current;
      if (!r) return;
      r.target.dispose();
      r.material.dispose();
      r.quad.geometry.dispose();
      r.atlas?.texture.dispose();
      res.current = null;
    };
  }, []);

  useFrame((state, delta) => {
    const r = res.current;
    if (!r) return;
    const blend = THREE.MathUtils.clamp(blendRef.current ?? 0, 0, 1);
    r.blend = blend;

    if (blend <= 0.001 || !r.atlas) {
      // Metal puro: un solo render, sin pase.
      gl.setRenderTarget(null);
      gl.render(state.scene, state.camera);
      sceneStats.asciiCells = null;
      return;
    }

    const alive = animate && (animateUntilRef ? performance.now() < animateUntilRef.current : true);
    if (alive) {
      r.clock += delta;
      r.material.uniforms.uTime.value = r.clock;
      r.material.uniforms.uFlicker.value = 1;
      // El parpadeo es continuo: pedir el siguiente cuadro.
      sceneStats.invalidations.ascii += 1;
      invalidate();
    } else {
      r.material.uniforms.uFlicker.value = 0;
    }
    r.material.uniforms.uBlend.value = blend;

    gl.setRenderTarget(r.target);
    gl.clear();
    gl.render(state.scene, state.camera);

    gl.setRenderTarget(null);
    if (blend < 0.999) {
      // Transición: el metal debajo, el ASCII lo cubre.
      gl.render(state.scene, state.camera);
    } else {
      gl.clear();
    }
    r.material.uniforms.uScene.value = r.target.texture;
    gl.render(r.quadScene, r.quadCamera);
    sceneStats.asciiCells = { cols: r.cols, rows: r.rows };
  }, 1);

  return null;
}
