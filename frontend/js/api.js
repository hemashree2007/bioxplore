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

  // MOCK mode: exact-match against mock cases, else closest case for demoing.
  const trimmed = (query || "").trim();
  if (!trimmed) {
    throw { code: "EMPTY_QUERY", message: "Query is empty." };
  }
  const direct = MOCK_CASES[trimmed];
  if (direct) {
    await new Promise((r) => setTimeout(r, 450)); // simulate latency
    return JSON.parse(JSON.stringify(direct));
  }

  // route by keywords so any input still shows a realistic result
  const t = trimmed.toLowerCase();
  let chosen = null;
  if (/(tamil|kural|tholkappiyam|தமிழ்|குறள்)/.test(t)) {
    chosen = MOCK_CASES["What does Thirukkural say about water?"];
  } else if (/(rhythm|period)/.test(t) && /(rhythm|biological)/.test(t)) {
    chosen = MOCK_CASES["Can biological rhythms be compared conceptually with orbital periods?"];
  } else if (/(mutation|dna|protein)/.test(t)) {
    chosen = MOCK_CASES[
      "How does a mutation affect DNA, protein structure, cellular function and disease progression?"
    ];
  } else if (/(black hole|white hole|black holes)/.test(t)) {
    chosen = MOCK_CASES["Black hole vs white hole"];
  }
  if (chosen) {
    await new Promise((r) => setTimeout(r, 450));
    const copy = JSON.parse(JSON.stringify(chosen));
    copy.query.raw_query = trimmed;
    return copy;
  }

  // nothing matches: simulate the backend's NO_DOMAIN_MATCH
  await new Promise((r) => setTimeout(r, 300));
  throw { code: "NO_DOMAIN_MATCH", message: "No supported domain matched this query." };
}

window.MKS_API = { fetchAnswer, EXAMPLE_QUERIES, CONFIG };

if (typeof module !== "undefined") module.exports = { fetchAnswer, EXAMPLE_QUERIES, CONFIG };
