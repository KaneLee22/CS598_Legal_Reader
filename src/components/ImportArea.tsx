'use client'

import type { CSSProperties } from 'react'

export const RECOMMENDED_INPUT_LIMIT = 4000
const VERY_SHORT_THRESHOLD = 80

type ImportAreaProps = {
  value: string
  disabled: boolean
  onChange: (value: string) => void
}

export function ImportArea({ value, disabled, onChange }: ImportAreaProps) {
  const trimmedLength = value.trim().length
  const isEmpty = trimmedLength === 0
  const isVeryShort = trimmedLength > 0 && trimmedLength < VERY_SHORT_THRESHOLD
  const isTooLong = value.length > RECOMMENDED_INPUT_LIMIT

  return (
    <section style={styles.shell} aria-label="Import legal clause">
      <div style={styles.headerRow}>
        <label style={styles.label} htmlFor="legal-text">
          Legal clause
        </label>
        <span style={{ ...styles.counter, ...(isTooLong ? styles.counterAlert : {}) }}>
          {value.length.toLocaleString()} / {RECOMMENDED_INPUT_LIMIT.toLocaleString()} characters
        </span>
      </div>

      <textarea
        id="legal-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={9}
        style={{
          ...styles.textarea,
          ...(isTooLong ? styles.textareaAlert : {}),
        }}
        disabled={disabled}
      />

      <p style={styles.privacyNote}>
        For demo use only. Do not paste confidential or sensitive legal documents.
      </p>

      <div style={styles.helperRow} aria-live="polite">
        {isEmpty && <span style={styles.helperText}>Paste a clause to generate reading support.</span>}
        {isVeryShort && (
          <span style={styles.softWarning}>
            This works best with a complete contract clause.
          </span>
        )}
        {isTooLong && (
          <span style={styles.strongWarning}>
            Please use a shorter clause for this prototype.
          </span>
        )}
        {!isEmpty && !isVeryShort && !isTooLong && (
          <span style={styles.helperText}>Recommended limit: 4000 characters.</span>
        )}
      </div>
    </section>
  )
}

export function canGenerateFromInput(value: string) {
  return value.trim().length > 0 && value.length <= RECOMMENDED_INPUT_LIMIT
}

const styles = {
  shell: {
    display: 'grid',
    gap: '12px',
    padding: '18px',
    border: '1px solid var(--line)',
    borderRadius: '22px',
    background: 'var(--card-muted)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
  },
  headerRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 700,
    color: 'var(--ink)',
  },
  counter: {
    color: 'var(--muted)',
    fontSize: '13px',
    fontWeight: 800,
  },
  counterAlert: {
    color: 'var(--danger)',
  },
  textarea: {
    width: '100%',
    resize: 'vertical',
    padding: '18px',
    border: '1px solid var(--line-strong)',
    borderRadius: '18px',
    color: 'var(--ink)',
    background: 'var(--card)',
    fontSize: '16px',
    lineHeight: 1.78,
    boxShadow: '0 10px 24px rgba(39, 44, 48, 0.04)',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, background 150ms ease',
  },
  textareaAlert: {
    borderColor: '#e2afa8',
    background: '#fff8f6',
  },
  helperRow: {
    minHeight: '22px',
  },
  privacyNote: {
    margin: '-2px 0 0',
    color: 'var(--muted)',
    fontSize: '13px',
    lineHeight: 1.45,
  },
  helperText: {
    color: 'var(--muted)',
    fontSize: '13px',
    lineHeight: 1.45,
  },
  softWarning: {
    color: 'var(--amber)',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1.45,
  },
  strongWarning: {
    color: 'var(--danger)',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.45,
  },
} satisfies Record<string, CSSProperties>
