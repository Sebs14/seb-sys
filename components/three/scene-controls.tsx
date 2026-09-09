"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_SPRING, damp, stepSpring } from "@/lib/spring";
import { CAMERA } from "@/lib/scene-config";
import { sceneStats } from "@/lib/scene-stats";
import type { SceneMode } from "@/lib/scene-types";
import { boundingRadius } from "./core-geometry";
import type { Rig } from "./scene-rig";

/* ══════════════════════════════════════════════════════════════
   CONTROLES: arrastre, inercia, cámara

   El puntero se captura en el canvas mientras dura el gesto. Antes de
   8 px no es arrastre (así un clic que tiembla sigue siendo clic); un
   segundo contacto se ignora hasta soltar el primero. La velocidad se
   mide con tiempo real y se amortigua; nada acumula sin límite.

   Toque: el contenedor tiene `touch-action: pan-y`, así que el scroll
   vertical de la página sigue siendo del navegador y el giro es
   horizontal.

   La cámara se encuadra por esfera envolvente y relación de aspecto,
   y llega a su distancia con un resorte.
   ══════════════════════════════════════════════════════════════ */

const DRAG_THRESHOLD = 8;
const SPEED_Y = 0.0065;
const SPEED_X = 0.0045;
const MAX_TILT = 0.55;

type Props = {
  rig: Rig;
  mode: SceneMode;
  graphRadius: number;
  still: boolean;
  onDragChange?: (dragging: boolean) => void;
};

export function SceneControls({ rig, mode, graphRadius, still, onDragChange }: Props) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const el = gl.domElement;
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let dragging = false;

    const down = (e: PointerEvent) => {
      if (pointerId !== null) return; // un solo contacto a la vez
      if (e.button !== 0 && e.pointerType === "mouse") return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      lastT = performance.now();
      dragging = false;
      rig.spin.vx = 0;
      rig.spin.vy = 0;
      rig.lastInteraction = lastT;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (!dragging) {
        if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return;
        dragging = true;
        rig.dragging = true;
        onDragChange?.(true);
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Algunos navegadores no permiten capturar tras el primer move.
        }
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      rig.spin.y += dx * SPEED_Y;
      rig.spin.x = THREE.MathUtils.clamp(rig.spin.x + dy * SPEED_X, -MAX_TILT, MAX_TILT);
      // Velocidad angular medida, con tope: nada de latigazos.
      rig.spin.vy = THREE.MathUtils.clamp((dx * SPEED_Y) / dt, -6, 6);
      rig.spin.vx = THREE.MathUtils.clamp((dy * SPEED_X) / dt, -4, 4);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      rig.lastInteraction = now;
      invalidate();
    };

    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (dragging) {
        dragging = false;
        rig.dragging = false;
        onDragChange?.(false);
        // Si el gesto terminó quieto, no hay inercia.
        if (performance.now() - lastT > 80) {
          rig.spin.vx = 0;
          rig.spin.vy = 0;
        }
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // ya liberado
        }
        invalidate();
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("lostpointercapture", up);
      rig.dragging = false;
    };
  }, [gl, rig, invalidate, onDragChange]);

  // Cambios de modo o tamaño: pedir cuadro para reencuadrar.
  useEffect(() => {
    invalidate();
  }, [mode, size.width, size.height, invalidate]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    let moving = false;

    // ── inercia y reset ─────────────────────────────────────────
    if (rig.resetRequested) {
      rig.spin.vx = 0;
      rig.spin.vy = 0;
      rig.spin.x = damp(rig.spin.x, 0, 10, dt);
      rig.spin.y = damp(rig.spin.y, 0, 10, dt);
      if (Math.abs(rig.spin.x) < 1e-3 && Math.abs(rig.spin.y) < 1e-3) {
        rig.spin.x = 0;
        rig.spin.y = 0;
        rig.resetRequested = false;
      } else {
        moving = true;
      }
    } else if (!rig.dragging) {
      if (Math.abs(rig.spin.vx) > 1e-4 || Math.abs(rig.spin.vy) > 1e-4) {
        rig.spin.y += rig.spin.vy * dt;
        rig.spin.x = THREE.MathUtils.clamp(rig.spin.x + rig.spin.vx * dt, -MAX_TILT, MAX_TILT);
        const decay = Math.exp(-dt * 3.2);
        rig.spin.vx *= decay;
        rig.spin.vy *= decay;
        if (Math.abs(rig.spin.vx) < 1e-4) rig.spin.vx = 0;
        if (Math.abs(rig.spin.vy) < 1e-4) rig.spin.vy = 0;
        moving = true;
      }
    }

    // ── cámara: encuadre por esfera envolvente ──────────────────
    const aspect = size.width / Math.max(1, size.height);
    const radius = boundingRadius(mode, graphRadius);
    const fill = mode === "core" ? 0.82 : 0.84;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const limit = Math.tan(halfFov) * Math.min(1, aspect);
    const target = Math.max(3.5, radius / (fill * limit));
    if (still) {
      rig.camera.value = target;
      rig.camera.velocity = 0;
    } else {
      moving = stepSpring(rig.camera, target, dt, CAMERA_SPRING) || moving;
    }
    camera.position.set(CAMERA.position[0], CAMERA.position[1], rig.camera.value);
    camera.lookAt(0, 0, 0);

    if (moving) {
      sceneStats.invalidations.controls += 1;
      invalidate();
    }
  });

  return null;
}
