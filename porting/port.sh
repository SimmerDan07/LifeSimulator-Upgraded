#!/bin/bash
# Regenerates src/game from the cleaned decompiled Java + hand-written overrides.
set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)
rm -rf src/game
python3 "$ROOT/../j2ts/j2ts.py" "$ROOT/../clean" src/game "$ROOT/../j2ts/files.txt" "$ROOT/../j2ts/hand.json"
cp -r src/hand/. src/game/
python3 tools/gen_registry.py src/game > src/game/registry.ts
