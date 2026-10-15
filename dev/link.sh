#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=dev/common.sh
source "$(dirname "$0")/common.sh"

RUNTIME_FILES=(main.py package.json dist py_modules defaults)

fail_if_real_install() {
  if [ -d "$TARGET" ] && [ ! -e "$TARGET/$MARKER" ]; then
    echo "Error: $TARGET is a real install, not a dev link. Remove it first." >&2
    exit 1
  fi
}

link_runtime_files() {
  sudo mkdir -p "$TARGET"
  sudo touch "$TARGET/$MARKER"
  for entry in "${RUNTIME_FILES[@]}"; do
    sudo ln -sfn "$PROJECT_DIR/$entry" "$TARGET/$entry"
  done
}

copy_plugin_json_since_decky_chowns_it() {
  sudo install -m 644 "$PROJECT_DIR/plugin.json" "$TARGET/plugin.json"
}

fail_if_real_install
pnpm --dir "$PROJECT_DIR" build
link_runtime_files
copy_plugin_json_since_decky_chowns_it
sudo systemctl restart plugin_loader
echo "Plugin linked at $TARGET"
