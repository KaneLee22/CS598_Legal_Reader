'use client'

import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { TermItem } from '../lib/types'

type TermPopoverProps = {
  term: TermItem
  anchorRect: DOMRect
}

const POPOVER_WIDTH = 320
const POPOVER_ESTIMATED_HEIGHT = 245
const VIEWPORT_MARGIN = 14
const ANCHOR_GAP = 8

export function TermPopover({ term, anchorRect }: TermPopoverProps) {
  const position = getPopoverPosition(anchorRect)

  return createPortal(
    <aside style={{ ...styles.popover, left: position.left, top: position.top }} role="tooltip">
      <div style={styles.header}>
        <span style={styles.icon}>i</span>
        <strong style={styles.term}>{term.term}</strong>
      </div>

      <dl style={styles.details}>
        <div>
          <dt style={styles.detailLabel}>Plain explanation</dt>
          <dd style={styles.detailText}>{term.plainExplanation}</dd>
        </div>
        <div>
          <dt style={styles.detailLabel}>Why it matters</dt>
          <dd style={styles.detailText}>{term.whyItMatters}</dd>
        </div>
        <div>
          <dt style={styles.detailLabel}>Example</dt>
          <dd style={styles.detailText}>{term.example}</dd>
        </div>
      </dl>
    </aside>,
    document.body,
  )
}

function getPopoverPosition(anchorRect: DOMRect) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(POPOVER_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2)
  const placeLeft = anchorRect.left + width > viewportWidth - VIEWPORT_MARGIN
  const placeAbove =
    anchorRect.bottom + ANCHOR_GAP + POPOVER_ESTIMATED_HEIGHT >
    viewportHeight - VIEWPORT_MARGIN
  const preferredLeft = placeLeft
    ? anchorRect.right - width
    : anchorRect.left
  const preferredTop = placeAbove
    ? anchorRect.top - ANCHOR_GAP - POPOVER_ESTIMATED_HEIGHT
    : anchorRect.bottom + ANCHOR_GAP

  return {
    left: clamp(preferredLeft, VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
    top: clamp(
      preferredTop,
      VIEWPORT_MARGIN,
      viewportHeight - VIEWPORT_MARGIN - Math.min(POPOVER_ESTIMATED_HEIGHT, viewportHeight),
    ),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

const styles = {
  popover: {
    position: 'fixed',
    zIndex: 1000,
    width: 'min(320px, 80vw)',
    padding: '15px',
    border: '1px solid rgba(47, 118, 109, 0.22)',
    borderRadius: '18px',
    color: '#24313a',
    background: 'var(--card)',
    boxShadow: '0 22px 54px rgba(39, 44, 48, 0.17)',
  },
  header: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  icon: {
    display: 'inline-grid',
    width: '20px',
    height: '20px',
    placeItems: 'center',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '12px',
    fontWeight: 900,
  },
  term: {
    color: 'var(--ink)',
    fontSize: '15px',
  },
  details: {
    display: 'grid',
    gap: '10px',
    margin: 0,
  },
  detailLabel: {
    marginBottom: '3px',
    color: 'var(--accent-dark)',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  detailText: {
    margin: 0,
    color: 'var(--slate)',
    fontSize: '13px',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
} satisfies Record<string, CSSProperties>
