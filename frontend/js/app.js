/* App state machine: idle → loading → result | error (EMPTY, NO_DOMAIN_MATCH, network…). */

(function () {
  const { fetchAnswer, EXAMPLE_QUERIES } = window.MKS_API;
  const R = window.MKS_RENDER;

  const $ = (id) => document.getElementById(id);
  const stateEls = {
    idle: $("state-idle"),
    loading: $("state-loading"),
    error: $("state-error"),
    result: $("state-result"),
  };

  function showState(name) {
    Object.entries(stateEls).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function setError(code, message) {
    $("error-code").textContent = code;
    $("error-message").textContent = message;
    showState("error");
  }

  function isCrossDomain(answer) {
    const q = answer.query || {};
    const domains = q.domains || [];
    const multiDomain = domains.length > 1;
    const hasTamilItem = (answer.answer.sections || []).some((s) =>
      (s.items || []).some((i) => (i.source || {}).text_name)
    );
    const hasCrossRel = (answer.answer.relationships || []).some((r) => {
      const t = `${r.from_entity} ${r.to_entity}`.toLowerCase();
      return r.evidence_label === "ANALOGY" || r.evidence_label === "INTERPRETATION";
    });
    return multiDomain || (hasCrossRel && (q.input_type === "cross_domain" || hasTamilItem));
  }

  function renderAnswer(answer) {
    R.renderHeader(answer, $("query-header"));
    R.renderSections(answer, $("dimension-panels"));
    R.renderComparison(answer.answer.comparison_table, $("comparison-box"));

    // Persistent notice on cross-domain / Tamil-science answers
    const notice = $("cross-domain-notice");
    notice.hidden = !isCrossDomain(answer);

    R.renderSources(answer.sources, $("sources-list"));
    R.renderWarnings(answer.warnings, $("warnings-list"));
    R.renderNotFound(answer.not_found, $("notfound-list"));

    showState("result");
  }

  async function run(query) {
    showState("loading");
    try {
      const answer = await fetchAnswer(query);
      renderAnswer(answer);
    } catch (err) {
      if (err && err.code === "NO_DOMAIN_MATCH") {
        setError(err.code, err.message + " Supported domains: astronomy, biology, classical Tamil literature.");
      } else {
        setError((err && err.code) || "ERROR", (err && err.message) || "Something went wrong.");
      }
    }
  }

  function wire() {
    const input = $("query-input");
    const btn = $("analyze-btn");

    btn.addEventListener("click", () => run(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run(input.value);
    });

    const chipBox = $("example-chips");
    EXAMPLE_QUERIES.forEach((q) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip chip-example";
      chip.textContent = q;
      chip.addEventListener("click", () => {
        input.value = q;
        run(q);
      });
      chipBox.appendChild(chip);
    });

    $("error-retry").addEventListener("click", () => run(input.value));
  }

  document.addEventListener("DOMContentLoaded", () => {
    showState("idle");
    wire();
  });
})();
