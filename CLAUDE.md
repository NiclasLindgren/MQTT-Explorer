# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
yarn                    # Install all dependencies (monorepo: root + app/ + backend/)
yarn dev                # Development mode: webpack dev-server (HMR on :8080) + electron
yarn build              # Production build: compiles TypeScript + webpack bundle
yarn start              # Launch electron with built app
yarn package            # Build release binaries via electron-builder
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
yarn lint               # Runs prettier check, tslint, and cspell
```

**Prettier:** 120 print width, no semicolons, single quotes, trailing commas (es5), 2-space indent.
**TSLint:** extends airbnb + tslint-react. Max 200 char lines.

## Architecture

This is an **Electron desktop app** for exploring MQTT brokers, structured as a monorepo with three layers:

### Main Process (`src/`)
Entry point: `src/electron.ts`. Manages Electron window lifecycle, hosts the backend ConnectionManager, communicates with the renderer via IPC.

### Backend (`backend/src/`)
MQTT connection management and data modeling. Key components:
- `ConnectionManager` — manages MQTT connections
- `DataSource`/`MqttSource` — MQTT client wrapper (mqtt@4.3.6)
- `SparkplugDecoder` — decodes Sparkplug B payloads via protobufjs
- Models for tree-structured topic data

### Frontend (`app/src/`)
React 16 + Redux + Material-UI 4 renderer process. Webpack-bundled (`app/webpack.config.js`, target: electron-renderer). Key areas:
- Redux store: actions, reducers, effects in `app/src/`
- Charting via D3/react-vis
- Ace editor for payload viewing/editing
- Socket.io-client for real-time updates

### Event System (`events/`)
Shared IPC abstraction between main and renderer processes. `EventBus` with `IpcMainEventBus` and `IpcRendererEventBus` implementations, plus an RPC layer for request-response patterns. Event types defined in `events/Events.ts`.

## Key Technology Versions

- Electron 17, Node 16, TypeScript 4.5
- React 16.11, Redux 4, Material-UI 4
- Webpack 5 (frontend only; backend/main use tsc)
