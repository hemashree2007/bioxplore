/* MOCK ENGINE — a small in-browser "backend" for demos.
 *
 * Given ANY phrasing ("what is a black hole", "black holes", "I want to
 * understand gene expression", a Tamil-script query…), it:
 *   1. detects input type + intent (same enum values as the frozen contracts)
 *   2. detects domains + extracts entities
 *   3. ALWAYS composes an answer with all four dimensions (1D–4D),
 *      relationships with evidence labels, de-duplicated sources, warnings
 *
 * Add a topic to TOPIC_KB (id, title, domain, plus per-dimension content)
 * and every question form about it works immediately.
 */

const TOPIC_KB = {
  "black hole": {
    domain: "astronomy",
    entity_type: "object",
    d1: {
      title: "Black hole (definition)",
      content: "A region of spacetime where gravity is so strong that nothing — not even light — escapes once inside the event horizon. Stellar-mass and supermassive black holes are observationally established.",
      label: "FACT",
      source: { title: "NASA Science — Black Holes", reference: "science.nasa.gov/universe/black-holes" },
      entities: ["black hole", "event horizon", "spacetime"],
    },
    d2: {
      title: "Formation mechanism",
      content: "Stellar-mass black holes form when the core of a massive star collapses at the end of nuclear burning; dynamical mass measurements in X-ray binaries confirm the compact objects.",
      label: "EVIDENCE",
      source: { title: "Casares & Jonker 2014, Space Sci. Rev. 183, 223", reference: "doi:10.1007/s11214-014-0068-9" },
      entities: ["black hole", "core collapse"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "spacetime", to_entity: "black hole", relation: "curved_into_extreme_form_by", label: "FACT",
          source: { title: "Einstein 1916, Annalen der Physik 49, 769", reference: "doi:10.1002/andp.19163540702" } },
        { from_entity: "massive star", to_entity: "black hole", relation: "collapses_into", label: "EVIDENCE",
          source: { title: "Casares & Jonker 2014, Space Sci. Rev. 183, 223", reference: "doi:10.1007/s11214-014-0068-9" } },
      ],
    },
    d4: {
      title: "Change over time / speculation",
      content: "Quantum theory predicts slow evaporation via Hawking radiation over enormous timescales; the prediction is untested and endpoint scenarios remain open research questions.",
      label: "HYPOTHESIS",
      source: { title: "Hawking 1974, Nature 248, 30", reference: "doi:10.1038/248030a0" },
      entities: ["black hole", "hawking radiation"],
    },
  },

  "plasma oscillation": {
    domain: "astronomy",
    entity_type: "process",
    d1: {
      title: "Plasma oscillation (definition)",
      content: "A collective, nearly sinusoidal oscillation of electrons against the ion background at the plasma frequency ωp = √(ne·e²/ε₀·me), which depends only on electron density.",
      label: "FACT",
      source: { title: "Chen, Introduction to Plasma Physics, 3rd ed., ch. 4", reference: "ISBN 978-3-319-22309-4" },
      entities: ["plasma oscillation", "plasma frequency"],
    },
    d2: {
      title: "Mechanism",
      content: "A displaced electron slab builds a charge-separation electric field that pulls electrons back; their inertia overshoots and the displacement repeats — an electrostatic oscillator of the medium itself.",
      label: "FACT",
      source: { title: "Chen, Introduction to Plasma Physics, 3rd ed., ch. 4", reference: "ISBN 978-3-319-22309-4" },
      entities: ["plasma oscillation", "charge separation"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "plasma frequency", to_entity: "radio emission", relation: "sets_cutoff_of", label: "EVIDENCE",
          source: { title: "Dulk 1985, ARA&A 23, 169", reference: "doi:10.1146/annurev.aa.23.090185.002445" } },
      ],
    },
    d4: {
      title: "Temporal behaviour",
      content: "In space plasmas the oscillation frequency maps electron density, so tracking emission frequency over time traces density structures moving through the solar wind.",
      label: "EVIDENCE",
      source: { title: "Dulk 1985, ARA&A 23, 169", reference: "doi:10.1146/annurev.aa.23.090185.002445" },
      entities: ["plasma frequency", "solar wind"],
    },
  },

  "kepler's laws": {
    domain: "astronomy",
    entity_type: "law",
    d1: {
      title: "Kepler's laws (statement)",
      content: "(1) Planets move on ellipses with the Sun at one focus; (2) the radius vector sweeps equal areas in equal times; (3) T² = (4π²/GM)a³ — period squared scales with semi-major axis cubed.",
      label: "FACT",
      source: { title: "Encyclopaedia Britannica, 'Kepler's laws of planetary motion'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion" },
      entities: ["kepler's laws", "orbital period"],
    },
    d2: {
      title: "Why the laws hold",
      content: "Newton derived all three from gravitation and his laws of motion; in the weak-field limit, Newtonian orbits are the small-curvature limit of geodesic motion in curved spacetime.",
      label: "FACT",
      source: { title: "Einstein 1916, Annalen der Physik 49, 769", reference: "doi:10.1002/andp.19163540702" },
      entities: ["kepler's laws", "general relativity"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "kepler's laws", to_entity: "orbital period", relation: "determines", label: "FACT",
          source: { title: "Britannica, 'Kepler's laws'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion" } },
        { from_entity: "orbital period", to_entity: "semi-major axis", relation: "set_by", label: "FACT",
          source: { title: "Britannica, 'Kepler's laws'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion" } },
      ],
    },
    d4: {
      title: "Orbits change over time",
      content: "Tides transfer angular momentum: the Moon recedes ~3.8 cm/yr (laser ranging) and Earth's day lengthens, so orbital periods evolve measurably over millions of years.",
      label: "EVIDENCE",
      source: { title: "Dickey et al. 1994, Science 265, 482", reference: "doi:10.1126/science.265.5171.482" },
      entities: ["orbital period", "tides"],
    },
  },

  "gene expression": {
    domain: "biology",
    entity_type: "process",
    d1: {
      title: "Gene expression (definition)",
      content: "The process by which gene information becomes a functional product: transcription of DNA to mRNA, then (for proteins) translation on ribosomes; expression level is measurable by RNA-seq or qPCR.",
      label: "FACT",
      source: { title: "Alberts et al., Molecular Biology of the Cell, 6th ed., ch. 6", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["gene expression", "transcription", "translation"],
    },
    d2: {
      title: "Regulation mechanism",
      content: "Transcription factors and enhancers set transcription rates; RNA processing/stability and protein degradation tune output; feedback loops and epigenetic marks integrate signals.",
      label: "FACT",
      source: { title: "Alberts et al., MBoCell 6th ed., ch. 7", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["transcription factor", "enhancer"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "gene expression", to_entity: "circadian rhythm", relation: "generates", label: "FACT",
          source: { title: "Dunlap 1999, Cell 96, 271", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
        { from_entity: "transcription factor", to_entity: "gene expression", relation: "regulates", label: "FACT",
          source: { title: "Alberts et al., MBoCell 6th ed., ch. 7", reference: "ISBN 978-0-8153-4432-2" } },
      ],
    },
    d4: {
      title: "Expression over time",
      content: "Expression is dynamic: clock genes cycle with ~24 h period; development runs on ordered waves of expression; stimulus responses show pulse-and-recovery kinetics.",
      label: "EVIDENCE",
      source: { title: "Panda et al. 2002, Cell 109, 307; Zhang et al. 2014, Science 342", reference: "doi:10.1126/science.1245030" },
      entities: ["gene expression", "circadian rhythm"],
    },
  },

  "circadian rhythm": {
    domain: "biology",
    entity_type: "process",
    d1: {
      title: "Circadian rhythm (definition)",
      content: "A biological process with a free-running period of about 24 hours, generated by an internal molecular clock (TTFL of Clock/Bmal1 driving Per/Cry) and synchronized by light.",
      label: "FACT",
      source: { title: "Dunlap 1999, Cell 96, 271", reference: "doi:10.1016/S0092-8674(00)80466-8" },
      entities: ["circadian rhythm", "molecular clock"],
    },
    d2: {
      title: "Clock mechanism",
      content: "CLOCK/BMAL1 activate Per/Cry transcription; PER/CRY proteins accumulate, enter the nucleus and repress their own transcription; slow degradation sets the ~24 h delay.",
      label: "FACT",
      source: { title: "Dunlap 1999, Cell 96, 271", reference: "doi:10.1016/S0092-8674(00)80466-8" },
      entities: ["ttfl", "per", "cry"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "gene expression", to_entity: "circadian rhythm", relation: "generates", label: "FACT",
          source: { title: "Dunlap 1999, Cell 96, 271", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
        { from_entity: "circadian rhythm", to_entity: "orbital period", relation: "conceptually_parallels", label: "ANALOGY",
          source: { title: "Cross-domain essay: Dunlap 1999; Britannica, Kepler's laws", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
      ],
    },
    d4: {
      title: "Rhythms across the lifetime",
      content: "Clock amplitude and phase change with age and shift work; misalignment is studied as a risk factor in metabolic and mood disorders (ongoing research).",
      label: "EVIDENCE",
      source: { title: "Bell-Pedersen et al. 2005, Nat Rev Genet 6, 544", reference: "doi:10.1038/nrg1633" },
      entities: ["circadian rhythm", "ageing"],
    },
  },

  "orbital period": {
    domain: "astronomy",
    entity_type: "concept",
    d1: {
      title: "Orbital period (definition)",
      content: "The time one orbit takes; for a two-body system T² = (4π²/GM)a³ — set by the semi-major axis and the central mass.",
      label: "FACT",
      source: { title: "Britannica, 'Kepler's laws of planetary motion'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion" },
      entities: ["orbital period", "semi-major axis"],
    },
    d2: {
      title: "Why it works",
      content: "Gravity supplies the centripetal acceleration; combining Newton's gravitation with circular-motion algebra yields the harmonic law, with corrections for eccentric orbits and relativistic effects.",
      label: "FACT",
      source: { title: "Einstein 1916; Britannica, 'Kepler's laws'", reference: "doi:10.1002/andp.19163540702" },
      entities: ["orbital period", "gravitation"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "kepler's laws", to_entity: "orbital period", relation: "determines", label: "FACT",
          source: { title: "Britannica, 'Kepler's laws'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion" } },
        { from_entity: "circadian rhythm", to_entity: "orbital period", relation: "conceptually_parallels", label: "ANALOGY",
          source: { title: "Cross-domain essay", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
      ],
    },
    d4: {
      title: "Periods evolve",
      content: "Tidal evolution changes orbital distances and periods over geological time (e.g. lunar recession 3.8 cm/yr, measured by laser ranging).",
      label: "EVIDENCE",
      source: { title: "Dickey et al. 1994, Science 265, 482", reference: "doi:10.1126/science.265.5171.482" },
      entities: ["orbital period", "tides"],
    },
  },

  "mutation": {
    domain: "biology",
    entity_type: "process",
    d1: {
      title: "Mutation (definition)",
      content: "A change in DNA sequence: point mutations (missense/nonsense/silent), indels, duplications, inversions, rearrangements.",
      label: "FACT",
      source: { title: "Alberts et al., MBoCell 6th ed., ch. 5", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["mutation", "dna"],
    },
    d2: {
      title: "Mechanism to protein and cell",
      content: "Coding changes propagate to the amino-acid sequence and can destabilize folding, abolish active sites or remove stop codons; loss of a channel/enzyme changes cellular function (e.g. CFTR in cystic fibrosis).",
      label: "EVIDENCE",
      source: { title: "Riordan et al. 1989, Science 245, 1066", reference: "doi:10.1126/science.2475911" },
      entities: ["mutation", "protein folding", "cell"],
    },
    d3: {
      title: "Relationships (causal chain)",
      rels: [
        { from_entity: "mutation", to_entity: "dna", relation: "alters", label: "FACT",
          source: { title: "Alberts et al., MBoCell 6th ed. ch. 5", reference: "ISBN 978-0-8153-4432-2" } },
        { from_entity: "dna", to_entity: "protein folding", relation: "encodes", label: "FACT",
          source: { title: "Anfinsen 1973, Science 181, 223", reference: "doi:10.1126/science.181.4096.223" } },
        { from_entity: "protein folding", to_entity: "cell", relation: "determines_function_of", label: "FACT",
          source: { title: "Alberts et al., MBoCell 6th ed. ch. 3", reference: "ISBN 978-0-8153-4432-2" } },
        { from_entity: "cell", to_entity: "disease progression", relation: "dysfunction_drives", label: "EVIDENCE",
          source: { title: "Fearon & Vogelstein 1990, Cell 61, 759", reference: "doi:10.1016/0092-8674(90)90186-U" } },
      ],
    },
    d4: {
      title: "Disease trajectory over time",
      content: "DNA change → altered protein → changed cell function → tissue dysfunction → clinical progression over years; rates vary by gene and environment.",
      label: "EVIDENCE",
      source: { title: "Tabrizi et al. 2020, Lancet Neurology (TRACK-HD)", reference: "doi:10.1016/S1474-4422(19)30402-6" },
      entities: ["mutation", "disease progression"],
    },
  },

  "thirukkural": {
    domain: "tamil",
    entity_type: "text_source",
    d1: {
      title: "Thirukkural (the text)",
      content: "A classical Tamil work of 1,330 short couplets (kural) attributed to Thiruvalluvar, organized into chapters on virtue (aram), wealth (porul) and love (inbam). MOCK RECORD — verses are added only after verification against a cited edition.",
      label: "FACT",
      source: { title: "Thirukkural — MOCK record for frontend development", reference: "edition to be cited when verified verse is added",
                text_name: "Thirukkural", verse_number: "000 (MOCK)", chapter: "MOCK", author: "Thiruvalluvar (attributed)" },
      entities: ["thirukkural"],
      is_verse: true,
      verse: {
        original: "MOCK VERSE TEXT — replace with a verified verse from a cited edition.",
        transliteration: "MOCK TRANSLITERATION",
        translation: "MOCK TRANSLATION (placeholder).",
        literal_meaning: "MOCK LITERAL MEANING (placeholder).",
        words: ["MOCK"],
      },
    },
    d2: {
      title: "Literary and cultural context",
      content: "The kural couplet form condenses an ethical maxim into seven words; the text's chapters map everyday conduct onto aram/porul/inbam, and it is read across Tamil literary culture for over a millennium (MOCK contextual note).",
      label: "INTERPRETATION",
      source: { title: "Thirukkural interpretive literature — MOCK record", reference: "citation pending verified edition",
                text_name: "Thirukkural", verse_number: "000 (MOCK)", chapter: "MOCK", author: null },
      entities: ["thirukkural"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "thirukkural", to_entity: "water value (thirukkural theme)", relation: "conceptually_resonates_with", label: "INTERPRETATION",
          source: { title: "CROSS-DOMAIN ESSAY: MBoCell ch. 2 (water and life); Thirukkural rain chapter — citation pending", reference: "ISBN 978-0-8153-4432-2" } },
      ],
    },
    d4: {
      title: "Reception over time",
      content: "The Thirukkural has been translated and reinterpreted continuously since the 19th century; commentarial traditions themselves evolve over time (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Reception studies — MOCK record", reference: "citation pending verified edition",
                text_name: "Thirukkural", verse_number: null, chapter: null, author: null },
      entities: ["thirukkural"],
    },
  },

  "tholkappiyam": {
    domain: "tamil",
    entity_type: "text_source",
    d1: {
      title: "Tholkappiyam (the text)",
      content: "The earliest extant Tamil grammar, in three books (ezhuttu/letters, col/words, porul/meaning), traditionally attributed to Tholkappiyar; it codifies phonology, morphology and poetics including the akam/puram landscape conventions. MOCK RECORD.",
      label: "FACT",
      source: { title: "Tholkappiyam — MOCK record for frontend development", reference: "edition to be cited",
                text_name: "Tholkappiyam", verse_number: "000 (MOCK)", chapter: null, author: "Tholkappiyar (attributed)" },
      entities: ["tholkappiyam"],
    },
    d2: {
      title: "Context: nature in the poetics",
      content: "The akam system binds five landscapes (kurinji, mullai, marutam, neytal, palai) to seasons, times of day and emotional states — nature as a coded emotional grammar (MOCK interpretive note).",
      label: "INTERPRETATION",
      source: { title: "Tholkappiyam porul commentary tradition — MOCK record", reference: "citation pending verified edition",
                text_name: "Tholkappiyam", verse_number: null, chapter: "porul", author: null },
      entities: ["tholkappiyam", "nature"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "tholkappiyam", to_entity: "nature (tamil akam landscapes)", relation: "codifies", label: "INTERPRETATION",
          source: { title: "Akam poetics — MOCK cross-reference", reference: "citation pending verified edition" } },
      ],
    },
    d4: {
      title: "Commentarial evolution",
      content: "Commentaries (e.g. Ilampuranam, Nachchinarkiniyar) layered over centuries show the text's meaning being negotiated through time (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Commentarial tradition — MOCK record", reference: "citation pending verified edition" },
      entities: ["tholkappiyam"],
    },
  },

  "radiation laws": {
    domain: "astronomy",
    entity_type: "law",
    d1: {
      title: "Radiation laws (definitions)",
      content: "Planck's law gives the black-body spectrum Bν(T); integrating gives the Stefan-Boltzmann law F = σT⁴; Wien's displacement law λmax·T = 2.898×10⁻³ m·K sets the peak wavelength.",
      label: "FACT",
      source: { title: "Planck 1901, Annalen der Physik 4, 553", reference: "doi:10.1002/andp.19013090310" },
      entities: ["planck's law", "stefan-boltzmann law", "wien's displacement law"],
    },
    d2: {
      title: "Physical picture",
      content: "Quantized electromagnetic modes in thermal equilibrium produce the universal spectrum; hotter bodies emit more at all wavelengths and peak at shorter wavelengths (colour as thermometer).",
      label: "FACT",
      source: { title: "Planck 1901, Annalen der Physik 4, 553", reference: "doi:10.1002/andp.19013090310" },
      entities: ["black-body radiation", "temperature"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "wien's displacement law", to_entity: "black-body radiation", relation: "characterizes_peak_of", label: "FACT",
          source: { title: "Britannica, 'Wien law'", reference: "britannica.com/science/Wien-law" } },
        { from_entity: "black-body radiation", to_entity: "cosmic microwave background", relation: "observed_as", label: "EVIDENCE",
          source: { title: "Planck 1901; CMB spectrum measurements", reference: "doi:10.1002/andp.19013090310" } },
      ],
    },
    d4: {
      title: "Cooling over time",
      content: "The universe's black-body background cools as it expands (2.725 K today, higher in the past); stellar surfaces cool toward white-dwarf endpoints over gigayears.",
      label: "EVIDENCE",
      source: { title: "CMB temperature evolution measurements", reference: "doi:10.1086/300499" },
      entities: ["black-body radiation", "cosmic microwave background"],
    },
  },

  "cosmological constant": {
    domain: "astronomy",
    entity_type: "concept",
    d1: {
      title: "Cosmological constant Λ (definition)",
      content: "A constant vacuum-energy term in Einstein's field equations, Gμν + Λgμν = (8πG/c⁴)Tμν; positive Λ has constant density as the universe expands — the simplest dark-energy candidate.",
      label: "FACT",
      source: { title: "Einstein 1917, Sitzungsber. Preuss. Akad. Wiss.", reference: "Collected Papers, Vol. 6, Princeton UP" },
      entities: ["cosmological constant", "dark energy"],
    },
    d2: {
      title: "How it acts",
      content: "Because its density stays constant while matter dilutes, Λ eventually dominates expansion and drives accelerated growth of scale; it entered Einstein's equations as a geometric term.",
      label: "FACT",
      source: { title: "Einstein 1917; modern cosmology texts", reference: "Collected Papers, Vol. 6" },
      entities: ["cosmological constant", "accelerating expansion"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "cosmological constant", to_entity: "accelerating expansion", relation: "drives", label: "EVIDENCE",
          source: { title: "Riess et al. 1998, AJ 116, 1009", reference: "doi:10.1086/300499" } },
      ],
    },
    d4: {
      title: "Future of the expansion",
      content: "If Λ is truly constant, expansion continues to accelerate and horizons approach; whether Λ is truly constant is an open research question (speculative beyond measured history).",
      label: "HYPOTHESIS",
      source: { title: "Riess et al. 1998, AJ 116, 1009", reference: "doi:10.1086/300499" },
      entities: ["accelerating expansion", "dark energy"],
    },
  },
};

/* ---- classification + composition (same enum values as contracts) ------- */

const TOPIC_ALIASES = {
  "black hole": ["black hole", "black holes", "blackhole", "black hoel", "white hole", "white holes"],
  "plasma oscillation": ["plasma oscillation", "plasma oscillations", "langmuir oscillation", "plasma frequency"],
  "kepler's laws": ["kepler", "kepler's laws", "keplers laws", "kepler law", "laws of planetary motion"],
  "gene expression": ["gene expression", "expression levels", "rna-seq", "rna seq"],
  "circadian rhythm": ["biological rhythm", "biological rhythms", "circadian rhythm", "circadian rhythms", "biological clock", "molecular clock"],
  "orbital period": ["orbital period", "orbital periods", "period of an orbit", "orbits"],
  "mutation": ["mutation", "mutations", "genetic variant", "dna mutation"],
  "thirukkural": ["thirukkural", "tirukkural", "thirukural", "kural", "திருக்குறள்", "குறள்", "thirukkural water"],
  "tholkappiyam": ["tholkappiyam", "tholkappiam", "tolkappiyam", "தொல்காப்பியம்"],
  "cosmological constant": ["cosmological constant", "lambda term", "dark energy"],
  "radiation laws": ["radiation law", "radiation laws", "planck law", "planck's law", "stefan-boltzmann", "wien", "black-body radiation", "blackbody", "black body"],
};

const QUESTION_STARTERS = ["what", "why", "how", "when", "where", "who", "can", "does", "do", "is", "are", "explain", "define", "describe"];
const COMPARISON_MARKERS = [" vs ", " versus ", "compare", "difference between", "compared"];
const RELATIONSHIP_MARKERS = ["related to", "relationship between", "relation between", "link between", "affect", "affects", "connection between"];
const TEMPORAL_MARKERS = ["over time", "change over", "changes over", "evolve", "progression", "progresses", "future"];
const SENTENCE_MARKERS = ["i want to", "i would like to", "i need to", "help me", "tell me about", "show me"];
const MECHANISM_MARKERS = ["mechanism", "under what conditions", "how does", "how do", "why does"];

function findTopic(text) {
  const t = " " + text.toLowerCase().replace(/[?!.]/g, " ").replace(/\s+/g, " ") + " ";
  const scored = [];
  for (const [key, aliases] of Object.entries(TOPIC_ALIASES)) {
    let score = 0;
    for (const a of aliases) {
      const needle = " " + a.toLowerCase() + " ";
      if (t.includes(needle)) score = Math.max(score, a.length);
      else if (t.includes(a.toLowerCase())) score = Math.max(score, a.length * 0.6);
    }
    if (score > 0) scored.push({ key, score });
  }
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].key;
}

