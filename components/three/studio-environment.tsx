"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════
   ENTORNO DE ESTUDIO

   El aluminio se define por lo que refleja. Acá se construye una
   pequeña sala procedural — paredes oscuras, un softbox grande arriba,
   una tira de recorte lateral y un relleno bajo — y se convierte en
   un mapa PMREM que la escena usa como `environment`. Sin HDR remoto:
   el objeto aparece aunque la red no.

   Se genera una vez por resolución y se libera al desmontar.
   ══════════════════════════════════════════════════════════════ */

function buildRoom(): THREE.Scene {
  const room = new THREE.Scene();

  const wall = new THREE.MeshBasicMaterial({ color: new THREE.Color("#141a1f") });
  const box = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 14), wall);
  box.material.side = THREE.BackSide;
  room.add(box);

  const panel = (
    color: string,
    intensity: number,
    size: [number, number],
    position: [number, number, number],
    lookAt: [number, number, number] = [0, 0, 0],
  ) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat);
    mesh.position.set(...position);
    mesh.lookAt(...lookAt);
    room.add(mesh);
  };

  // Softbox principal: arriba y ligeramente al frente, ancho.
  panel("#ffffff", 9, [7, 3.2], [0, 4.6, 2.2]);
  // Recorte lateral frío: dibuja el canto izquierdo.
  panel("#dfe9ff", 4.5, [1.6, 6], [-6.4, 0.6, 1.5]);
  // Relleno cálido bajo, a la derecha: evita el negro total en la panza.
  panel("#ffe9d2", 1.8, [5, 1.2], [4.5, -3.8, 2.5]);
  // Tira de fósforo muy tenue detrás: un guiño al acento, nunca neón.
  panel("#9ef5b5", 0.35, [6, 0.5], [0, -1.2, -6.6]);
  // Panel oscuro frontal: el reflejo del "espectador", casi negro.
  panel("#0a0c0f", 1, [6, 4], [0, 0, 6.8]);

  return room;
}

export function StudioEnvironment({ resolution = 256 }: { resolution?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    performance.mark("seb:pmrem-start");
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = buildRoom();
    const target = pmrem.fromScene(room, 0.05);
    performance.measure("seb:pmrem", "seb:pmrem-start");
    void resolution;
    scene.environment = target.texture;
    scene.environmentIntensity = 1;
    invalidate();

    room.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });
    pmrem.dispose();

    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
    };
  }, [gl, scene, resolution, invalidate]);

  return (
    <>
      {/* Luces directas: el entorno da los reflejos; esto dibuja los
          cantos con un brillo especular concreto y separa la silueta. */}
      <directionalLight position={[3.5, 5, 4]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 1.5, 2]} intensity={0.7} color="#cfe0ff" />
      <directionalLight position={[2, -4, -3]} intensity={0.35} color="#ffe2c4" />
    </>
  );
}
