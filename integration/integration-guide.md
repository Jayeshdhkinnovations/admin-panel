# Optional Toowix telemetry integration

No production Toowix code was available in this workspace, and this project does not probe `talk.toowix.com` for undocumented endpoints. Review and add `startTelemetryPublisher` to both existing meeting entry points (`/meet/:roomId` and `/meet-direct/:roomId`) after the authenticated Jitsi conference and existing peer connections are available.

Pass only the already-created `RTCPeerConnection` instances. The publisher calls `getStats()` every three seconds; it does not create media tracks, peer connections, recordings, or active bandwidth tests. Issue a short-lived telemetry token server-side, never embed `TELEMETRY_INGEST_TOKEN` in a browser bundle.

Receiver-to-sender matrix values must be posted by every receiving browser in `receivers`; the sample module intentionally does not fabricate them.
