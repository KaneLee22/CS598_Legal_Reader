'use client'

import { useMemo, useState } from 'react'
import type { ActiveSelection, AnalysisResult, HoverTarget, LevelNumber } from '../lib/types'
import { InspectPanel } from './InspectPanel'
import { OriginalPane } from './OriginalPane'
import { SimplifiedPane } from './SimplifiedPane'

type ReaderWorkspaceProps = {
  result: AnalysisResult
  activeLevel: LevelNumber
  onLevelChange: (level: LevelNumber) => void
}

export function ReaderWorkspace({ result, activeLevel, onLevelChange }: ReaderWorkspaceProps) {
  const [hoverTarget, setHoverTarget] = useState<HoverTarget>(null)
  const [activeSelection, setActiveSelection] = useState<ActiveSelection>(null)
  const currentLevel =
    result.levels.find((levelView) => levelView.level === activeLevel) ?? result.levels[0]
  const highlighted = useMemo(
    () =>
      getBlockHighlights(
        currentLevel.blocks,
        result.fidelityNotes,
        result.terms,
        hoverTarget,
        activeSelection,
      ),
    [activeSelection, currentLevel.blocks, hoverTarget, result.fidelityNotes, result.terms],
  )

  return (
    <section className="reader-workspace" aria-label="Reader workspace">
      <OriginalPane
        blocks={result.originalBlocks}
        hoveredBlockIds={highlighted.hoveredOriginalBlockIds}
        selectedBlockIds={highlighted.selectedOriginalBlockIds}
        onHoverBlock={(blockId) => setHoverTarget({ type: 'original-block', blockId })}
        onLeaveBlock={() => setHoverTarget(null)}
        onSelectBlock={(blockId) => setActiveSelection({ type: 'original-block', blockId })}
      />
      <SimplifiedPane
        currentLevel={currentLevel}
        activeLevel={activeLevel}
        onLevelChange={onLevelChange}
        fidelityNotes={result.fidelityNotes}
        terms={result.terms}
        hoveredBlockIds={highlighted.hoveredSimplifiedBlockIds}
        selectedBlockIds={highlighted.selectedSimplifiedBlockIds}
        selectedNoteId={
          activeSelection?.type === 'fidelity-note' ? activeSelection.noteId : undefined
        }
        selectedTermId={activeSelection?.type === 'term' ? activeSelection.termId : undefined}
        onHoverBlock={(blockId) => setHoverTarget({ type: 'simplified-block', blockId })}
        onLeaveBlock={() => setHoverTarget(null)}
        onSelectBlock={(blockId) => setActiveSelection({ type: 'simplified-block', blockId })}
        onSelectFidelityNote={(noteId) => setActiveSelection({ type: 'fidelity-note', noteId })}
        onSelectTerm={(termId) => setActiveSelection({ type: 'term', termId })}
      />
      <InspectPanel
        analysisResult={result}
        currentLevel={currentLevel}
        activeSelection={activeSelection}
        onClose={() => setActiveSelection(null)}
      />
    </section>
  )
}

function getBlockHighlights(
  simplifiedBlocks: { id: string; sourceBlockIds: string[]; termIds: string[] }[],
  fidelityNotes: { id: string; blockId: string }[],
  terms: { id: string; sourceBlockId: string }[],
  hoverTarget: HoverTarget,
  activeSelection: ActiveSelection,
) {
  const hoveredOriginalBlockIds = new Set<string>()
  const hoveredSimplifiedBlockIds = new Set<string>()
  const selectedOriginalBlockIds = new Set<string>()
  const selectedSimplifiedBlockIds = new Set<string>()

  applyTargetHighlight(
    hoverTarget,
    simplifiedBlocks,
    fidelityNotes,
    terms,
    hoveredOriginalBlockIds,
    hoveredSimplifiedBlockIds,
  )
  applyTargetHighlight(
    activeSelection,
    simplifiedBlocks,
    fidelityNotes,
    terms,
    selectedOriginalBlockIds,
    selectedSimplifiedBlockIds,
  )

  return {
    hoveredOriginalBlockIds: hoveredOriginalBlockIds,
    hoveredSimplifiedBlockIds: hoveredSimplifiedBlockIds,
    selectedOriginalBlockIds: selectedOriginalBlockIds,
    selectedSimplifiedBlockIds: selectedSimplifiedBlockIds,
  }
}

function applyTargetHighlight(
  target: ActiveSelection | HoverTarget,
  simplifiedBlocks: { id: string; sourceBlockIds: string[]; termIds: string[] }[],
  fidelityNotes: { id: string; blockId: string }[],
  terms: { id: string; sourceBlockId: string }[],
  originalIds: Set<string>,
  simplifiedIds: Set<string>,
) {
  if (!target) {
    return
  }

  if (target.type === 'original-block') {
    originalIds.add(target.blockId)
    simplifiedBlocks
      .filter((block) => block.sourceBlockIds.includes(target.blockId))
      .forEach((block) => simplifiedIds.add(block.id))
    return
  }

  if (target.type === 'simplified-block') {
    simplifiedIds.add(target.blockId)
    simplifiedBlocks
      .find((block) => block.id === target.blockId)
      ?.sourceBlockIds.forEach((sourceBlockId) => originalIds.add(sourceBlockId))
    return
  }

  if (target.type === 'fidelity-note') {
    const note = fidelityNotes.find((item) => item.id === target.noteId)
    const block = simplifiedBlocks.find((item) => item.id === note?.blockId)

    if (!block) {
      return
    }

    simplifiedIds.add(block.id)
    block.sourceBlockIds.forEach((sourceBlockId) => originalIds.add(sourceBlockId))
    return
  }

  if (target.type === 'term') {
    const term = terms.find((item) => item.id === target.termId)

    if (term) {
      originalIds.add(term.sourceBlockId)
    }

    simplifiedBlocks
      .filter((block) => block.termIds.includes(target.termId))
      .forEach((block) => simplifiedIds.add(block.id))
  }
}
