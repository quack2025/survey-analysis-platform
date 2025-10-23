import { ProjectContext, NET_TEMPLATES, NetTemplate } from '@/types';

export function buildClassifyQuestionPrompt(
  questionTitle: string,
  context: ProjectContext
): { system: string; user: string } {
  const system = `You are analyzing responses for a ${context.studyType.replace('_', ' ')} study.

PROJECT CONTEXT:
- Study objective: ${context.objective}
- Brand/Product: ${context.brand}
- Target audience: ${context.targetAudience || 'General population'}
- Study phase: ${context.studyPhase}

Classify each user question into exactly one of two types: "REFERENCE" or "OPINION".

Logic (on priority):
1. References
   - If the question asks for one single or list of concrete facts, brands, names, counts or an enumeration (even of one single term) — label it "REFERENCE".
   - Triggers: asks which, what (is/are), name, tell me, list, how many, show me, brand, comes to mind.

2. Opinions
   - If the question expects a subjective response—judgment, preference, advice, impression, prediction — label it "OPINION".
   - Triggers: asks what you think, feel, believe, prefer, like, recommend, suggest, or your opinion.

Consider the project context to better understand the intent of each question.

Output:
Return a JSON object with:
- "question": the original text
- "type": either "REFERENCE" or "OPINION"`;

  const user = questionTitle;

  return { system, user };
}

export function buildSummaryPrompt(
  answerList: string[],
  questionTitle: string,
  projectLanguage: string = 'en'
): { system: string; user: string } {
  const system = `You are a data analyst. Summarize user responses to the question:
${questionTitle}

---

## Input Schema
- \`answers\`: array of string responses (may include empty or off-topic)

---

## Rules
- Produce a **single, concise paragraph** around 200-250 words (no lists, no quotes, no preamble).
- Weight by frequency: prioritize high-volume ideas; mention low-volume points only if they materially change interpretation.
- Focus on the **top ~5 ideas/patterns** after merging synonyms and near-duplicates.
- Reflect the overall **sentiment tilt** if apparent.
- Use calibrated quantifiers ("most", "many", "some", "few") unless exact shares are provided.
- Remove noise/off-topic content.
- Language: ${projectLanguage}.

---

## JSON Output Schema
- \`Summary\`: array of strings, containing **one** string with all the summary text in index 0`;

  const user = JSON.stringify(answerList);

  return { system, user };
}

export function buildExtractCodesPrompt(
  answerList: string[],
  questionTitle: string,
  projectLanguage: string = 'en',
  context?: ProjectContext
): { system: string; user: string } {
  let contextSection = '';

  if (context) {
    contextSection = `
## PROJECT CONTEXT
Study type: ${context.studyType.replace('_', ' ')}
Objective: ${context.objective}
Brand: ${context.brand}

CONCEPTUAL FRAMEWORK:
${getConceptualFramework(context.studyType)}

Generate codes that align with this framework while remaining grounded in actual responses.
`;
  }

  const system = `Categorize open-ended responses into concise codes with sentiment.

Codes must be descriptive attributes (not nets), because they will later be grouped into broader nets.

Codes are for survey analysis. Minor semantic nuances between them add no value, so ensure codes are meaningful, distinct, and non-overlapping

## Context
Question → ${questionTitle}
${contextSection}

## Steps

### 1. Extraction
- Identify main ideas from each answer
- Codes must consider the objective of the question.
- Express each as a phrase of 1–3 words, only first word capitalized.
- Codes must be semantically broad, not micro-fragmented.
- Codes must describe an attribute (e.g., clarity, variety, visibility), never a net label.
- Do not generate more than 25-30 unique codes, but less is better if no more are really needed.

### 2. Normalization
- Merge obvious duplicates (case, whitespace, plural/singular) and similar codes.
- Each code must be unique after normalization.

### 3. Sentiment
- Assign Positive, Negative, or Neutral. (do not translate)
- Negation flips polarity.

## Language and Style
- **CRITICAL: All codes MUST be in ${projectLanguage === 'es' ? 'SPANISH (español)' : projectLanguage.toUpperCase()}**
- **Output codes in language locale:** ${projectLanguage}
- **Code format**: Natural phrases, first word capitalized
- **Net names**: Broad, non-overlapping categories
- **Proper spelling/accents** for target language (e.g., "Sabor único" not "Unique flavor")

## JSON Output Schema
- categories: array of objects:
  - name: canonical code
  - sentiment: Positive | Neutral | Negative (do not translate)`;

  const user = JSON.stringify(answerList);

  return { system, user };
}

export function buildNormalizeCodesPrompt(
  codes: Array<{ name: string; sentiment: string }>,
  questionTitle: string
): { system: string; user: string } {
  const system = `Remove those open-ended response codes that semantically overlap with others.

## Context
Question → ${questionTitle}

## Input Data Structure Expected
Array of codes with their sentiments

## Step

### 1. Semantics
- If two codes express a similar concept within the context of the question objective, keep only one.
- Always keep the most general, inclusive, and neutral version.
- Discard the more specific or redundant variants.
- Keep at max 15 codes.
- Keep same code name and sentiment than input for the remaining list.

## JSON Output Schema
- categories: array of objects:
  - name: canonical code
  - sentiment: Positive | Neutral | Negative`;

  const user = JSON.stringify(codes);

  return { system, user };
}

