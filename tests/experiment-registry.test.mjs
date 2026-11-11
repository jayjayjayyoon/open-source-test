import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, isAbsolute } from 'node:path';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const registryPath = resolve(repositoryRoot, 'experiments/README.md');
const registry = readFileSync(registryPath, 'utf8');

function tableRows(pattern) {
  return registry.split(/\r?\n/).filter((line) => pattern.test(line));
}

function cellsOf(row) {
  return row.split('|').slice(1, -1).map((cell) => cell.trim());
}

test('experiment IDs and slugs are unique and the next ID cannot collide', () => {
  const rows = tableRows(/^\|\s*EXP-\d{4}\s*\|/);
  assert.ok(rows.length >= 2, 'Existing UI suite and GPT Bridge must be registered');

  const ids = [], slugs = [];
  for (const row of rows) {
    const cells = cellsOf(row);
    assert.ok(cells.length >= 6, 'Every experiment needs the six index fields');
    assert.match(cells[0], /^EXP-\d{4}$/);
    assert.match(cells[1], /^`[a-z0-9]+(?:-[a-z0-9]+)*`$/);
    ids.push(cells[0]);
    slugs.push(cells[1]);
  }
  assert.equal(new Set(ids).size, ids.length, 'Experiment IDs must never repeat');
  assert.equal(new Set(slugs).size, slugs.length, 'Experiment slugs must never repeat');

  const next = registry.match(/\*\*Next EXP ID:\s*`(EXP-\d{4})`\*\*/);
  assert.ok(next, 'State the next unassigned experiment ID');
  assert.equal(Number(next[1].slice(4)), Math.max(...ids.map((id) => Number(id.slice(4)))) + 1);
});

test('registered local source links resolve and are inside this repository', () => {
  const rows = tableRows(/^\|\s*EXP-\d{4}\s*\|/);
  for (const row of rows) {
    const cells = cellsOf(row);
    const link = cells[3].match(/\[[^\]]+\]\(([^)]+)\)/);
    assert.ok(link, 'Every experiment needs an existing source link');
    if (/^https?:\/\//.test(link[1])) continue; // External upstream link: not a local file.
    const path = resolve(dirname(registryPath), decodeURIComponent(link[1].split('#')[0]));
    assert.ok(!relative(repositoryRoot, path).startsWith('..') && !isAbsolute(relative(repositoryRoot, path)), 'Local source link may not leave repo');
    assert.ok(existsSync(path), `Missing source path: ${link[1]}`);
  }
});

test('UI subcases are unique children of registered experiments', () => {
  const ids = new Set(tableRows(/^\|\s*EXP-\d{4}\s*\|/).map((row) => cellsOf(row)[0]));
  const subcases = tableRows(/^\|\s*EXP-\d{4}\/UI-\d{2}\s*\|/).map((row) => cellsOf(row)[0]);
  assert.equal(new Set(subcases).size, subcases.length, 'Duplicate UI subcase');
  for (const id of subcases) assert.ok(ids.has(id.split('/')[0]), `Unknown parent for ${id}`);
});
