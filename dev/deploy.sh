#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_NAME="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["name"])' "$PROJECT_DIR/plugin.json")"
TARGET="$HOME/homebrew/plugins/$PLUGIN_NAME"
MARKER=".dev-link"
RUNTIME_FILES=(main.py package.json dist py_modules defaults)

fail_if_real_install() {
  if [ -d "$TARGET" ] && [ ! -e "$TARGET/$MARKER" ]; then
    echo "Error: $TARGET is a real install, not a dev link. Remove it first." >&2
    exit 1
  fi
}

is_linked_with_current_plugin_json() {
  [ -e "$TARGET/$MARKER" ] && cmp -s "$PROJECT_DIR/plugin.json" "$TARGET/plugin.json"
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

restart_decky() {
  sudo systemctl restart plugin_loader
}

reload_plugin_without_sudo() {
  node "$PROJECT_DIR/dev/reload.mjs" "$PLUGIN_NAME"
}

fail_if_real_install
pnpm --dir "$PROJECT_DIR" build

if is_linked_with_current_plugin_json; then
  reload_plugin_without_sudo || restart_decky
  echo "Plugin reloaded from $PROJECT_DIR"
else
  link_runtime_files
  copy_plugin_json_since_decky_chowns_it
  restart_decky
  echo "Plugin linked at $TARGET"
fi
