import type { NextConfig } from "next";

/* GitHub Pages sirve archivos estáticos y desde un subdirectorio
   (`usuario.github.io/<repo>`), así que el build para Pages necesita
   tres cosas que el desarrollo local NO debe tener:

     - `output: "export"` para generar HTML plano,
     - `basePath`/`assetPrefix` para que cada ruta y cada asset
       cuelguen de `/seb-sys`.

   Por eso van detrás de una variable de entorno: `npm run dev` sigue
   funcionando en `localhost:3000` a secas, y sólo el flujo de Pages
   (`npm run build:pages`) activa el modo estático.

   Si algún día el repo se llama `Sebs14.github.io`, el sitio vive en
   la raíz y basePath/assetPrefix se quitan. */
const forPages = process.env.GITHUB_PAGES === "true";
const repo = "/seb-sys";

const nextConfig: NextConfig = {
  ...(forPages
    ? {
        output: "export" as const,
        basePath: repo,
        assetPrefix: repo,
        // Sin servidor no hay optimización de imágenes en vivo.
        images: { unoptimized: true },
      }
    : {}),

  /* Next 16 bloquea por defecto los recursos de dev (chunks, HMR) que no
     vengan del host con el que arrancó el server: localhost. Si abrís la
     página por la IP de la LAN — para probar en el celular, por ejemplo —
     los chunks del cliente responden 403, la app no hidrata y se queda en
     el HTML plano: sin tipeo, sin scramble, sin glitch y sin hero WebGL.

     El matcher de Next parte el host por puntos y compara segmento a
     segmento, así que los comodines sirven también para IPs. Se listan
     sólo rangos PRIVADOS y `*.local`: con `*` a secas cualquier sitio web
     podría leer el código de tu server mientras desarrollás, que es
     justamente lo que este bloqueo evita.

     Lo estable es entrar por el nombre mDNS del equipo — en el celular
     `http://sebastians-macbook-air.local:3000` — porque ese no cambia
     cuando el DHCP te da otra IP. Sólo aplica en desarrollo. */
  allowedDevOrigins: [
    "*.local",
    "172.16.*.*",
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;
