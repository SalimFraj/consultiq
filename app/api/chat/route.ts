import { NextResponse } from "next/server";
import { runAgent } from "@/lib/gemini";
import type { ChatMode, ClientMessage } from "@/lib/types";

export const runtime = "nodejs";

// ── Guardrail constants ─────────────────────────────────────────────
const MAX_MESSAGES = 30;
const MAX_CONTENT_LENGTH = 4_000; // characters per message
const MAX_BODY_SIZE = 100 * 1024; // 100 KB
const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 20;

// ── In-memory rate limiter ──────────────────────────────────────────
// NOTE: This is an in-memory store and resets on every cold start / redeploy.
// For production, replace with Redis, Upstash, or a similar persistent store.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    // First request or window expired — start a new window
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count < RATE_LIMIT_MAX_REQUESTS) {
    entry.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Rate limit exceeded
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: false, retryAfterSeconds };
}

// ── Request types ───────────────────────────────────────────────────
type ChatRequest = {
  messages?: ClientMessage[];
  mode?: ChatMode;
};

const ALLOWED_ROLES = new Set(["user", "assistant"]);

export async function POST(request: Request) {
  try {
    // 1. Rate limiting (by IP)
    const clientIp = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(clientIp);
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.` },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        },
      );
    }

    // 2. Request body size cap (100 KB)
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: `Request body too large. Maximum allowed size is ${MAX_BODY_SIZE / 1024}KB.` },
        { status: 413 },
      );
    }

    const body = (await request.json()) as ChatRequest;

    // 3. Message count cap
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    if (rawMessages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Too many messages. Maximum allowed is ${MAX_MESSAGES} messages per request.` },
        { status: 400 },
      );
    }

    // 4. Content length cap (per message)
    for (const msg of rawMessages) {
      if (typeof msg.content === "string" && msg.content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          {
            error: `Message content too long. Each message must be at most ${MAX_CONTENT_LENGTH} characters.`,
          },
          { status: 400 },
        );
      }
    }

    // 5. Sanitize messages — keep only allowed roles
    const messages = rawMessages.filter(
      (msg) => typeof msg.role === "string" && ALLOWED_ROLES.has(msg.role),
    );

    const mode = body.mode === "workflow" ? "workflow" : "assistant";

    if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "A latest user message is required." }, { status: 400 });
    }

    const response = await runAgent(messages, mode);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
