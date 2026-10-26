// Save/load for the tracker. Everything lives in one site-wide Netlify Blobs store,
// so it survives every redeploy. Never rename STORE or you'll start with an empty tracker.
import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

const STORE = "scu-tracker";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const same = (a, b) => { const x = Buffer.from(a || ""), y = Buffer.from(b || ""); return x.length === y.length && timingSafeEqual(x, y); };
const toBlobKey = k => k.replace(/:/g, "/");     // app keys like att:abc123 -> att/abc123
const fromBlobKey = k => k.replace(/\//g, ":");

export default async (req) => {
  const pass = Netlify.env.get("TRACKER_PASSCODE");
  if (!pass) return new Response("TRACKER_PASSCODE is not set in Netlify environment variables.", { status: 500 });
  if (!same(req.headers.get("x-tracker-passcode"), pass)) { await sleep(1000); return new Response("Unauthorized", { status: 401 }); }

  const url = new URL(req.url);
  const store = getStore({ name: STORE, consistency: "strong" });
  const noCache = { "cache-control": "no-store" };

  if (url.searchParams.has("ping")) return Response.json({ ok: true }, { headers: noCache });

  if (req.method === "GET" && url.searchParams.has("list")) {
    const prefix = toBlobKey(url.searchParams.get("list") || "");
    const { blobs } = await store.list({ prefix });
    return Response.json({ keys: blobs.map(b => fromBlobKey(b.key)) }, { headers: noCache });
  }

  const key = url.searchParams.get("key") || "";
  if (!/^[\w:.-]{1,200}$/.test(key)) return new Response("Bad key", { status: 400 });
  const bk = toBlobKey(key);

  if (req.method === "GET") {
    const v = await store.get(bk, { type: "text" });
    if (v === null) return new Response("Not found", { status: 404, headers: noCache });
    return new Response(v, { headers: { "content-type": "text/plain; charset=utf-8", ...noCache } });
  }
  if (req.method === "PUT") {
    await store.set(bk, await req.text());
    return Response.json({ ok: true });
  }
  if (req.method === "DELETE") {
    await store.delete(bk);
    return Response.json({ ok: true });
  }
  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/data" };
