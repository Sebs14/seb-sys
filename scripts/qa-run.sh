#!/usr/bin/env bash
# Corrida completa de QA sobre el export estático: build, servidor,
# E2E, sonda de rendimiento, Lighthouse móvil y capturas de evidencia.
set -o pipefail
cd "$(dirname "$0")/.."
GITHUB_PAGES=true npx next build 2>&1 | grep -v omz | tail -4 || exit 1
touch out/.nojekyll
node scripts/serve-pages.mjs --port 4173 --dir out > /tmp/serve-qa.log 2>&1 &
SERVER=$!
sleep 1
echo "== E2E"
npx playwright test 2>&1 | grep -v omz > /tmp/e2e-final.log; echo "e2e exit=$?" >> /tmp/e2e-final.log
grep -E "passed|failed|skipped|exit=" /tmp/e2e-final.log | tail -4
echo "== probe"
node scripts/probe-frames.mjs http://localhost:4173/seb-sys/ 2>&1 | grep -v omz > docs/evidence/perf-swiftshader.json
node scripts/probe-frames.mjs http://localhost:4173/seb-sys/ --gpu 2>&1 | grep -v omz > docs/evidence/perf-gpu-metal.json
cat docs/evidence/perf-gpu-metal.json
echo "== lighthouse"
npx -y lighthouse http://localhost:4173/seb-sys/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=docs/evidence/lighthouse-mobile.json --quiet --chrome-flags="--headless=new --use-angle=metal --enable-gpu --ignore-gpu-blocklist" 2>&1 | grep -v omz | tail -3
node -e 'const r=require("./docs/evidence/lighthouse-mobile.json");const c=r.categories;console.log(JSON.stringify({performance:c.performance.score,accessibility:c.accessibility.score,bestPractices:c["best-practices"].score,seo:c.seo.score,lcp:r.audits["largest-contentful-paint"].displayValue,cls:r.audits["cumulative-layout-shift"].displayValue,tbt:r.audits["total-blocking-time"].displayValue}))'
echo "== evidence"
node scripts/shot-evidence.mjs http://localhost:4173/seb-sys/ docs/evidence/final 2>&1 | grep -v omz | tail -3
kill $SERVER
echo "== done"
