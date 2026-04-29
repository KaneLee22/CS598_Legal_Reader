'use client'

import { useState, type CSSProperties } from 'react'
import { AppHeader } from '../components/AppHeader'
import { DesignRationale } from '../components/DesignRationale'
import { canGenerateFromInput, ImportArea } from '../components/ImportArea'
import { ReaderWorkspace } from '../components/ReaderWorkspace'
import {
  SAMPLE_CANCELLATION_RESULT,
  SAMPLE_SUBSCRIPTION_RESULT,
} from '../lib/sampleData'
import type { AnalysisResult, LevelNumber } from '../lib/types'

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error'

type AnalyzeApiResponse =
  | { ok: true; result: AnalysisResult }
  | { ok: false; error: string }

const sampleText =
  "Supplier shall indemnify, defend, and hold harmless Customer from and against all claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees, arising out of Supplier's breach of this Agreement, negligence, willful misconduct, or violation of applicable law."

export default function Page() {
  const [inputText, setInputText] = useState(sampleText)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeLevel, setActiveLevel] = useState<LevelNumber>(2)
  const [showGeneratedStructure, setShowGeneratedStructure] = useState(false)
  const [isEditingClause, setIsEditingClause] = useState(true)
  const [showPostGenerationSamples, setShowPostGenerationSamples] = useState(false)

  async function handleGenerate() {
    const text = inputText.trim()

    if (!text) {
      setGenerationStatus('error')
      setErrorMessage('Enter legal text before generating an analysis.')
      return
    }

    if (!canGenerateFromInput(inputText)) {
      setGenerationStatus('error')
      setErrorMessage('Please use a shorter clause for this prototype.')
      return
    }

    setGenerationStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = (await response.json()) as AnalyzeApiResponse

      if (data.ok === false) {
        throw new Error(data.error)
      }

      if (!response.ok) {
        throw new Error('Analysis request failed.')
      }

      setAnalysisResult(data.result)
      setGenerationStatus('success')
      setActiveLevel(2)
      setShowGeneratedStructure(false)
      setIsEditingClause(false)
      setShowPostGenerationSamples(false)
    } catch (error) {
      setGenerationStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Generation failed. You can still use a sample clause for the demo.',
      )
    }
  }

  function loadSample(result: AnalysisResult) {
    setInputText(result.originalText)
    setAnalysisResult(result)
    setGenerationStatus('success')
    setErrorMessage('')
    setActiveLevel(2)
    setShowGeneratedStructure(false)
    setIsEditingClause(false)
    setShowPostGenerationSamples(false)
  }

  const isLoading = generationStatus === 'loading'
  const canGenerate = canGenerateFromInput(inputText)
  const hasResult = Boolean(analysisResult)

  return (
    <main style={styles.page}>
      <section style={{ ...styles.card, ...(hasResult ? styles.cardWide : styles.cardNarrow) }}>
        <AppHeader />

        <p style={styles.introCopy}>
          Paste a contract clause to generate structured reading support across
          multiple simplification levels.
        </p>

        <DesignRationale />

        {analysisResult && generationStatus === 'success' && !isEditingClause ? (
          <SourceSummaryBar
            characterCount={inputText.length}
            onEdit={() => setIsEditingClause(true)}
            onRegenerate={handleGenerate}
            disabled={isLoading || !canGenerate}
          />
        ) : (
          <>
            <ImportArea value={inputText} onChange={setInputText} disabled={isLoading} />

            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !canGenerate}
                style={{
                  ...styles.button,
                  ...(isLoading || !canGenerate ? styles.buttonDisabled : {}),
                }}
              >
                {isLoading ? 'Generating...' : analysisResult ? 'Regenerate' : 'Generate'}
              </button>
              <span style={styles.statusText}>{getStatusLabel(generationStatus)}</span>
            </div>
          </>
        )}

        {!analysisResult && <SamplePanel isLoading={isLoading} onLoadSample={loadSample} />}

        {generationStatus === 'loading' && <GenerationLoadingState />}

        {generationStatus === 'error' && (
          <div style={styles.errorBox}>
            <strong>Generation failed. You can still use a sample clause for the demo.</strong>
            {errorMessage && <span style={styles.errorDetail}>{errorMessage}</span>}
          </div>
        )}

        {analysisResult && generationStatus !== 'loading' && (
          <section style={styles.resultPanel} aria-label="Analysis summary">
            <p style={styles.metadataLine}>
              {analysisResult.originalBlocks.length} source blocks · {analysisResult.levels.length}{' '}
              levels · {analysisResult.fidelityNotes.length} fidelity notes ·{' '}
              {analysisResult.terms.length} terms
            </p>

            <ReaderWorkspace
              result={analysisResult}
              activeLevel={activeLevel}
              onLevelChange={setActiveLevel}
            />

            <section style={styles.debugPanel} aria-label="Generated structure debug preview">
              <div style={styles.secondaryControls}>
                <button
                  type="button"
                  style={styles.debugToggle}
                  onClick={() => setShowPostGenerationSamples((current) => !current)}
                  aria-expanded={showPostGenerationSamples}
                >
                  Try another sample
                </button>
                <button
                  type="button"
                  style={styles.debugToggle}
                  onClick={() => setShowGeneratedStructure((current) => !current)}
                  aria-expanded={showGeneratedStructure}
                >
                  View Generated Structure
                </button>
              </div>

              {showPostGenerationSamples && (
                <SamplePanel isLoading={isLoading} onLoadSample={loadSample} compact />
              )}

              {showGeneratedStructure && (
                <pre style={styles.pre} aria-readonly="true">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              )}
            </section>
          </section>
        )}
      </section>
    </main>
  )
}

