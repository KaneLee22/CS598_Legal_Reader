import { useMemo, useState, type ReactNode } from 'react'
import { createDemoDocument, sampleClauseText } from './data'
import type {
  DemoDocument,
  FidelityWarning,
  InspectTarget,
  LegalTerm,
  OriginalSegment,
  SimplificationLevel,
} from './types'
import './styles.css'

const initialInspectTarget: InspectTarget = { kind: 'overview' }

export function App() {
  const [draftText, setDraftText] = useState(sampleClauseText)
  const [documentData, setDocumentData] = useState<DemoDocument>(() =>
    createDemoDocument(sampleClauseText),
  )
  const [hasGenerated, setHasGenerated] = useState(false)
  const [activeLevelIndex, setActiveLevelIndex] = useState(1)
  const [inspectTarget, setInspectTarget] = useState<InspectTarget>(initialInspectTarget)

  const activeLevel = documentData.levels[activeLevelIndex] ?? documentData.levels[0]
  const activeWarnings = hasGenerated
    ? documentData.warnings.filter((warning) => warning.levelIds.includes(activeLevel.id))
    : []
  const selection = useMemo(
    () => getSelectionContext(inspectTarget, documentData, activeLevel, hasGenerated),
    [activeLevel, documentData, hasGenerated, inspectTarget],
  )

  function handleTextChange(value: string) {
    setDraftText(value)
    setDocumentData(createDemoDocument(value))
    setHasGenerated(false)
    setInspectTarget(initialInspectTarget)
  }

  function handleGenerate() {
    const nextDocument = createDemoDocument(draftText)
    setDocumentData(nextDocument)
    setActiveLevelIndex(Math.min(1, nextDocument.levels.length - 1))
    setHasGenerated(true)
    setInspectTarget(initialInspectTarget)
  }

  return (
    <main className="app-shell">
      <Hero />

      <section className="workspace" aria-label="Legal simplification workspace">
        <ClauseComposer
          value={draftText}
          hasGenerated={hasGenerated}
          onChange={handleTextChange}
          onGenerate={handleGenerate}
        />

        <LevelControls
          levels={documentData.levels}
          activeLevelIndex={activeLevelIndex}
          disabled={!hasGenerated}
          onChange={(index) => {
            setActiveLevelIndex(index)
            setInspectTarget(initialInspectTarget)
          }}
        />

        <div className="reader-grid">
          <OriginalPane
            segments={documentData.originalSegments}
            highlightedIds={selection.sourceIds}
            selectedId={inspectTarget.kind === 'source' ? inspectTarget.id : undefined}
            onSelect={(id) => setInspectTarget({ kind: 'source', id })}
          />

          <SimplifiedPane
            isGenerated={hasGenerated}
            level={activeLevel}
            warnings={activeWarnings}
            allWarnings={documentData.warnings}
            terms={documentData.terms}
            highlightedBlockIds={selection.blockIds}
            selectedTarget={inspectTarget}
            onSelectBlock={(id) => setInspectTarget({ kind: 'block', id })}
            onSelectWarning={(id) => setInspectTarget({ kind: 'warning', id })}
            onSelectTerm={(id) => setInspectTarget({ kind: 'term', id })}
          />

          <InspectPanel
            target={inspectTarget}
            documentData={documentData}
            activeLevel={activeLevel}
            isGenerated={hasGenerated}
            onSelectSource={(id) => setInspectTarget({ kind: 'source', id })}
            onSelectBlock={(id) => setInspectTarget({ kind: 'block', id })}
            onSelectWarning={(id) => setInspectTarget({ kind: 'warning', id })}
            onSelectTerm={(id) => setInspectTarget({ kind: 'term', id })}
          />
        </div>
      </section>
    </main>
  )
}

