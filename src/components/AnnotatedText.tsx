'use client'

import { useState, type CSSProperties, type MouseEvent } from 'react'
import type { TermItem } from '../lib/types'
import { TermPopover } from './TermPopover'

type AnnotatedTextProps = {
  text: string
  terms: TermItem[]
  selectedTermId?: string
  onSelectTerm: (termId: string) => void
}

type TextPart =
  | { type: 'text'; text: string }
  | { type: 'term'; text: string; term: TermItem }

export function AnnotatedText({
  text,
  terms,
  selectedTermId,
  onSelectTerm,
}: AnnotatedTextProps) {
  const [openTerm, setOpenTerm] = useState<{ termId: string; anchorRect: DOMRect } | null>(null)
  const parts = getAnnotatedParts(text, terms)

  return (
    <p style={styles.text}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={`${part.text}-${index}`}>{part.text}</span>
        }

        const isOpen = openTerm?.termId === part.term.id
        const isSelected = selectedTermId === part.term.id

        return (
          <span
            key={`${part.term.id}-${index}`}
            style={styles.termWrap}
          >
            <button
              type="button"
              style={{
                ...styles.termButton,
                ...(isSelected ? styles.termButtonSelected : {}),
              }}
              onMouseEnter={(event) => openPopover(event.currentTarget, part.term.id, setOpenTerm)}
              onMouseLeave={() => setOpenTerm(null)}
              onFocus={(event) => openPopover(event.currentTarget, part.term.id, setOpenTerm)}
              onBlur={() => setOpenTerm(null)}
              onClick={(event) => handleTermClick(event, part.term.id, onSelectTerm)}
            >
              <span>{part.text}</span>
              <span aria-hidden="true" style={styles.infoIcon}>
                i
              </span>
            </button>
            {isOpen && openTerm && (
              <TermPopover term={part.term} anchorRect={openTerm.anchorRect} />
            )}
          </span>
        )
      })}
    </p>
  )
}

function openPopover(
  element: HTMLElement,
  termId: string,
  setOpenTerm: (value: { termId: string; anchorRect: DOMRect }) => void,
) {
  setOpenTerm({ termId, anchorRect: element.getBoundingClientRect() })
}

function handleTermClick(
  event: MouseEvent<HTMLButtonElement>,
  termId: string,
  onSelectTerm: (termId: string) => void,
) {
  event.stopPropagation()
  onSelectTerm(termId)
}

function getAnnotatedParts(text: string, terms: TermItem[]): TextPart[] {
  const sortedTerms = [...terms]
    .filter((term) => term.term.trim().length > 0)
    .sort((a, b) => b.term.length - a.term.length)
  const parts: TextPart[] = []
  let cursor = 0

  while (cursor < text.length) {
    const match = findNextMatch(text, sortedTerms, cursor)

    if (!match) {
      parts.push({ type: 'text', text: text.slice(cursor) })
      break
    }

    if (match.index > cursor) {
      parts.push({ type: 'text', text: text.slice(cursor, match.index) })
    }

    parts.push({
      type: 'term',
      text: text.slice(match.index, match.index + match.term.term.length),
      term: match.term,
    })
    cursor = match.index + match.term.term.length
  }

  return parts
}

function findNextMatch(text: string, terms: TermItem[], startIndex: number) {
  let bestMatch: { index: number; term: TermItem } | null = null

  for (const term of terms) {
    const index = text.indexOf(term.term, startIndex)

    if (index === -1) {
      continue
    }

    if (
      !bestMatch ||
      index < bestMatch.index ||
      (index === bestMatch.index && term.term.length > bestMatch.term.term.length)
    ) {
      bestMatch = { index, term }
    }
  }

  return bestMatch
}

const styles = {
  text: {
    margin: 0,
    color: '#2f3b45',
    fontSize: '15px',
    lineHeight: 1.78,
    overflowWrap: 'anywhere',
  },
  termWrap: {
    position: 'relative',
    display: 'inline-block',
  },
  termButton: {
    display: 'inline-flex',
    gap: '4px',
    alignItems: 'center',
    padding: '1px 3px',
    border: 0,
    borderBottom: '1px dotted var(--accent-dark)',
    borderRadius: '5px',
    color: 'var(--accent-dark)',
    background: 'rgba(220, 235, 230, 0.4)',
    fontWeight: 800,
    cursor: 'pointer',
  },
  termButtonSelected: {
    borderBottomStyle: 'solid',
    background: 'var(--accent-soft)',
    boxShadow: '0 0 0 2px rgba(47, 118, 109, 0.14)',
  },
  infoIcon: {
    display: 'inline-grid',
    width: '14px',
    height: '14px',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fffdf8',
    background: 'var(--accent)',
    fontSize: '9px',
    fontWeight: 900,
    lineHeight: 1,
  },
} satisfies Record<string, CSSProperties>
