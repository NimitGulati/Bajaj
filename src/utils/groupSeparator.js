'use strict';

/**
 * Separates a graph into independent connected components using DFS.
 * Works on an undirected view of the directed graph so that all reachable
 * nodes (regardless of edge direction) end up in the same group.
 *
 * @param {Object.<string, string[]>} adjacencyList - Directed adjacency list
 * @param {Set<string>} allNodes
 * @returns {Array<{ nodes: Set<string>, adjacencyList: Object.<string, string[]> }>}
 */
const separateGroups = (adjacencyList, allNodes) => {
  // Build undirected adjacency for component discovery
  /** @type {Object.<string, Set<string>>} */
  const undirected = {};

  for (const node of allNodes) {
    if (!undirected[node]) undirected[node] = new Set();
  }

  for (const [parent, children] of Object.entries(adjacencyList)) {
    for (const child of children) {
      undirected[parent].add(child);
      if (!undirected[child]) undirected[child] = new Set();
      undirected[child].add(parent);
    }
  }

  const visited = new Set();
  const groups = [];

  const dfs = (start, component) => {
    const stack = [start];
    while (stack.length) {
      const node = stack.pop();
      if (visited.has(node)) continue;
      visited.add(node);
      component.add(node);
      for (const neighbour of undirected[node]) {
        if (!visited.has(neighbour)) stack.push(neighbour);
      }
    }
  };

  // Process nodes in sorted order for deterministic grouping
  const sortedNodes = [...allNodes].sort();

  for (const node of sortedNodes) {
    if (!visited.has(node)) {
      const component = new Set();
      dfs(node, component);

      // Build directed sub-adjacency list for this component
      const subAdj = {};
      for (const n of component) {
        if (adjacencyList[n]) {
          subAdj[n] = adjacencyList[n].filter((c) => component.has(c));
        }
      }

      groups.push({ nodes: component, adjacencyList: subAdj });
    }
  }

  return groups;
};

module.exports = { separateGroups };
