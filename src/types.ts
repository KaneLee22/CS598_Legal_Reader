export type Severity = 'notice' | 'caution' | 'serious'

export type OriginalSegment = {
  id: string
  label: string
  text: string
}

export type LegalTerm = {
  id: string
  phrase: string
  explanation: string
  legalFunction: string
  sourceIds: string[]
  blockIds: string[]
  caution: string
}

export type FidelityWarning = {
  id: string
  kind: 'omission' | 'scope-shift' | 'merged-duty' | 'uncertain'
  severity: Severity
  title: string
  message: string
  sourceIds: string[]
  blockIds: string[]
  levelIds: string[]
}

export type SimplifiedBlock = {
  id: string
  sourceIds: string[]
  text: string
  warningIds: string[]
  termIds: string[]
}

export type SimplificationLevel = {
  id: string
  label: string
  shortLabel: string
  description: string
  readability: number
  fidelity: number
  blocks: SimplifiedBlock[]
}

export type DemoDocument = {
  originalText: string
  originalSegments: OriginalSegment[]
  levels: SimplificationLevel[]
  warnings: FidelityWarning[]
  terms: LegalTerm[]
}

export type InspectTarget =
  | { kind: 'overview' }
  | { kind: 'source'; id: string }
  | { kind: 'block'; id: string }
  | { kind: 'warning'; id: string }
  | { kind: 'term'; id: string }
