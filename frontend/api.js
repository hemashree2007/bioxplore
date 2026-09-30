/* API layer — the single place that knows where answers come from.
 *
 * MOCK MODE (default): answers come from js/mock-data.js (exact backend schema).
 * LIVE MODE: POST {query, options} to Part A's /query and return its JSON.
 *
 * Switch: set window.MKS_CONFIG = { backend: "live", endpoint: "http://127.0.0.1:8001/query" }
 * before js/api.js loads, or just edit DEFAULT_CONFIG below (one line).
 */

const DEFAULT_CONFIG = {
  backend: "mock", // "mock" | "live"
  endpoint: "http://127.0.0.1:8001/query", // Part A: POST /query
  timeoutMs: 15000,
};

const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.MKS_CONFIG || {});

const EXAMPLE_QUERIES = [
  "Black holes",
  "Plasma oscillation",
  "Radiation laws",
  "Kepler's laws",
  "Gene expression",
  "Thirukkural",
  "Nature in Tholkappiyam",
  "Black hole vs white hole",
  "Can biological rhythms be compared conceptually with orbital periods?",
];

function normalizeError(raw) {
  // Backend error contract: {"error": {"code": ..., "message": ...}}
  if (raw && raw.error && raw.error.code) {
    return { code: raw.error.code, message: raw.error.message || "Request failed." };
  }
  return { code: "NETWORK_ERROR", message: (raw && raw.message) || "Could not reach the backend." };
}

async function fetchAnswer(query, options) {
  if (CONFIG.backend === "live") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    try {
      const resp = await fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, options: options || {} }),
        signal: controller.signal,
      });
      const body = await resp.json().catch(() => null);
      if (!resp.ok) throw normalizeError(body);
      if (body && body.error) throw normalizeError(body); // NO_DOMAIN_MATCH etc.
      return body;
    } catch (err) {
      if (err instanceof TypeError) throw normalizeError(null); // fetch/network
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  // MOCK mode: the curated cases match only by their exact example title;
  // every other phrasing goes through the general mock engine, which
  // composes a full 1D–4D answer for ANY supported topic.
  const trimmed = (query || "").trim();
  if (!trimmed) {
    throw { code: "EMPTY_QUERY", message: "Query is empty." };
  }
  if (MOCK_CASES[trimmed]) {
    await new Promise((r) => setTimeout(r, 450));
    return JSON.parse(JSON.stringify(MOCK_CASES[trimmed]));
  }
  return safeEngine(trimmed);
}

async function safeEngine(text) {
  await new Promise((r) => setTimeout(r, 350));
  return window.MOCK_ENGINE.mockAnswerAny(text);
}

window.MKS_API = { fetchAnswer, EXAMPLE_QUERIES, CONFIG };

if (typeof module !== "undefined") module.exports = { fetchAnswer, EXAMPLE_QUERIES, CONFIG };
