import test from 'node:test';
import assert from 'node:assert/strict';
import { SCALE_SIZES, createScaleData, selectScaleGraph } from '../src/scaleData.js';

for (const size of SCALE_SIZES) {
  test(`synthetic ${size}-node fixture has consistent references`, () => {
    const data = createScaleData(size);
    assert.equal(data.nodes.length, size);
    assert.equal(data.edges.length, size - 1);
    const ids = new Set(data.nodes.map((node) => node.id));
    assert.equal(ids.size, size);
    for (const edge of data.edges) {
      assert.ok(ids.has(edge.source));
      assert.ok(ids.has(edge.target));
    }
    assert.equal(selectScaleGraph(data, 'full').nodes.length, size);
    assert.equal(selectScaleGraph(data, 'hierarchy').nodes.length, 6);
    assert.equal(selectScaleGraph(data, 'hierarchy', 0).nodes.length, 10);
    const focused = selectScaleGraph(data, 'hierarchy', 0, 0);
    const expectedTasks = data.nodes.filter((node) => node.kind === 'task' && node.project === 0).length;
    assert.equal(focused.nodes.length, 10 + expectedTasks);
    assert.ok(focused.nodes.length < size);
    assert.equal(focused.edges.length, focused.nodes.length - 1);
  });
}

test('unsupported scale size is rejected', () => {
  assert.throws(() => createScaleData(51), RangeError);
});