function getStatusLabel(status: GenerationStatus) {
  if (status === 'loading') {
    return 'Generating structured output'
  }

  if (status === 'success') {
    return 'Analysis ready'
  }

  if (status === 'error') {
    return 'Generation needs attention'
  }

  return 'Ready'
}

function GenerationLoadingState() {
  return (
    <div style={styles.loadingBox} aria-live="polite">
      <strong>Generating structured reading support...</strong>
      <ol style={styles.loadingSteps}>
        <li>Segmenting original clause</li>
        <li>Creating simplification levels</li>
        <li>Checking fidelity changes</li>
        <li>Preparing term explanations</li>
      </ol>
    </div>
  )
}

function SourceSummaryBar({
  characterCount,
  onEdit,
  onRegenerate,
  disabled,
}: {
  characterCount: number
  onEdit: () => void
  onRegenerate: () => void
  disabled: boolean
}) {
  return (
    <div style={styles.sourceSummaryBar}>
      <span style={styles.sourceSummaryText}>
        Source clause analyzed · {characterCount.toLocaleString()} characters
      </span>
      <div style={styles.sourceSummaryActions}>
        <button type="button" style={styles.secondaryActionButton} onClick={onEdit}>
          Edit Clause
        </button>
        <button
          type="button"
          style={{
            ...styles.secondaryActionButton,
            ...(disabled ? styles.secondaryActionButtonDisabled : {}),
          }}
          disabled={disabled}
          onClick={onRegenerate}
        >
          Regenerate
        </button>
      </div>
    </div>
  )
}

function SamplePanel({
  isLoading,
  onLoadSample,
  compact = false,
}: {
  isLoading: boolean
  onLoadSample: (result: AnalysisResult) => void
  compact?: boolean
}) {
  return (
    <div
      style={{
        ...styles.samplePanel,
        ...(compact ? styles.samplePanelCompact : {}),
      }}
      aria-label="Fallback demo examples"
    >
      <span style={styles.sampleLabel}>Demo sample clauses</span>
      <div style={styles.sampleGrid}>
        <SampleCard
          title="Cancellation / Refund Clause"
          description="A service cancellation clause with notice timing, partial refund, and force majeure."
          disabled={isLoading}
          onLoad={() => onLoadSample(SAMPLE_CANCELLATION_RESULT)}
        />
        <SampleCard
          title="Subscription Renewal Clause"
          description="A subscription clause covering auto-renewal, cancellation notice, payment, and access."
          disabled={isLoading}
          onLoad={() => onLoadSample(SAMPLE_SUBSCRIPTION_RESULT)}
        />
      </div>
    </div>
  )
}

