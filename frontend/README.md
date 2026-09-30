# Frontend — Multidimensional Knowledge System

Vanilla HTML/CSS/JS single-page frontend for the research backend. No build
tools, no frameworks. Renders the backend's structured JSON answer
(domains, dimensions, per-dimension sections, labelled relationships,
sources, warnings) — it is NOT a chatbot UI.

## Run it

**Easiest:** double-click `standalone.html` (self-contained build).

**Modular (canonical sources):**

```bash
python -m http.server 8765   # from this folder
# open http://127.0.0.1:8765
```

## Files

```
index.html            page structure (semantic zones, states)
css/styles.css        responsive layout, badge/panel/verse styles
js/mock-data.js       4 mock cases in the exact backend schema
js/api.js             mock/live switch + error mapping (THE integration point)
js/render.js          header, dimension panels, badges, verse cards, sources
js/graph.js           dependency-free SVG node-link graph (3D panel)
js/app.js             state machine: idle → loading → result | error
build_standalone.py   regenerates standalone.html from the modular sources
```

## Mock cases (mock-data.js)

1. **Single-domain science (comparison):** "Black hole vs white hole" — 1D/3D/4D,
   FACT vs HYPOTHESIS labels, comparison table, relationship graph.
2. **Tamil verse query:** "What does Thirukkural say about water?" — verse card
   with original/transliteration/translation/literal meaning + full source fields.
   The verse text is clearly marked MOCK (no real verse is fabricated).
3. **Cross-domain:** biological rhythms ↔ orbital periods — ANALOGY relationship,
   persistent "Conceptual relationships are not scientific evidence." notice.
4. **Multidimensional biology:** mutation → DNA → protein → function →
   disease progression — all four dimensions + causal chain graph.

Any unmatched input demonstrates the `NO_DOMAIN_MATCH` error state.

## Connecting the real backend (one flag)

The backend contract: `POST /query` with `{"query": str, "options": {...}}`
returning `{query, answer: {summary, sections[], relationships[], comparison_table},
sources[], warnings[], not_found[]}` — or `{"error": {"code", "message"}}`.

In `index.html` (or `js/api.js` DEFAULT_CONFIG):

```js
window.MKS_CONFIG = {
  backend: "live",                      // was "mock"
  endpoint: "http://127.0.0.1:8001/query", // Part A's /query endpoint
};
```

Error codes handled: `EMPTY_QUERY`, `QUERY_TOO_LONG`, `NO_DOMAIN_MATCH`,
`RETRIEVAL_FAILED`, `INVALID_RESULT`, plus network failures/timeout.
Regenerate `standalone.html` after edits: `python build_standalone.py`.

CORS: Part A enables CORS for all origins, so a locally opened page works; if you
host the frontend elsewhere, add your origin to Part A's allow-list.

## Features checklist

- Input placeholder exactly: "Enter a topic, keyword, concept, sentence, question, or cross-domain query..."
- 9 clickable example queries
- Header: domains, input type + confidence, entities (A/B sides for comparisons), dimensions
- Only activated dimension panels render — never empty panels
- Colour-coded badges: FACT (green), EVIDENCE (blue), INTERPRETATION (amber),
  ANALOGY (purple), HYPOTHESIS (red outline; the enum value — displayed as HYPOTHESIS)
- 3D panel: node-link SVG graph + labelled relationship list
- Tamil verse cards in Noto Serif Tamil with verse number, chapter, author, source
  (a verse without source info would be withheld with a visible badge)
- Sources section (de-duplicated, linked)
- Persistent cross-domain/Tamil-science notice
- Loading, empty (idle), error and not-found states
- Mobile-friendly single-column layout (≤760px)
