// Synthetic fixtures only. No user projects, private data, or live integrations.
export const SCALE_SIZES = [50, 200, 1000];
export const AREAS = ['연구 예시', '학습 예시', '개발 예시', '운영 예시', '아이디어 예시'];
export const STATES = ['NOW', 'NEXT', 'WAITING', 'DONE'];
export const SCENARIOS = {
  balanced: { label: '균형형', description: '프로젝트와 작업이 고르게 늘어나는 기본형' },
  projectHeavy: { label: '프로젝트 증가형', description: '프로젝트 수가 많고 프로젝트당 작업은 적은 구조' },
  taskHeavy: { label: '작업 집중형', description: '프로젝트 수는 적고 한 프로젝트 아래 작업이 매우 많은 구조' },
  mixed: { label: '복합형', description: '프로젝트·작업·문서·결정 노드가 섞인 구조' },
  crossLinked: { label: '관계 증가형', description: '계층 관계 외 프로젝트 간 교차 연결이 많은 구조' },
};

function scenarioCounts(size, scenario) {
  if (scenario === 'projectHeavy') {
    const projectCount = Math.min(Math.max(30, Math.floor(size * 0.42)), size - 6);
    return { projectCount, itemCount: size - 6 - projectCount };
  }
  if (scenario === 'taskHeavy') {
    const projectCount = Math.min(12, size - 6);
    return { projectCount, itemCount: size - 6 - projectCount };
  }
  const projectCount = Math.min(20, size - 6);
  return { projectCount, itemCount: size - 6 - projectCount };
}

function mixedKind(index) {
  return ['task', 'task', 'document', 'decision'][index % 4];
}

export function createScaleData(size, scenario = 'balanced') {
  if (!SCALE_SIZES.includes(size)) throw new RangeError('Unsupported scale size');
  if (!SCENARIOS[scenario]) throw new RangeError('Unsupported scenario');

  const { projectCount, itemCount } = scenarioCounts(size, scenario);
  const nodes = [{ id: 'root', parentId: null, kind: 'root', title: '전체 작업 영역', area: -1, project: -1, status: 'NOW', x: 40, y: 1050 }];

  for (let a = 0; a < AREAS.length; a += 1) {
    nodes.push({ id: `area-${a}`, parentId: 'root', kind: 'area', title: AREAS[a], area: a, project: -1, status: STATES[a % 4], x: 310, y: a * 470 + 140 });
  }

  for (let p = 0; p < projectCount; p += 1) {
    const area = p % AREAS.length;
    nodes.push({
      id: `project-${p}`,
      parentId: `area-${area}`,
      kind: 'project',
      title: `예시 프로젝트 ${String(p + 1).padStart(2, '0')}`,
      area,
      project: p,
      status: STATES[p % 4],
      x: 630,
      y: p * 108 + 90,
    });
  }

  for (let i = 0; i < itemCount; i += 1) {
    const p = scenario === 'taskHeavy' ? i % projectCount : (i * 7) % projectCount;
    const sequence = Math.floor(i / Math.max(projectCount, 1));
    const kind = scenario === 'mixed' ? mixedKind(i) : 'task';
    const prefix = kind === 'task' ? '가상 작업' : kind === 'document' ? '가상 문서' : '가상 결정';
    nodes.push({
      id: `${kind}-${i}`,
      parentId: `project-${p}`,
      kind,
      title: `${prefix} ${String(i + 1).padStart(4, '0')}`,
      area: p % AREAS.length,
      project: p,
      status: STATES[i % 4],
      x: 990 + Math.floor(sequence / 3) * 185,
      y: p * 108 + (sequence % 3) * 32 + 80,
    });
  }

  const edges = nodes.filter((node) => node.parentId).map((node) => ({
    id: `edge-${node.id}`,
    source: node.parentId,
    target: node.id,
    relation: 'parent',
  }));

  if (scenario === 'crossLinked' && projectCount > 2) {
    for (let p = 0; p < projectCount; p += 1) {
      const target = (p * 3 + 5) % projectCount;
      if (target !== p) {
        edges.push({ id: `cross-${p}-${target}`, source: `project-${p}`, target: `project-${target}`, relation: 'related' });
      }
    }
  }

  return { nodes, edges, scenario, projectCount };
}

export function selectScaleGraph(dataset, mode, areaIndex = null, projectIndex = null) {
  if (mode === 'full') return dataset;
  const visibleNodes = dataset.nodes.filter((node) => {
    if (node.kind === 'root' || node.kind === 'area') return true;
    if (areaIndex === null) return false;
    if (node.kind === 'project') return node.area === areaIndex;
    return projectIndex !== null && node.project === projectIndex;
  });
  const ids = new Set(visibleNodes.map((node) => node.id));
  return {
    ...dataset,
    nodes: visibleNodes,
    edges: dataset.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
  };
}

export function getNodePath(dataset, node) {
  if (!node || node.kind === 'root') return ['전체 작업 영역'];
  const areaName = AREAS[node.area] ?? '알 수 없는 분야';
  if (node.kind === 'area') return ['전체 작업 영역', areaName];
  const projectNode = dataset.nodes.find((candidate) => candidate.id === `project-${node.project}`);
  if (node.kind === 'project') return ['전체 작업 영역', areaName, projectNode?.title ?? node.title];
  return ['전체 작업 영역', areaName, projectNode?.title ?? `프로젝트 ${node.project + 1}`, node.title];
}
