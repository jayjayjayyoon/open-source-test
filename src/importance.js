// Visual prominence is an editable, conversation-scoped design hypothesis.
// It is NOT a user-confirmed priority, deadline, progress score, or an inference from degree.
export const IMPORTANCE_LEVELS = Object.freeze({
  core: { label: '핵심 주제', diameter: 150, rationale: '이번 실험의 중심 목표·실험 자체·향후 목표' },
  major: { label: '주요 연결', diameter: 112, rationale: '실험 운영·핵심 기능·기술 기반·검증 결정' },
  detail: { label: '세부 항목', diameter: 76, rationale: '세부 기술·개별 기능·참고·추후 연동' },
});

const CORE_IDS = new Set(['lab', 'network', 'tower']);
const MAJOR_IDS = new Set([
  'repo', 'v02', 'v03', 'pages', 'reactflow', 'graph', 'context',
  'conversation', 'gate', 'scale', 'search',
]);

export function visualImportance(nodeId) {
  if (CORE_IDS.has(nodeId)) return 'core';
  if (MAJOR_IDS.has(nodeId)) return 'major';
  return 'detail';
}
