'use client'

import type { CSSProperties } from 'react'

export function DesignRationale() {
  return (
    <details style={styles.card}>
      <summary style={styles.summary}>Design Rationale</summary>
      <div style={styles.body}>
        <p>
          This prototype studies the readability-fidelity tradeoff in legal
          simplification. The original clause stays visible to preserve context while
          the slider lets users compare different reading-support levels.
        </p>
        <p>
          Trace links show where simplified text comes from. Fidelity notes reveal
          possible compression, omission, or generalization, and term explanations
          provide contextual support for legal phrases.
        </p>
      </div>
    </details>
  )
}

const styles = {
  card: {
    marginBottom: '22px',
    border: '1px solid var(--line)',
    borderRadius: '18px',
    background: 'rgba(251, 248, 241, 0.78)',
    boxShadow: '0 8px 18px rgba(39, 44, 48, 0.04)',
  },
  summary: {
    padding: '13px 15px',
    color: 'var(--accent-dark)',
    fontSize: '13px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  body: {
    display: 'grid',
    gap: '8px',
    padding: '0 15px 15px',
    color: 'var(--slate)',
    fontSize: '14px',
    lineHeight: 1.55,
  },
} satisfies Record<string, CSSProperties>
