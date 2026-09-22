import test from 'node:test';
import assert from 'node:assert/strict';
import { sectors } from '../src/sectorNavigation.js';

test('five sectors have unique identifiers and usable initial pages', () => {
  assert.deepEqual(sectors.map(({ id }) => id), ['project', 'ai', 'data', 'brief', 'archive']);
  assert.equal(new Set(sectors.map(({ id }) => id)).size, sectors.length);
  for (const sector of sectors) {
    assert.ok(sector.pages.length > 0);
    assert.equal(new Set(sector.pages.map(({ id }) => id)).size, sector.pages.length);
    assert.ok(sector.pages.every(({ label }) => label.trim()));
  }
});

test('existing project subpages and newspaper slot remain discoverable', () => {
  assert.deepEqual(sectors[0].pages.map(({ id }) => id), ['map', 'board', 'about']);
  assert.ok(sectors.find(({ id }) => id === 'brief').pages.some(({ id }) => id === 'morning'));
  assert.ok(sectors.find(({ id }) => id === 'data').pages.some(({ id }) => id === 'missing'));
});