function classifyInput(text) {
  const t = " " + text.toLowerCase() + " ";
  const isQuestion = text.trim().endsWith("?") || QUESTION_STARTERS.includes(text.trim().split(/\s+/)[0]?.toLowerCase());
  const isComparison = COMPARISON_MARKERS.some((m) => t.includes(m));
  const isRelationship = RELATIONSHIP_MARKERS.some((m) => t.includes(m));
  const isTemporal = TEMPORAL_MARKERS.some((m) => t.includes(m));
  const isSentence = SENTENCE_MARKERS.some((m) => t.includes(m));
  const wordCount = text.trim().split(/\s+/).length;

  let inputType = "topic";
  let conf = 0.8;
  const secondary = [];

  if (isComparison) { inputType = "comparison"; conf = 0.95; secondary.push("relationship"); }
  else if (isRelationship) { inputType = "relationship"; conf = 0.9; }
  else if (isTemporal && isQuestion) { inputType = "temporal"; conf = 0.85; secondary.push("question"); }
  else if (isTemporal) { inputType = "temporal"; conf = 0.75; }
  else if (isSentence) { inputType = "sentence"; conf = 0.9; secondary.push("question"); }
  else if (isQuestion) { inputType = "question"; conf = 0.85; }
  else if (wordCount <= 3) { inputType = "keyword"; conf = 0.8; }
  else { inputType = "topic"; conf = 0.75; }

  let intent = "explain";
  if (/what is|what are|define|definition/.test(t)) intent = "define";
  else if (isComparison) intent = "compare";
  else if (isRelationship) intent = "find_relationship";
  else if (isTemporal) intent = "describe_change_over_time";
  else if (/meaning|interpret|say about|significance/.test(t)) intent = "interpret_meaning";
  else if (isQuestion) intent = "explain";
  else if (/what if|hypothetical|imagine|speculate/.test(t)) intent = "explore_hypothesis";

  return { inputType, conf, secondary, intent };
}

