import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RELATION_NODES, RELATION_EDGES, NODE_KINDS, LINK_TYPES,
  getRelations, connectedIds,
} from '../src/relationshipData.js';

const ids = new Set(RELATION_NODES.map((node) => node.id));
const edgeIds = new Set(RELATION_EDGES.map((edge) => edge.id));

test('relationship graph has unique, complete nodes and typed links', () => {
  assert.ok(RELATION_NODES.length > 10);
  assert.ok(RELATION_EDGES.length > RELATION_NODES.length - 1, 'not just a single-parent tree');
  assert.equal(ids.size, RELATION_NODES.length);
  assert.equal(edgeIds.size, RELATION_EDGES.length);
  for (const node of RELATION_NODES) {
    assert.ok(NODE_KINDS[node.kind], `unknown node kind: ${node.id}`);
    assert.ok(node.title && node.summary && node.provenance);
    assert.ok(Number.isFinite(node.position.x) && Number.isFinite(node.position.y));
  }
  for (const edge of RELATION_EDGES) {
    assert.ok(ids.has(edge.source) && ids.has(edge.target), `dangling link: ${edge.id}`);
    assert.notEqual(edge.source, edge.target);
    assert.ok(LINK_TYPES[edge.type], `unknown link type: ${edge.id}`);
    assert.ok(edge.reason?.trim(), `missing explanation: ${edge.id}`);
  }
});

test('multiple connections and neighbor filtering preserve relationship evidence', () => {
  const labLinks = getRelations('lab');
  assert.ok(labLinks.length >= 4);
  assert.ok(new Set(labLinks.map((edge) => edge.neighborId)).size >= 4);
  for (const relation of labLinks) assert.ok(ids.has(relation.neighborId));
  assert.ok(connectedIds('lab').has('lab'));
  assert.ok(connectedIds('lab').has('network'));
  assert.equal(getRelations('lab', ['depends']).length, 0);
});

test('public experiment labels future integrations as not connected', () => {
  for (const id of ['notion', 'gitdata', 'database', 'sync']) {
    const entry = RELATION_NODES.find((node) => node.id === id);
    assert.ok(entry);
    assert.equal(entry.kind, 'future');
    assert.match(entry.state, /미연동|미구현/);
  }
});
