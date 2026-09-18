import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

/**
 * Auth responses are per-user, so they must never be cached by the Next.js
 * Data Cache — otherwise the first visitor's session could be served to
 * everyone. Keep this route fully dynamic.
 */
export const dynamic = "force-dynamic";