function detectDomainsAndEntities(key) {
  const topic = TOPIC_KB[key];
  const domains = [{ domain: topic.domain, score: 0.95 }];
  const entities = [
    {
      text: key,
      normalized_name: key,
      domain: topic.domain,
      entity_type: topic.entity_type,
      side: null,
    },
  ];

  // pull in related entities from the 3D relationships for richness
  const rels = (topic.d3 && topic.d3.rels) || [];
  for (const r of rels) {
    for (const name of [r.from_entity, r.to_entity]) {
      if (name !== key && !entities.some((e) => e.normalized_name === name)) {
        const other = TOPIC_KB[name];
        entities.push({
          text: name,
          normalized_name: name,
          domain: other ? other.domain : topic.domain,
          entity_type: other ? other.entity_type : "concept",
          side: null,
        });
        if (other && !domains.some((d) => d.domain === other.domain)) {
          domains.push({ domain: other.domain, score: 0.7 });
        }
      }
    }
  }
  return { domains, entities };
}

function sectionMeta(dim) {
  return {
    "1D": { title: "Text / Literal", desc: "definitions, equations, measurements, verses" },
    "2D": { title: "Interpretation / Context", desc: "mechanisms, conditions, context" },
    "3D": { title: "Symbol / Concept / Relationship", desc: "entity → entity, cause → effect" },
    "4D": { title: "Future / Hypothetical / Temporal", desc: "change over time, analogy, speculation" },
  }[dim];
}

