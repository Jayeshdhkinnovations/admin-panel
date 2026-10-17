# Toowix Meet Monitoring

Standalone React/Vite and Node/Express live monitoring MVP at `C:\Users\xeon5\Desktop\toowix-meet-monitoring`. It follows the supplied observability-preview layout and renders only authenticated Live telemetry.

## Run

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5175`. The backend is `http://localhost:4015`, avoiding ports 3000, 3001, and 4000. On Linux/macOS: `cp .env.example .env && npm install && npm run dev`.

## Live mode

Set strong `MONITOR_ADMIN_TOKEN` and `TELEMETRY_INGEST_TOKEN` values. POST validated browser telemetry to `/api/telemetry` with the ingestion bearer token. Use the administrator token in the dashboard’s Live-mode field. Read APIs and SSE require authorization; payloads are capped at 256 KB and retention is bounded by `METRICS_RETENTION_MINUTES`.

`integration/telemetryPublisher.ts` is an optional reviewable module for both Toowix meeting routes. Once wired in, meetings are discovered automatically and appear in the dashboard within 10 seconds. Follow [automatic-meeting-integration.md](integration/automatic-meeting-integration.md); this repository does not modify the meeting app itself.

## API

`GET /api/health` is public. `POST /api/telemetry` uses the ingestion token. `GET /api/meetings`, `/api/meetings/:id/participants`, `/api/meetings/:id/history`, `/api/meetings/:id/metrics`, `/api/meetings/:id/alerts`, `/api/servers/health`, and `/api/stream` use the admin token. See `docs/` for architecture, metrics, thresholds, and integration status.

## Verification

Run `npm run build` and `npm test`. Tests cover authorization, payload validation, and participant ingestion. No production telemetry or server metrics were tested because no authorized Toowix source or infrastructure access was provided.
