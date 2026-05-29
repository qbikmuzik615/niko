# niko
Kids draw-and-guess browser game with instant room links.

## Run locally (automated iPad testing)

```bash
./scripts/start-local.sh
```

Optional custom port:

```bash
./scripts/start-local.sh 9000
```

The script automatically:
- Detects your LAN IP.
- Starts a local web server bound to `0.0.0.0`.
- Prints a host link that auto-creates a room.
- Prints a regular game link for iPad/other devices.
- Shows a terminal QR code when `qrencode` is installed.

### iPad test flow
1. Run the script on your laptop/desktop.
2. Open the printed **host link** on your main device.
3. Open the printed **game link** on iPad (same Wi‑Fi).
4. Share/join link from the host screen and play.

## Files
- `game.html`: full single-file app.
- `scripts/start-local.sh`: one-command local network launcher.
