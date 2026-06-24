'use strict';

const { validateEntry } = require('../utils/validateEntry');
const { buildGraph } = require('../utils/graphBuilder');
const { separateGroups } = require('../utils/groupSeparator');
const { hasCycle } = require('../utils/cycleDetector');
const { resolveRoot } = require('../utils/rootResolver');
const { buildTree, calcDepth } = require('../utils/treeBuilder');

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 – Input processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates all entries and separates them into:
 *  - uniqueEdges        : first occurrence of each valid edge
 *  - duplicateEdges     : edges seen more than once (stored only once, not every copy)
 *  - invalidEntries     : entries that failed validation
 *
 * Multi-parent rule is NOT applied here; it is applied later during graph
 * construction so that it can be applied per-group.
 *
 * @param {string[]} data
 * @returns {{
 *   uniqueEdges: string[],
 *   duplicateEdges: string[],
 *   invalidEntries: string[]
 * }}
 */
const processInputData = (data) => {
  const seen = new Set();
  const uniqueEdges = [];
  const duplicateEdges = [];
  const invalidEntries = [];

  for (const raw of data) {
    const result = validateEntry(raw);

    if (!result.valid) {
      invalidEntries.push(typeof raw === 'string' ? raw.trim() : String(raw));
      continue;
    }

    const edge = `${result.parent}->${result.child}`;

    if (seen.has(edge)) {
      // Only record the first duplicate occurrence (not all repeats)
      if (!duplicateEdges.includes(edge)) {
        duplicateEdges.push(edge);
      }
    } else {
      seen.add(edge);
      uniqueEdges.push(edge);
    }
  }

  return { uniqueEdges, duplicateEdges, invalidEntries };
};

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 – Apply multi-parent rule
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filters edges so that each child node has at most one parent.
 * "First parent wins" – subsequent parents are silently discarded.
 *
 * @param {string[]} edges
 * @returns {string[]}
 */
const applyMultiParentRule = (edges) => {
  const childOwner = new Map(); // child → first parent that claimed it
  const filtered = [];

  for (const edge of edges) {
    const [parent, child] = edge.split('->');

    if (!childOwner.has(child)) {
      childOwner.set(child, parent);
      filtered.push(edge);
    }
    // else: another parent already owns this child → silently discard
  }

  return filtered;
};

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 – Build hierarchies per group
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a single connected-component group into a hierarchy object.
 *
 * @param {{ nodes: Set<string>, adjacencyList: Object.<string, string[]> }} group
 * @returns {{
 *   root: string,
 *   tree?: Object,
 *   depth?: number,
 *   has_cycle?: true
 * }}
 */
const buildHierarchy = (group) => {
  const { nodes, adjacencyList } = group;
  const cyclic = hasCycle(adjacencyList, nodes);
  const root = resolveRoot(adjacencyList, nodes);

  if (cyclic) {
    return { root, tree: {}, has_cycle: true };
  }

  const tree = buildTree(adjacencyList, root);
  const depth = calcDepth(tree);

  return { root, tree, depth };
};

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 – Summary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a summary object from the array of hierarchy objects.
 *
 * @param {Array<{ root: string, depth?: number, has_cycle?: true }>} hierarchies
 * @returns {{ total_trees: number, total_cycles: number, largest_tree_root: string }}
 */
const buildSummary = (hierarchies) => {
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = '';
  let maxDepth = -1;

  for (const h of hierarchies) {
    if (h.has_cycle) {
      total_cycles += 1;
    } else {
      total_trees += 1;
      const depth = h.depth || 0;
      if (
        depth > maxDepth ||
        (depth === maxDepth && h.root < largest_tree_root)
      ) {
        maxDepth = depth;
        largest_tree_root = h.root;
      }
    }
  }

  return { total_trees, total_cycles, largest_tree_root };
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Orchestrates the complete hierarchy processing pipeline.
 *
 * @param {string[]} data
 * @returns {{
 *   hierarchies: Array,
 *   invalid_entries: string[],
 *   duplicate_edges: string[],
 *   summary: Object
 * }}
 */
const processHierarchyData = (data) => {
  // 1. Validate & deduplicate
  const { uniqueEdges, duplicateEdges, invalidEntries } = processInputData(data);

  // 2. Multi-parent rule
  const cleanEdges = applyMultiParentRule(uniqueEdges);

  // 3. Build full graph
  const { adjacencyList, allNodes } = buildGraph(cleanEdges);

  // Handle empty input
  if (allNodes.size === 0) {
    return {
      hierarchies: [],
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary: { total_trees: 0, total_cycles: 0, largest_tree_root: '' },
    };
  }

  // 4. Split into independent groups
  const groups = separateGroups(adjacencyList, allNodes);

  // 5. Build hierarchy per group
  const hierarchies = groups.map(buildHierarchy);

  // 6. Summary
  const summary = buildSummary(hierarchies);

  return { hierarchies, invalid_entries: invalidEntries, duplicate_edges: duplicateEdges, summary };
};

module.exports = {
  processHierarchyData,
  processInputData,
  applyMultiParentRule,
  buildHierarchy,
  buildSummary,
};
