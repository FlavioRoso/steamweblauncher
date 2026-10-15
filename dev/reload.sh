#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=dev/common.sh
source "$(dirname "$0")/common.sh"

pnpm --dir "$PROJECT_DIR" build
node "$PROJECT_DIR/dev/reload.mjs" "$PLUGIN_NAME"
