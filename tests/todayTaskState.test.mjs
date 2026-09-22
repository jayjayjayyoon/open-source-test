import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TASK_STORAGE_KEY, exampleTasks, koreaDateKey, readDemoProgress, remainingTasks,
} from '../src/todayTaskState.js';

test('each sample task has a unique ID and a valid existing-screen destination', () => {
  assert.equal(new Set(exampleTasks.map(({ id }) => id)).size, exampleTasks.length);
  assert.deepEqual(exampleTasks.map(({ destination }) => destination), [
    'map', './scale-lab.html', './relationship-lab.html',
  ]);
});

test('completed tasks disappear individually and all-complete yields an empty list', () => {
  const firstId = exampleTasks[0].id;
  assert.equal(remainingTasks([]).length, exampleTasks.length);
  assert.equal(remainingTasks([firstId]).length, exampleTasks.length - 1);
  assert.ok(remainingTasks([firstId]).every(({ id }) => id !== firstId));
  assert.deepEqual(remainingTasks(exampleTasks.map(({ id }) => id)), []);
  assert.equal(remainingTasks([]).length, exampleTasks.length); // undo
});

test('demo completion loads only on the matching KST day and ignores invalid IDs', () => {
  const today = '2026-09-22';
  const storage = { getItem: (key) => key === TASK_STORAGE_KEY ? JSON.stringify({
    date: today, completedIds: ['map', 'map', 'not-a-task', 'scale'],
  }) : null };
  assert.deepEqual(readDemoProgress(storage, today), ['map', 'scale']);
  assert.deepEqual(readDemoProgress(storage, '2026-09-23'), []);
  assert.equal(koreaDateKey(new Date('2026-09-21T15:30:00.000Z')), today);
});

test('missing or inaccessible browser storage starts with an empty checklist', () => {
  assert.deepEqual(readDemoProgress({ getItem: () => null }, '2026-09-22'), []);
  assert.deepEqual(readDemoProgress({ getItem: () => '{invalid json' }, '2026-09-22'), []);
  assert.deepEqual(readDemoProgress({ getItem: () => { throw new Error('blocked'); } }, '2026-09-22'), []);
});
