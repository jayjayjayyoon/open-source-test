import test from 'node:test';
import assert from 'node:assert/strict';
import { RELATION_NODES, RELATION_EDGES } from '../src/relationshipData.js';
import { IMPORTANCE_LEVELS, visualImportance } from '../src/importance.js';

test('all existing nodes receive a known visual tier', () => {
  for (const node of RELATION_NODES) {
    assert.ok(IMPORTANCE_LEVELS[visualImportance(node.id)], node.id);
  }
});

test('core, major and detail visual diameters are strictly ordered', () => {
  assert.ok(IMPORTANCE_LEVELS.core.diameter > IMPORTANCE_LEVELS.major.diameter);
  assert.ok(IMPORTANCE_LEVELS.major.diameter > IMPORTANCE_LEVELS.detail.diameter);
  assert.equal(visualImportance('lab'), 'core');
  assert.equal(visualImportance('tower'), 'core');
  assert.equal(visualImportance('reactflow'), 'major');
  assert.equal(visualImportance('reference'), 'detail');
});

test('changing visual tiers does not modify original relationship references', () => {
  const ids = new Set(RELATION_NODES.map(node => node.id));
  for (const edge of RELATION_EDGES) {
    assert.ok(ids.has(edge.source));
    assert.ok(ids.has(edge.target));
  }
});