function SampleCard({
  title,
  description,
  disabled,
  onLoad,
}: {
  title: string
  description: string
  disabled: boolean
  onLoad: () => void
}) {
  return (
    <article style={styles.sampleCard}>
      <div>
        <h3 style={styles.sampleTitle}>{title}</h3>
        <p style={styles.sampleDescription}>{description}</p>
      </div>
      <button
        type="button"
        onClick={onLoad}
        disabled={disabled}
        style={{
          ...styles.sampleButton,
          ...(disabled ? styles.sampleButtonDisabled : {}),
        }}
      >
        Load sample
      </button>
    </article>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    margin: 0,
    padding: '48px 20px',
    color: 'var(--ink)',
    background: 'transparent',
    fontFamily:
      'IBM Plex Sans, Avenir Next, Trebuchet MS, Verdana, system-ui, sans-serif',
  },
  card: {
    margin: '0 auto',
    padding: '36px',
    border: '1px solid rgba(217, 212, 201, 0.9)',
    borderRadius: '30px',
    background: 'rgba(255, 253, 248, 0.88)',
    boxShadow: 'var(--shadow-md)',
    backdropFilter: 'blur(18px)',
    transition: 'width 220ms ease',
  },
  cardNarrow: {
    width: 'min(940px, 100%)',
  },
  cardWide: {
    width: 'min(1500px, 100%)',
  },
  kicker: {
    margin: '0 0 8px',
    color: '#1f5f58',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
  },
  title: {
    margin: '0 0 12px',
    maxWidth: '760px',
    fontSize: 'clamp(32px, 5vw, 56px)',
    lineHeight: 0.98,
    letterSpacing: '-0.05em',
  },
  subtitle: {
    maxWidth: '720px',
    margin: '0 0 28px',
    color: '#667085',
    fontSize: '17px',
    lineHeight: 1.6,
  },
  introCopy: {
    margin: '0 0 22px',
    color: 'var(--slate)',
    fontSize: '17px',
    lineHeight: 1.6,
    maxWidth: '720px',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '14px',
    alignItems: 'center',
    marginTop: '18px',
  },
  button: {
    minHeight: '50px',
    padding: '0 24px',
    border: '1px solid var(--accent-dark)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(47, 118, 109, 0.22)',
    transition: 'transform 150ms ease, box-shadow 150ms ease, background 150ms ease',
  },
  buttonDisabled: {
    borderColor: '#bfc8c1',
    color: '#7b8582',
    background: '#ebe7de',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  statusText: {
    color: 'var(--muted)',
    fontSize: '14px',
    fontWeight: 700,
  },
  samplePanel: {
    display: 'grid',
    gap: '14px',
    marginTop: '18px',
    padding: '16px',
    border: '1px dashed var(--line-strong)',
    borderRadius: '18px',
    background: 'var(--card-muted)',
  },
  samplePanelCompact: {
    width: '100%',
    marginTop: 0,
  },
  sampleLabel: {
    color: 'var(--amber)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  sampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px',
  },
  sampleCard: {
    display: 'grid',
    gap: '14px',
    alignContent: 'space-between',
    padding: '16px',
    border: '1px solid var(--line)',
    borderRadius: '18px',
    background: 'var(--card)',
    boxShadow: '0 8px 18px rgba(39, 44, 48, 0.04)',
  },
  sampleTitle: {
    margin: '0 0 6px',
    color: 'var(--ink)',
    fontSize: '16px',
    lineHeight: 1.25,
  },
  sampleDescription: {
    margin: 0,
    color: 'var(--slate)',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  sampleButton: {
    minHeight: '40px',
    width: 'fit-content',
    padding: '0 15px',
    border: '1px solid #d9c38f',
    borderRadius: '999px',
    color: '#6f4a17',
    background: 'var(--amber-soft)',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
  },
  sampleButtonDisabled: {
    color: '#8d8a82',
    background: '#ebe7de',
    cursor: 'not-allowed',
  },
  loadingBox: {
    display: 'grid',
    gap: '10px',
    marginTop: '18px',
    padding: '14px 16px',
    border: '1px solid rgba(47, 118, 109, 0.2)',
    borderRadius: '16px',
    color: 'var(--accent-dark)',
    background: 'var(--accent-soft)',
    boxShadow: 'var(--shadow-sm)',
  },
  loadingSteps: {
    display: 'grid',
    gap: '6px',
    margin: 0,
    paddingLeft: '20px',
    color: '#315d57',
    fontSize: '14px',
    lineHeight: 1.45,
  },
  errorBox: {
    display: 'grid',
    gap: '6px',
    marginTop: '18px',
    padding: '14px 16px',
    border: '1px solid #e2afa8',
    borderRadius: '16px',
    color: 'var(--danger)',
    background: 'var(--danger-soft)',
  },
  errorDetail: {
    color: 'var(--danger)',
    fontSize: '13px',
    lineHeight: 1.45,
    opacity: 0.82,
  },
  resultPanel: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--line)',
  },
  metadataLine: {
    margin: '0 0 12px',
    color: 'var(--muted)',
    fontSize: '13px',
    fontWeight: 800,
  },
  sourceSummaryBar: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    border: '1px solid var(--line)',
    borderRadius: '18px',
    background: 'var(--card-muted)',
    boxShadow: '0 8px 18px rgba(39, 44, 48, 0.04)',
  },
  sourceSummaryText: {
    color: 'var(--muted)',
    fontSize: '14px',
    fontWeight: 800,
  },
  sourceSummaryActions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  secondaryActionButton: {
    minHeight: '34px',
    padding: '0 12px',
    border: '1px solid var(--line-strong)',
    borderRadius: '999px',
    color: 'var(--accent-dark)',
    background: 'var(--card)',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryActionButtonDisabled: {
    color: '#8d8a82',
    background: '#ebe7de',
    cursor: 'not-allowed',
  },
  debugPanel: {
    display: 'grid',
    justifyItems: 'start',
    gap: '10px',
    marginTop: '18px',
  },
  secondaryControls: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  debugToggle: {
    minHeight: '34px',
    padding: '0 12px',
    border: '1px solid var(--line)',
    borderRadius: '999px',
    color: 'var(--muted)',
    background: 'var(--card-muted)',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  pre: {
    width: '100%',
    maxHeight: '420px',
    margin: 0,
    overflow: 'auto',
    padding: '16px',
    border: '1px solid var(--line)',
    borderRadius: '18px',
    color: 'var(--ink)',
    background: 'var(--card-muted)',
    fontSize: '12px',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap' as const,
  },
} satisfies Record<string, CSSProperties>
