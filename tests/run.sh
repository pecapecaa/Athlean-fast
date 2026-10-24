#!/usr/bin/env bash
# Runs the cart tests against a local copy of the site.
#
#   ./tests/run.sh
#
# Starts a static server on a free port, runs the suite against it, and shuts
# the server down again. Exit code 0 means every check passed.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-8299}"
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"

node tests/server.js "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

# Wait for the server rather than guessing at a sleep.
for _ in $(seq 1 40); do
  if curl -sf "http://localhost:$PORT/" >/dev/null; then break; fi
  sleep 0.25
done

BASE="http://localhost:$PORT" node tests/cart.spec.js
BASE="http://localhost:$PORT" node tests/analytics.spec.js
BASE="http://localhost:$PORT" node tests/seo.spec.js
BASE="http://localhost:$PORT" node tests/navigation.spec.js
