import React, { useState } from 'react'
import HierarchyCard from './components/HierarchyCard'
import SummaryPanel from './components/SummaryPanel'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const PLACEHOLDER = `One edge per line:
A->B
A->C
B->D
X->Y

Or paste a JSON array:
["A->B","A->C","B->D"]`

/**
 * Parses the textarea value into a string[].
 * Supports two formats:
 *   1. JSON array  – ["A->B","A->C","B->D"]
 *   2. Newline-separated – one edge per line
 */
const parseInput = (text) => {
  const trimmed = text.trim()

  // ── JSON array format ──────────────────────────────────────
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      // fall through to line-by-line parsing
    }
  }

  // ── JSON object with "data" key  e.g. { "data": [...] } ──
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed.data)) return parsed.data.map(String)
    } catch {
      // fall through
    }
  }

  // ── Newline-separated (default) ───────────────────────────
  return trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

const App = () => {
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [result, setResult]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    const data = parseInput(input)

    try {
      const response = await fetch(`${API_BASE}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      let json
      try {
        json = await response.json()
      } catch {
        throw new Error(`Server returned non-JSON (status ${response.status})`)
      }

      if (!response.ok) {
        throw new Error(json?.message || `Request failed — status ${response.status}`)
      }

      setResult(json)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the backend. Make sure the server is running on port 3000.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInput('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg select-none">
            H
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Hierarchy Builder</h1>
            <p className="text-xs text-gray-500">BFHL Full Stack Challenge</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Input card ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Enter Node Edges
          </h2>

          {/* Format hints */}
          <div className="flex flex-wrap gap-3 mb-4 mt-2">
            {[
              { label: 'Line-by-line', example: 'A->B  A->C  B->D' },
              { label: 'JSON array',   example: '["A->B","A->C"]' },
              { label: 'JSON object',  example: '{"data":["A->B"]}' },
            ].map(({ label, example }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">{label}</span>
                <span className="font-mono text-gray-400">{example}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={10}
              aria-label="Node edges input"
              spellCheck={false}
              className="w-full font-mono text-sm rounded-lg border border-gray-300 p-3
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         resize-y bg-gray-50 placeholder-gray-300"
            />

            {/* Live preview of parsed count */}
            {input.trim() && (
              <p className="text-xs text-gray-400">
                Detected{' '}
                <span className="font-semibold text-indigo-500">
                  {parseInput(input).length}
                </span>{' '}
                entr{parseInput(input).length === 1 ? 'y' : 'ies'} to submit
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700
                           disabled:opacity-40 disabled:cursor-not-allowed
                           text-white font-semibold py-2.5 px-6 rounded-lg
                           transition-colors cursor-pointer"
              >
                {loading ? <Spinner /> : 'Build Hierarchy'}
              </button>

              {(result || error) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2.5 rounded-lg border border-gray-300
                             text-gray-600 hover:bg-gray-100 transition-colors
                             font-medium text-sm cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── Error banner ── */}
        {error && (
          <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <span className="mt-0.5 font-bold">✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <>
            <SummaryPanel summary={result.summary} />

            {result.invalid_entries?.length > 0 && (
              <section aria-label="Invalid entries">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Invalid Entries ({result.invalid_entries.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.invalid_entries.map((e, i) => (
                    <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-mono border border-red-200">
                      {e || <em className="not-italic opacity-50">(empty)</em>}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {result.duplicate_edges?.length > 0 && (
              <section aria-label="Duplicate edges">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Duplicate Edges ({result.duplicate_edges.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.duplicate_edges.map((e, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-mono border border-amber-200">
                      {e}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {result.hierarchies?.length > 0 ? (
              <section aria-label="Hierarchies">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Hierarchies ({result.hierarchies.length})
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.hierarchies.map((h, i) => (
                    <HierarchyCard key={i} hierarchy={h} index={i} />
                  ))}
                </div>
              </section>
            ) : (
              !result.invalid_entries?.length && (
                <p className="text-sm text-gray-400 text-center py-6">No valid hierarchies to display.</p>
              )
            )}
          </>
        )}
      </main>
    </div>
  )
}

const Spinner = () => (
  <span className="flex items-center justify-center gap-2">
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    Processing…
  </span>
)

export default App
