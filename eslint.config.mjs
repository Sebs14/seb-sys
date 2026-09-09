import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /* Excepción acotada y deliberada: la escena Three.js es código
       imperativo por diseño. Los materiales, uniforms, matrices y el
       "rig" se mutan en `useFrame` sesenta veces por segundo; pasar por
       estado de React o clonar objetos en cada cuadro sería justamente
       el anti-patrón que R3F documenta. Las reglas del compilador que
       prohíben mutar valores devueltos por hooks o leídos de refs se
       apagan SÓLO en esta carpeta. El resto (exhaustive-deps,
       set-state-in-effect, rules-of-hooks) sigue activo también acá. */
    files: ["components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
