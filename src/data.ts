import type {
  DemoDocument,
  FidelityWarning,
  LegalTerm,
  OriginalSegment,
  SimplificationLevel,
} from './types'

export const sampleClauseText =
  "Supplier shall indemnify, defend, and hold harmless Customer and its officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses, including reasonable attorneys' fees, arising out of or relating to Supplier's breach of this Agreement, negligence, willful misconduct, or violation of applicable law. Customer may seek injunctive relief without posting bond if monetary damages would be inadequate."

const sampleSegments: OriginalSegment[] = [
  {
    id: 'o1',
    label: 'O1',
    text: "Supplier shall indemnify, defend, and hold harmless Customer and its officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses, including reasonable attorneys' fees.",
  },
  {
    id: 'o2',
    label: 'O2',
    text: "The covered losses must arise out of or relate to Supplier's breach of this Agreement, negligence, willful misconduct, or violation of applicable law.",
  },
  {
    id: 'o3',
    label: 'O3',
    text: 'Customer may seek injunctive relief without posting bond if monetary damages would be inadequate.',
  },
]

const sampleWarnings: FidelityWarning[] = [
  {
    id: 'w1',
    kind: 'scope-shift',
    severity: 'caution',
    title: 'Scope compressed',
    message:
      'The phrase "any and all claims, damages, losses, liabilities, costs, and expenses" is shortened at this level.',
    sourceIds: ['o1'],
    blockIds: ['l2-b1', 'l3-b1'],
    levelIds: ['level-2', 'level-3'],
  },
  {
    id: 'w2',
    kind: 'merged-duty',
    severity: 'notice',
    title: 'Three duties merged',
    message:
      'Indemnify, defend, and hold harmless are presented as one practical duty for readability.',
    sourceIds: ['o1'],
    blockIds: ['l1-b1', 'l2-b1', 'l3-b1'],
    levelIds: ['level-1', 'level-2', 'level-3'],
  },
  {
    id: 'w3',
    kind: 'omission',
    severity: 'serious',
    title: 'Remedy detail omitted',
    message:
      'The bond requirement for injunctive relief is not included in the shortest summary.',
    sourceIds: ['o3'],
    blockIds: ['l3-b2'],
    levelIds: ['level-3'],
  },
]

const sampleTerms: LegalTerm[] = [
  {
    id: 't1',
    phrase: 'indemnify',
    explanation: 'A duty to reimburse or cover another party for specified losses.',
    legalFunction: 'Allocates financial responsibility after a covered event.',
    sourceIds: ['o1'],
    blockIds: ['l0-b1', 'l1-b1', 'l2-b1', 'l3-b1'],
    caution: 'Exact scope depends on the surrounding words and governing law.',
  },
  {
    id: 't2',
    phrase: 'hold harmless',
    explanation: 'A promise that the other party should not bear certain losses.',
    legalFunction: 'Often appears with indemnity language to reinforce risk shifting.',
    sourceIds: ['o1'],
    blockIds: ['l0-b1', 'l1-b1'],
    caution: 'It can overlap with, but is not always identical to, indemnity.',
  },
  {
    id: 't3',
    phrase: "reasonable attorneys' fees",
    explanation: 'Legal fees that are limited by a reasonableness standard.',
    legalFunction: 'Specifies that covered expenses can include lawyer fees.',
    sourceIds: ['o1'],
    blockIds: ['l0-b1', 'l1-b1', 'l2-b1'],
    caution: 'A court or contract process may decide what is reasonable.',
  },
  {
    id: 't4',
    phrase: 'injunctive relief',
    explanation: 'A court order requiring someone to do, or stop doing, something.',
    legalFunction: 'Provides a non-money remedy when damages may not be enough.',
    sourceIds: ['o3'],
    blockIds: ['l0-b3', 'l1-b3', 'l2-b3', 'l3-b2'],
    caution: 'Availability depends on facts, procedure, and court standards.',
  },
  {
    id: 't5',
    phrase: 'without posting bond',
    explanation: 'A request to avoid paying security before receiving a court order.',
    legalFunction: 'Attempts to lower the procedural cost of emergency relief.',
    sourceIds: ['o3'],
    blockIds: ['l0-b3', 'l1-b3', 'l2-b3'],
    caution: 'Courts may still require a bond despite contract wording.',
  },
]

