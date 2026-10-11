#!/usr/bin/env bash
# Render review stills at half scale and tile them: scripts/stills.sh NAME COMPOSITION FRAME...
set -e
name=$1; comp=$2; shift 2
mkdir -p out/stills/$name
for f in "$@"; do
  npx remotion still src/index.ts "$comp" out/stills/$name/$(printf %05d $f).png --frame=$f --scale=0.5 >/dev/null 2>&1 &
  while [ "$(jobs -r | wc -l)" -ge 3 ]; do sleep 0.2; done
done
wait
ffmpeg -loglevel error -y -pattern_type glob -i "out/stills/$name/*.png" -vf "tile=${COLS:-4}x$(( ($# + ${COLS:-4} - 1) / ${COLS:-4} ))" -frames:v 1 out/stills/$name.png
echo out/stills/$name.png
