'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { LevelNumber } from '../lib/types'

type LevelOption = {
  level: LevelNumber
  label: string
  microcopy: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    level: 0,
    label: 'Original',
    microcopy: 'Maximum fidelity. No simplification.',
  },
  {
    level: 1,
    label: 'Closer to Original',
    microcopy: 'Preserves legal structure while reducing density.',
  },
  {
    level: 2,
    label: 'Balanced',
    microcopy: 'Improves readability while keeping key obligations visible.',
  },
  {
    level: 3,
    label: 'More Guided',
    microcopy: 'Most accessible, but may compress legal detail.',
  },
]

type LevelSliderProps = {
  value: LevelNumber
  onChange: (level: LevelNumber) => void
  disabled?: boolean
}

export function LevelSlider({ value, onChange, disabled = false }: LevelSliderProps) {
  const activeLevel = LEVEL_OPTIONS.find((option) => option.level === value) ?? LEVEL_OPTIONS[0]

  return (
    <section style={styles.shell} aria-label="Readability and fidelity level">
      <div style={styles.topRow}>
        <div>
          <p style={styles.kicker}>Simplification level</p>
          <h2 style={styles.heading}>
            {activeLevel.level} {activeLevel.label}
          </h2>
        </div>
        <span style={styles.tradeoff}>Fidelity &lt;-&gt; Readability</span>
      </div>

      <div style={styles.sliderArea}>
        <input
          aria-label="Readability and fidelity slider"
          type="range"
          min="0"
          max="3"
          step="1"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value) as LevelNumber)}
          style={styles.range}
        />
        <div style={styles.labels}>
          {LEVEL_OPTIONS.map((option) => (
            <button
              key={option.level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.level)}
              style={{
                ...styles.levelButton,
                ...(option.level === value ? styles.levelButtonActive : {}),
                ...(disabled ? styles.levelButtonDisabled : {}),
              }}
            >
              <strong>{option.level}</strong>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={activeLevel.level}
          style={styles.microcopy}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {activeLevel.microcopy}
        </motion.p>
      </AnimatePresence>
    </section>
  )
}

const styles = {
  shell: {
    display: 'grid',
    gap: '18px',
    marginBottom: '24px',
    padding: '20px',
    border: '1px solid var(--line)',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, var(--card), var(--card-muted))',
    boxShadow: 'var(--shadow-sm)',
  },
  topRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  kicker: {
    margin: '0 0 4px',
    color: 'var(--accent-dark)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  heading: {
    margin: 0,
    color: 'var(--ink)',
    fontSize: '24px',
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
  },
  tradeoff: {
    padding: '7px 11px',
    border: '1px solid rgba(47, 118, 109, 0.18)',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '13px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  sliderArea: {
    display: 'grid',
    gap: '12px',
  },
  range: {
    width: '100%',
    accentColor: 'var(--accent)',
    cursor: 'pointer',
  },
  labels: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '8px',
  },
  levelButton: {
    display: 'grid',
    gap: '4px',
    minHeight: '62px',
    padding: '10px',
    border: '1px solid var(--line)',
    borderRadius: '16px',
    color: 'var(--slate)',
    background: 'rgba(255, 253, 248, 0.78)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, background 150ms ease, box-shadow 150ms ease, transform 150ms ease',
  },
  levelButtonActive: {
    borderColor: 'var(--accent)',
    color: 'var(--ink)',
    background: 'var(--accent-soft)',
    boxShadow: 'inset 0 0 0 1px rgba(47, 118, 109, 0.22)',
    transform: 'translateY(-1px)',
  },
  levelButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.62,
  },
  microcopy: {
    margin: 0,
    color: 'var(--slate)',
    fontSize: '15px',
    lineHeight: 1.5,
  },
} satisfies Record<string, CSSProperties>