const sampleLevels: SimplificationLevel[] = [
  {
    id: 'level-0',
    label: 'Level 0: Near-original',
    shortLabel: 'Near original',
    description: 'Keeps legal structure and most legal terms intact.',
    readability: 24,
    fidelity: 96,
    blocks: [
      {
        id: 'l0-b1',
        sourceIds: ['o1'],
        text: "Supplier must indemnify, defend, and hold harmless Customer and its representatives against all claims, damages, losses, liabilities, costs, and expenses, including reasonable attorneys' fees.",
        warningIds: [],
        termIds: ['t1', 't2', 't3'],
      },
      {
        id: 'l0-b2',
        sourceIds: ['o2'],
        text: "This applies when the losses arise from Supplier's breach of the Agreement, negligence, willful misconduct, or violation of applicable law.",
        warningIds: [],
        termIds: [],
      },
      {
        id: 'l0-b3',
        sourceIds: ['o3'],
        text: 'Customer may seek injunctive relief without posting bond if money damages would not be enough.',
        warningIds: [],
        termIds: ['t4', 't5'],
      },
    ],
  },
  {
    id: 'level-1',
    label: 'Level 1: Legal plain English',
    shortLabel: 'Plain English',
    description: 'Uses plainer wording while preserving each major obligation.',
    readability: 52,
    fidelity: 88,
    blocks: [
      {
        id: 'l1-b1',
        sourceIds: ['o1'],
        text: "Supplier must protect Customer and its people from covered claims and expenses, including reasonable attorneys' fees.",
        warningIds: ['w2'],
        termIds: ['t1', 't2', 't3'],
      },
      {
        id: 'l1-b2',
        sourceIds: ['o2'],
        text: 'The protection applies if the problem is connected to Supplier breaking the agreement, acting negligently, acting intentionally wrongfully, or violating the law.',
        warningIds: [],
        termIds: [],
      },
      {
        id: 'l1-b3',
        sourceIds: ['o3'],
        text: 'Customer can ask a court for injunctive relief without posting bond when money would not fix the problem.',
        warningIds: [],
        termIds: ['t4', 't5'],
      },
    ],
  },
  {
    id: 'level-2',
    label: 'Level 2: Reader summary',
    shortLabel: 'Reader summary',
    description: 'Prioritizes fast comprehension and flags compressed details.',
    readability: 76,
    fidelity: 74,
    blocks: [
      {
        id: 'l2-b1',
        sourceIds: ['o1', 'o2'],
        text: "Supplier must cover Customer for losses and legal costs tied to Supplier's breach, negligence, misconduct, or legal violation.",
        warningIds: ['w1', 'w2'],
        termIds: ['t1', 't3'],
      },
      {
        id: 'l2-b3',
        sourceIds: ['o3'],
        text: 'Customer may ask for a court order, without a bond, if money would not be enough.',
        warningIds: [],
        termIds: ['t4', 't5'],
      },
    ],
  },
  {
    id: 'level-3',
    label: 'Level 3: Essential gist',
    shortLabel: 'Essential gist',
    description: 'Shows the shortest reading-support version with stronger warnings.',
    readability: 91,
    fidelity: 58,
    blocks: [
      {
        id: 'l3-b1',
        sourceIds: ['o1', 'o2'],
        text: 'Supplier takes financial responsibility for certain Customer losses caused by Supplier-related problems.',
        warningIds: ['w1', 'w2'],
        termIds: ['t1'],
      },
      {
        id: 'l3-b2',
        sourceIds: ['o3'],
        text: 'Customer may seek a court order when money would not solve the issue.',
        warningIds: ['w3'],
        termIds: ['t4'],
      },
    ],
  },
]

const sampleDocument: DemoDocument = {
  originalText: sampleClauseText,
  originalSegments: sampleSegments,
  levels: sampleLevels,
  warnings: sampleWarnings,
  terms: sampleTerms,
}

const termDictionary = [
  {
    phrase: 'indemnify',
    explanation: 'A duty to reimburse or cover another party for specified losses.',
    legalFunction: 'Allocates financial responsibility.',
  },
  {
    phrase: 'hold harmless',
    explanation: 'A promise that another party should not bear certain losses.',
    legalFunction: 'Reinforces risk shifting.',
  },
  {
    phrase: 'injunctive relief',
    explanation: 'A court order requiring action or stopping action.',
    legalFunction: 'Provides a non-money remedy.',
  },
  {
    phrase: "attorneys' fees",
    explanation: 'Costs charged by lawyers.',
    legalFunction: 'Identifies legal costs that may be recoverable.',
  },
  {
    phrase: 'material breach',
    explanation: 'A serious failure to perform a contract duty.',
    legalFunction: 'May trigger stronger remedies or termination rights.',
  },
]

