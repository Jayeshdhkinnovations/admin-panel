// Vercel's non-Next.js file router does not reliably send multi-segment API
// URLs (for example /api/meetings/:id/participants) to a catch-all function.
// backend/vercel.json rewrites every API request here, then the shared handler
// routes it using the original path supplied in the `path` query parameter.
export { default } from './[...path].js';
