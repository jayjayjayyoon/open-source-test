// Public schema contract only. Never import private conversation exports into this repository.
export const RECORD_TYPES = Object.freeze(['project', 'task', 'decision', 'artifact']);
export const RECORD_STATES = Object.freeze(['planned', 'in_progress', 'blocked', 'verified', 'completed', 'unknown']);
export const REQUIRED_FIELDS = Object.freeze([
  { key: 'id', description: '변경되지 않는 고유 ID' },
  { key: 'type', description: '프로젝트·작업·결정·결과물의 구분' },
  { key: 'title', description: '확인된 이름' },
  { key: 'status', description: '근거로 확인한 상태 또는 unknown' },
  { key: 'sourceRef', description: '원본의 추적 가능한 참조' },
  { key: 'verifiedAt', description: '상태를 확인한 날짜(YYYY-MM-DD)' },
  { key: 'visibility', description: '비공개 / 공개 승인' },
]);

export const PUBLIC_DATA_STATUS = Object.freeze({
  source: 'not_connected',
  privateStorage: 'not_configured',
  importStatus: 'waiting_for_user_export',
  liveSync: false,
  publicRecords: Object.freeze([]),
});

// Both explicit human approval AND publicly accessible provenance are required.
// A valid shape alone is never permission to publish.
export function validatePublicRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { ok: false, reason: 'invalid-record' };
  if (!REQUIRED_FIELDS.every(({ key }) => typeof record[key] === 'string' && record[key].trim())) return { ok: false, reason: 'missing-fields' };
  if (!RECORD_TYPES.includes(record.type) || !RECORD_STATES.includes(record.status)) return { ok: false, reason: 'invalid-type-or-state' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.verifiedAt)) return { ok: false, reason: 'invalid-date' };
  if (record.visibility !== 'public-approved' || record.sourceAccess !== 'public' || record.sourceVerified !== true) return { ok: false, reason: 'not-approved-or-unverified' };
  return { ok: true, reason: null };
}
