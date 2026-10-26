// Relays the tracker's AI requests to the Anthropic API so the API key never reaches the browser.
import { timingSafeEqual } from "node:crypto";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const same = (a, b) => { const x = Buffer.from(a || ""), y = Buffer.from(b || ""); return x.length === y.length && timingSafeEqual(x, y); };

export default async (req) => {
  const pass = Netlify.env.get("TRACKER_PASSCODE");
  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!pass || !apiKey) return new Response("TRACKER_PASSCODE or ANTHROPIC_API_KEY is not set.", { status: 500 });
  if (!same(req.headers.get("x-tracker-passcode"), pass)) { await sleep(1000); return new Response("Unauthorized", { status: 401 }); }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
  if (!Array.isArray(body.messages)) return new Response("Missing messages", { status: 400 });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: Netlify.env.get("CLAUDE_MODEL") || "claude-haiku-5-5",
      max_tokens: Math.min(Number(body.max_tokens) || 1000, 1500),
      messages: body.messages
    })
  });
  return new Response(await r.text(), { status: r.status, headers: { "content-type": "application/json" } });
};

export const config = { path: "/api/claude" };
