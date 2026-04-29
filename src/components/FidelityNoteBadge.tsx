'use client'

import type { CSSProperties, MouseEvent } from 'react'
import type { FidelityNote, FidelitySeverity } from '../lib/types'

type FidelityNoteBadgeProps = {
  note: FidelityNote
  selected: boolean
  onSelect: (noteId: string) => void
}

export function FidelityNoteBadge({ note, selected, onSelect }: FidelityNoteBadgeProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onSelect(note.id)
  }

  return (
    <button
      type="button"
      title={note.message}
      aria-label={`Fidelity Note: ${note.type}. ${note.message}`}
      onClick={handleClick}
      style={{
        ...styles.badge,
        ...severityStyles[note.severity],
        ...(selected ? styles.selected : {}),
      }}
    >
      <span style={styles.prefix}>Fidelity Note</span>
      <span>{note.type}</span>
    </button>
  )
}

const styles = {
  badge: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '2px',
    maxWidth: '100%',
    padding: '8px 10px',
    border: '1px solid var(--line)',
    borderRadius: '14px',
    textAlign: 'left',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(39, 44, 48, 0.04)',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, background 150ms ease',
  },
  selected: {
    boxShadow: 'inset 0 0 0 1px rgba(47, 118, 109, 0.35), 0 10px 18px rgba(47, 118, 109, 0.08)',
    borderColor: 'var(--accent)',
    transform: 'translateY(-1px)',
  },
  prefix: {
    fontSize: '10px',
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    opacity: 0.78,
  },
} satisfies Record<string, CSSProperties>

const severityStyles: Record<FidelitySeverity, CSSProperties> = {
  info: {
    color: 'var(--slate)',
    background: '#f1f3f2',
    borderColor: '#d7dcda',
  },
  low: {
    color: '#365e8c',
    background: '#e8f0f7',
    borderColor: '#c9d8e7',
  },
  medium: {
    color: 'var(--amber)',
    background: 'var(--amber-soft)',
    borderColor: '#dec48b',
  },
  high: {
    color: 'var(--danger)',
    background: 'var(--danger-soft)',
    borderColor: '#e2afa8',
  },
}
