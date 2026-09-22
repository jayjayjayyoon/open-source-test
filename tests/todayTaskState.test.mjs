import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TASK_STORAGE_KEY, exampleTasks, koreaDateKey, readDemoProgress, remainingTasks, progressForDate,
} from '../src/todayTaskState.js';

test('each sample task has a unique ID and points to the exact relevant screen', () => {
  assert.equal(new Set(exampleTasks.map(({ id }) => id)).size, exampleTasks.length);
  assert.deepEqual(exampleTasks.map(({ destination }) => destination), [
    'map', 'preview', './relationship-lab.html',
  ]);
});

test('completion removes each task and undo restores all samples', () => {
  const first = exampleTasks[0].id;
  assert.equal(remainingTasks([]).length, exampleTasks.length);
  assert.equal(remainingTasks([first]).length, exampleTasks.length - 1);
  assert.ok(remainingTasks([first]).every(({ id }) => id !== first));
  assert.deepEqual(remainingTasks(exampleTasks.map(({ id }) => id)), []);
  assert.equal(remainingTasks([]).length, exampleTasks.length);
});

test('progress only loads on the matching KST date and drops unknown IDs', () => {
  const today = '2026-09-22';
  const storage = { getItem: (key) => key === TASK_STORAGE_KEY ? JSON.stringify({
    date: today, completedIds: ['map', 'map', 'not-a-task', 'responsive'],
  }) : null };
  assert.deepEqual(readDemoProgress(storage, today), ['map', 'responsive']);
  assert.deepEqual(readDemoProgress(storage, '2026-09-23'), []);
  assert.equal(koreaDateKey(new Date('2026-09-21T15:30:00.000Z')), today);
});

test('date rollover discards old-day in-memory checks before storage is rewritten', () => {
  const oldProgress = { date: '2026-09-22', completedIds: ['map', 'responsive'] };
  assert.equal(progressForDate(oldProgress, '2026-09-22'), oldProgress);
  assert.deepEqual(progressForDate(oldProgress, '2026-09-23'), { date: '2026-09-23', completedIds: [] });
});

test('missing or inaccessible browser storage starts with an empty checklist', () => {
  assert.deepEqual(readDemoProgress({ getItem: () => null }, '2026-09-22'), []);
  assert.deepEqual(readDemoProgress({ getItem: () => '{invalid json' }, '2026-09-22'), []);
  assert.deepEqual(readDemoProgress({ getItem: () => { throw new Error('blocked'); } }, '2026-09-22'), []);
});
