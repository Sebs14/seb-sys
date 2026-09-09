"use client";

import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { WebcamStatus } from "@/lib/scene-types";

/* ══════════════════════════════════════════════════════════════
   LA CÁMARA, EN GLIFOS

   Lo barato de tener el pase ASCII resuelto en GPU: asciifica lo que
   sea que se haya renderizado. Así que "verte a vos mismo en ASCII"
   no es un motor nuevo — es cambiarle la fuente a la textura.

   El material es `basic` a propósito: sin iluminación, la luminancia
   que lee el shader es EXACTAMENTE la del video. El video nunca sale
   del navegador: no hay red, no hay servidor.

   Cada final posible AVISA, y cada recurso se libera: pistas, video,
   srcObject y la VideoTexture. Incluida la resolución tardía del
   permiso cuando el usuario ya se fue.
   ══════════════════════════════════════════════════════════════ */

type Session = {
  stream: MediaStream;
  video: HTMLVideoElement;
  texture: THREE.VideoTexture;
};

function releaseSession(s: Session) {
  s.stream.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
  s.video.pause();
  s.video.srcObject = null;
  s.video.removeAttribute("src");
  s.video.load();
  s.texture.dispose();
}

export function WebcamPlane({ onState }: { onState: (state: WebcamStatus) => void }) {
  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    let cancelled = false;

    /* `navigator.mediaDevices?.getUserMedia(...).then(...)` NO sirve: el
       encadenamiento opcional corta la cadena completa y el fallo es mudo.
       Y no existe en ningún origen inseguro. */
    const media = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!media?.getUserMedia) {
      onState("unsupported");
      return;
    }

    onState("asking");

    media
      .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then(async (stream) => {
        if (cancelled) {
          // El usuario salió antes de que el permiso resolviera.
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        try {
          await video.play();
        } catch {
          stream.getTracks().forEach((t) => t.stop());
          video.srcObject = null;
          if (!cancelled) onState("error");
          return;
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          video.srcObject = null;
          return;
        }
        const tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace;
        const session: Session = { stream, video, texture: tex };
        sessionRef.current = session;
        // Si el navegador corta la pista (otro tab, permiso revocado),
        // la interfaz tiene que enterarse.
        stream.getTracks().forEach((track) => {
          track.onended = () => {
            if (sessionRef.current === session) onState("error");
          };
        });
        setTexture(tex);
        onState("live");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const name = error instanceof Error ? error.name : "";
        onState(
          name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError"
            ? "denied"
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "unsupported"
              : "error",
        );
      });

    return () => {
      cancelled = true;
      const s = sessionRef.current;
      if (s) {
        releaseSession(s);
        sessionRef.current = null;
      }
    };
  }, [onState]);

  // El video avanza solo: mientras haya cámara hay cuadros que pedir.
  useEffect(() => {
    if (!texture) return;
    let raf = 0;
    const tick = () => {
      invalidate();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [texture, invalidate]);

  if (!texture) return null;

  /* Cubre el encuadre completo y va espejado con escala negativa en X:
     uno espera verse como en un espejo. three invierte el winding solo
     cuando el determinante es negativo; no hace falta DoubleSide ni
     espejar la textura. */
  return (
    <mesh scale={[-viewport.width, viewport.height, 1]} renderOrder={10}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} depthTest={false} />
    </mesh>
  );
}
