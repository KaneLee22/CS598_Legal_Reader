export function validateAnalysisResult(data: unknown): { valid: boolean; error?: string } {
  if (!isRecord(data)) {
    return invalid('Analysis result must be an object.')
  }

  if (typeof data.originalText !== 'string') {
    return invalid('originalText must be a string.')
  }

  if (!Array.isArray(data.originalBlocks) || data.originalBlocks.length === 0) {
    return invalid('originalBlocks must be a non-empty array.')
  }

  for (const [index, block] of data.originalBlocks.entries()) {
    if (!isRecord(block)) {
      return invalid(`originalBlocks[${index}] must be an object.`)
    }

    if (typeof block.id !== 'string') {
      return invalid(`originalBlocks[${index}].id must be a string.`)
    }

    if (typeof block.text !== 'string') {
      return invalid(`originalBlocks[${index}].text must be a string.`)
    }
  }

  if (!Array.isArray(data.levels) || data.levels.length !== 4) {
    return invalid('levels must be an array with exactly 4 items.')
  }

  for (const [levelIndex, level] of data.levels.entries()) {
    if (!isRecord(level)) {
      return invalid(`levels[${levelIndex}] must be an object.`)
    }

    if (typeof level.level !== 'number') {
      return invalid(`levels[${levelIndex}].level must be a number.`)
    }

    if (!Array.isArray(level.blocks) || level.blocks.length === 0) {
      return invalid(`levels[${levelIndex}].blocks must be a non-empty array.`)
    }

    for (const [blockIndex, block] of level.blocks.entries()) {
      const blockPath = `levels[${levelIndex}].blocks[${blockIndex}]`

      if (!isRecord(block)) {
        return invalid(`${blockPath} must be an object.`)
      }

      if (typeof block.id !== 'string') {
        return invalid(`${blockPath}.id must be a string.`)
      }

      if (typeof block.text !== 'string') {
        return invalid(`${blockPath}.text must be a string.`)
      }

      if (typeof block.level !== 'number') {
        return invalid(`${blockPath}.level must be a number.`)
      }

      if (!isStringArray(block.sourceBlockIds)) {
        return invalid(`${blockPath}.sourceBlockIds must be an array of strings.`)
      }

      if (!isStringArray(block.fidelityNoteIds)) {
        return invalid(`${blockPath}.fidelityNoteIds must be an array of strings.`)
      }

      if (!isStringArray(block.termIds)) {
        return invalid(`${blockPath}.termIds must be an array of strings.`)
      }
    }
  }

  if (!Array.isArray(data.fidelityNotes)) {
    return invalid('fidelityNotes must be an array.')
  }

  for (const [index, note] of data.fidelityNotes.entries()) {
    if (!isRecord(note)) {
      return invalid(`fidelityNotes[${index}] must be an object.`)
    }

    if (typeof note.id !== 'string') {
      return invalid(`fidelityNotes[${index}].id must be a string.`)
    }

    if (typeof note.blockId !== 'string') {
      return invalid(`fidelityNotes[${index}].blockId must be a string.`)
    }
  }

  if (!Array.isArray(data.terms)) {
    return invalid('terms must be an array.')
  }

  for (const [index, term] of data.terms.entries()) {
    if (!isRecord(term)) {
      return invalid(`terms[${index}] must be an object.`)
    }

    if (typeof term.id !== 'string') {
      return invalid(`terms[${index}].id must be a string.`)
    }

    if (typeof term.sourceBlockId !== 'string') {
      return invalid(`terms[${index}].sourceBlockId must be a string.`)
    }
  }

  return { valid: true }
}

function invalid(error: string) {
  return { valid: false, error }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
