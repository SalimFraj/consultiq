import { describe, expect, it } from "vitest";
import { POST } from "../app/api/chat/route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `test-${crypto.randomUUID()}`,
      ...headers
    },
    body: JSON.stringify(body)
  });
}

describe("/api/chat guardrails", () => {
  it("rejects an empty message list", async () => {
    const response = await POST(request({ messages: [], mode: "assistant" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "A latest user message is required." });
  });

  it("rejects too many messages", async () => {
    const messages = Array.from({ length: 31 }, () => ({ role: "user", content: "hello" }));
    const response = await POST(request({ messages, mode: "assistant" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("Too many messages") });
  });

  it("rejects oversized message content", async () => {
    const response = await POST(
      request({
        mode: "assistant",
        messages: [{ role: "user", content: "x".repeat(4_001) }]
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("Message content too long") });
  });

  it("rejects oversized request bodies from content-length", async () => {
    const response = await POST(
      request({ messages: [{ role: "user", content: "hello" }] }, { "content-length": String(101 * 1024) })
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("Request body too large") });
  });

  it("rate-limits repeated requests from the same IP", async () => {
    const ip = `rate-${crypto.randomUUID()}`;
    let response = await POST(request({ messages: [], mode: "assistant" }, { "x-forwarded-for": ip }));

    for (let index = 0; index < 20; index += 1) {
      response = await POST(request({ messages: [], mode: "assistant" }, { "x-forwarded-for": ip }));
    }

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
});
