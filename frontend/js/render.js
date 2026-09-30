/* Renderers — pure DOM builders for each part of the answer envelope. */

(function () {
  const DIMENSION_META = {
    "1D": { title: "1D — Text / Literal", desc: "definitions, equations, measurements, verses" },
    "2D": { title: "2D — Interpretation / Context", desc: "mechanisms, conditions, literary context" },
    "3D": { title: "3D — Symbol / Concept / Relationship", desc: "entity → entity, cause → effect, concept ↔ concept" },
    "4D": { title: "4D — Future / Hypothetical / Temporal", desc: "change over time, progression, analogy, speculation" },
  };

  const BADGE_CLASS = {
    FACT: "badge-fact",
    EVIDENCE: "badge-evidence",
    INTERPRETATION: "badge-interpretation",
    ANALOGY: "badge-analogy",
    HYPOTHESIS: "badge-hypothesis",
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function badge(label) {
    const span = el("span", `badge ${BADGE_CLASS[label] || "badge-interpretation"}`);
    span.textContent = label;
    span.title = `Evidence level: ${label}`;
    return span;
  }

  function sourceLine(source) {
    const parts = [];
    if (source.text_name) parts.push(`${source.text_name}`);
    if (source.verse_number) parts.push(`verse ${source.verse_number}`);
    if (source.chapter) parts.push(`ch. ${source.chapter}`);
    if (source.author) parts.push(source.author);
    const ref = source.reference || "";
    const line = parts.length ? `${source.title} — ${parts.join(", ")}` : source.title;
    const p = el("p", "source-line");
    if (ref) {
      const a = document.createElement("a");
      a.href = /^https?:\/\//.test(ref) ? ref : `https://${ref}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = line;
      p.appendChild(a);
    } else {
      p.textContent = line;
    }
    return p;
  }

  function verseCard(item) {
    const card = el("article", "verse-card");
    const v = item.verse || {};

    const head = el("header", "verse-head");
    head.appendChild(el("span", "verse-textname", item.source.text_name || "Tamil text"));
    if (item.source.verse_number) head.appendChild(el("span", "verse-number", `வரி ${item.source.verse_number}`));
    if (item.source.chapter) head.appendChild(el("span", "verse-chapter", `அதிகாரம் ${item.source.chapter}`));
    if (item.source.author) head.appendChild(el("span", "verse-author", item.source.author));
    card.appendChild(head);

    const original = el("p", "verse-original ta", v.original || item.content);
    original.setAttribute("lang", "ta");
    card.appendChild(original);

    if (v.transliteration) card.appendChild(el("p", "verse-transliteration", v.transliteration));
    if (v.translation) {
      const t = el("p", "verse-translation");
      t.append(el("strong", null, "Translation: "), document.createTextNode(v.translation));
      card.appendChild(t);
    }
    if (v.literal_meaning) {
      const lm = el("p", "verse-literal");
      lm.append(el("strong", null, "Literal meaning: "), document.createTextNode(v.literal_meaning));
      card.appendChild(lm);
    }
    if (Array.isArray(v.words) && v.words.length) {
      const words = el("p", "verse-words");
      v.words.forEach((w) => words.appendChild(el("span", "word-chip", w)));
      card.appendChild(words);
    }

    // Never display a verse without source info.
    const hasSource = item.source && (item.source.text_name || item.source.verse_number);
    const foot = el("footer", "verse-foot");
    foot.appendChild(badge(item.evidence_label));
    if (hasSource) {
      foot.appendChild(sourceLine(item.source));
    } else {
      foot.appendChild(el("span", "badge badge-hypothesis", "SOURCE MISSING — verse withheld"));
    }
    card.appendChild(foot);
    return card;
  }

  function itemCard(item) {
    if (item.is_verse || item.verse) return verseCard(item);
    const card = el("article", "item-card");
    const head = el("header", "item-head");
    head.appendChild(badge(item.evidence_label));
    head.appendChild(el("h4", "item-title", item.title));
    card.appendChild(head);
    card.appendChild(el("p", "item-content", item.content));
    if (item.entities && item.entities.length) {
      const chips = el("div", "entity-chips");
      item.entities.forEach((e) => chips.appendChild(el("span", "word-chip", e)));
      card.appendChild(chips);
    }
    if (item.source && item.source.title) card.appendChild(sourceLine(item.source));
    return card;
  }

  function relationshipList(rels) {
    const list = el("ul", "rel-list");
    rels.forEach((r) => {
      const li = el("li", "rel-item");
      li.appendChild(badge(r.evidence_label));
      li.append(
        document.createTextNode(" ")
      );
      const strong = el("strong", null, r.from_entity);
      const em = el("em", "rel-type", ` ${r.relation} `);
      li.append(strong, em, el("strong", null, r.to_entity));
      if (r.source && r.source.title) li.appendChild(sourceLine(r.source));
      list.appendChild(li);
    });
    return list;
  }

  function renderHeader(answer, container) {
    container.innerHTML = "";
    const q = answer.query || {};
    const wrap = el("section", "query-header");

    const doms = el("div", "header-row");
    doms.appendChild(el("span", "header-label", "Domains"));
    (q.domains || []).forEach((d) => doms.appendChild(el("span", "chip chip-domain", d.domain)));
    wrap.appendChild(doms);

    const types = el("div", "header-row");
    types.appendChild(el("span", "header-label", "Input type"));
    types.appendChild(el("span", "chip chip-type", q.input_type || "unknown"));
    if (typeof q.input_type_confidence === "number") {
      types.appendChild(el("span", "chip chip-muted", `confidence ${q.input_type_confidence.toFixed(2)}`));
    }
    (q.secondary_types || []).forEach((t) => types.appendChild(el("span", "chip chip-muted", `also: ${t}`)));
    wrap.appendChild(types);

    if ((q.entities || []).length) {
      const ents = el("div", "header-row");
      ents.appendChild(el("span", "header-label", "Entities"));
      q.entities.forEach((e) => {
        const chip = el("span", "chip chip-entity");
        chip.textContent = e.side ? `${e.text} (${e.side})` : e.text;
        chip.title = `${e.normalized_name} · ${e.domain} · ${e.entity_type}`;
        ents.appendChild(chip);
      });
      wrap.appendChild(ents);
    }

    if (q.dimensions && q.dimensions.length) {
      const dims = el("div", "header-row");
      dims.appendChild(el("span", "header-label", "Dimensions"));
      q.dimensions.forEach((d) => dims.appendChild(el("span", "chip chip-dim", DIMENSION_META[d] ? DIMENSION_META[d].title.split("—")[0].trim() : d)));
      wrap.appendChild(dims);
    }

    container.appendChild(wrap);
  }

  function renderSections(answer, container) {
    container.innerHTML = "";
    const sectionEls = [];

    for (const section of answer.answer.sections || []) {
      const meta = DIMENSION_META[section.dimension] || { title: section.dimension, desc: "" };
      const panel = el("section", "dimension-panel");
      panel.classList.add(`panel-${section.dimension}`);

      const head = el("header", "panel-head");
      head.appendChild(el("h3", "panel-title", meta.title));
      head.appendChild(el("p", "panel-desc", meta.desc));
      panel.appendChild(head);

      // 3D: graph + list from relationships[]
      if (section.dimension === "3D") {
        const rels = (answer.answer.relationships || []).filter((r) => r.dimension === "3D" || true);
        const graphBox = el("div", "graph-box");
        panel.appendChild(graphBox);
        window.MKS_GRAPH.renderGraph(graphBox, rels);
        panel.appendChild(relationshipList(rels));
        sectionEls.push(panel);
        continue;
      }

      const items = section.items || [];
      if (!items.length) continue; // never render empty panels
      items.forEach((item) => panel.appendChild(itemCard(item)));
      sectionEls.push(panel);
    }

    sectionEls.forEach((p) => container.appendChild(p));
  }

  function renderComparison(table, container) {
    if (!table || !table.rows) return;
    container.innerHTML = "";
    const wrap = el("section", "comparison-panel");
    wrap.appendChild(el("h3", "panel-title", "Comparison"));
    const tableEl = el("table", "comparison-table");
    const thead = el("thead");
    const headRow = el("tr");
    (table.columns || []).forEach((c) => headRow.appendChild(el("th", null, c)));
    thead.appendChild(headRow);
    tableEl.appendChild(thead);
    const tbody = el("tbody");
    (table.rows || []).forEach((row) => {
      const tr = el("tr");
      row.forEach((cell, i) => tr.appendChild(el(i === 0 ? "th" : "td", null, cell)));
      tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);
    wrap.appendChild(tableEl);
    container.appendChild(wrap);
  }

  function renderSources(sources, container) {
    container.innerHTML = "";
    if (!sources || !sources.length) {
      container.appendChild(el("p", "muted", "No sources returned."));
      return;
    }
    const ol = el("ol", "sources-list");
    sources.forEach((s) => {
      const li = el("li");
      li.appendChild(sourceLine(s));
      ol.appendChild(li);
    });
    container.appendChild(ol);
  }

  function renderWarnings(warnings, container) {
    container.innerHTML = "";
    if (!warnings || !warnings.length) {
      container.closest(".card").hidden = true;
      return;
    }
    container.closest(".card").hidden = false;
    warnings.forEach((w) => container.appendChild(el("li", null, w)));
  }

  function renderNotFound(items, container) {
    container.innerHTML = "";
    if (!items || !items.length) {
      container.closest(".card").hidden = true;
      return;
    }
    container.closest(".card").hidden = false;
    items.forEach((n) => container.appendChild(el("li", null, n)));
  }

  window.MKS_RENDER = {
    renderHeader,
    renderSections,
    renderComparison,
    renderSources,
    renderWarnings,
    renderNotFound,
    badge,
    DIMENSION_META,
  };
})();
