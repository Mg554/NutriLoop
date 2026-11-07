#!/usr/bin/env bash
# Run INSIDE the kid's account:  bash install-zorin.sh
# Copies the offline single-file app and adds a menu/desktop launcher that
# opens it full-screen (kiosk) in Chrome/Chromium if present, else Firefox.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/nutriloop.html"
DEST="$HOME/.local/share/nutriloop"
mkdir -p "$DEST" "$HOME/.local/share/applications"
cp "$SRC" "$DEST/index.html"
# offline pose model for the camera smart coach + recorded Arabic voice
mkdir -p "$DEST/voice" && cp "$(dirname "$0")"/voice/*.mp3 "$DEST/voice/" 2>/dev/null || true
mkdir -p "$DEST/pose" && cp "$(dirname "$0")/pose/pose.js" "$(dirname "$0")/pose/pose-pack.js" "$DEST/pose/"
cp "$(dirname "$0")/icon-512.png" "$DEST/icon.png" 2>/dev/null || true

if   command -v google-chrome >/dev/null; then BR="google-chrome --app=file://$DEST/index.html --start-fullscreen"
elif command -v chromium      >/dev/null; then BR="chromium --app=file://$DEST/index.html --start-fullscreen"
else                                        BR="firefox --kiosk file://$DEST/index.html"; fi

cat > "$HOME/.local/share/applications/nutriloop.desktop" <<DESK
[Desktop Entry]
Type=Application
Name=NutriLoop
Name[ar]=رحلة الأكل الصحي
Exec=$BR
Icon=$DEST/icon.png
Categories=Education;Game;
DESK
chmod +x "$HOME/.local/share/applications/nutriloop.desktop"
[ -d "$HOME/Desktop" ] && cp "$HOME/.local/share/applications/nutriloop.desktop" "$HOME/Desktop/" && \
  gio set "$HOME/Desktop/nutriloop.desktop" metadata::trusted true 2>/dev/null || true
echo "✅ Installed. Launcher: $BR"
