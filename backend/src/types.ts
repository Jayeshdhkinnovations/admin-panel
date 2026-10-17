import { z } from 'zod';

export const telemetrySchema = z.object({
  meetingId: z.string().min(1).max(128), participantId: z.string().min(1).max(128),
  displayName: z.string().max(120).optional(), timestamp: z.number().int().positive().optional(),
  connectionState: z.enum(['connected', 'reconnecting', 'disconnected']).default('connected'),
  audioEnabled: z.boolean().optional(), cameraEnabled: z.boolean().optional(), screenSharing: z.boolean().optional(),
  client: z.object({ browser: z.string().max(80).optional(), os: z.string().max(80).optional() }).optional(),
  network: z.object({ rttMs: z.number().min(0).max(60000).optional(), jitterMs: z.number().min(0).max(60000).optional(), packetLossPct: z.number().min(0).max(100).optional(), uploadBitrateKbps: z.number().min(0).max(1000000).optional(), downloadBitrateKbps: z.number().min(0).max(1000000).optional(), availableOutgoingBitrateKbps: z.number().min(0).max(1000000).optional(), iceState: z.string().max(40).optional(), relay: z.boolean().optional() }).optional(),
  video: z.object({ captureWidth: z.number().int().min(0).optional(), captureHeight: z.number().int().min(0).optional(), captureFps: z.number().min(0).max(240).optional(), sendWidth: z.number().int().min(0).optional(), sendHeight: z.number().int().min(0).optional(), sendFps: z.number().min(0).max(240).optional(), receiveWidth: z.number().int().min(0).optional(), receiveHeight: z.number().int().min(0).optional(), receiveFps: z.number().min(0).max(240).optional(), codec: z.string().max(30).optional(), frozenFrames: z.number().min(0).optional(), framesDropped: z.number().min(0).optional(), qualityLimitationReason: z.string().max(60).optional() }).optional(),
  audio: z.object({ outboundBitrateKbps: z.number().min(0).optional(), inboundBitrateKbps: z.number().min(0).optional(), codec: z.string().max(30).optional(), level: z.number().min(0).max(1).optional(), concealedSamples: z.number().min(0).optional() }).optional(),
  receivers: z.array(z.object({ senderParticipantId: z.string().min(1).max(128), streamType: z.enum(['camera','screen']), width: z.number().int().min(0), height: z.number().int().min(0), fps: z.number().min(0).max(240), bitrateKbps: z.number().min(0), packetLossPct: z.number().min(0).max(100).optional(), frozenFrames: z.number().min(0).optional(), codec: z.string().max(30).optional() })).max(100).optional()
});
export type Telemetry = z.infer<typeof telemetrySchema>;
export type Participant = Telemetry & { lastSeen: number; joinedAt: number; quality: 'Excellent'|'Good'|'Degraded'|'Poor'|'Unknown'; score: number };
