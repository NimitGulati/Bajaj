import React from 'react'

/**
 * Displays the summary object returned by the API.
 *
 * @param {{ summary: { total_trees: number, total_cycles: number, largest_tree_root: string } }} props
 */
const SummaryPanel = ({ summary }) => {
  if (!summary) return null

  const items = [
    { label: 'Total Trees', value: summary.total_trees, color: 'text-indigo-600' },
    { label: 'Total Cycles', value: summary.total_cycles, color: 'text-amber-600' },
    {
      label: 'Largest Tree Root',
      value: summary.largest_tree_root || '—',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Summary
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {items.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center">
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
            <span className="text-xs text-gray-500 mt-1 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummaryPanel
