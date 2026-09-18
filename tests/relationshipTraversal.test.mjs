import test from 'node:test';
import assert from 'node:assert/strict';
import { RELATION_EDGES, LINK_TYPES } from '../src/relationshipData.js';
import { relationshipNeighborhood, describeTwoStepRoute } from '../src/relationshipTraversal.js';

const allTypes = Object.keys(LINK_TYPES);
test('one-hop and two-hop exploration reach beyond a single-parent tree', () => {
  const direct = relationshipNeighborhood('lab', allTypes, 1);
  const extended = relationshipNeighborhood('lab', allTypes, 2);
  assert.equal(direct.distances.get('network'), 1);
  assert.equal(direct.distances.has('reference'), false);
  assert.equal(extended.distances.get('reference'), 2);
  assert.ok(extended.distances.size > direct.distances.size);
  const route = describeTwoStepRoute('reference', extended.via);
  assert.ok(route);
  assert.equal(route.throughId, 'network');
  for (const edge of [route.first, route.second]) {
    assert.ok(RELATION_EDGES.some((item) => item.id === edge.id));
    assert.ok(edge.reason.trim());
  }
});

test('filters and unknown nodes never invent connections', () => {
  const filtered = relationshipNeighborhood('lab', ['depends']);
  assert.deepEqual([...filtered.distances.entries()], [['lab', 0]]);
  assert.equal(describeTwoStepRoute('network', filtered.via), null);
  assert.equal(relationshipNeighborhood('nonexistent', allTypes).distances.size, 0);
});
