#!/bin/bash
set -e
cd "$(dirname "$0")/.."
npx esbuild test/monkey.ts --bundle --platform=node --format=esm --outfile=dist-test/monkey.mjs --loader:.txt=text --log-level=warning --sourcemap
node --enable-source-maps dist-test/monkey.mjs "$@"
