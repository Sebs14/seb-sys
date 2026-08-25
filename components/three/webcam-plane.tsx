"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════
   LA CÁMARA, EN GLIFOS

   Lo barato de tener el pase ASCII resuelto en GPU: asciifica lo que
   sea que se haya renderizado. Así que "verte a vos mismo en ASCII"
   no es un motor nuevo — es cambiarle la fuente a la textura.

   El material es `basic` a propósito: sin iluminación, la luminancia
   que lee el shader es EXACTAMENTE la del video.

   El video nunca sale del navegador: no hay red, no hay servidor.

   Cada final posible AVISA. Antes esto fallaba en silencio de tres
   maneras distintas y el usuario sólo veía un hueco.
   ══════════════════════════════════════════════════════════════ */

export type CamState = "asking" | "live" | "denied" | "unsupported";

export function WebcamPlane({
  onState,
}: {
  onState: (state: CamState) => void;
}) {
  const viewport = useThree((state) => state.viewport);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    /* OJO: `navigator.mediaDevices?.getUserMedia(...).then(...)` NO sirve.
       El encadenamiento opcional corta la cadena COMPLETA, así que si
       `mediaDevices` no existe tampoco corre el `.catch` y el fallo es
       mudo. Y no existe en cualquier origen que no sea seguro: por IP
       sobre http, la API simplemente no está. */
    const media = navigator.mediaDevices;
    if (!media?.getUserMedia) {
      onState("unsupported");
      return;
    }

    onState("asking");

    media
      .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then((granted) => {
        stream = granted;
        if (cancelled) {
          granted.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = document.createElement("video");
        video.srcObject = granted;
        video.muted = true;
        video.playsInline = true;
        void video.play();
        setTexture(new THREE.VideoTexture(video));
        onState("live");
      })
      .catch(() => onState("denied"));

    return () => {
      cancelled = true;
      // Soltar la cámara al salir: el LED encendido de más es imperdonable.
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onState]);

  if (!texture) return null;

  /* Cubre el encuadre completo y va espejado con una escala negativa en
     X: uno se espera verse como en un espejo, no como lo ve la cámara.
     Y sí, escalar en −X invierte el sentido de las caras — pero three lo
     resuelve solo: al dibujar calcula `matrixWorld.determinantAffine() < 0`
     y da vuelta el winding (`setMaterial(material, frontFaceCW)`). No hace
     falta DoubleSide ni espejar la textura; espejar las dos cosas fue el
     bug que dejó la imagen al revés. */
  return (
    <mesh scale={[-viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
