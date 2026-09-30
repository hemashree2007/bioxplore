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

  "white hole": {
    domain: "astronomy",
    entity_type: "object",
    d1: {
      title: "White hole (definition; hypothetical)",
      content: "The time-reverse of a black hole: a region nothing can enter, from which matter and light can only emerge. It appears as a mathematical solution of general relativity, but there is no observational evidence that white holes exist.",
      label: "HYPOTHESIS",
      source: { title: "Hawking & Ellis 1973, The Large Scale Structure of Space-Time, sec. 5.6", reference: "ISBN 978-0-521-09906-6" },
      entities: ["white hole", "event horizon", "general relativity"],
    },
    d2: {
      title: "Why they are doubted",
      content: "No known formation process makes a white hole in our universe, and anything emerging from one would destabilize it in standard relativity — the solution is mathematical, not a physical prediction.",
      label: "INTERPRETATION",
      source: { title: "Hawking & Ellis 1973", reference: "ISBN 978-0-521-09906-6" },
      entities: ["white hole", "general relativity"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "white hole", to_entity: "black hole", relation: "time_reverse_of", label: "HYPOTHESIS",
          source: { title: "Hawking & Ellis 1973", reference: "ISBN 978-0-521-09906-6" } },
        { from_entity: "event horizon", to_entity: "white hole", relation: "bounds_against_entry", label: "FACT",
          source: { title: "Hawking & Ellis 1973", reference: "ISBN 978-0-521-09906-6" } },
      ],
    },
    d4: {
      title: "Speculative scenarios",
      content: "Speculations imagine white holes as relics of the early universe or endpoints of evaporating black holes; all such scenarios are untested and unobserved.",
      label: "HYPOTHESIS",
      source: { title: "Hawking & Ellis 1973; modern white-hole conjecture reviews", reference: "ISBN 978-0-521-09906-6" },
      entities: ["white hole", "black hole evaporation"],
    },
  },

  "wormhole": {
    domain: "astronomy",
    entity_type: "object",
    d1: {
      title: "Wormhole (definition)",
      content: "A wormhole (Einstein–Rosen bridge) is a hypothetical tunnel connecting two regions of spacetime; the concept comes from exact solutions of general relativity and has never been observed.",
      label: "FACT",
      source: { title: "Morris & Thorne 1988, American Journal of Physics 56, 395", reference: "doi:10.1119/1.15620" },
      entities: ["wormhole", "einstein-rosen bridge", "spacetime"],
    },
    d2: {
      title: "Traversability condition",
      content: "Morris and Thorne showed a wormhole traversable by humans would require 'exotic' matter violating the usual energy conditions; no such matter is known.",
      label: "FACT",
      source: { title: "Morris & Thorne 1988, Am. J. Phys. 56, 395", reference: "doi:10.1119/1.15620" },
      entities: ["wormhole", "exotic matter"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "spacetime", to_entity: "wormhole", relation: "tunnels_through", label: "HYPOTHESIS",
          source: { title: "Morris & Thorne 1988", reference: "doi:10.1119/1.15620" } },
        { from_entity: "black hole", to_entity: "wormhole", relation: "interior_geometry_related_to", label: "HYPOTHESIS",
          source: { title: "Morris & Thorne 1988", reference: "doi:10.1119/1.15620" } },
      ],
    },
    d4: {
      title: "Speculation: interstellar travel",
      content: "If traversable wormholes existed they might allow shortcuts across spacetime; this remains science-fiction-adjacent speculation, not established physics.",
      label: "HYPOTHESIS",
      source: { title: "Morris & Thorne 1988, Am. J. Phys. 56, 395", reference: "doi:10.1119/1.15620" },
      entities: ["wormhole", "interstellar travel"],
    },
  },

  "tamil": {
    domain: "tamil",
    entity_type: "theme",
    d1: {
      title: "Classical Tamil literature (domain overview)",
      content: "Covers Thirukkural, Tholkappiyam, Thirumandiram, Purananuru and Avvaiyar works — stored as original verse, words, literal meaning, translation, keywords, concepts and full source metadata. Ask about any of these texts (e.g. 'Thirukkural', 'Nature in Tholkappiyam').",
      label: "FACT",
      source: { title: "Classical Tamil texts — MOCK overview record", reference: "verses added only after verification against cited editions" },
      entities: ["thirukkural", "tholkappiyam", "purananuru"],
    },
    d2: {
      title: "Context: the classical Tamil landscape",
      content: "Sangam-era poetics divides poetry into akam (inner/love) and puram (outer/public) genres bound to five landscapes; didactic and devotional traditions (Thirukkural, Thirumandiram, Avvaiyar) layer ethics and mysticism onto this grammar (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Kailasapathy, Tamil Heroic Poetry (1968) — MOCK cross-reference", reference: "citation pending verified edition" },
      entities: ["tholkappiyam", "purananuru"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "thirukkural", to_entity: "water value (thirukkural theme)", relation: "conceptually_resonates_with", label: "INTERPRETATION",
          source: { title: "CROSS-DOMAIN ESSAY: MBoCell ch. 2; Thirukkural rain chapter — citation pending", reference: "ISBN 978-0-8153-4432-2" } },
        { from_entity: "circadian rhythm", to_entity: "body as microcosm (thirumandiram theme)", relation: "conceptually_parallels", label: "INTERPRETATION",
          source: { title: "CROSS-DOMAIN ESSAY: Dunlap 1999; Thirumandiram commentary — citation pending", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
      ],
    },
    d4: {
      title: "Transmission over time",
      content: "These texts passed through oral performance, manuscript culture, print editions and modern critical editions — each stage reshaping what was preserved (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Transmission studies — MOCK record", reference: "citation pending verified edition" },
      entities: ["purananuru", "thirukkural"],
    },
  },

  "blast wave": {
    domain: "astronomy",
    entity_type: "process",
    d1: {
      title: "Blast wave (definition and Sedov–Taylor law)",
      content: "A blast wave is a strong shock driven by a sudden energy release. For a point explosion in uniform gas, R(t) ∝ (E t²/ρ₀)^(1/5) — the Sedov–Taylor solution; young supernova remnants like Tycho follow it closely.",
      label: "FACT",
      source: { title: "Taylor 1950, Proc. R. Soc. A 201, 159", reference: "doi:10.1098/rspa.1950.0043" },
      entities: ["blast wave", "supernova remnant", "shock wave"],
    },
    d2: {
      title: "Shock mechanism",
      content: "The expanding ejecta drive a shock that compresses and heats the surrounding gas; X-ray emission from the shocked plasma traces the evolution, and dimensional analysis fixes the expansion law without solving full fluid equations.",
      label: "FACT",
      source: { title: "Taylor 1950, Proc. R. Soc. A 201, 159", reference: "doi:10.1098/rspa.1950.0043" },
      entities: ["blast wave", "shock wave"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "supernova", to_entity: "blast wave", relation: "drives", label: "EVIDENCE",
          source: { title: "Taylor 1950; SNR observations", reference: "doi:10.1098/rspa.1950.0043" } },
        { from_entity: "blast wave", to_entity: "interstellar clouds", relation: "compresses_and_heats", label: "EVIDENCE",
          source: { title: "SNR–ISM interaction studies", reference: "doi:10.1098/rspa.1950.0043" } },
      ],
    },
    d4: {
      title: "Remnant evolution over millennia",
      content: "Blast waves slow from Sedov–Taylor free expansion into pressure-driven and then momentum-conserving phases over thousands of years, finally dissolving into the interstellar medium.",
      label: "EVIDENCE",
      source: { title: "Supernova remnant evolution studies", reference: "doi:10.1098/rspa.1950.0043" },
      entities: ["supernova remnant", "interstellar medium"],
    },
  },

  "thirumandiram": {
    domain: "tamil",
    entity_type: "text_source",
    d1: {
      title: "Thirumandiram (the text)",
      content: "A Tamil Shaiva Siddha work of about 3,000 verses attributed to Tirumular, foundational for Shaiva mysticism and yoga in Tamil tradition. MOCK RECORD — verses are added only after verification against a cited edition.",
      label: "FACT",
      source: { title: "Thirumandiram — MOCK record for frontend development", reference: "edition to be cited",
                text_name: "Thirumandiram", verse_number: null, chapter: null, author: "Tirumular (attributed)" },
      entities: ["thirumandiram"],
    },
    d2: {
      title: "Context: body and cosmos",
      content: "The interpretive tradition treats the human body as a container of cosmic order — a microcosm of Shaiva metaphysics — connecting yoga, ritual and devotion (MOCK contextual note).",
      label: "INTERPRETATION",
      source: { title: "Thirumandiram interpretive literature — MOCK record", reference: "citation pending verified edition" },
      entities: ["thirumandiram", "body"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "circadian rhythm", to_entity: "body as microcosm (thirumandiram theme)", relation: "conceptually_parallels", label: "INTERPRETATION",
          source: { title: "CROSS-DOMAIN ESSAY: Dunlap 1999, Cell 96, 271; Thirumandiram commentary — citation pending", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
      ],
    },
    d4: {
      title: "Reception over time",
      content: "The text's commentarial and devotional reception has evolved across centuries, with modern editions reshaping its readership (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Reception studies — MOCK record", reference: "citation pending verified edition" },
      entities: ["thirumandiram"],
    },
  },

  "purananuru": {
    domain: "tamil",
    entity_type: "text_source",
    d1: {
      title: "Purananuru (the text)",
      content: "An anthology of around 400 classical Tamil poems (puram/outer genre) from the Sangam era, covering kings, warfare, generosity and public life, attributed to many poets. MOCK RECORD.",
      label: "FACT",
      source: { title: "Purananuru — MOCK record for frontend development", reference: "edition to be cited",
                text_name: "Purananuru", verse_number: null, chapter: null, author: "various (Sangam poets)" },
      entities: ["purananuru"],
    },
    d2: {
      title: "Context: puram themes",
      content: "Puram poetry codifies public virtue — kingship, bounty, courage and the impermanence of life and monuments — in contrast to the private akam genre (MOCK contextual note).",
      label: "INTERPRETATION",
      source: { title: "Purananuru commentary tradition — MOCK record", reference: "citation pending verified edition" },
      entities: ["purananuru", "impermanence"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "accelerating expansion", to_entity: "impermanence (tamil puram theme)", relation: "conceptually_parallels", label: "ANALOGY",
          source: { title: "CROSS-DOMAIN ESSAY: Riess et al. 1998, AJ 116, 1009; Kailasapathy 1968, Tamil Heroic Poetry", reference: "doi:10.1086/300499" } },
      ],
    },
    d4: {
      title: "Anthology across time",
      content: "Compiled from an oral-performance tradition and transmitted through centuries of manuscript culture, the anthology itself is a record of change over time (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Sangam transmission studies — MOCK record", reference: "citation pending verified edition" },
      entities: ["purananuru"],
    },
  },

  "avvaiyar": {
    domain: "tamil",
    entity_type: "text_source",
    d1: {
      title: "Avvaiyar works (the texts)",
      content: "Moral didactic works attributed to the poet-saint Avvaiyar — notably Aathichudi (one-line maxims) and Kondrai Vendhan — teaching ethics and learning, especially to children. MOCK RECORD.",
      label: "FACT",
      source: { title: "Avvaiyar works — MOCK record for frontend development", reference: "edition to be cited",
                text_name: "Aathichudi", verse_number: null, chapter: null, author: "Avvaiyar (attributed)" },
      entities: ["avvaiyar", "ethics"],
    },
    d2: {
      title: "Context: didactic ethics",
      content: "The maxims compress ethical instruction — literacy, generosity, self-control — into memorable single lines recited in Tamil schooling culture (MOCK contextual note).",
      label: "INTERPRETATION",
      source: { title: "Avvaiyar commentary tradition — MOCK record", reference: "citation pending verified edition" },
      entities: ["avvaiyar", "knowledge"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "avvaiyar", to_entity: "ethics (didactic theme)", relation: "codifies", label: "INTERPRETATION",
          source: { title: "Didactic literature studies — MOCK record", reference: "citation pending verified edition" } },
      ],
    },
    d4: {
      title: "Transmission over time",
      content: "Aathichudi lines have been transmitted orally in classrooms and print for generations; editions vary, illustrating living transmission (MOCK note).",
      label: "INTERPRETATION",
      source: { title: "Transmission studies — MOCK record", reference: "citation pending verified edition" },
      entities: ["avvaiyar"],
    },
  },

  "dna": {
    domain: "biology",
    entity_type: "concept",
    d1: {
      title: "DNA (definition)",
      content: "The hereditary molecule: a double helix of antiparallel strands with specific base pairing (A–T, G–C); the sequence encodes genetic information (Watson, Crick, Franklin, Wilkins 1953).",
      label: "FACT",
      source: { title: "Watson & Crick 1953, Nature 171, 737", reference: "doi:10.1038/171737a0" },
      entities: ["dna", "double helix", "base pairing"],
    },
    d2: {
      title: "How DNA works",
      content: "Complementary base pairing enables semi-conservative replication and transcription; the code is read in triplets to specify amino-acid sequences of proteins.",
      label: "FACT",
      source: { title: "Alberts et al., MBoCell 6th ed., ch. 4–5", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["dna", "replication", "transcription"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "mutation", to_entity: "dna", relation: "alters", label: "FACT",
          source: { title: "Alberts et al., MBoCell 6th ed. ch. 5", reference: "ISBN 978-0-8153-4432-2" } },
        { from_entity: "dna", to_entity: "protein folding", relation: "encodes", label: "FACT",
          source: { title: "Anfinsen 1973, Science 181, 223", reference: "doi:10.1126/science.181.4096.223" } },
      ],
    },
    d4: {
      title: "DNA across time",
      content: "Sequences accumulate mutations over generations (molecular clocks); ancient-DNA studies read evolutionary history directly from preserved genetic material.",
      label: "EVIDENCE",
      source: { title: "Molecular evolution studies", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["dna", "evolution"],
    },
  },

  "protein folding": {
    domain: "biology",
    entity_type: "process",
    d1: {
      title: "Protein folding (definition)",
      content: "The amino-acid sequence drives a protein to a specific low-energy 3D structure (Anfinsen's thermodynamic hypothesis); structure determines function.",
      label: "FACT",
      source: { title: "Anfinsen 1973, Science 181, 223", reference: "doi:10.1126/science.181.4096.223" },
      entities: ["protein folding", "tertiary structure"],
    },
    d2: {
      title: "Folding mechanism in the cell",
      content: "Chaperones assist folding and prevent aggregation; misfolded proteins are refolded or degraded by quality-control pathways — sequence, environment and helpers together set the outcome.",
      label: "FACT",
      source: { title: "Alberts et al., MBoCell 6th ed., ch. 3", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["protein folding", "chaperone"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "mutation", to_entity: "protein folding", relation: "alters", label: "FACT",
          source: { title: "Anfinsen 1973; Riordan et al. 1989, Science 245, 1066", reference: "doi:10.1126/science.2475911" } },
        { from_entity: "protein folding", to_entity: "cell", relation: "determines_function_of", label: "FACT",
          source: { title: "Alberts et al., MBoCell 6th ed. ch. 3", reference: "ISBN 978-0-8153-4432-2" } },
      ],
    },
    d4: {
      title: "Misfolding over a lifetime",
      content: "Misfolding and aggregation underlie age-dependent proteinopathies (e.g. prion, Huntington's); aggregation burden typically accumulates over years to decades.",
      label: "EVIDENCE",
      source: { title: "Protein misfolding disease literature", reference: "doi:10.1016/S1474-4422(19)30402-6" },
      entities: ["protein folding", "aggregation"],
    },
  },

  "biology": {
    domain: "biology",
    entity_type: "theme",
    d1: {
      title: "Biology (domain overview)",
      content: "Covers DNA, RNA, genes, mutations, proteins and folding, gene expression, cells, pathways, networks, biomarkers, biological rhythms, development and disease progression. Ask about any of these (e.g. 'what is a mutation', 'gene expression over time').",
      label: "FACT",
      source: { title: "Alberts et al., Molecular Biology of the Cell, 6th ed.", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["dna", "gene expression", "mutation", "protein folding"],
    },
    d2: {
      title: "How the domain connects",
      content: "The central chain is sequence → structure → function → phenotype: DNA encodes proteins whose folded structures do cellular work, regulated dynamically and mis-regulated in disease.",
      label: "INTERPRETATION",
      source: { title: "Alberts et al., MBoCell 6th ed.", reference: "ISBN 978-0-8153-4432-2" },
      entities: ["dna", "protein folding", "cell"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "mutation", to_entity: "disease progression", relation: "initiates_trajectory_toward", label: "EVIDENCE",
          source: { title: "Fearon & Vogelstein 1990, Cell 61, 759", reference: "doi:10.1016/0092-8674(90)90186-U" } },
        { from_entity: "gene expression", to_entity: "circadian rhythm", relation: "generates", label: "FACT",
          source: { title: "Dunlap 1999, Cell 96, 271", reference: "doi:10.1016/S0092-8674(00)80466-8" } },
      ],
    },
    d4: {
      title: "Biology as change over time",
      content: "Development, circadian cycles, clonal evolution and molecular clocks are all temporal processes — biology is inherently four-dimensional.",
      label: "EVIDENCE",
      source: { title: "Panda et al. 2002, Cell 109, 307", reference: "doi:10.1126/science.1245030" },
      entities: ["development", "circadian rhythm", "disease progression"],
    },
  },

  "astronomy": {
    domain: "astronomy",
    entity_type: "theme",
    d1: {
      title: "Astronomy/Astrophysics (domain overview)",
      content: "Covers radio astronomy, spectral imaging, photometry, plasma and plasma oscillation, radiation laws, black-body and blazar radiation, blast waves, cosmology, cosmological constant, black/white holes, wormholes, Kepler's laws, orbital periods and spacetime.",
      label: "FACT",
      source: { title: "NASA Science; Encyclopaedia Britannica", reference: "science.nasa.gov" },
      entities: ["black hole", "plasma oscillation", "kepler's laws"],
    },
    d2: {
      title: "How the domain connects",
      content: "Gravity curves spacetime (orbits, black holes, wormholes); ionized plasma radiates by well-known laws; observations across the electromagnetic spectrum test the models.",
      label: "INTERPRETATION",
      source: { title: "Einstein 1916; NASA Science", reference: "doi:10.1002/andp.19163540702" },
      entities: ["spacetime", "plasma", "photometry"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "spacetime", to_entity: "black hole", relation: "curved_into_extreme_form_by", label: "FACT",
          source: { title: "Einstein 1916", reference: "doi:10.1002/andp.19163540702" } },
        { from_entity: "kepler's laws", to_entity: "orbital period", relation: "determines", label: "FACT",
          source: { title: "Britannica, 'Kepler's laws'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion" } },
      ],
    },
    d4: {
      title: "The universe over time",
      content: "Expansion accelerates (dark energy), stars evolve and die as remnants, and blast waves seed the interstellar medium — cosmic history is change over time.",
      label: "EVIDENCE",
      source: { title: "Riess et al. 1998, AJ 116, 1009", reference: "doi:10.1086/300499" },
      entities: ["accelerating expansion", "blast wave"],
    },
  },

  "disease progression": {
    entity_type: "process",
    d1: {
      title: "Disease progression (definition)",
      content: "The ordered evolution of a disease through stages — from molecular lesion to tissue dysfunction to clinical symptoms — over time.",
      label: "FACT",
      source: { title: "Fearon & Vogelstein 1990, Cell 61, 759", reference: "doi:10.1016/0092-8674(90)90186-U" },
      entities: ["disease progression"],
    },
    d2: {
      title: "Mechanism: clonal evolution (cancer example)",
      content: "Sequential mutations give successive clones growth advantages (APC → KRAS → TP53 in colorectal cancer); multi-region sequencing confirms spatial and temporal heterogeneity within tumours.",
      label: "EVIDENCE",
      source: { title: "Fearon & Vogelstein 1990, Cell 61, 759", reference: "doi:10.1016/0092-8674(90)90186-U" },
      entities: ["cancer", "clonal evolution", "mutation"],
    },
    d3: {
      title: "Relationships",
      rels: [
        { from_entity: "mutation", to_entity: "disease progression", relation: "initiates_trajectory_toward", label: "EVIDENCE",
          source: { title: "Fearon & Vogelstein 1990", reference: "doi:10.1016/0092-8674(90)90186-U" } },
        { from_entity: "cell", to_entity: "disease progression", relation: "dysfunction_drives", label: "EVIDENCE",
          source: { title: "Fearon & Vogelstein 1990", reference: "doi:10.1016/0092-8674(90)90186-U" } },
      ],
    },
    d4: {
      title: "Clinical trajectories over time",
      content: "Progression timelines vary by gene and environment: Huntington's age of onset tracks CAG repeat length; longitudinal cohorts (e.g. TRACK-HD) quantify the stages.",
      label: "EVIDENCE",
      source: { title: "Tabrizi et al. 2020, Lancet Neurology (TRACK-HD)", reference: "doi:10.1016/S1474-4422(19)30402-6" },
      entities: ["disease progression", "huntington's"],
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
  "thirumandiram": ["thirumandiram", "thirumandhiram", "tirumandiram", "tirumular", "திருமந்திரம்"],
  "purananuru": ["purananuru", "puranaanooru", "puram poetry", "புறநானூறு"],
  "avvaiyar": ["avvaiyar", "aathichudi", "athichudi", "ஔவையார்"],
  "white hole": ["white hole", "white holes"],
  "wormhole": ["wormhole", "wormholes", "einstein-rosen bridge", "einstein rosen bridge"],
  "blast wave": ["blast wave", "blast waves", "sedov-taylor", "sedov taylor", "supernova remnant"],
  "astronomy": ["astronomy", "astrophysics", "space", "universe"],
  "biology": ["biology", "biological", "life science", "life sciences"],
  "tamil": ["tamil", "tamil literature", "classical tamil", "தமிழ்", "sangam"],
  "dna": ["dna", "deoxyribonucleic acid", "double helix"],
  "protein folding": ["protein folding", "folding", "tertiary structure", "misfolding"],
  "disease progression": ["disease progression", "disease", "cancer progression", "tumor progression", "tumour progression"],
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
