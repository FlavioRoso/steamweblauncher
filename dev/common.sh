# shellcheck shell=bash

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_NAME="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["name"])' "$PROJECT_DIR/plugin.json")"
TARGET="$HOME/homebrew/plugins/$PLUGIN_NAME"
MARKER=".dev-link"

export PROJECT_DIR PLUGIN_NAME TARGET MARKER
