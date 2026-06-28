// moe-idb-proxy-worker.js
// Cloudflare Worker for Master of Epic 物理ダメージ計算webツール
//
// v1.18.4:
// - Fixed for this tool's GitHub Pages deployment.
// - Allows only configured browser Origins.
// - Returns 403 for other Origins.
// - Fetches only individual official MoE DB item pages.

const ALLOWED_HOST = "idb.moepic.com";

// Browser Origin is scheme + host only. GitHub Pages path is not included.
// Published URL example:
// https://sincostanrap-droid.github.io/Master-of-Epic-web-damage-tool/
const ALLOWED_ORIGINS = new Set([
  "https://sincostanrap-droid.github.io"
]);

function requestOrigin(request) {
  return request.headers.get("Origin") || "";
}

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(origin);
}

function corsHeaders(origin = "") {
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function response(body, status = 200, headers = {}, origin = "") {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders(origin),
      ...headers
    }
  });
}

function text(body, status = 200, origin = "") {
  return response(body, status, {"Content-Type": "text/plain; charset=utf-8"}, origin);
}

function enforceOrigin(request) {
  const origin = requestOrigin(request);
  if (!origin || !isAllowedOrigin(origin)) {
    throw new Error(`Forbidden origin: ${origin || "(none)"}`);
  }
  return origin;
}

function normalizeTargetUrl(raw) {
  if (!raw) return null;

  const target = new URL(raw);
  if (target.protocol !== "https:") throw new Error("Only https URLs are allowed.");
  if (target.hostname !== ALLOWED_HOST) throw new Error("Only idb.moepic.com is allowed.");
  if (!target.pathname.startsWith("/items/")) throw new Error("Only /items/ pages are allowed.");

  // Individual item page only.
  if (!/^\/items\/[a-z_%-]+\/\d+\/?$/i.test(target.pathname)) {
    throw new Error("Only individual item pages are allowed. Example: /items/defences/22761");
  }

  target.hash = "";
  return target.toString();
}

export default {
  async fetch(request) {
    const origin = requestOrigin(request);

    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(origin)) {
        return text("Forbidden origin.", 403, origin);
      }
      return response(null, 204, {}, origin);
    }

    if (request.method !== "GET") {
      return text("Method not allowed.", 405, origin);
    }

    try {
      const allowedOrigin = enforceOrigin(request);
      const current = new URL(request.url);
      const targetUrl = normalizeTargetUrl(current.searchParams.get("url"));

      if (!targetUrl) {
        return text("OK: MoE IDB proxy worker is running for Master of Epic damage tool.", 200, allowedOrigin);
      }

      const upstream = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "MoE-damage-tool-IDB-importer/1.0",
          "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8"
        },
        cf: {
          cacheTtl: 21600,
          cacheEverything: true
        }
      });

      const body = await upstream.text();

      if (!upstream.ok) {
        return text(`Upstream error: HTTP ${upstream.status}\n${body.slice(0, 500)}`, upstream.status, allowedOrigin);
      }

      return response(body, 200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=21600",
        "X-MOE-IDB-Proxy": "OK"
      }, allowedOrigin);
    } catch (e) {
      const message = e && e.message ? e.message : String(e);
      const status = message.startsWith("Forbidden origin") ? 403 : 400;
      return text(message, status, origin);
    }
  }
};
