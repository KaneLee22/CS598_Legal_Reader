'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

export function AppHeader() {
  return (
    <motion.header
      style={styles.header}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <p style={styles.kicker}>Research prototype</p>
      <h1 style={styles.title}>Balancing Readability and Fidelity</h1>
      <p style={styles.subtitle}>
        A Traceable Dual-Pane Interface for Legal Text Simplification
      </p>
      <div style={styles.disclaimer}>Reading support only - Not legal advice</div>
    </motion.header>
  )
}

const styles = {
  header: {
    display: 'grid',
    gap: '12px',
    marginBottom: '30px',
    paddingBottom: '8px',
  },
  kicker: {
    margin: 0,
    color: 'var(--accent-dark)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: '840px',
    margin: 0,
    color: 'var(--ink)',
    fontSize: 'clamp(40px, 5.5vw, 72px)',
    lineHeight: 0.94,
    letterSpacing: '-0.06em',
  },
  subtitle: {
    maxWidth: '760px',
    margin: 0,
    color: 'var(--slate)',
    fontSize: '19px',
    lineHeight: 1.55,
  },
  disclaimer: {
    width: 'fit-content',
    marginTop: '8px',
    padding: '8px 12px',
    border: '1px solid rgba(47, 118, 109, 0.18)',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'linear-gradient(135deg, #eef7f3, var(--accent-soft))',
    fontSize: '13px',
    fontWeight: 800,
    boxShadow: '0 8px 18px rgba(47, 118, 109, 0.08)',
  },
} satisfies Record<string, CSSProperties>