export function buildGenerateNetsPrompt(
  codes: Array<{ name: string; sentiment: string }>,
  questionTitle: string,
  projectLanguage: string = 'en',
  context?: ProjectContext
): { system: string; user: string } {
  let frameworkSection = '';

  if (context) {
    const templates = NET_TEMPLATES[context.studyType];
    frameworkSection = `
RECOMMENDED NET STRUCTURE for ${context.studyType.replace('_', ' ')}:
${templates.map(t => `- ${t.net}: ${t.description}`).join('\n')}

RULES:
1. Use these nets as your PRIMARY structure
2. You MAY create 1-2 additional nets ONLY if codes clearly don't fit existing ones
3. You MUST still include the "Uncategorized" fallback net (empty)
4. Distribute codes across nets based on semantic fit
`;
  }

  const system = `## Context
Group open-ended response codes into broader thematic nets.
Nets must be neutral umbrella categories, not descriptive codes.

**Target language locale:** ${projectLanguage}
**Question:** ${questionTitle}

${frameworkSection}

## Input Data Structure Expected
Array of normalized codes with their sentiments.

## Steps

### 1. Create fallback net
- Net name: "Uncategorized" (or equivalent in target language)
  - Contains code: "Uncategorized" (or equivalent in target language) with Neutral sentiment
- No other fallback nets.

### 2. Group Codes into Thematic Nets
- Create thematic nets plus the fallback net
- Nets must consider the objective of the question.
- The fallback must always exist but remain empty, except for a single placeholder code with Neutral sentiment.
- Group normalized codes by semantic similarity, not by surface form.
  - Each net should contain at least two codes whenever possible.
    - Avoid single-code nets unless no meaningful semantic fit exists.
    - Do not create vague or residual nets.
  - Nets must group codes that share a clear conceptual domain.
    - Do not combine unrelated topics.
    - Do not force a code into an irrelevant net.
  - Preserve all input codes.

- Net names must be neutral umbrella concepts:
  - Prefer two-word stable concepts.
  - One word is acceptable only if it is a strong, self-contained concept.
  - Never use descriptive phrases, adjectives, evaluative terms, or unrelated pairs joined by conjunctions like "and".
  - All names must be consistent in style and abstraction level.

## Language and Style
- **CRITICAL: All nets and codes MUST be in ${projectLanguage === 'es' ? 'SPANISH (español)' : projectLanguage.toUpperCase()}**
- **Codes and nets in language locale:** ${projectLanguage}
- Keep sentiments untranslated (always: Positive, Neutral, Negative)
- **Code format**: Natural phrases, first word capitalized
- **Net names**: Broad, non-overlapping categories in ${projectLanguage}
- **Proper spelling/accents** for target language (e.g., "Conexión emocional" not "Emotional connection")
- Ensure fallback category uses target language locale (e.g., "Sin categorizar" for Spanish)

## Required JSON Output
- nets: array of objects (includes fallback theme translated):
  - net: net label
  - codes: array of objects:
    - code: canonical code
    - sentiment: Positive | Neutral | Negative
- Each code must appear at most once and never as a semantic duplicate.`;

  const user = JSON.stringify(codes);

  return { system, user };
}

export function buildClassifyAnswersPrompt(
  answers: string[],
  nets: any[],
  questionTitle: string
): { system: string; user: string } {
  const system = `Classify each user answer into the provided **nets** and **codes**.

The phrases are responses to the question: "${questionTitle}"

---

## Rules
- One object per input answer, same order and count.
- Assign **ALL** nets/codes that the answer **meaningfully covers** (multi-label). No hard cap.
- Each answer must map to ≥1 net and ≥1 code.
- Each code must include sentiment.
- Use only input nets/codes; do not invent.
- If none apply, fallback to the translated version of **Uncategorized / Uncategorized** available in the input.
- No extra text or fields beyond the schema.
- De-duplicate repeated nets/codes in the same answer.

---

## JSON Output Schema
- **answers**: array of objects:
  - **answer**: original response text
  - **nets**: array of objects:
    - **net**: net label (string, or **Uncategorized** if no match possible; translated into the project language)
    - **codes**: array of objects:
      - **code**: assigned code (string, or **Uncategorized** if no match possible; translated into the project language)
      - **sentiment**: Positive | Neutral | Negative

Available nets and codes:
${JSON.stringify(nets, null, 2)}`;

  const user = JSON.stringify(answers);

  return { system, user };
}

function getConceptualFramework(studyType: string): string {
  const frameworks: Record<string, string> = {
    commercial_evaluation: `Consider standard advertising effectiveness dimensions:
- Message clarity & comprehension
- Emotional response & engagement
- Brand linkage & recall
- Purchase intent & action
- Credibility & trust`,

    product_feedback: `Consider product evaluation dimensions:
- Functional performance & quality
- Sensory experience (taste, smell, texture, etc.)
- Value for money
- Packaging & convenience
- Usage context & occasions`,

    concept_test: `Consider concept evaluation dimensions:
- Relevance & need (solves a problem)
- Uniqueness & differentiation
- Believability & credibility
- Appeal & interest
- Purchase intent`,

    brand_health: `Consider brand health dimensions:
- Awareness & familiarity
- Brand image & personality
- Brand equity & trust
- Loyalty & advocacy
- Competitive positioning`,

    ux_research: `Consider UX evaluation dimensions:
- Usability & ease of use
- Functionality & features
- Visual design & aesthetics
- User satisfaction
- Pain points & barriers`,

    customer_satisfaction: `Consider satisfaction dimensions:
- Product/service quality
- Customer service & support
- Value for money
- Experience & convenience
- Loyalty & recommendation likelihood`,
  };

  return frameworks[studyType] || 'No specific framework - use general thematic analysis';
}
