#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_NAME="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["name"])' "$PROJECT_DIR/plugin.json")"
TARGET="$HOME/homebrew/plugins/$PLUGIN_NAME"
MARKER=".dev-link"

if [ ! -e "$TARGET/$MARKER" ]; then
  echo "No dev link at $TARGET."
  exit 0
fi

sudo rm -r "$TARGET"
sudo systemctl restart plugin_loader
echo "Dev link removed."
