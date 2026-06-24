'use strict';

/**
 * Detects root nodes in a directed graph.
 * A root is any node that never appears as a child in any edge.
 *
 * Supports multiple roots.
 *
 * @param {Object.<string, string[]>} adjacencyList
 * @param {Set<string>} allNodes
 * @returns {string[]} Sorted array of root node labels
 */
const detectRoots = (adjacencyList, allNodes) => {
  const childNodes = new Set();

  for (const children of Object.values(adjacencyList)) {
    for (const child of children) {
      childNodes.add(child);
    }
  }

  const roots = [];
  for (const node of allNodes) {
    if (!childNodes.has(node)) {
      roots.push(node);
    }
  }

  return roots.sort();
};

module.exports = { detectRoots };
