import test from 'node:test';
import assert from 'node:assert/strict';
import { projects, relationships, checks, STATUS } from '../src/data.js';

test('every graph node has a unique ID and a known status', () => {
  const ids = projects.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  projects.forEach(({ id, status }) => {
    assert.ok(STATUS[status], `${id} has an unknown status`);
  });
});

test('every relationship and checklist item points to an existing node', () => {
  const ids = new Set(projects.map(({ id }) => id));
  relationships.forEach(([source, target]) => {
    assert.ok(ids.has(source), `missing source: ${source}`);
    assert.ok(ids.has(target), `missing target: ${target}`);
  });
  checks.forEach(({ projectId }) => assert.ok(ids.has(projectId), `missing task target: ${projectId}`));
});

test('demo distinguishes deferred integration and formal development', () => {
  for (const id of ['sync', 'tower']) {
    assert.equal(projects.find((project) => project.id === id)?.status, 'WAITING');
  }
});
