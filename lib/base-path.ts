/* GitHub Pages sirve el sitio bajo `/seb-sys`. Next reescribe sus
   propios assets con `assetPrefix`, pero NO las rutas escritas a mano
   hacia `public/`. Todo lo que apunte a un archivo propio pasa por acá. */

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}