function composeAnswer(key, text, classification, domains, entities) {
  const topic = TOPIC_KB[key];
  const sections = [];
  const relationships = [];
  const sources = [];
  const warnings = [];
  const collectedSources = [];

  const srcKey = (s) => `${s.title}|${s.reference || ""}|${s.verse_number || ""}`;

  function pushSource(s) {
    const full = Object.assign(
      { reference: null, text_name: null, verse_number: null, chapter: null, author: null },
      s
    );
    if (!sources.some((x) => srcKey(x) === srcKey(full))) sources.push(full);
    collectedSources.push(full);
    return full;
  }

  for (const dim of ["1D", "2D", "3D", "4D"]) {
    const d = topic[`d${dim[0]}`];
    if (!d) continue;
    const meta = sectionMeta(dim);

    if (dim === "3D") {
      const rels = (d.rels || []).map((r) => ({
        from_entity: r.from_entity,
        to_entity: r.to_entity,
        relation: r.relation,
        dimension: "3D",
        evidence_label: r.label,
        source: pushSource(r.source),
      }));
      relationships.push(...rels);
      sections.push({ dimension: dim, title: meta.title, items: [], relationships_note: "see relationships[]" });
      continue;
    }

    const items = [];
    items.push({
      id: `${key.replace(/[^a-z0-9]+/g, "_")}_${dim.toLowerCase()}`,
      title: d.title,
      content: d.content,
      evidence_label: d.label,
      source: pushSource(d.source),
      entities: d.entities || [key],
      ...(d.is_verse ? { is_verse: true, verse: d.verse } : {}),
    });

    // comparative queries put both sides into 1D when both topics exist
    if (dim === "1D") {
      for (const otherKey of Object.keys(TOPIC_KB)) {
        if (otherKey !== key && text.toLowerCase().includes(otherKey.split(" ")[0])) {
          const other = TOPIC_KB[otherKey];
          items.push({
            id: `${otherKey.replace(/[^a-z0-9]+/g, "_")}_${dim.toLowerCase()}`,
            title: other.d1.title,
            content: other.d1.content,
            evidence_label: other.d1.label,
            source: pushSource(other.d1.source),
            entities: other.d1.entities || [otherKey],
            ...(other.d1.is_verse ? { is_verse: true, verse: other.d1.verse } : {}),
          });
          break;
        }
      }
    }

    sections.push({ dimension: dim, title: meta.title, items });
  }

  // comparison table when the query is comparative and both sides are in the KB
  let comparison_table = null;
  const sideKeys = Object.keys(TOPIC_KB).filter((k) => text.toLowerCase().includes(k.split(" ")[0]) && k !== key);
  if (classification.inputType === "comparison" && sideKeys.length) {
    const a = TOPIC_KB[key], b = TOPIC_KB[sideKeys[0]];
    comparison_table = {
      columns: ["Property", key + " (A)", sideKeys[0] + " (B)"],
      rows: [
        ["Domain", a.domain, b.domain],
        ["1D summary", a.d1.content.slice(0, 90) + "…", b.d1.content.slice(0, 90) + "…"],
        ["Evidence", a.d1.label, b.d1.label],
        ["4D outlook", a.d4 ? a.d4.content.slice(0, 80) + "…" : "—", b.d4 ? b.d4.content.slice(0, 80) + "…" : "—"],
      ],
    };
  }

  // cross-domain notice when bridge relationships appear
  const hasBridge = relationships.some((r) => r.evidence_label === "ANALOGY" || r.evidence_label === "INTERPRETATION");
  if (hasBridge || domains.length > 1) warnings.push("Conceptual relationships are not scientific evidence.");
  if (topic.domain === "tamil") {
    warnings.push("Tamil records here are MOCK placeholders — real verses are added only after verification against a cited edition.");
  }

  const summary =
    `Detected ${classification.inputType} (${classification.intent}) in ${domains.map((x) => x.domain).join(" + ")}. ` +
    `Answer covers all four dimensions for “${key}” with ${relationships.length} labelled relationship(s) and ${sources.length} source(s).`;

  return {
    summary,
    sections,
    relationships,
    comparison_table,
    sources: sources,
  };
}

