// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// open-next.config.ts — OpenNext Cloudflare Adapter Config
//
// OpenNext is the tool that converts your Next.js app into a format
// that Cloudflare Workers can understand and run.
//
// Think of it like a "translator" between Next.js and Cloudflare.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// R2 is Cloudflare's storage service (like Amazon S3, but free up to 10GB).
// Uncommenting this would enable faster page caching via R2 storage.
// For now, we leave it off — the default caching works fine for a new site.
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	// For best results consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache
});
