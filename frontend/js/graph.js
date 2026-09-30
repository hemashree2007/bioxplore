/* Tiny dependency-free SVG node-link graph for the 3D panel.
 * Deterministic circle layout (no physics jitter), edge labels with
 * relation + evidence level, colour-coded by label.
 */

(function () {
  const LABEL_COLORS = {
    FACT: "#15803d",
    EVIDENCE: "#1d4ed8",
    INTERPRETATION: "#b45309",
    ANALOGY: "#7c3aed",
    HYPOTHESIS: "#b91c1c",
  };

  function uniqueNodes(links) {
    const nodes = [];
    const seen = new Map();
    for (const l of links) {
      for (const name of [l.from_entity, l.to_entity]) {
        if (!seen.has(name)) {
          seen.set(name, nodes.length);
          nodes.push({ id: name, label: name });
        }
      }
    }
    return nodes;
  }

  function circleLayout(nodes, width, height, radius) {
    const cx = width / 2;
    const cy = height / 2;
    const n = nodes.length;
    if (n === 1) {
      nodes[0].x = cx;
      nodes[0].y = cy;
      return;
    }
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      node.x = cx + radius * Math.cos(angle);
      node.y = cy + radius * Math.sin(angle);
    });
  }

  function shorten(text, max) {
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  /** Render links into container element. links: [{from_entity,to_entity,relation,evidence_label}] */
  function renderGraph(container, links) {
    if (!links.length) {
      container.innerHTML = '<p class="muted">No relationships for this query.</p>';
      return;
    }
    const width = Math.max(320, container.clientWidth || 560);
    const height = Math.max(240, Math.min(420, 140 + links.length * 40));
    const radius = Math.min(width, height) * 0.32;

    const nodes = uniqueNodes(links);
    circleLayout(nodes, width, height, radius);

    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Relationship graph");
    svg.classList.add("graph-svg");

    // edges
    links.forEach((link, idx) => {
      const a = nodes.find((n) => n.id === link.from_entity);
      const b = nodes.find((n) => n.id === link.to_entity);
      if (!a || !b) return;
      const color = LABEL_COLORS[link.evidence_label] || "#64748b";

      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "1.6");
      line.setAttribute("stroke-dasharray", link.evidence_label === "ANALOGY" || link.evidence_label === "HYPOTHESIS" ? "6 4" : "");
      svg.appendChild(line);

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const g = document.createElementNS(NS, "g");

      const rect = document.createElementNS(NS, "rect");
      const label = `${shorten(link.relation, 18)} · ${link.evidence_label}`;
      rect.setAttribute("x", mx - label.length * 3.1 - 4);
      rect.setAttribute("y", my - 9);
      rect.setAttribute("width", label.length * 6.2 + 8);
      rect.setAttribute("height", 18);
      rect.setAttribute("rx", 4);
      rect.setAttribute("fill", "#ffffff");
      rect.setAttribute("stroke", color);
      rect.setAttribute("stroke-width", "0.8");
      rect.setAttribute("opacity", "0.95");
      g.appendChild(rect);

      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", mx);
      text.setAttribute("y", my + 4);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "10");
      text.setAttribute("fill", color);
      text.textContent = label;
      g.appendChild(text);
      svg.appendChild(g);
    });

    // nodes
    nodes.forEach((node) => {
      const g = document.createElementNS(NS, "g");
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", 22);
      circle.setAttribute("fill", "#eef2ff");
      circle.setAttribute("stroke", "#4f46e5");
      circle.setAttribute("stroke-width", "1.4");
      g.appendChild(circle);

      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", node.x);
      text.setAttribute("y", node.y + 4);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "9.5");
      text.setAttribute("fill", "#1e1b4b");
      text.textContent = shorten(node.label, 12);
      text.setAttribute("title", node.label);
      g.appendChild(text);
      svg.appendChild(g);
    });

    container.innerHTML = "";
    container.appendChild(svg);
  }

  window.MKS_GRAPH = { renderGraph, LABEL_COLORS };
})();
