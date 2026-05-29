#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but not installed."
  exit 1
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -z "$LAN_IP" ]]; then
  LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
fi
if [[ -z "$LAN_IP" ]]; then
  LAN_IP="$(python3 - <<'PY'
import socket
s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
try:
    s.connect(("8.8.8.8",80))
    print(s.getsockname()[0])
except Exception:
    print("127.0.0.1")
finally:
    s.close()
PY
)"
fi

BASE_URL="http://${LAN_IP}:${PORT}/game.html"
HOST_URL="${BASE_URL}?create=1"

cat <<MSG

✅ Local server starting for iPad testing

Open this on host device (auto-create room):
$HOST_URL

Open this on iPad/other devices (join manually or from host share link):
$BASE_URL

Tip: make sure devices are on the same Wi-Fi network.
Press Ctrl+C to stop.
MSG

if command -v qrencode >/dev/null 2>&1; then
  echo
  echo "Host QR code:"
  qrencode -t ANSIUTF8 "$HOST_URL"
fi

python3 -m http.server "$PORT" --bind 0.0.0.0
