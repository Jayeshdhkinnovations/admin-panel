# Automatic meeting discovery integration

## Result

Once this integration is installed, every Toowix meeting gets a dedicated dashboard entry automatically. The first participating browser sends telemetry after joining; the monitoring backend creates the room from its trusted `meetingId`, and the dashboard refreshes the meeting list automatically. No dashboard-side room creation is required.

## Prerequisites

1. Deploy the monitoring backend at an HTTPS URL reachable by every meeting browser. `http://localhost:4015` is only suitable when the meeting and backend run on the same computer.
2. Set `CORS_ORIGIN` to the Toowix web origin and dashboard origin, for example:

   ```env
   CORS_ORIGIN=https://talk.toowix.com,https://monitoring.toowix.com
   ```

3. Do **not** expose `TELEMETRY_INGEST_TOKEN` in the Toowix browser bundle in production. For the first local test, it may be used temporarily; then replace it with a short-lived token issued by the authenticated Toowix backend.

## Changes in the Toowix frontend

Locate the meeting lifecycle code. Search the Toowix repository for these terms:

```powershell
rg -n "new JitsiConference|JitsiMeetJS|createLocalTracks|getStats|onConferenceJoined|conference.join" src
```

Copy `integration/telemetryPublisher.ts` into the Toowix source tree, for example `src/lib/monitoring/telemetryPublisher.ts`.

The current publisher includes browser/OS, audio counters, jitter, ICE state,
camera/screen-track state, video codec and frame counters. Deploy this updated
file to Toowix; older publisher copies cannot populate those dashboard fields.

In the file which creates or joins the Jitsi conference, start the publisher **after the conference is joined and the existing peer connection is available**:

```ts
import { startTelemetryPublisher } from '@/lib/monitoring/telemetryPublisher';

// Run after your existing Jitsi conference join succeeds.
const stopMonitoring = startTelemetryPublisher({
  endpoint: import.meta.env.VITE_MONITORING_TELEMETRY_URL,
  token: telemetryTokenFromYourBackend,
  meetingId: roomId,                 // e.g. twx-qfa-eta-xuy
  participantId: authenticatedUser.id,
  displayName: authenticatedUser.name,
  getPeerConnections: () => existingPeerConnections,
});

// Call this in the existing leave/unmount cleanup.
stopMonitoring();
```

Install this in **both** routes, without merging or changing their media handling:

- `/meet/:roomId`
- `/meet-direct/:roomId`

`existingPeerConnections` must be the exact `RTCPeerConnection` already managed by the Jitsi integration. Do not create a new one. Its exact accessor differs by Toowix implementation, so provide the Toowix source project to wire it safely.

For the sender-to-viewer video matrix, pass `resolveSenderParticipantId` from
the Toowix/Jitsi participant mapping. WebRTC statistics expose an inbound
stream, but do not expose the application participant ID by themselves.

JVB bridge load and private server transport metrics cannot be read from a
meeting browser. They need an authorized Jitsi server metrics integration.

## Configuration in the Toowix frontend

For a local same-machine test:

```env
VITE_MONITORING_TELEMETRY_URL=http://localhost:4015/api/telemetry
```

For production:

```env
VITE_MONITORING_TELEMETRY_URL=https://monitoring.your-domain.com/api/telemetry
```

## Token flow

Add a small authenticated endpoint in the existing Toowix backend, such as `POST /api/monitoring/telemetry-session`. It should verify the signed-in user and that they can join `roomId`, then return a short-lived, room-scoped telemetry credential. The monitoring backend should verify that credential and reject a submitted `meetingId` or `participantId` outside its claims. Never use a global ingestion token in browser production code.

## Verification

1. Start the monitoring backend and dashboard.
2. Join any Toowix room after deploying the publisher.
3. Open the dashboard, enter its admin token once, and click **Connect**.
4. Within 3–10 seconds the meeting ID appears in the selector. Its participants and live metrics update as each browser publishes.

If the meeting does not appear, inspect the meeting browser Network tab for the telemetry POST and the monitoring backend console for rejected payloads. Typical causes are CORS, an unreachable monitoring URL, a missing peer-connection accessor, or an invalid telemetry credential.