function Hero() {
  return (
    <header className="hero-panel">
      <div>
        <p className="eyebrow">HCI research prototype</p>
        <h1>Balancing Readability and Fidelity</h1>
        <p className="hero-copy">
          A traceable dual-pane interface for legal text simplification. The demo
          generates fixed simplification levels once, then the slider switches between
          local views with source mapping, omission warnings, and phrase explanations.
        </p>
      </div>
      <div className="scope-card" aria-label="Prototype boundaries">
        <span>Reading support only</span>
        <strong>No legal advice. No chat. No database.</strong>
      </div>
    </header>
  )
}

type ClauseComposerProps = {
  value: string
  hasGenerated: boolean
  onChange: (value: string) => void
  onGenerate: () => void
}

function ClauseComposer({ value, hasGenerated, onChange, onGenerate }: ClauseComposerProps) {
  return (
    <section className="card composer-card" aria-label="Paste legal clause">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Input</p>
          <h2>Paste a legal clause</h2>
        </div>
        <button className="secondary-button" type="button" onClick={() => onChange(sampleClauseText)}>
          Use sample
        </button>
      </div>

      <textarea
        aria-label="Legal clause text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
      />

      <div className="composer-actions">
        <p>
          Generation is simulated locally for the prototype. After generation, slider
          changes do not call any model.
        </p>
        <button
          className="primary-button"
          type="button"
          onClick={onGenerate}
          disabled={value.trim().length === 0}
        >
          {hasGenerated ? 'Regenerate fixed levels' : 'Generate simplification levels'}
        </button>
      </div>
    </section>
  )
}

type LevelControlsProps = {
  levels: SimplificationLevel[]
  activeLevelIndex: number
  disabled: boolean
  onChange: (index: number) => void
}

