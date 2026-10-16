#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="steamweblauncher"
REPOSITORY="FlavioRoso/steamweblauncher"
VERSION="${STEAMWEBLAUNCHER_VERSION:-latest}"
PLUGINS_DIR="$HOME/homebrew/plugins"
TARGET="$PLUGINS_DIR/$PLUGIN_NAME"

release_zip_url() {
  if [ "$VERSION" = "latest" ]; then
    echo "https://github.com/$REPOSITORY/releases/latest/download/$PLUGIN_NAME.zip"
  else
    echo "https://github.com/$REPOSITORY/releases/download/$VERSION/$PLUGIN_NAME.zip"
  fi
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

fail_if_root() {
  if [ "$(id -u)" -eq 0 ]; then
    fail "run this as your normal user, not with sudo. It asks for sudo when needed."
  fi
}

fail_without_decky() {
  if [ ! -d "$PLUGINS_DIR" ]; then
    fail "Decky Loader not found ($PLUGINS_DIR is missing). Install it first: https://decky.xyz"
  fi
}

extract_zip() {
  local archive="$1" destination="$2"
  if command -v unzip >/dev/null; then
    unzip -q "$archive" -d "$destination"
  elif command -v bsdtar >/dev/null; then
    bsdtar -xf "$archive" -C "$destination"
  else
    python3 -m zipfile -e "$archive" "$destination"
  fi
}

replace_installed_plugin() {
  local extracted="$1"
  sudo rm -rf "$TARGET"
  sudo mv "$extracted" "$TARGET"
}

fail_if_root
fail_without_decky

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

echo "Downloading $PLUGIN_NAME ($VERSION)..."
curl -fsSL "$(release_zip_url)" -o "$workdir/$PLUGIN_NAME.zip"
extract_zip "$workdir/$PLUGIN_NAME.zip" "$workdir/extracted"

if [ ! -f "$workdir/extracted/$PLUGIN_NAME/plugin.json" ]; then
  fail "the downloaded file is not a $PLUGIN_NAME plugin package."
fi

echo "Installing into $TARGET (asks for your password)..."
replace_installed_plugin "$workdir/extracted/$PLUGIN_NAME"
sudo systemctl restart plugin_loader

echo "$PLUGIN_NAME installed. Open the Quick Access menu in Game Mode and look for the Web tab."
