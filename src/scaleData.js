// Synthetic fixtures only. No user projects, private data, or live integrations.
export const SCALE_SIZES = [50, 200, 1000];
export const AREAS = ['연구 예시', '학습 예시', '개발 예시', '운영 예시', '아이디어 예시'];
export const STATES = ['NOW', 'NEXT', 'WAITING', 'DONE'];

export function createScaleData(size) {
  if (!SCALE_SIZES.includes(size)) throw new RangeError('Unsupported scale size');
  const nodes = [{ id: 'root', parentId: null, kind: 'root', title: '전체 작업 영역', area: -1, project: -1, status: 'NOW', x: 40, y: 1050 }];
  for (let a = 0; a < AREAS.length; a += 1) {
    nodes.push({ id: `area-${a}`, parentId: 'root', kind: 'area', title: AREAS[a], area: a, project: -1, status: STATES[a % 4], x: 310, y: a * 470 + 140 });
  }
  for (let p = 0; p < 20; p += 1) {
    nodes.push({ id: `project-${p}`, parentId: `area-${Math.floor(p / 4)}`, kind: 'project', title: `예시 프로젝트 ${String(p + 1).padStart(2, '0')}`, area: Math.floor(p / 4), project: p, status: STATES[p % 4], x: 630, y: p * 120 + 90 });
  }
  for (let i = 0; i < size - 26; i += 1) {
    const p = i % 20;
    const sequence = Math.floor(i / 20);
    nodes.push({ id: `task-${i}`, parentId: `project-${p}`, kind: 'task', title: `가상 작업 ${String(i + 1).padStart(4, '0')}`, area: Math.floor(p / 4), project: p, status: STATES[i % 4], x: 990 + Math.floor(sequence / 3) * 185, y: p * 120 + (sequence % 3) * 32 + 80 });
  }
  const edges = nodes.filter((node) => node.parentId).map((node) => ({ id: `edge-${node.id}`, source: node.parentId, target: node.id }));
  return { nodes, edges };
}

// Overview: 6 nodes. Area focus: 10. Project focus: only that project's tasks plus ancestors.
// In full mode all nodes/edges render: this is intentionally a stress test, not the default UI.
export function selectScaleGraph(dataset, mode, areaIndex = null, projectIndex = null) {
  if (mode === 'full') return dataset;
  const visibleNodes = dataset.nodes.filter((node) => {
    if (node.kind === 'root' || node.kind === 'area') return true;
    if (areaIndex === null) return false;
    if (node.kind === 'project') return node.area === areaIndex;
    return projectIndex !== null && node.project === projectIndex;
  });
  const ids = new Set(visibleNodes.map((node) => node.id));
  return { nodes: visibleNodes, edges: dataset.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)) };
}
