#!/usr/bin/env bash
# Screenshot a game mid-play: builds, serves dist, opens #/play/<slug>, clicks Play, waits, optional key presses.
# usage: bash scripts/play.sh <slug> <out.png> [wait-ms=2500] [js to run after start]
set -uo pipefail
cd "$(dirname "$0")/.."
PP=${PREVIEW_PORT:-5311}; CP=${CDP_PORT:-9311}
npx vite preview --port "$PP" --strictPort --host 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
sleep 1.5
JS="document.querySelector('.btn-play')?.click(); setTimeout(() => { ${4:-} }, 600)"
SEL=.btn-play PORT=$CP CHROME=$(command -v google-chrome) WAIT=${3:-2500} node scripts/shot.mjs "http://127.0.0.1:$PP/#/play/$1" "$2" 1280 900 dark "$JS"
kill $SRV 2>/dev/null; pkill -f "vite preview --port $PP" 2>/dev/null; true
