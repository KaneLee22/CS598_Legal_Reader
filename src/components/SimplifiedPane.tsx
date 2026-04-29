'use client'

import { motion } from 'framer-motion'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { FidelityNote, LevelNumber, LevelView, TermItem } from '../lib/types'
import { AnnotatedText } from './AnnotatedText'
import { FidelityNoteBadge } from './FidelityNoteBadge'

type SimplifiedPaneProps = {
  currentLevel: LevelView
  activeLevel: LevelNumber
  onLevelChange: (level: LevelNumber) => void
  fidelityNotes: FidelityNote[]
  terms: TermItem[]
  hoveredBlockIds: Set<string>
  selectedBlockIds: Set<string>
  selectedNoteId?: string
  selectedTermId?: string
  onHoverBlock: (blockId: string) => void
  onLeaveBlock: () => void
  onSelectBlock: (blockId: string) => void
  onSelectFidelityNote: (noteId: string) => void
  onSelectTerm: (termId: string) => void
}

const levelLabels: Record<LevelNumber, string> = {
  0: 'Original',
  1: 'Closer to Original',
  2: 'Balanced',
  3: 'More Guided',
}

export function SimplifiedPane({
  currentLevel,
  activeLevel,
  onLevelChange,
  fidelityNotes,
  terms,
  hoveredBlockIds,
  selectedBlockIds,
  selectedNoteId,
  selectedTermId,
  onHoverBlock,
  onLeaveBlock,
  onSelectBlock,
  onSelectFidelityNote,
  onSelectTerm,
}: SimplifiedPaneProps) {
  return (
    <section style={styles.pane} aria-label="Simplified view pane">
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <p style={styles.kicker}>Simplified View</p>
            <h2 style={styles.title}>
              Level {currentLevel.level}: {levelLabels[currentLevel.level]}
            </h2>
          </div>
          <LevelTabs activeLevel={activeLevel} onLevelChange={onLevelChange} />
        </div>
      </div>

      <div style={styles.blockStack}>
        {currentLevel.blocks.map((block, index) => {
          const isHovered = hoveredBlockIds.has(block.id)
          const isSelected = selectedBlockIds.has(block.id)
          const blockNotes = block.fidelityNoteIds
            .map((noteId) => fidelityNotes.find((note) => note.id === noteId))
            .filter((note): note is FidelityNote => Boolean(note))
          const blockTerms = block.termIds
            .map((termId) => terms.find((term) => term.id === termId))
            .filter((term): term is TermItem => Boolean(term))

          return (
            <motion.article
              key={block.id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.025 }}
              style={{
                ...styles.blockCard,
                ...(isHovered ? styles.blockCardHovered : {}),
                ...(isSelected ? styles.blockCardSelected : {}),
              }}
              onMouseEnter={() => onHoverBlock(block.id)}
              onMouseLeave={onLeaveBlock}
              onFocus={() => onHoverBlock(block.id)}
              onBlur={onLeaveBlock}
              onClick={() => onSelectBlock(block.id)}
              onKeyDown={(event) => handleBlockKeyDown(event, block.id, onSelectBlock)}
            >
              <div style={styles.metaRow}>
                <span style={styles.blockLabel}>S{index + 1}</span>
                <span style={styles.sourceLabel}>
                  Maps to {block.sourceBlockIds.map((id) => id.toUpperCase()).join(', ')}
                </span>
              </div>
              <AnnotatedText
                text={block.text}
                terms={blockTerms}
                selectedTermId={selectedTermId}
                onSelectTerm={onSelectTerm}
              />
              {blockNotes.length > 0 && (
                <div style={styles.noteRow} aria-label="Fidelity Notes">
                  {blockNotes.map((note) => (
                    <FidelityNoteBadge
                      key={note.id}
                      note={note}
                      selected={selectedNoteId === note.id}
                      onSelect={onSelectFidelityNote}
                    />
                  ))}
                </div>
              )}
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}

function LevelTabs({
  activeLevel,
  onLevelChange,
}: {
  activeLevel: LevelNumber
  onLevelChange: (level: LevelNumber) => void
}) {
  const tabs: Array<{ level: LevelNumber; label: string }> = [
    { level: 0, label: 'Original' },
    { level: 1, label: 'Closer' },
    { level: 2, label: 'Balanced' },
    { level: 3, label: 'More Guided' },
  ]

  return (
    <div style={styles.levelTabs} aria-label="Simplification level selector">
      {tabs.map((tab) => (
        <button
          key={tab.level}
          type="button"
          onClick={() => onLevelChange(tab.level)}
          style={{
            ...styles.levelTab,
            ...(activeLevel === tab.level ? styles.levelTabActive : {}),
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function handleBlockKeyDown(
  event: KeyboardEvent<HTMLElement>,
  blockId: string,
  onSelectBlock: (blockId: string) => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  onSelectBlock(blockId)
}

const styles = {
  pane: {
    minHeight: '620px',
    border: '1px solid var(--line)',
    borderRadius: '24px',
    background: 'var(--card)',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    padding: '18px 18px 16px',
    borderBottom: '1px solid var(--line)',
    background: 'rgba(255, 253, 248, 0.96)',
    backdropFilter: 'blur(12px)',
  },
  headerTop: {
    display: 'grid',
    gap: '12px',
  },
  kicker: {
    margin: '0 0 5px',
    color: 'var(--accent-dark)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    color: 'var(--ink)',
    fontSize: '22px',
    letterSpacing: '-0.025em',
  },
  levelTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '4px',
    padding: '4px',
    border: '1px solid var(--line)',
    borderRadius: '14px',
    background: 'var(--card-muted)',
  },
  levelTab: {
    minHeight: '34px',
    padding: '0 8px',
    border: '1px solid transparent',
    borderRadius: '10px',
    color: 'var(--muted)',
    background: 'transparent',
    fontSize: '12px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  levelTabActive: {
    borderColor: 'rgba(47, 118, 109, 0.24)',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    boxShadow: '0 6px 14px rgba(47, 118, 109, 0.08)',
  },
  blockStack: {
    display: 'grid',
    gap: '15px',
    padding: '18px',
  },
  blockCard: {
    display: 'grid',
    gap: '10px',
    width: '100%',
    padding: '17px',
    border: '1px solid #d5ded8',
    borderRadius: '18px',
    color: 'inherit',
    background: '#f8fbf8',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, background 150ms ease, box-shadow 150ms ease, transform 150ms ease',
  },
  blockCardHovered: {
    borderColor: '#8fb9ae',
    background: '#eef7f3',
    transform: 'translateY(-1px)',
  },
  blockCardSelected: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-soft)',
    boxShadow: 'inset 0 0 0 1px rgba(47, 118, 109, 0.28)',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockLabel: {
    padding: '4px 8px',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '12px',
    fontWeight: 800,
  },
  sourceLabel: {
    padding: '4px 8px',
    border: '1px solid #c9d9d4',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: '#eef7f3',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  noteRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    paddingTop: '4px',
  },
} satisfies Record<string, CSSProperties>
