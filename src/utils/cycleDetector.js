'use strict';

/**
 * DFS-based cycle detection for directed graphs.
 *
 * Uses a "visited" set and a "recursion stack" set.
 * Returns true if the graph (or subgraph) contains at least one cycle.
 *
 * @param {Object.<string, string[]>} adjacencyList
 * @param {Set<string>} allNodes
 * @returns {boolean}
 */
const hasCycle = (adjacencyList, allNodes) => {
  const visited = new Set();
  const recStack = new Set();

  /**
   * @param {string} node
   * @returns {boolean}
   */
  const dfs = (node) => {
    visited.add(node);
    recStack.add(node);

    const neighbours = adjacencyList[node] || [];
    for (const neighbour of neighbours) {
      if (!visited.has(neighbour)) {
        if (dfs(neighbour)) return true;
      } else if (recStack.has(neighbour)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  };

  for (const node of allNodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
};

module.exports = { hasCycle };
