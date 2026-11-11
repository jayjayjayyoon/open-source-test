import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, isAbsolute } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const registryPath = resolve(root, 'experiments/README.md');
const registry = readFileSync(registryPath, 'utf8');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const levels = new Set(['source-only', 'bounded-check', 'run-recorded']);

function section(from, to) {
  assert.ok(registry.includes(from), `Missing section: ${from}`);
  return registry.split(from)[1].split(to)[0];
}

function tableRows(text) {
  return text.split(/\r?\n/).filter((line) => /^\|\s*EXP-/.test(line));
}

function cells(row) {
  return row.split('|').slice(1, -1).map((part) => part.trim());
}

const independent = tableRows(section('## Registered experiments', '### EXP-0001'));
const cases = tableRows(section('### EXP-0001', '## Minimal workflow'));

test('registered experiment IDs/slugs are well-formed, ordered, unique and never skipped', () => {
  assert.ok(independent.length >= 2, 'Keep original UI suite and GPT Bridge');
  const ids = [], slugs = [];
  for (const row of independent) {
    const fields = cells(row);
    assert.equal(fields.length, 7, 'Registry rows need exactly seven columns');
    assert.match(fields[0], /^EXP-\d{4}$/);
    assert.match(fields[1], /^`[a-z0-9]+(?:-[a-z0-9]+)*`$/);
    assert.match(fields[2], /^`[a-z0-9]+(?:-[a-z0-9]+)*`$/);
    assert.match(fields[5], /^`[a-z-]+`$/);
    assert.ok(levels.has(fields[5].slice(1, -1)), 'Unknown evidence level');
    assert.ok(fields[6].length > 12, 'Every status needs its evidence boundary');
    ids.push(fields[0]); slugs.push(fields[1]);
  }
  assert.equal(new Set(ids).size, ids.length, 'Duplicate experiment ID');
  assert.equal(new Set(slugs).size, slugs.length, 'Duplicate slug');
  assert.deepEqual(ids.map((id) => Number(id.slice(4))), ids.map((_, index) => index + 1),
    'IDs must be ordered and existing IDs retained (no gaps)');
  const next = registry.match(/\*\*Next EXP ID:\s*`(EXP-\d{4})`\*\*/);
  assert.ok(next, 'Declare next ID');
  assert.equal(Number(next[1].slice(4)), ids.length + 1, 'Next ID must follow the last row');
});

test('local experiment source links exist and do not escape repository', () => {
  for (const row of independent) {
    const fields = cells(row);
    for (const index of [3, 4]) {
      const link = fields[index].match(/\[[^\]]+\]\(([^)]+)\)/);
      assert.ok(link, `EXP ${fields[0]}: source/upstream needs a real link`);
      if (/^https:\/\//.test(link[1])) continue;
      assert.ok(!/^\w+:/.test(link[1]), 'Unsupported URL protocol');
      const path = resolve(dirname(registryPath), decodeURIComponent(link[1].split('#')[0]));
      const rel = relative(root, path);
      assert.ok(rel && rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\')
        && !isAbsolute(rel), `Link leaves repository: ${link[1]}`);
      assert.ok(existsSync(path), `Missing source path: ${link[1]}`);
    }
  }
});

test('UI subcases are unique and point to known parent experiments', () => {
  const parents = new Set(independent.map((row) => cells(row)[0]));
  const seen = new Set();
  assert.equal(cases.length, 3, 'Preserve all existing three UI pages');
  for (const row of cases) {
    const fields = cells(row);
    assert.equal(fields.length, 3, 'UI case: ID, page link, purpose');
    assert.match(fields[0], /^EXP-\d{4}\/UI-\d{2}$/);
    assert.ok(parents.has(fields[0].split('/')[0]), 'Case without registered parent');
    assert.ok(!seen.has(fields[0]), 'Duplicate UI case');
    seen.add(fields[0]);
    assert.match(fields[1], /\]\(https:\/\//, 'UI page needs a concrete URL');
  }
});

test('root UI tests are scoped: experimental tools must not be executed implicitly', () => {
  assert.equal(pkg.scripts.test, 'node --test "tests/*.test.mjs"');
});