/** Entry point mirroring the real backend: any phrasing in, full envelope out. */
function mockAnswerAny(query) {
  const trimmed = (query || "").trim();
  if (!trimmed) throw { code: "EMPTY_QUERY", message: "Query is empty." };

  const key = findTopic(trimmed);
  if (!key) {
    throw {
      code: "NO_DOMAIN_MATCH",
      message: "No supported topic matched this query. Known topics: " +
        Object.keys(TOPIC_KB).join(", ") + ".",
    };
  }

  const classification = classifyInput(trimmed);
  const { domains, entities } = detectDomainsAndEntities(key);
  const answer = composeAnswer(key, trimmed, classification, domains, entities);

  return {
    meta: { mock: true, engine: "mock-answer-any/2.0" },
    query: {
      raw_query: trimmed,
      normalized_query: trimmed.toLowerCase().replace(/[?!.]+$/, "").trim(),
      input_type: classification.inputType,
      input_type_confidence: classification.conf,
      secondary_types: classification.secondary,
      intent: classification.intent,
      domains,
      entities,
      dimensions: ["1D", "2D", "3D", "4D"],
      dimension_reasons: {
        "1D": "literal layer always included",
        "2D": "mechanism/context layer included",
        "3D": "relationship layer included",
        "4D": "temporal/speculative layer included",
      },
      options: { max_items: 20 },
      language: /[\u0b80-\u0bff]/.test(trimmed) ? "ta" : "en",
      warnings: [],
    },
    answer: answer,
    sources: answer.sources || [],
    warnings: answer.warnings || [],
    not_found: [],
  };
}

window.MOCK_ENGINE = { mockAnswerAny, TOPIC_KB, TOPIC_ALIASES };
