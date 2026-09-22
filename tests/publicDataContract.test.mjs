import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLIC_DATA_STATUS, RECORD_STATES, RECORD_TYPES, REQUIRED_FIELDS, validatePublicRecord,
} from '../src/publicDataContract.js';

const example = {
  id: 'public-example-1', type: 'task', title: '공개 샘플', status: 'verified',
  sourceRef: 'https://example.org/public-evidence', verifiedAt: '2026-09-22',
  visibility: 'public-approved', sourceAccess: 'public', sourceVerified: true,
};

test('minimum record fields and enumerated types are defined', () => {
  assert.deepEqual(RECORD_TYPES, ['project', 'task', 'decision', 'artifact']);
  assert.ok(RECORD_STATES.includes('unknown'));
  assert.ok(REQUIRED_FIELDS.some(({ key }) => key === 'sourceRef'));
  assert.ok(REQUIRED_FIELDS.some(({ key }) => key === 'visibility'));
});

test('private, unverified and incomplete items cannot be published', () => {
  assert.deepEqual(validatePublicRecord(example), { ok: true, reason: null });
  assert.equal(validatePublicRecord({ ...example, visibility: 'private' }).ok, false);
  assert.equal(validatePublicRecord({ ...example, sourceAccess: 'private' }).ok, false);
  assert.equal(validatePublicRecord({ ...example, sourceVerified: false }).ok, false);
  assert.equal(validatePublicRecord({ ...example, sourceRef: '' }).ok, false);
  assert.equal(validatePublicRecord({ ...example, status: 'made-up' }).ok, false);
  assert.equal(validatePublicRecord(null).ok, false);
});

test('public site starts without private imports, live sync, or invented counts', () => {
  assert.equal(PUBLIC_DATA_STATUS.liveSync, false);
  assert.equal(PUBLIC_DATA_STATUS.privateStorage, 'not_configured');
  assert.equal(PUBLIC_DATA_STATUS.source, 'not_connected');
  assert.deepEqual(PUBLIC_DATA_STATUS.publicRecords, []);
});
