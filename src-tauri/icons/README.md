# Storm POS Icons

Place your icon files here before building the desktop app. Required files:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png` (256x256 actual size)
- `icon.ico` (multi-resolution Windows icon)
- `icon.icns` (macOS icon, optional if only building for Windows)

## Generating icons from the Storm logo

Install the Tauri CLI and run:
  npx @tauri-apps/cli icon path/to/storm-logo.png

This will generate all required sizes automatically into this folder.
