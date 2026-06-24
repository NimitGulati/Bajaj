import React, { useState } from 'react'

/**
 * Recursively renders a nested hierarchy object.
 *
 * Input shape:  { A: { B: { D: {} }, C: {} } }
 *
 * @param {{ tree: Object, depth?: number }} props
 */
const TreeNode = ({ label, children, isRoot = false }) => {
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = children && Object.keys(children).length > 0

  return (
    <li className="ml-4 my-1">
      <div className="flex items-center gap-1">
        {/* Expand / collapse toggle */}
        {hasChildren ? (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-5 h-5 flex items-center justify-center text-xs rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors font-bold"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '+' : '−'}
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-xs text-gray-300">
            ●
          </span>
        )}

        <span
          className={`px-2 py-0.5 rounded-full text-sm font-semibold border ${
            isRoot
              ? 'bg-indigo-600 text-white border-indigo-700'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          {label}
        </span>
      </div>

      {hasChildren && !collapsed && (
        <ul className="border-l-2 border-indigo-200 pl-2 mt-1">
          {Object.entries(children).map(([childLabel, grandchildren]) => (
            <TreeNode
              key={childLabel}
              label={childLabel}
              children={grandchildren}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Top-level TreeView component.
 *
 * @param {{ tree: Object }} props
 *   tree – the hierarchy object, e.g. { A: { B: { D: {} }, C: {} } }
 */
const TreeView = ({ tree }) => {
  if (!tree || Object.keys(tree).length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No tree structure available (cyclic graph).
      </p>
    )
  }

  return (
    <ul className="text-sm">
      {Object.entries(tree).map(([rootLabel, children]) => (
        <TreeNode
          key={rootLabel}
          label={rootLabel}
          children={children}
          isRoot
        />
      ))}
    </ul>
  )
}

export default TreeView
