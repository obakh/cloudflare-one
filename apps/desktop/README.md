# Desktop App

A cross-platform desktop application built with [Tauri](https://tauri.app/) and React.

## Features

- **Cross-platform**: macOS, Windows, and Linux support
- **Custom titlebar**: Native-looking window controls
- **System tray**: Background operation with tray menu
- **Global shortcuts**: System-wide keyboard shortcuts
- **Deep links**: Custom URL scheme handling (`myapp://`)
- **Auto-updates**: Built-in update mechanism via GitHub releases
- **Native notifications**: System notification support
- **Persistent storage**: Key-value store for app settings
- **Multi-environment**: Dev, staging, and production configs

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) 18+
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio Build Tools, WebView2
  - **Linux**: `webkit2gtk`, `libappindicator`

### Linux Dependencies

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

# Fedora
sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel

# Arch
sudo pacman -S webkit2gtk-4.1 libappindicator-gtk3 librsvg
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri:dev

# Run with staging config
pnpm tauri:staging

# Run with production config
pnpm tauri:prod
```

## Building

```bash
# Build for current platform (production)
pnpm tauri:build:prod

# Build for development
pnpm tauri:build:dev

# Build for staging
pnpm tauri:build:staging
```

Build outputs are in `src-tauri/target/release/bundle/`.

## Configuration

### Environment Variables

Set `APP_ENV` to control which backend URL is used:

- `development` (default): `http://localhost:1420`
- `staging`: `https://staging.example.com`
- `production`: `https://app.example.com`

### Deep Links

The app registers the `myapp://` URL scheme. Configure in `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "deep-link": {
      "desktop": {
        "schemes": ["myapp"]
      }
    }
  }
}
```

### Auto-Updates

Configure update endpoints in `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY",
      "endpoints": [
        "https://github.com/your-org/your-repo/releases/latest/download/latest.json"
      ]
    }
  }
}
```

Generate signing keys:

```bash
pnpm tauri signer generate -w ~/.tauri/myapp.key
```

### Icons

Generate icons from a source image (1024x1024 PNG recommended):

```bash
pnpm tauri icon path/to/icon.png
```

## Project Structure

```
apps/desktop/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # React hooks for Tauri APIs
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust backend
│   ├── capabilities/       # Permission configs
│   ├── icons/              # App icons
│   ├── src/
│   │   ├── lib.rs          # Main Tauri logic
│   │   └── main.rs         # Entry point
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Production config
│   ├── tauri.dev.conf.json # Development config
│   └── tauri.staging.conf.json
├── index.html
├── package.json
└── vite.config.ts
```

## Hooks

### useDeepLinks

Handle deep link navigation:

```tsx
useDeepLinks((url) => {
  console.log("Deep link:", url);
  // Navigate based on URL
});
```

### useUpdater

Check for and install updates:

```tsx
const { checkForUpdates, updateAvailable, installUpdate } = useUpdater();
```

### useNotifications

Send native notifications:

```tsx
const { sendNotification } = useNotifications();
await sendNotification({ title: "Hello", body: "World" });
```

### useStore

Persistent key-value storage:

```tsx
const { value, setValue } = useStore("key", defaultValue);
```

## Customization

1. Update `productName` and `identifier` in `tauri.conf.json`
2. Replace icons in `src-tauri/icons/`
3. Update deep link scheme in `tauri.conf.json`
4. Configure update endpoints for auto-updates
5. Customize the React frontend in `src/`
