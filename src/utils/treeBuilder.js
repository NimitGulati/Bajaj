'use strict';

/**
 * Recursively builds the children subtree for a given node.
 * Returns an object whose keys are direct children and values are their
 * own subtrees — i.e. it does NOT wrap the current node in an extra key.
 *
 * @param {Object.<string, string[]>} adjacencyList
 * @param {string} node
 * @param {Set<string>} visited
 * @returns {Object}  e.g. for node B with child D → { D: {} }
 */
const buildSubtree = (adjacencyList, node, visited) => {
  if (visited.has(node)) return {};
  visited.add(node);

  const children = adjacencyList[node] || [];
  const subtree = {};

  for (const child of children) {
    subtree[child] = buildSubtree(adjacencyList, child, new Set(visited));
  }

  return subtree;
};

/**
 * Converts a directed adjacency list into a nested hierarchy object,
 * starting from the given root node.
 *
 * Example:
 *   adjacencyList = { A: ['B','C'], B: ['D'] }
 *   root = 'A'
 *   →  { A: { B: { D: {} }, C: {} } }
 *
 * @param {Object.<string, string[]>} adjacencyList
 * @param {string} root
 * @returns {Object}
 */
const buildTree = (adjacencyList, root) => {
  const subtree = buildSubtree(adjacencyList, root, new Set());
  return { [root]: subtree };
};

/**
 * Calculates the depth of a nested hierarchy tree object.
 * Depth = number of nodes on the longest root-to-leaf path.
 *
 * Example:
 *   { A: { B: { D: {} }, C: {} } }  →  3   (A → B → D)
 *
 * @param {Object} tree
 * @returns {number}
 */
const calcDepth = (tree) => {
  const keys = Object.keys(tree);
  if (keys.length === 0) return 0;

  let max = 0;
  for (const key of keys) {
    const childDepth = calcDepth(tree[key]);
    if (childDepth > max) max = childDepth;
  }
  return 1 + max;
};

module.exports = { buildTree, calcDepth };
