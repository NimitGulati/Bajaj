'use strict';

const request = require('supertest');
const app = require('../app');

// ─── helpers ────────────────────────────────────────────────────────────────

const post = (data) => request(app).post('/bfhl').send({ data });

// ─── 1. Valid tree ───────────────────────────────────────────────────────────

describe('1. Valid single tree', () => {
  test('returns correct hierarchy for A->B, A->C, B->D', async () => {
    const res = await post(['A->B', 'A->C', 'B->D']);
    expect(res.status).toBe(200);
    expect(res.body.summary.total_trees).toBe(1);
    expect(res.body.summary.total_cycles).toBe(0);
    expect(res.body.hierarchies[0].root).toBe('A');
    expect(res.body.hierarchies[0].depth).toBe(3);
    expect(res.body.invalid_entries).toHaveLength(0);
    expect(res.body.duplicate_edges).toHaveLength(0);
    // Verify nested structure
    const tree = res.body.hierarchies[0].tree;
    expect(tree).toHaveProperty('A');
    expect(tree.A).toHaveProperty('B');
    expect(tree.A.B).toHaveProperty('D');
    expect(tree.A).toHaveProperty('C');
  });
});

// ─── 2. Multiple independent trees ──────────────────────────────────────────

describe('2. Multiple trees', () => {
  test('A->B, B->C, X->Y produces two groups', async () => {
    const res = await post(['A->B', 'B->C', 'X->Y']);
    expect(res.status).toBe(200);
    expect(res.body.summary.total_trees).toBe(2);
    expect(res.body.summary.total_cycles).toBe(0);
    expect(res.body.hierarchies).toHaveLength(2);
    const roots = res.body.hierarchies.map((h) => h.root).sort();
    expect(roots).toEqual(['A', 'X']);
  });
});

// ─── 3. Cycle graph ──────────────────────────────────────────────────────────

describe('3. Cycle detection', () => {
  test('A->B, B->C, C->A is flagged as cyclic', async () => {
    const res = await post(['A->B', 'B->C', 'C->A']);
    expect(res.status).toBe(200);
    expect(res.body.summary.total_cycles).toBe(1);
    expect(res.body.summary.total_trees).toBe(0);
    const h = res.body.hierarchies[0];
    expect(h.has_cycle).toBe(true);
    expect(h.root).toBe('A'); // lexicographically smallest
  });

  test('larger pure cycle with no natural root: P->Q, Q->R, R->P', async () => {
    // No multi-parent conflict, clean cycle
    const res = await post(['P->Q', 'Q->R', 'R->P']);
    expect(res.status).toBe(200);
    expect(res.body.summary.total_cycles).toBe(1);
    expect(res.body.hierarchies[0].has_cycle).toBe(true);
    expect(res.body.hierarchies[0].root).toBe('P'); // lexicographically smallest
  });

  test('A->B, B->C, C->D, D->B: D->B discarded by multi-parent (B owned by A), so no cycle', async () => {
    // B is already a child of A; D->B is dropped; result is a clean chain A->B->C->D
    const res = await post(['A->B', 'B->C', 'C->D', 'D->B']);
    expect(res.status).toBe(200);
    expect(res.body.summary.total_cycles).toBe(0);
    expect(res.body.summary.total_trees).toBe(1);
  });
});

// ─── 4. Invalid entries ──────────────────────────────────────────────────────

describe('4. Invalid entries', () => {
  const invalids = ['hello', '1->2', 'AB->C', 'A-B', 'A->A', '', '   '];

  test('each invalid entry is collected correctly', async () => {
    const res = await post(invalids);
    expect(res.status).toBe(200);
    // All entries are invalid so hierarchies should be empty
    expect(res.body.hierarchies).toHaveLength(0);
    // All (trimmed) invalids should appear in invalid_entries
    expect(res.body.invalid_entries.length).toBe(invalids.length);
  });

  test('mix of valid and invalid', async () => {
    const res = await post(['A->B', 'bad', 'A->C']);
    expect(res.body.invalid_entries).toEqual(['bad']);
    expect(res.body.hierarchies).toHaveLength(1);
  });
});

// ─── 5. Duplicate edges ──────────────────────────────────────────────────────

describe('5. Duplicate edges', () => {
  test('A->B repeated three times → duplicateEdges has A->B once', async () => {
    const res = await post(['A->B', 'A->B', 'A->B']);
    expect(res.body.duplicate_edges).toEqual(['A->B']);
    // Only the first occurrence is used in the graph
    expect(res.body.hierarchies).toHaveLength(1);
    expect(res.body.hierarchies[0].root).toBe('A');
  });
});

// ─── 6. Multi-parent node ───────────────────────────────────────────────────

describe('6. Multi-parent rule', () => {
  test('A->D and B->D: first parent (A) wins, B->D is discarded', async () => {
    const res = await post(['A->D', 'B->D', 'A->B']);
    expect(res.status).toBe(200);
    // D's parent should be A (first occurrence)
    // The final tree: A -> {B, D}  (B->D discarded)
    const h = res.body.hierarchies[0];
    expect(h.root).toBe('A');
    expect(h.tree.A).toHaveProperty('D');
    expect(h.tree.A).toHaveProperty('B');
    // B should NOT have D as a child since B->D was discarded
    expect(h.tree.A.B).not.toHaveProperty('D');
  });
});

// ─── 7. Empty input ──────────────────────────────────────────────────────────

describe('7. Empty input', () => {
  test('empty array returns empty hierarchies and zero summary', async () => {
    const res = await post([]);
    expect(res.status).toBe(200);
    expect(res.body.hierarchies).toHaveLength(0);
    expect(res.body.summary.total_trees).toBe(0);
    expect(res.body.summary.total_cycles).toBe(0);
    expect(res.body.summary.largest_tree_root).toBe('');
  });

  test('missing data field returns 400', async () => {
    const res = await request(app).post('/bfhl').send({});
    expect(res.status).toBe(400);
    expect(res.body.is_success).toBe(false);
  });
});

// ─── 8. Large input ──────────────────────────────────────────────────────────

describe('8. Large input (chain of 26 nodes)', () => {
  test('linear chain A->B->C->...->Z has depth 26', async () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const edges = [];
    for (let i = 0; i < alphabet.length - 1; i++) {
      edges.push(`${alphabet[i]}->${alphabet[i + 1]}`);
    }
    const res = await post(edges);
    expect(res.status).toBe(200);
    expect(res.body.hierarchies).toHaveLength(1);
    expect(res.body.hierarchies[0].depth).toBe(26);
    expect(res.body.hierarchies[0].root).toBe('A');
    expect(res.body.summary.largest_tree_root).toBe('A');
  });
});

// ─── 9. Response schema ──────────────────────────────────────────────────────

describe('9. Response schema', () => {
  test('response always contains required fields', async () => {
    const res = await post(['A->B']);
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('email_id');
    expect(res.body).toHaveProperty('college_roll_number');
    expect(res.body).toHaveProperty('hierarchies');
    expect(res.body).toHaveProperty('invalid_entries');
    expect(res.body).toHaveProperty('duplicate_edges');
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('total_trees');
    expect(res.body.summary).toHaveProperty('total_cycles');
    expect(res.body.summary).toHaveProperty('largest_tree_root');
  });
});
