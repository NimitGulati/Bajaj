'use strict';

const { detectRoots } = require('./rootDetector');

/**
 * Resolves the root for a graph group.
 *
 * Rules:
 *  - If there are natural roots (nodes that are never a child), return the
 *    first one (alphabetically smallest after sort in detectRoots).
 *  - If the graph is a pure cycle (no natural root) choose the
 *    lexicographically smallest node as root.
 *
 * @param {Object.<string, string[]>} adjacencyList
 * @param {Set<string>} allNodes
 * @returns {string}
 */
const resolveRoot = (adjacencyList, allNodes) => {
  const roots = detectRoots(adjacencyList, allNodes);

  if (roots.length > 0) {
    return roots[0]; // already sorted; pick the smallest
  }

  // Cyclic group – no natural root; pick lexicographically smallest node
  const sorted = [...allNodes].sort();
  return sorted[0];
};

module.exports = { resolveRoot };