export function createDemoDocument(inputText: string): DemoDocument {
  if (normalize(inputText) === normalize(sampleClauseText)) {
    return sampleDocument
  }

  const originalSegments = splitIntoSegments(inputText)
  const sourceIds = originalSegments.map((segment) => segment.id)
  const customTerms = createDetectedTerms(inputText, sourceIds)
  const levels = createCustomLevels(inputText, sourceIds, customTerms)
  const warnings = createCustomWarnings(sourceIds, levels.map((level) => level.id))

  return {
    originalText: inputText,
    originalSegments,
    levels,
    warnings,
    terms: customTerms,
  }
}

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function splitIntoSegments(inputText: string): OriginalSegment[] {
  const parts = inputText
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const safeParts = parts.length > 0 ? parts : ['Paste a clause to generate a local demo.']

  return safeParts.slice(0, 5).map((text, index) => ({
    id: `o${index + 1}`,
    label: `O${index + 1}`,
    text,
  }))
}

function createDetectedTerms(inputText: string, sourceIds: string[]): LegalTerm[] {
  const lowerText = inputText.toLowerCase()

  return termDictionary
    .filter((term) => lowerText.includes(term.phrase.toLowerCase()))
    .map((term, index) => ({
      id: `t${index + 1}`,
      phrase: term.phrase,
      explanation: term.explanation,
      legalFunction: term.legalFunction,
      sourceIds,
      blockIds: ['custom-l0-b1', 'custom-l1-b1', 'custom-l2-b1'],
      caution: 'This is a reading-support explanation, not legal advice.',
    }))
}

function createCustomLevels(
  inputText: string,
  sourceIds: string[],
  terms: LegalTerm[],
): SimplificationLevel[] {
  const trimmed = inputText.trim() || 'No clause text was provided.'
  const termIds = terms.map((term) => term.id)
  const plain = simplifyText(trimmed)

  return [
    {
      id: 'custom-level-0',
      label: 'Level 0: Clause-preserving view',
      shortLabel: 'Close view',
      description: 'Keeps the pasted clause intact for comparison.',
      readability: 28,
      fidelity: 94,
      blocks: [
        {
          id: 'custom-l0-b1',
          sourceIds,
          text: trimmed,
          warningIds: [],
          termIds,
        },
      ],
    },
    {
      id: 'custom-level-1',
      label: 'Level 1: Light plain-language rewrite',
      shortLabel: 'Light rewrite',
      description: 'Applies local wording substitutions and keeps a close trace.',
      readability: 55,
      fidelity: 78,
      blocks: [
        {
          id: 'custom-l1-b1',
          sourceIds,
          text: plain,
          warningIds: ['custom-w1'],
          termIds,
        },
      ],
    },
    {
      id: 'custom-level-2',
      label: 'Level 2: Reading-support gist',
      shortLabel: 'Gist',
      description: 'Compresses the clause and warns that details need inspection.',
      readability: 82,
      fidelity: 55,
      blocks: [
        {
          id: 'custom-l2-b1',
          sourceIds,
          text:
            'This clause appears to assign duties, risks, or remedies between the parties. Inspect the original wording before relying on this summary.',
          warningIds: ['custom-w1', 'custom-w2'],
          termIds,
        },
      ],
    },
  ]
}

function createCustomWarnings(sourceIds: string[], levelIds: string[]): FidelityWarning[] {
  return [
    {
      id: 'custom-w1',
      kind: 'uncertain',
      severity: 'caution',
      title: 'Local demo simplification',
      message:
        'This fallback uses deterministic wording rules, so legal nuance may not be preserved.',
      sourceIds,
      blockIds: ['custom-l1-b1', 'custom-l2-b1'],
      levelIds: levelIds.slice(1),
    },
    {
      id: 'custom-w2',
      kind: 'omission',
      severity: 'serious',
      title: 'Details compressed',
      message:
        'The gist level may omit conditions, exceptions, remedies, time limits, or party-specific duties.',
      sourceIds,
      blockIds: ['custom-l2-b1'],
      levelIds: ['custom-level-2'],
    },
  ]
}

function simplifyText(value: string) {
  return value
    .replace(/\bshall\b/gi, 'must')
    .replace(/\bpursuant to\b/gi, 'under')
    .replace(/\bprior to\b/gi, 'before')
    .replace(/\bsubsequent to\b/gi, 'after')
    .replace(/\bprovided that\b/gi, 'if')
    .replace(/\bin the event that\b/gi, 'if')
    .replace(/\bnotwithstanding\b/gi, 'despite')
}
