# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
yarn --ignore-engines install    # Install all dependencies (monorepo: root + app/ + backend/)
yarn --ignore-engines build      # Production build: compiles TypeScript + webpack bundle
yarn --ignore-engines dev:server # Browser dev mode: webpack dev-server (:8080) + backend server (:3000)
yarn --ignore-engines start      # Launch electron with built app
yarn --ignore-engines package    # Build release binaries via electron-builder
```

**Note:** `--ignore-engines` is required because the project has mixed Node engine requirements. Use `yarn config set ignore-engines true` to avoid repeating the flag.

### Dev Modes

- **Browser mode** (`dev:server`): Runs `dev:server:app` (webpack on :8080) and `dev:server:backend` (Node server on :3000) in parallel. The webpack dev server proxies `/socket.io`, `/api`, `/auth` to the backend. Use http://localhost:8080.
- **Electron mode** (`dev:app` + `dev:electron` in separate terminals): webpack dev-server + Electron shell.
- **Do not use `dev` directly** — it runs all modes in parallel causing port conflicts.

### Building Executables

```bash
yarn --ignore-engines prepare-release   # Copies built app into build/clean/
yarn --ignore-engines package win       # Produces portable .exe and NSIS installer in build/clean/dist/
```

## Testing

```bash
yarn test               # Run all tests (app + backend)
yarn test:app           # Frontend tests only (mocha + chai, pattern: app/src/**/*.spec.ts)
yarn test:backend       # Backend tests only (mocha + chai, pattern: backend/src/**/*.spec.ts)
```

Backend tests use NYC for coverage. UI/E2E tests use WebdriverIO + Spectron and require a running Mosquitto broker (`scripts/uiTests.sh`).

## Linting

```bash
yarn lint               # Runs prettier check, eslint, and cspell
```

**Prettier:** 120 print width, no semicolons, single quotes, trailing commas (es5), 2-space indent.

## Architecture

This is an **Electron desktop app** (with a browser mode) for exploring MQTT brokers, structured as a monorepo with three layers:

### Main Process (`src/`)
Entry point: `src/electron.ts`. Manages Electron window lifecycle, hosts the backend ConnectionManager, communicates with the renderer via IPC. `src/server.ts` provides the browser-mode HTTP/WebSocket server. `src/AuthManager.ts` handles authentication (env vars `MQTT_EXPLORER_USERNAME`/`MQTT_EXPLORER_PASSWORD`, or auto-generated credentials, or `MQTT_EXPLORER_SKIP_AUTH=true`).

### Backend (`backend/src/`)
MQTT connection management and data modeling. Key components:
- `ConnectionManager` (`backend/src/index.ts`) — manages MQTT connections
- `DataSource`/`MqttSource` — MQTT client wrapper
- `SparkplugDecoder` — decodes Sparkplug B payloads via protobufjs
- Models for tree-structured topic data. **Important:** type-only exports (interfaces, type aliases) in `backend/src/Model/index.ts` must use `export type`.

### Frontend (`app/src/`)
React 19 + Redux + MUI 7 renderer process. Two webpack configs:
- `webpack.config.mjs` — Electron renderer target
- `webpack.browser.config.mjs` — Browser target, aliases `electron` to `app/src/mocks/electron.ts`, replaces IPC event bus with browser event bus via `NormalModuleReplacementPlugin`

Key areas:
- Redux store: actions, reducers, effects in `app/src/`
- Connection setup: `app/src/components/ConnectionSetup/` (profile list, settings, advanced settings with subscriptions)
- Topic tree: `app/src/components/Tree/` (TreeNode with mouse-over selection controlled by `selectTopicWithMouseOver` setting)
- Sidebar: `app/src/components/Sidebar/` (CodeDiff for JSON diff view, publish tab, details)
- Charting via visx/D3

### Event System (`events/`)
Shared IPC abstraction between main and renderer processes. `EventBus` with `IpcMainEventBus` and `IpcRendererEventBus` implementations, plus an RPC layer for request-response patterns. Event types defined in `events/Events.ts`.

## Dark Mode Considerations

MUI's default dark theme has a light primary color (`#90caf9`), which means `theme.palette.primary.contrastText` resolves to **black**. For text/icons inside the AppBar, use `color="inherit"` or `color: 'inherit'` instead of `primary.contrastText` to pick up the correct toolbar text color in both themes.

## MUI Icon Styling

MUI SVG icons ignore `width`/`height` CSS properties. Use `fontSize` to control icon size. When using `@mui/styles` `withStyles`, MUI's default `.MuiSvgIcon-root` styles may win on specificity — use `&.MuiSvgIcon-root` selector to override.

## Key Technology Versions

- Electron 39, TypeScript 5.9
- React 19, Redux 5, MUI 7
- Webpack 5 (frontend only; backend/main use tsc)
