'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { OriginalBlock } from '../lib/types'

type OriginalPaneProps = {
  blocks: OriginalBlock[]
  hoveredBlockIds: Set<string>
  selectedBlockIds: Set<string>
  onHoverBlock: (blockId: string) => void
  onLeaveBlock: () => void
  onSelectBlock: (blockId: string) => void
}

export function OriginalPane({
  blocks,
  hoveredBlockIds,
  selectedBlockIds,
  onHoverBlock,
  onLeaveBlock,
  onSelectBlock,
}: OriginalPaneProps) {
  return (
    <section style={styles.pane} aria-label="Original text pane">
      <div style={styles.header}>
        <p style={styles.kicker}>Original Text</p>
        <h2 style={styles.title}>Source blocks</h2>
      </div>

      <div style={styles.blockStack}>
        {blocks.map((block, index) => {
          const isHovered = hoveredBlockIds.has(block.id)
          const isSelected = selectedBlockIds.has(block.id)

          return (
          <motion.button
            key={block.id}
            type="button"
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
          >
            <span style={styles.blockLabel}>O{index + 1}</span>
            <p style={styles.blockText}>{block.text}</p>
          </motion.button>
          )
        })}
      </div>
    </section>
  )
}

const styles = {
  pane: {
    minHeight: '620px',
    overflow: 'hidden',
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
    border: '1px solid var(--line)',
    borderRadius: '18px',
    color: 'inherit',
    background: 'var(--card-muted)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, background 150ms ease, box-shadow 150ms ease, transform 150ms ease',
  },
  blockCardHovered: {
    borderColor: '#8fb9ae',
    background: '#f0f7f4',
    transform: 'translateY(-1px)',
  },
  blockCardSelected: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-soft)',
    boxShadow: 'inset 0 0 0 1px rgba(47, 118, 109, 0.28)',
  },
  blockLabel: {
    width: 'fit-content',
    padding: '4px 8px',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    fontSize: '12px',
    fontWeight: 800,
  },
  blockText: {
    margin: 0,
    color: '#2f3b45',
    fontSize: '15px',
    lineHeight: 1.65,
    overflowWrap: 'anywhere',
  },
} satisfies Record<string, CSSProperties>
