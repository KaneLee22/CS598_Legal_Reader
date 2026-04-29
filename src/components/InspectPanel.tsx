'use client'

import type { CSSProperties, ReactNode } from 'react'
import type {
  ActiveSelection,
  AnalysisResult,
  FidelityNote,
  LevelView,
  OriginalBlock,
  SimplifiedBlock,
  TermItem,
} from '../lib/types'

type InspectPanelProps = {
  analysisResult: AnalysisResult
  currentLevel: LevelView
  activeSelection: ActiveSelection
  onClose: () => void
}

export function InspectPanel({
  analysisResult,
  currentLevel,
  activeSelection,
  onClose,
}: InspectPanelProps) {
  const content = getInspectContent(analysisResult, currentLevel, activeSelection)

  return (
    <aside style={styles.panel} aria-label="Inspect panel">
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Inspect Panel</p>
          <h2 style={styles.title}>{content.title}</h2>
        </div>
        {activeSelection && (
          <button type="button" style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div style={styles.content}>{content.body}</div>
    </aside>
  )
}

function getInspectContent(
  analysisResult: AnalysisResult,
  currentLevel: LevelView,
  activeSelection: ActiveSelection,
) {
  if (!activeSelection) {
    return {
      title: 'Selection details',
      body: (
        <EmptyState>
          Select a block, fidelity note, or legal term to inspect what changed.
        </EmptyState>
      ),
    }
  }

  if (activeSelection.type === 'original-block') {
    const originalBlock = analysisResult.originalBlocks.find(
      (block) => block.id === activeSelection.blockId,
    )
    const relatedSimplifiedBlocks = currentLevel.blocks.filter((block) =>
      block.sourceBlockIds.includes(activeSelection.blockId),
    )
    const relatedTerms = analysisResult.terms.filter(
      (term) => term.sourceBlockId === activeSelection.blockId,
    )

    return {
      title: 'Inspecting Source Block',
      body: (
        <>
          <Section title="Original source block">
            <TextCard label={formatOriginalId(originalBlock?.id)} text={originalBlock?.text} />
          </Section>
          <Section title="Related simplified block(s) at current level">
            <SimplifiedBlockList blocks={relatedSimplifiedBlocks} />
          </Section>
          <Section title="Related legal terms">
            <TermList terms={relatedTerms} />
          </Section>
        </>
      ),
    }
  }

  if (activeSelection.type === 'simplified-block') {
    const simplifiedBlock = currentLevel.blocks.find(
      (block) => block.id === activeSelection.blockId,
    )
    const originalBlocks = getOriginalBlocks(analysisResult, simplifiedBlock?.sourceBlockIds ?? [])
    const fidelityNotes = getFidelityNotes(analysisResult, simplifiedBlock?.fidelityNoteIds ?? [])
    const relatedTerms = getTerms(analysisResult, simplifiedBlock?.termIds ?? [])

    return {
      title: 'Inspecting Simplified Block',
      body: (
        <>
          <Section title="Current simplification">
            <TextCard label={simplifiedBlock?.id.toUpperCase()} text={simplifiedBlock?.text} />
          </Section>
          <Section title="Original source block(s)">
            <OriginalBlockList blocks={originalBlocks} />
          </Section>
          <Section title="Fidelity notes">
            <FidelityNoteList notes={fidelityNotes} />
          </Section>
          <Section title="Related legal terms">
            <TermList terms={relatedTerms} />
          </Section>
        </>
      ),
    }
  }

  if (activeSelection.type === 'fidelity-note') {
    const note = analysisResult.fidelityNotes.find((item) => item.id === activeSelection.noteId)
    const simplifiedBlock = currentLevel.blocks.find((block) => block.id === note?.blockId)
    const originalBlocks = getOriginalBlocks(analysisResult, simplifiedBlock?.sourceBlockIds ?? [])

    return {
      title: note?.type ?? 'Inspecting Fidelity Note',
      body: (
        <>
          <Section title="Fidelity note type">
            <MetaCard label={note?.type ?? 'Unknown note'} value={`Severity: ${note?.severity ?? 'unknown'}`} />
          </Section>
          <Section title="Message">
            <Paragraph>{note?.message ?? 'This fidelity note is not available.'}</Paragraph>
          </Section>
          <Section title="Why it matters">
            <Paragraph>{note?.whyItMatters ?? 'No rationale is available.'}</Paragraph>
          </Section>
          <Section title="Original source">
            <OriginalBlockList blocks={originalBlocks} />
          </Section>
          <Section title="Current simplification">
            <TextCard label={simplifiedBlock?.id.toUpperCase()} text={simplifiedBlock?.text} />
          </Section>
        </>
      ),
    }
  }

  const term = analysisResult.terms.find((item) => item.id === activeSelection.termId)
  const sourceBlock = analysisResult.originalBlocks.find(
    (block) => block.id === term?.sourceBlockId,
  )

  return {
    title: 'Inspecting Legal Term',
    body: (
      <>
        <Section title="Term">
          <MetaCard label={term?.term ?? 'Unknown term'} value="Phrase-level explanation" />
        </Section>
        <Section title="Plain explanation">
          <Paragraph>{term?.plainExplanation ?? 'No explanation is available.'}</Paragraph>
        </Section>
        <Section title="Why it matters">
          <Paragraph>{term?.whyItMatters ?? 'No rationale is available.'}</Paragraph>
        </Section>
        <Section title="Example">
          <Paragraph>{term?.example ?? 'No example is available.'}</Paragraph>
        </Section>
        <Section title="Source block">
          <TextCard label={formatOriginalId(sourceBlock?.id)} text={sourceBlock?.text} />
        </Section>
      </>
    ),
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  )
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div style={styles.emptyState}>
      <p style={styles.emptyText}>{children}</p>
    </div>
  )
}

function Paragraph({ children }: { children: ReactNode }) {
  return <p style={styles.paragraph}>{children}</p>
}

function TextCard({ label, text }: { label?: string; text?: string }) {
  return (
    <article style={styles.textCard}>
      {label && <span style={styles.cardLabel}>{label}</span>}
      <p style={styles.cardText}>{text ?? 'Not available at the current level.'}</p>
    </article>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metaCard}>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  )
}

