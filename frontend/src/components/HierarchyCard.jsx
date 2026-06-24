import React from 'react'
import TreeView from './TreeView'

/**
 * Renders a single hierarchy (tree or cyclic group).
 *
 * @param {{ hierarchy: Object, index: number }} props
 */
const HierarchyCard = ({ hierarchy, index }) => {
  const isCyclic = hierarchy.has_cycle === true

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        isCyclic
          ? 'border-amber-300 bg-amber-50'
          : 'border-indigo-200 bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 text-sm">
          Group {index + 1} — Root:{' '}
          <span
            className={`font-bold ${isCyclic ? 'text-amber-600' : 'text-indigo-600'}`}
          >
            {hierarchy.root}
          </span>
        </h3>

        <div className="flex gap-2">
          {isCyclic ? (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-200 text-amber-800 font-medium">
              🔄 Cyclic
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 font-medium">
              ✓ Tree · depth {hierarchy.depth}
            </span>
          )}
        </div>
      </div>

      {/* Tree visualisation */}
      <TreeView tree={hierarchy.tree} />
    </div>
  )
}

export default HierarchyCard
