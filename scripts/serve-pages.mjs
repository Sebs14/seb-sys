#!/usr/bin/env node
/* Sirve `out/` como lo haría GitHub Pages: bajo el subdirectorio
   `/seb-sys`, con `index.html` por carpeta y el 404 real del export.
   Sin dependencias: es lo que corre el E2E y lo que se usa para
   probar el export a mano.

   uso: node scripts/serve-pages.mjs [--port 4173] [--dir out] [--base /seb-sys] */

import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const port = Number(opt("port", process.env.PORT ?? 4173));
const dir = path.resolve(opt("dir", "out"));
const base = opt("base", "/seb-sys").replace(/\/$/, "");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

async function stat(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

async function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const abs = path.join(dir, rel);
  if (!abs.startsWith(dir)) return null;
  const s = await stat(abs);
  if (s?.isFile()) return abs;
  if (s?.isDirectory()) {
    const index = path.join(abs, "index.html");
    if ((await stat(index))?.isFile()) return index;
  }
  // `/ruta` → `/ruta.html`, como hace Pages con `trailingSlash: false`.
  const html = `${abs}.html`;
  if ((await stat(html))?.isFile()) return html;
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let pathname = url.pathname;

  if (pathname === "/" || pathname === base) {
    res.writeHead(302, { Location: `${base}/` });
    res.end();
    return;
  }
  if (!pathname.startsWith(`${base}/`)) {
    await send404(res);
    return;
  }
  pathname = pathname.slice(base.length);

  const file = await resolveFile(pathname);
  if (!file) {
    await send404(res);
    return;
  }
  const ext = path.extname(file).toLowerCase();
  let body = await fs.readFile(file);
  const headers = {
    "Content-Type": TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
  };
  // GitHub Pages comprime texto; sin esto, Lighthouse mide 3–4× más bytes
  // de los que viajan en producción.
  const compressible = /\.(html|js|mjs|css|json|svg|txt|xml|webmanifest)$/.test(ext);
  if (compressible && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
    body = gzipSync(body);
    headers["Content-Encoding"] = "gzip";
    headers.Vary = "Accept-Encoding";
  }
  res.writeHead(200, headers);
  res.end(body);
});

async function send404(res) {
  const file = path.join(dir, "404.html");
  const body = (await stat(file)) ? await fs.readFile(file) : Buffer.from("404");
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}

server.listen(port, () => {
  console.log(`seb.sys estático: http://localhost:${port}${base}/  (dir: ${dir})`);
});
