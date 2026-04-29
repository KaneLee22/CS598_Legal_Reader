const levelEnum = [0, 1, 2, 3] as const

const fidelityNoteTypeEnum = [
  'Condition Compressed',
  'Condition Omitted',
  'Exception Compressed',
  'Exception Omitted',
  'Notice Requirement Simplified',
  'Timing Detail Simplified',
  'Legal Term Generalized',
  'Liability Detail Compressed',
  'Meaning Preserved',
] as const

const severityEnum = ['info', 'low', 'medium', 'high'] as const

const originalBlockSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'text'],
  properties: {
    id: { type: 'string' },
    text: { type: 'string' },
  },
} as const

const simplifiedBlockSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'level', 'sourceBlockIds', 'text', 'fidelityNoteIds', 'termIds'],
  properties: {
    id: { type: 'string' },
    level: { type: 'integer', enum: levelEnum },
    sourceBlockIds: {
      type: 'array',
      items: { type: 'string' },
    },
    text: { type: 'string' },
    fidelityNoteIds: {
      type: 'array',
      items: { type: 'string' },
    },
    termIds: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const

const fidelityNoteSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'blockId', 'level', 'type', 'severity', 'message', 'whyItMatters'],
  properties: {
    id: { type: 'string' },
    blockId: { type: 'string' },
    level: { type: 'integer', enum: levelEnum },
    type: { type: 'string', enum: fidelityNoteTypeEnum },
    severity: { type: 'string', enum: severityEnum },
    message: { type: 'string' },
    whyItMatters: { type: 'string' },
  },
} as const

const termItemSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'term', 'sourceBlockId', 'plainExplanation', 'whyItMatters', 'example'],
  properties: {
    id: { type: 'string' },
    term: { type: 'string' },
    sourceBlockId: { type: 'string' },
    plainExplanation: { type: 'string' },
    whyItMatters: { type: 'string' },
    example: { type: 'string' },
  },
} as const

const levelViewSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['level', 'blocks'],
  properties: {
    level: { type: 'integer', enum: levelEnum },
    blocks: {
      type: 'array',
      items: simplifiedBlockSchema,
    },
  },
} as const

export const analysisSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://legal-reader.local/schemas/analysis-result.schema.json',
  title: 'AnalysisResult',
  type: 'object',
  additionalProperties: false,
  required: ['originalText', 'originalBlocks', 'levels', 'fidelityNotes', 'terms'],
  properties: {
    originalText: { type: 'string' },
    originalBlocks: {
      type: 'array',
      items: originalBlockSchema,
    },
    levels: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: levelViewSchema,
    },
    fidelityNotes: {
      type: 'array',
      items: fidelityNoteSchema,
    },
    terms: {
      type: 'array',
      items: termItemSchema,
    },
  },
} as const
