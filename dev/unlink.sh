#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=dev/common.sh
source "$(dirname "$0")/common.sh"

if [ -e "$TARGET/$MARKER" ]; then
  sudo rm -r "$TARGET"
else
  echo "No dev link at $TARGET."
  exit 0
fi

sudo systemctl restart plugin_loader
echo "Dev link removed."