function LevelControls({ levels, activeLevelIndex, disabled, onChange }: LevelControlsProps) {
  const activeLevel = levels[activeLevelIndex] ?? levels[0]

  return (
    <section className="card level-card" aria-label="Simplification level controls">
      <div>
        <p className="eyebrow">Local level switcher</p>
        <h2>{activeLevel.label}</h2>
        <p>{activeLevel.description}</p>
      </div>

      <div className="slider-wrap">
        <input
          type="range"
          min="0"
          max={levels.length - 1}
          step="1"
          value={activeLevelIndex}
          disabled={disabled}
          aria-label="Simplification level"
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <div className="slider-labels">
          {levels.map((level) => (
            <span key={level.id}>{level.shortLabel}</span>
          ))}
        </div>
      </div>

      <div className="metric-strip" aria-label="Readability and fidelity metrics">
        <Metric label="Readability" value={activeLevel.readability} />
        <Metric label="Estimated fidelity" value={activeLevel.fidelity} />
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

type OriginalPaneProps = {
  segments: OriginalSegment[]
  highlightedIds: string[]
  selectedId?: string
  onSelect: (id: string) => void
}

function OriginalPane({ segments, highlightedIds, selectedId, onSelect }: OriginalPaneProps) {
  return (
    <section className="card pane source-pane" aria-label="Original legal text">
      <PaneHeader eyebrow="Original" title="Source clause" meta="Click a block to inspect mappings" />

      <div className="block-stack">
        {segments.map((segment) => {
          const isActive = highlightedIds.includes(segment.id) || selectedId === segment.id

          return (
            <button
              key={segment.id}
              type="button"
              className={`source-block ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelect(segment.id)}
            >
              <span>{segment.label}</span>
              <p>{segment.text}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

type SimplifiedPaneProps = {
  isGenerated: boolean
  level: SimplificationLevel
  warnings: FidelityWarning[]
  allWarnings: FidelityWarning[]
  terms: LegalTerm[]
  highlightedBlockIds: string[]
  selectedTarget: InspectTarget
  onSelectBlock: (id: string) => void
  onSelectWarning: (id: string) => void
  onSelectTerm: (id: string) => void
}

function SimplifiedPane({
  isGenerated,
  level,
  warnings,
  allWarnings,
  terms,
  highlightedBlockIds,
  selectedTarget,
  onSelectBlock,
  onSelectWarning,
  onSelectTerm,
}: SimplifiedPaneProps) {
  return (
    <section className="card pane simplified-pane" aria-label="Simplified legal text">
      <PaneHeader
        eyebrow="Simplified"
        title={isGenerated ? level.shortLabel : 'Awaiting generation'}
        meta={
          isGenerated
            ? `${warnings.length} active fidelity warning${warnings.length === 1 ? '' : 's'}`
            : 'Slider locked'
        }
      />

      {!isGenerated ? (
        <div className="empty-state">
          <span>Generate once</span>
          <p>
            Simplification levels, trace links, legal-term explanations, and fidelity
            warnings will appear here after generation.
          </p>
        </div>
      ) : (
        <>
          <WarningRail warnings={warnings} onSelectWarning={onSelectWarning} />

          <div className="block-stack">
            {level.blocks.map((block) => {
              const blockWarnings = allWarnings.filter((warning) =>
                block.warningIds.includes(warning.id),
              )
              const blockTerms = terms.filter((term) => block.termIds.includes(term.id))
              const isActive =
                highlightedBlockIds.includes(block.id) ||
                (selectedTarget.kind === 'block' && selectedTarget.id === block.id)

              return (
                <article key={block.id} className={`simplified-block ${isActive ? 'is-active' : ''}`}>
                  <button type="button" className="block-hit-area" onClick={() => onSelectBlock(block.id)}>
                    <span className="mapping-tag">
                      Maps to {block.sourceIds.map(formatSourceId).join(', ')}
                    </span>
                    <p>{renderTextWithTerms(block.text, blockTerms, onSelectTerm)}</p>
                  </button>

                  {(blockWarnings.length > 0 || blockTerms.length > 0) && (
                    <div className="chip-row">
                      {blockWarnings.map((warning) => (
                        <button
                          key={warning.id}
                          type="button"
                          className={`chip warning-chip ${warning.severity}`}
                          onClick={() => onSelectWarning(warning.id)}
                        >
                          {warning.title}
                        </button>
                      ))}
                      {blockTerms.map((term) => (
                        <button
                          key={term.id}
                          type="button"
                          className="chip term-chip"
                          onClick={() => onSelectTerm(term.id)}
                        >
                          {term.phrase}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

function WarningRail({
  warnings,
  onSelectWarning,
}: {
  warnings: FidelityWarning[]
  onSelectWarning: (id: string) => void
}) {
  if (warnings.length === 0) {
    return <p className="quiet-note">No active omission or fidelity warnings at this level.</p>
  }

  return (
    <div className="warning-rail" aria-label="Active fidelity warnings">
      {warnings.map((warning) => (
        <button
          key={warning.id}
          type="button"
          className={`warning-card ${warning.severity}`}
          onClick={() => onSelectWarning(warning.id)}
        >
          <span>{warning.kind.replace('-', ' ')}</span>
          <strong>{warning.title}</strong>
        </button>
      ))}
    </div>
  )
}

function PaneHeader({ eyebrow, title, meta }: { eyebrow: string; title: string; meta: string }) {
  return (
    <div className="pane-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <span>{meta}</span>
    </div>
  )
}

type InspectPanelProps = {
  target: InspectTarget
  documentData: DemoDocument
  activeLevel: SimplificationLevel
  isGenerated: boolean
  onSelectSource: (id: string) => void
  onSelectBlock: (id: string) => void
  onSelectWarning: (id: string) => void
  onSelectTerm: (id: string) => void
}

function InspectPanel({
  target,
  documentData,
  activeLevel,
  isGenerated,
  onSelectSource,
  onSelectBlock,
  onSelectWarning,
  onSelectTerm,
}: InspectPanelProps) {
  const content = getInspectContent(target, documentData, activeLevel, isGenerated)

  return (
    <aside className="card inspect-panel" aria-label="Inspect panel">
      <div className="pane-header">
        <div>
          <p className="eyebrow">Inspect</p>
          <h2>{content.title}</h2>
        </div>
        <span>{content.badge}</span>
      </div>

      <p className="inspect-summary">{content.summary}</p>

      {content.detail && <p className="detail-note">{content.detail}</p>}

      <InspectorLinks
        title="Original blocks"
        ids={content.sourceIds}
        formatter={formatSourceId}
        onSelect={onSelectSource}
      />
      <InspectorLinks
        title="Simplified blocks"
        ids={content.blockIds}
        formatter={(id) => id.toUpperCase()}
        onSelect={onSelectBlock}
      />

      <div className="inspect-section">
        <h3>Warnings</h3>
        {content.warningIds.length === 0 ? (
          <p>No linked warning.</p>
        ) : (
          <div className="chip-row">
            {content.warningIds.map((id) => {
              const warning = documentData.warnings.find((item) => item.id === id)

              return (
                <button
                  key={id}
                  type="button"
                  className={`chip warning-chip ${warning?.severity ?? 'notice'}`}
                  onClick={() => onSelectWarning(id)}
                >
                  {warning?.title ?? id}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="inspect-section">
        <h3>Legal terms</h3>
        {content.termIds.length === 0 ? (
          <p>No linked term explanation.</p>
        ) : (
          <div className="chip-row">
            {content.termIds.map((id) => {
              const term = documentData.terms.find((item) => item.id === id)

              return (
                <button key={id} type="button" className="chip term-chip" onClick={() => onSelectTerm(id)}>
                  {term?.phrase ?? id}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <p className="non-advice">Prototype note: explanations support reading only and are not legal advice.</p>
    </aside>
  )
}

function InspectorLinks({
  title,
  ids,
  formatter,
  onSelect,
}: {
  title: string
  ids: string[]
  formatter: (id: string) => string
  onSelect: (id: string) => void
}) {
  return (
    <div className="inspect-section">
      <h3>{title}</h3>
      {ids.length === 0 ? (
        <p>None linked.</p>
      ) : (
        <div className="link-row">
          {ids.map((id) => (
            <button key={id} type="button" onClick={() => onSelect(id)}>
              {formatter(id)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getSelectionContext(
  target: InspectTarget,
  documentData: DemoDocument,
  activeLevel: SimplificationLevel,
  isGenerated: boolean,
) {
  if (target.kind === 'source') {
    const linkedBlocks = isGenerated
      ? activeLevel.blocks
          .filter((block) => block.sourceIds.includes(target.id))
          .map((block) => block.id)
      : []

    return { sourceIds: [target.id], blockIds: linkedBlocks }
  }

  if (target.kind === 'block') {
    const block = activeLevel.blocks.find((item) => item.id === target.id)

    return { sourceIds: block?.sourceIds ?? [], blockIds: block ? [block.id] : [] }
  }

  if (target.kind === 'warning') {
    const warning = documentData.warnings.find((item) => item.id === target.id)

    return { sourceIds: warning?.sourceIds ?? [], blockIds: warning?.blockIds ?? [] }
  }

  if (target.kind === 'term') {
    const term = documentData.terms.find((item) => item.id === target.id)

    return { sourceIds: term?.sourceIds ?? [], blockIds: term?.blockIds ?? [] }
  }

  return { sourceIds: [], blockIds: [] }
}

function getInspectContent(
  target: InspectTarget,
  documentData: DemoDocument,
  activeLevel: SimplificationLevel,
  isGenerated: boolean,
) {
  if (target.kind === 'source') {
    const segment = documentData.originalSegments.find((item) => item.id === target.id)
    const linkedBlocks = isGenerated
      ? activeLevel.blocks.filter((block) => block.sourceIds.includes(target.id))
      : []
    const warnings = isGenerated
      ? documentData.warnings.filter((warning) => warning.sourceIds.includes(target.id))
      : []
    const terms = isGenerated
      ? documentData.terms.filter((term) => term.sourceIds.includes(target.id))
      : []

    return {
      title: segment?.label ?? 'Source block',
      badge: 'Original',
      summary: segment?.text ?? 'This source block is not available.',
      detail: isGenerated
        ? 'Trace links show which simplified blocks currently depend on this source text.'
        : 'Generate simplification levels to inspect trace links from this source block.',
      sourceIds: segment ? [segment.id] : [],
      blockIds: linkedBlocks.map((block) => block.id),
      warningIds: warnings.map((warning) => warning.id),
      termIds: terms.map((term) => term.id),
    }
  }

  if (target.kind === 'block') {
    const block = activeLevel.blocks.find((item) => item.id === target.id)

    return {
      title: 'Simplified block',
      badge: activeLevel.shortLabel,
      summary: block?.text ?? 'This simplified block is not available at the current level.',
      detail: 'Mappings are block-level, not token-level, to keep the demo readable.',
      sourceIds: block?.sourceIds ?? [],
      blockIds: block ? [block.id] : [],
      warningIds: block?.warningIds ?? [],
      termIds: block?.termIds ?? [],
    }
  }

  if (target.kind === 'warning') {
    const warning = documentData.warnings.find((item) => item.id === target.id)

    return {
      title: warning?.title ?? 'Warning',
      badge: warning?.severity ?? 'notice',
      summary: warning?.message ?? 'This warning is not available.',
      detail: warning
        ? `Warning type: ${warning.kind.replace('-', ' ')}. Active on ${warning.levelIds.length} level(s).`
        : undefined,
      sourceIds: warning?.sourceIds ?? [],
      blockIds: warning?.blockIds ?? [],
      warningIds: warning ? [warning.id] : [],
      termIds: [],
    }
  }

  if (target.kind === 'term') {
    const term = documentData.terms.find((item) => item.id === target.id)

    return {
      title: term?.phrase ?? 'Legal term',
      badge: 'Term',
      summary: term?.explanation ?? 'This term explanation is not available.',
      detail: term ? `${term.legalFunction} ${term.caution}` : undefined,
      sourceIds: term?.sourceIds ?? [],
      blockIds: term?.blockIds ?? [],
      warningIds: [],
      termIds: term ? [term.id] : [],
    }
  }

  return {
    title: 'Overview',
    badge: 'Ready',
    summary:
      'Select an original block, simplified block, warning, or legal term to inspect trace links and fidelity notes.',
    detail:
      'The interface intentionally uses phrase and block links rather than token-level alignment.',
    sourceIds: [],
    blockIds: [],
    warningIds: [],
    termIds: [],
  }
}

function renderTextWithTerms(
  text: string,
  terms: LegalTerm[],
  onSelectTerm: (id: string) => void,
) {
  const matches = terms
    .map((term) => {
      const index = text.toLowerCase().indexOf(term.phrase.toLowerCase())
      return { term, index }
    })
    .filter((match) => match.index >= 0)
    .sort((a, b) => a.index - b.index)

  if (matches.length === 0) {
    return text
  }

  const nodes: ReactNode[] = []
  let cursor = 0

  matches.forEach(({ term, index }) => {
    if (index < cursor) {
      return
    }

    if (index > cursor) {
      nodes.push(text.slice(cursor, index))
    }

    nodes.push(
      <button key={`${term.id}-${index}`} type="button" className="inline-term" onClick={() => onSelectTerm(term.id)}>
        {text.slice(index, index + term.phrase.length)}
      </button>,
    )
    cursor = index + term.phrase.length
  })

  if (cursor < text.length) {
    nodes.push(text.slice(cursor))
  }

  return nodes
}

function formatSourceId(id: string) {
  return id.replace('o', 'O')
}