function OriginalBlockList({ blocks }: { blocks: OriginalBlock[] }) {
  if (blocks.length === 0) {
    return <Paragraph>No original source block is linked.</Paragraph>
  }

  return (
    <div style={styles.list}>
      {blocks.map((block) => (
        <TextCard key={block.id} label={formatOriginalId(block.id)} text={block.text} />
      ))}
    </div>
  )
}

function SimplifiedBlockList({ blocks }: { blocks: SimplifiedBlock[] }) {
  if (blocks.length === 0) {
    return <Paragraph>No simplified block is linked at this level.</Paragraph>
  }

  return (
    <div style={styles.list}>
      {blocks.map((block) => (
        <TextCard key={block.id} label={block.id.toUpperCase()} text={block.text} />
      ))}
    </div>
  )
}

function FidelityNoteList({ notes }: { notes: FidelityNote[] }) {
  if (notes.length === 0) {
    return <Paragraph>No fidelity notes are linked.</Paragraph>
  }

  return (
    <div style={styles.list}>
      {notes.map((note) => (
        <article key={note.id} style={styles.noteCard}>
          <div style={styles.noteHeader}>
            <strong>{note.type}</strong>
            <span>{note.severity}</span>
          </div>
          <p style={styles.cardText}>{note.message}</p>
        </article>
      ))}
    </div>
  )
}

function TermList({ terms }: { terms: TermItem[] }) {
  if (terms.length === 0) {
    return <Paragraph>No legal terms are linked.</Paragraph>
  }

  return (
    <div style={styles.list}>
      {terms.map((term) => (
        <article key={term.id} style={styles.termCard}>
          <strong>{term.term}</strong>
          <p style={styles.cardText}>{term.plainExplanation}</p>
        </article>
      ))}
    </div>
  )
}

function getOriginalBlocks(analysisResult: AnalysisResult, blockIds: string[]) {
  return blockIds
    .map((blockId) => analysisResult.originalBlocks.find((block) => block.id === blockId))
    .filter((block): block is OriginalBlock => Boolean(block))
}

function getFidelityNotes(analysisResult: AnalysisResult, noteIds: string[]) {
  return noteIds
    .map((noteId) => analysisResult.fidelityNotes.find((note) => note.id === noteId))
    .filter((note): note is FidelityNote => Boolean(note))
}

function getTerms(analysisResult: AnalysisResult, termIds: string[]) {
  return termIds
    .map((termId) => analysisResult.terms.find((term) => term.id === termId))
    .filter((term): term is TermItem => Boolean(term))
}

function formatOriginalId(id?: string) {
  return id?.toUpperCase()
}

const styles = {
  panel: {
    position: 'sticky',
    top: '18px',
    maxHeight: 'calc(100vh - 36px)',
    overflow: 'auto',
    border: '1px solid var(--line)',
    borderRadius: '24px',
    background: 'var(--card)',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '18px 18px 16px',
    borderBottom: '1px solid var(--line)',
    background: 'rgba(255, 253, 248, 0.96)',
    backdropFilter: 'blur(12px)',
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
    fontSize: '21px',
    letterSpacing: '-0.025em',
  },
  closeButton: {
    minHeight: '30px',
    padding: '0 10px',
    border: '1px solid rgba(47, 118, 109, 0.2)',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  content: {
    display: 'grid',
    gap: '16px',
    padding: '18px',
  },
  emptyState: {
    minHeight: '220px',
    display: 'grid',
    placeItems: 'center',
    padding: '18px',
    border: '1px dashed var(--line-strong)',
    borderRadius: '18px',
    background: 'var(--card-muted)',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    color: 'var(--slate)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  section: {
    display: 'grid',
    gap: '9px',
  },
  sectionTitle: {
    margin: 0,
    color: 'var(--accent-dark)',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
  },
  paragraph: {
    margin: 0,
    color: 'var(--slate)',
    fontSize: '14px',
    lineHeight: 1.6,
    overflowWrap: 'anywhere',
  },
  list: {
    display: 'grid',
    gap: '9px',
  },
  textCard: {
    display: 'grid',
    gap: '8px',
    padding: '12px',
    border: '1px solid var(--line)',
    borderRadius: '16px',
    background: 'var(--card-muted)',
  },
  cardLabel: {
    width: 'fit-content',
    padding: '3px 7px',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '11px',
    fontWeight: 900,
  },
  cardText: {
    margin: 0,
    color: '#2f3b45',
    fontSize: '13px',
    lineHeight: 1.55,
    overflowWrap: 'anywhere',
  },
  metaCard: {
    display: 'grid',
    gap: '4px',
    padding: '12px',
    border: '1px solid #c9d9d4',
    borderRadius: '14px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '13px',
  },
  noteCard: {
    display: 'grid',
    gap: '8px',
    padding: '12px',
    border: '1px solid #dec48b',
    borderRadius: '14px',
    background: 'var(--amber-soft)',
  },
  noteHeader: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#775116',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  termCard: {
    display: 'grid',
    gap: '6px',
    padding: '12px',
    border: '1px solid #c9d9d4',
    borderRadius: '14px',
    color: 'var(--accent-dark)',
    background: '#eef7f3',
    fontSize: '13px',
  },
} satisfies Record<string, CSSProperties>
