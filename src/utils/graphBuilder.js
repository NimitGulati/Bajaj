'use strict';

/**
 * Builds an adjacency list and collects all unique nodes from a list of
 * validated edge strings in "PARENT->CHILD" format.
 *
 * @param {string[]} edges - Array of valid unique edge strings e.g. ["A->B","A->C","B->D"]
 * @returns {{ adjacencyList: Object.<string, string[]>, allNodes: Set<string> }}
 */
const buildGraph = (edges) => {
  /** @type {Object.<string, string[]>} */
  const adjacencyList = {};
  const allNodes = new Set();

  for (const edge of edges) {
    const [parent, child] = edge.split('->');

    allNodes.add(parent);
    allNodes.add(child);

    if (!adjacencyList[parent]) {
      adjacencyList[parent] = [];
    }
    adjacencyList[parent].push(child);
  }

  return { adjacencyList, allNodes };
};

module.exports = { buildGraph };
