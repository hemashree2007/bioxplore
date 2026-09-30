/* MOCK data for the Multidimensional Knowledge System frontend.
 *
 * All four cases mirror Part A's /query envelope EXACTLY:
 * { query, answer: { summary, sections[], relationships[], comparison_table }, sources[], warnings[], not_found[] }
 * Section items: { id, title, content, evidence_label, source, entities }
 * Relationship: { from_entity, to_entity, relation, dimension, evidence_label, source }
 * Source: { title, reference, text_name, verse_number, chapter, author }
 *
 * Labels use the enum value HYPOTHESIS (there is no HYPOTHETICAL tag).
 * The Tamil verse here is synthetic MOCK text, clearly marked.
 */

const MOCK_CASES = {
  "Black hole vs white hole": {
    meta: { mock: true, case: "single-domain science (comparison)" },
    query: {
      raw_query: "Black hole vs white hole",
      normalized_query: "black hole vs white hole",
      input_type: "comparison",
      input_type_confidence: 0.95,
      secondary_types: ["relationship"],
      intent: "compare",
      domains: [{ domain: "astronomy", score: 0.97 }],
      entities: [
        { text: "black hole", normalized_name: "black hole", domain: "astronomy", entity_type: "object", side: "A" },
        { text: "white hole", normalized_name: "white hole", domain: "astronomy", entity_type: "object", side: "B" },
      ],
      dimensions: ["1D", "3D", "4D"],
      dimension_reasons: {
        "1D": "literal definitions requested",
        "3D": "comparison implies relationship analysis",
        "4D": "white holes are hypothetical objects",
      },
      options: { max_items: 20 },
      language: "en",
      warnings: [],
    },
    answer: {
      summary:
        "Compared 3 item(s) in domain astronomy across dimensions 1D, 3D, 4D. Black holes are observationally established; white holes are a time-reversed mathematical solution with no observational evidence.",
      sections: [
        {
          dimension: "1D",
          title: "Text / Literal",
          items: [
            {
              id: "astro_black_hole_def",
              title: "Black hole (definition)",
              content:
                "A region of spacetime where gravity is so strong that nothing — not even light — escapes once inside the event horizon.",
              evidence_label: "FACT",
              source: {
                title: "NASA Science — Black Holes",
                reference: "science.nasa.gov/universe/black-holes",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["black hole", "event horizon", "spacetime"],
              side: "A",
            },
            {
              id: "astro_white_hole_def",
              title: "White hole (definition; hypothetical)",
              content:
                "The time-reverse of a black hole: a region nothing can enter, from which matter and light can only emerge. It appears as a mathematical solution of general relativity but there is no observational evidence that white holes exist.",
              evidence_label: "HYPOTHESIS",
              source: {
                title: "Hawking & Ellis 1973, The Large Scale Structure of Space-Time, sec. 5.6",
                reference: "ISBN 978-0-521-09906-6",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["white hole", "event horizon"],
              side: "B",
            },
          ],
        },
        {
          dimension: "3D",
          title: "Symbol / Concept / Relationship",
          items: [],
          relationships_note: "see relationships[] below",
        },
        {
          dimension: "4D",
          title: "Future / Hypothetical / Temporal",
          items: [
            {
              id: "astro_white_hole_4d",
              title: "White holes as speculative endpoints",
              content:
                "Some cosmological speculations imagine white holes as the far end of evaporating black holes or as relics of the early universe; all such scenarios are untested.",
              evidence_label: "HYPOTHESIS",
              source: {
                title: "Hawking & Ellis 1973; modern review essays on white-hole conjectures",
                reference: "ISBN 978-0-521-09906-6",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["white hole", "black hole evaporation"],
            },
          ],
        },
      ],
      relationships: [
        {
          from_entity: "white hole",
          to_entity: "black hole",
          relation: "time_reverse_of",
          dimension: "3D",
          evidence_label: "HYPOTHESIS",
          source: {
            title: "Hawking & Ellis 1973, The Large Scale Structure of Space-Time",
            reference: "ISBN 978-0-521-09906-6",
            text_name: null, verse_number: null, chapter: null, author: null,
          },
        },
      ],
      comparison_table: {
        columns: ["Property", "Black hole (A)", "White hole (B)"],
        rows: [
          ["Nothing escapes / nothing enters", "Nothing escapes past event horizon", "Nothing can enter"],
          ["Observational status", "Established (EHT 2019 image of M87*)", "No observational evidence"],
          ["Evidence label", "FACT", "HYPOTHESIS"],
        ],
      },
    },
    sources: [
      { title: "NASA Science — Black Holes", reference: "science.nasa.gov/universe/black-holes", text_name: null, verse_number: null, chapter: null, author: null },
      { title: "Hawking & Ellis 1973, The Large Scale Structure of Space-Time", reference: "ISBN 978-0-521-09906-6", text_name: null, verse_number: null, chapter: null, author: null },
    ],
    warnings: [],
    not_found: [],
  },

  "What does Thirukkural say about water?": {
    meta: { mock: true, case: "Tamil verse query" },
    query: {
      raw_query: "What does Thirukkural say about water?",
      normalized_query: "what does thirukkural say about water?",
      input_type: "question",
      input_type_confidence: 0.85,
      secondary_types: ["concept"],
      intent: "interpret_meaning",
      domains: [{ domain: "tamil", score: 0.96 }],
      entities: [
        { text: "thirukkural", normalized_name: "thirukkural", domain: "tamil", entity_type: "text_source", side: null },
        { text: "water", normalized_name: "water", domain: "tamil", entity_type: "theme", side: null },
      ],
      dimensions: ["1D", "2D"],
      dimension_reasons: {
        "1D": "original verse, words, literal meaning",
        "2D": "literary/philosophical context requested",
      },
      options: { max_items: 20 },
      language: "mixed",
      warnings: [],
    },
    answer: {
      summary:
        "One verified verse on water from the Thirukkural with literary context. The verse is a moral reflection on rain and worldly order — it is not a scientific claim.",
      sections: [
        {
          dimension: "1D",
          title: "Text / Literal",
          items: [
            {
              id: "ta_kural_mock_water",
              title: "Thirukkural — verse on water (MOCK)",
              content: "MOCK VERSE TEXT — replace with verified verse from a cited edition.",
              evidence_label: "FACT",
              source: {
                title: "Thirukkural — MOCK record for frontend development",
                reference: "edition to be cited when verified verse is added",
                text_name: "Thirukkural",
                verse_number: "000 (MOCK)",
                chapter: "MOCK",
                author: "Thiruvalluvar (attributed)",
              },
              entities: ["thirukkural", "water"],
              is_verse: true,
              verse: {
                original: "மாதர் நட்பாண்மை மாக்கட் புணர்ச்சிது — MOCK TEXT",
                transliteration: "MOCK TRANSLITERATION",
                translation: "MOCK TRANSLATION — water sustains the world's order (placeholder).",
                literal_meaning: "MOCK LITERAL MEANING (placeholder).",
                words: ["நீர் (water)", "வானம் (sky)", "நிலம் (land)"],
              },
            },
          ],
        },
        {
          dimension: "2D",
          title: "Interpretation / Context",
          items: [
            {
              id: "ta_kural_mock_water_ctx",
              title: "Literary and cultural context (MOCK)",
              content:
                "In the Thirukkural's moral architecture, rain is treated as the foundation of worldly order — agriculture, food and wealth all depend on it (MOCK contextual note for development).",
              evidence_label: "INTERPRETATION",
              source: {
                title: "Thirukkural interpretive literature — MOCK record",
                reference: "citation pending verified edition",
                text_name: "Thirukkural",
                verse_number: "000 (MOCK)",
                chapter: "MOCK",
                author: null,
              },
              entities: ["thirukkural", "water"],
            },
          ],
        },
      ],
      relationships: [],
      comparison_table: null,
    },
    sources: [
      {
        title: "Thirukkural — MOCK record for frontend development",
        reference: "edition to be cited when verified verse is added",
        text_name: "Thirukkural", verse_number: "000 (MOCK)", chapter: "MOCK",
        author: "Thiruvalluvar (attributed)",
      },
    ],
    warnings: [
      "This is a MOCK frontend record. No verified Thirukkural verse is available yet — verses are added only after verification against a cited edition.",
    ],
    not_found: [],
  },

  "Can biological rhythms be compared conceptually with orbital periods?": {
    meta: { mock: true, case: "cross-domain" },
    query: {
      raw_query: "Can biological rhythms be compared conceptually with orbital periods?",
      normalized_query: "can biological rhythms be compared conceptually with orbital periods?",
      input_type: "cross_domain",
      input_type_confidence: 0.9,
      secondary_types: ["comparison", "relationship"],
      intent: "find_relationship",
      domains: [
        { domain: "biology", score: 0.82 },
        { domain: "astronomy", score: 0.78 },
      ],
      entities: [
        { text: "biological rhythms", normalized_name: "circadian rhythm", domain: "biology", entity_type: "process", side: "A" },
        { text: "orbital periods", normalized_name: "orbital period", domain: "astronomy", entity_type: "concept", side: "B" },
      ],
      dimensions: ["1D", "3D", "4D"],
      dimension_reasons: {
        "1D": "literal facts of both domains",
        "3D": "cross-domain relationship analysis",
        "4D": "analogy/speculative framing",
      },
      options: { max_items: 20 },
      language: "en",
      warnings: [],
    },
    answer: {
      summary:
        "Both are periodic phenomena with a characteristic period — Keplerian orbits by T² = (4π²/GM)a³, circadian rhythms by an endogenous ~24 h molecular clock. The shared abstraction is a robust oscillator; the physics differs completely, so the mapping is a conceptual analogy, not evidence.",
      sections: [
        {
          dimension: "1D",
          title: "Text / Literal",
          items: [
            {
              id: "bio_circadian_def",
              title: "Circadian rhythm (definition)",
              content:
                "A biological process with a free-running period of about 24 hours, generated by an internal molecular clock and synchronized daily by light.",
              evidence_label: "FACT",
              source: {
                title: "Dunlap, J. C. 1999, Cell 96, 271 (Molecular Bases for Circadian Clocks)",
                reference: "doi:10.1016/S0092-8674(00)80466-8",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["circadian rhythm"],
            },
            {
              id: "astro_kepler_laws",
              title: "Kepler's laws (harmonic law)",
              content: "The square of the orbital period is proportional to the cube of the semi-major axis: T² = (4π²/GM)a³.",
              evidence_label: "FACT",
              source: {
                title: "Encyclopaedia Britannica, 'Kepler's laws of planetary motion'",
                reference: "britannica.com/science/Keplers-laws-of-planetary-motion",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["kepler's laws", "orbital period"],
            },
          ],
        },
        {
          dimension: "3D",
          title: "Symbol / Concept / Relationship",
          items: [],
          relationships_note: "see relationships[] below",
        },
        {
          dimension: "4D",
          title: "Future / Hypothetical / Temporal",
          items: [
            {
              id: "x_analogy_4d",
              title: "Oscillators as a shared abstraction",
              content:
                "If one abstracts away mechanism, gravitational orbits and gene-regulatory clocks are both self-sustaining oscillators; researchers sometimes borrow intuition across them. This is an analogy for framing questions — not a physical correspondence.",
              evidence_label: "ANALOGY",
              source: {
                title: "Cross-domain essay: Dunlap 1999; Britannica, Kepler's laws",
                reference: "doi:10.1016/S0092-8674(00)80466-8",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["circadian rhythm", "orbital period"],
            },
          ],
        },
      ],
      relationships: [
        {
          from_entity: "circadian rhythm",
          to_entity: "orbital period",
          relation: "conceptually_parallels",
          dimension: "3D",
          evidence_label: "ANALOGY",
          source: {
            title: "Cross-domain essay: Dunlap 1999, Cell 96, 271; Britannica, Kepler's laws",
            reference: "doi:10.1016/S0092-8674(00)80466-8",
            text_name: null, verse_number: null, chapter: null, author: null,
          },
        },
        {
          from_entity: "kepler's laws",
          to_entity: "orbital period",
          relation: "determines",
          dimension: "3D",
          evidence_label: "FACT",
          source: {
            title: "Encyclopaedia Britannica, 'Kepler's laws of planetary motion'",
            reference: "britannica.com/science/Keplers-laws-of-planetary-motion",
            text_name: null, verse_number: null, chapter: null, author: null,
          },
        },
        {
          from_entity: "gene expression",
          to_entity: "circadian rhythm",
          relation: "generates",
          dimension: "3D",
          evidence_label: "FACT",
          source: {
            title: "Dunlap, J. C. 1999, Cell 96, 271",
            reference: "doi:10.1016/S0092-8674(00)80466-8",
            text_name: null, verse_number: null, chapter: null, author: null,
          },
        },
      ],
      comparison_table: null,
    },
    sources: [
      { title: "Dunlap, J. C. 1999, Cell 96, 271", reference: "doi:10.1016/S0092-8674(00)80466-8", text_name: null, verse_number: null, chapter: null, author: null },
      { title: "Encyclopaedia Britannica, 'Kepler's laws of planetary motion'", reference: "britannica.com/science/Keplers-laws-of-planetary-motion", text_name: null, verse_number: null, chapter: null, author: null },
    ],
    warnings: ["Conceptual relationships are not scientific evidence."],
    not_found: [],
  },

  "How does a mutation affect DNA, protein structure, cellular function and disease progression?": {
    meta: { mock: true, case: "multidimensional biology" },
    query: {
      raw_query: "How does a mutation affect DNA, protein structure, cellular function and disease progression?",
      normalized_query: "how does a mutation affect dna, protein structure, cellular function and disease progression?",
      input_type: "multidimensional",
      input_type_confidence: 0.9,
      secondary_types: ["relationship", "temporal"],
      intent: "explain",
      domains: [{ domain: "biology", score: 0.95 }],
      entities: [
        { text: "mutation", normalized_name: "mutation", domain: "biology", entity_type: "process", side: null },
        { text: "dna", normalized_name: "dna", domain: "biology", entity_type: "concept", side: null },
        { text: "protein structure", normalized_name: "protein folding", domain: "biology", entity_type: "process", side: null },
        { text: "cellular function", normalized_name: "cell", domain: "biology", entity_type: "concept", side: null },
        { text: "disease progression", normalized_name: "disease progression", domain: "biology", entity_type: "process", side: null },
      ],
      dimensions: ["1D", "2D", "3D", "4D"],
      dimension_reasons: {
        "1D": "definitions of each layer",
        "2D": "mechanism linking sequence to structure to function",
        "3D": "causal chain between entities",
        "4D": "disease progression over time",
      },
      options: { max_items: 20 },
      language: "en",
      warnings: [],
    },
    answer: {
      summary:
        "A disease-relevant mutation changes DNA sequence, which can destabilize the encoded protein's folded structure, altering cellular function and initiating a clinical trajectory that unfolds over years.",
      sections: [
        {
          dimension: "1D",
          title: "Text / Literal",
          items: [
            {
              id: "bio_mutation_def",
              title: "Mutation (definition)",
              content: "A change in the DNA sequence: point mutations (missense, nonsense, silent), insertions/deletions, duplications, inversions and chromosomal rearrangements.",
              evidence_label: "FACT",
              source: {
                title: "Alberts, B. et al., Molecular Biology of the Cell, 6th ed., ch. 5",
                reference: "ISBN 978-0-8153-4432-2",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["mutation", "dna"],
            },
          ],
        },
        {
          dimension: "2D",
          title: "Interpretation / Context",
          items: [
            {
              id: "bio_mutation_mech",
              title: "Mechanism: sequence → structure → function",
              content:
                "A coding mutation changes the amino-acid sequence; because function depends on the folded 3D structure, substitutions or frameshifts can destabilize folding, abolish active sites, or remove stop codons. Loss of a channel or enzyme changes cellular behaviour (e.g. CFTR mutations in cystic fibrosis).",
              evidence_label: "EVIDENCE",
              source: {
                title: "Riordan, J. R. et al. 1989, Science 245, 1066 (CFTR)",
                reference: "doi:10.1126/science.2475911",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["mutation", "protein folding", "cell"],
            },
          ],
        },
        {
          dimension: "3D",
          title: "Symbol / Concept / Relationship",
          items: [],
          relationships_note: "see relationships[] below",
        },
        {
          dimension: "4D",
          title: "Future / Hypothetical / Temporal",
          items: [
            {
              id: "bio_disease_temporal",
              title: "Mutation to disease trajectory over time",
              content:
                "The chain is causal but rates vary: DNA change → altered protein → changed cell function → tissue dysfunction → clinical progression over years (as in cystic fibrosis or Huntington's, where repeat length sets age of onset).",
              evidence_label: "EVIDENCE",
              source: {
                title: "Tabrizi, S. J. et al. 2020, Lancet Neurology (TRACK-HD)",
                reference: "doi:10.1016/S1474-4422(19)30402-6",
                text_name: null, verse_number: null, chapter: null, author: null,
              },
              entities: ["mutation", "disease progression"],
            },
          ],
        },
      ],
      relationships: [
        { from_entity: "mutation", to_entity: "dna", relation: "alters", dimension: "3D", evidence_label: "FACT", source: { title: "Alberts et al., MBoCell 6th ed. ch. 5", reference: "ISBN 978-0-8153-4432-2", text_name: null, verse_number: null, chapter: null, author: null } },
        { from_entity: "dna", to_entity: "protein folding", relation: "encodes", dimension: "3D", evidence_label: "FACT", source: { title: "Anfinsen 1973, Science 181, 223", reference: "doi:10.1126/science.181.4096.223", text_name: null, verse_number: null, chapter: null, author: null } },
        { from_entity: "protein folding", to_entity: "cell", relation: "determines_function_of", dimension: "3D", evidence_label: "FACT", source: { title: "Alberts et al., MBoCell 6th ed. ch. 3", reference: "ISBN 978-0-8153-4432-2", text_name: null, verse_number: null, chapter: null, author: null } },
        { from_entity: "cell", to_entity: "disease progression", relation: "dysfunction_drives", dimension: "3D", evidence_label: "EVIDENCE", source: { title: "Fearon & Vogelstein 1990, Cell 61, 759", reference: "doi:10.1016/0092-8674(90)90186-U", text_name: null, verse_number: null, chapter: null, author: null } },
      ],
      comparison_table: null,
    },
    sources: [
      { title: "Alberts, B. et al., Molecular Biology of the Cell, 6th ed.", reference: "ISBN 978-0-8153-4432-2", text_name: null, verse_number: null, chapter: null, author: null },
      { title: "Riordan, J. R. et al. 1989, Science 245, 1066 (CFTR)", reference: "doi:10.1126/science.2475911", text_name: null, verse_number: null, chapter: null, author: null },
      { title: "Anfinsen 1973, Science 181, 223", reference: "doi:10.1126/science.181.4096.223", text_name: null, verse_number: null, chapter: null, author: null },
      { title: "Fearon & Vogelstein 1990, Cell 61, 759", reference: "doi:10.1016/0092-8674(90)90186-U", text_name: null, verse_number: null, chapter: null, author: null },
      { title: "Tabrizi, S. J. et al. 2020, Lancet Neurology (TRACK-HD)", reference: "doi:10.1016/S1474-4422(19)30402-6", text_name: null, verse_number: null, chapter: null, author: null },
    ],
    warnings: [],
    not_found: [],
  },
};

if (typeof module !== "undefined") module.exports = { MOCK_CASES };
