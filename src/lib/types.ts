export type LevelNumber = 0 | 1 | 2 | 3

export type SimplificationLevel = {
  level: LevelNumber
  label: string
  description: string
  fidelityHint: string
}

export type OriginalBlock = {
  id: string
  text: string
}

export type SimplifiedBlock = {
  id: string
  level: LevelNumber
  sourceBlockIds: string[]
  text: string
  fidelityNoteIds: string[]
  termIds: string[]
}

export type FidelityNoteType =
  | 'Condition Compressed'
  | 'Condition Omitted'
  | 'Exception Compressed'
  | 'Exception Omitted'
  | 'Notice Requirement Simplified'
  | 'Timing Detail Simplified'
  | 'Legal Term Generalized'
  | 'Liability Detail Compressed'
  | 'Meaning Preserved'

export type FidelitySeverity = 'info' | 'low' | 'medium' | 'high'

export type FidelityNote = {
  id: string
  blockId: string
  level: LevelNumber
  type: FidelityNoteType
  severity: FidelitySeverity
  message: string
  whyItMatters: string
}

export type TermItem = {
  id: string
  term: string
  sourceBlockId: string
  plainExplanation: string
  whyItMatters: string
  example: string
}

export type LevelView = {
  level: LevelNumber
  blocks: SimplifiedBlock[]
}

export type AnalysisResult = {
  originalText: string
  originalBlocks: OriginalBlock[]
  levels: LevelView[]
  fidelityNotes: FidelityNote[]
  terms: TermItem[]
}

export type ActiveSelection =
  | { type: 'original-block'; blockId: string }
  | { type: 'simplified-block'; blockId: string }
  | { type: 'fidelity-note'; noteId: string }
  | { type: 'term'; termId: string }
  | null

export type HoverTarget =
  | { type: 'original-block'; blockId: string }
  | { type: 'simplified-block'; blockId: string }
  | null
