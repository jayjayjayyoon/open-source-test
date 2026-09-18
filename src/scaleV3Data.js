// Synthetic fixtures only. No user projects or external synchronization.
export const SCALE_SIZES = [50, 200, 1000];
export const AREAS = ['연구 예시', '학습 예시', '개발 예시', '운영 예시', '아이디어 예시'];
export const STATUSES = ['NOW', 'NEXT', 'WAITING', 'DONE'];
export const SCENARIOS = [
  { id: 'balanced', title: '기본형', description: '분야 5개·프로젝트 20개와 작업을 균등 배분' },
  { id: 'projects', title: '프로젝트 증가', description: '프로젝트 수를 늘려 분야별 탐색과 페이지 이동 확인' },
  { id: 'relations', title: '관계 증가', description: '소속 관계 외에 프로젝트 간 교차 연결 추가' },
  { id: 'tasks', title: '작업 집중', description: '한 프로젝트에 최대 200개의 작업 집중' },
  { id: 'mixed', title: '복합 자료', description: '작업·문서·결정과 관련 프로젝트를 함께 연결' },
];
export const PAGE_SIZE = 8;
export const CHILD_PAGE_SIZE = 30;

export function createScaleV3Data(size, scenario = 'balanced') {
  if (!SCALE_SIZES.includes(size)) throw new RangeError('지원하지 않는 노드 개수');
  if (!SCENARIOS.some((item) => item.id === scenario)) throw new RangeError('지원하지 않는 시나리오');
  const projectCount = scenario === 'projects' ? (size === 50 ? 12 : size === 200 ? 40 : 100) : 20;
  const childrenCount = size - 6 - projectCount;
  const nodes = [{ id: 'root', parentId: null, kind: 'root', title: '전체 작업 영역', area: -1, project: -1, sequence: -1, status: 'NOW', x: 40, y: 1000 }];
  for (let index = 0; index < AREAS.length; index += 1) {
    nodes.push({ id: `area-${index}`, parentId: 'root', kind: 'area', title: AREAS[index], area: index, project: -1, sequence: -1, status: STATUSES[index % 4], x: 320, y: index * 430 + 100 });
  }
  for (let index = 0; index < projectCount; index += 1) {
    const area = Math.floor(index * AREAS.length / projectCount);
    nodes.push({ id: `project-${index}`, parentId: `area-${area}`, kind: 'project', title: `예시 프로젝트 ${String(index + 1).padStart(3, '0')}`, area, project: index, sequence: -1, status: STATUSES[index % 4], x: 630, y: index * 112 + 60 });
  }
  const specialTarget = scenario === 'tasks' ? Math.min(200, Math.floor(childrenCount * 0.6)) : 0;
  const counts = Array(projectCount).fill(0);
  for (let index = 0; index < childrenCount; index += 1) {
    const project = scenario === 'tasks' && index < specialTarget ? 0 : scenario === 'tasks' ? 1 + ((index - specialTarget) % (projectCount - 1)) : index % projectCount;
    const area = Math.floor(project * AREAS.length / projectCount);
    const sequence = counts[project]++;
    const kind = scenario === 'mixed' ? ['task', 'document', 'decision'][index % 3] : 'task';
    const prefix = { task: '가상 작업', document: '가상 문서', decision: '가상 결정' }[kind];
    nodes.push({ id: `item-${index}`, parentId: `project-${project}`, kind, title: `${prefix} ${String(index + 1).padStart(4, '0')}`, area, project, sequence, status: STATUSES[index % 4], x: 990 + Math.floor(sequence / 4) * 185, y: project * 112 + (sequence % 4) * 24 + 70 });
  }
  const edges = nodes.filter((node) => node.parentId).map((node) => ({ id: `parent-${node.id}`, source: node.parentId, target: node.id, relation: 'belongs' }));
  if (scenario === 'relations' || scenario === 'mixed') {
    for (let index = 0; index < projectCount; index += 1) {
      edges.push({ id: `related-${index}`, source: `project-${index}`, target: `project-${(index + 7) % projectCount}`, relation: 'related' });
    }
  }
  return { nodes, edges, size, scenario, projectCount };
}

export function ancestors(data, id) {
  const byId = new Map(data.nodes.map((node) => [node.id, node]));
  const path = [];
  const visited = new Set();
  let current = byId.get(id);
  while (current && !visited.has(current.id)) {
    path.unshift(current);
    visited.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return path;
}

export function areaProjects(data, area) {
  return data.nodes.filter((node) => node.kind === 'project' && node.area === area);
}

export function projectChildren(data, project) {
  return data.nodes.filter((node) => node.parentId === `project-${project}`);
}

// Related links are displayed only when both endpoints are in view.
export function selectScaleV3Graph(data, mode, area = null, project = null, page = 0, childPage = 0) {
  if (mode === 'full') return data;
  const available = area === null ? [] : areaProjects(data, area).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const projectIds = new Set(available.map((node) => node.id));
  const childIds = new Set(project === null ? [] : projectChildren(data, project).slice(childPage * CHILD_PAGE_SIZE, (childPage + 1) * CHILD_PAGE_SIZE).map((node) => node.id));
  const visible = data.nodes.filter((node) => node.kind === 'root' || node.kind === 'area' || projectIds.has(node.id) || childIds.has(node.id));
  const ids = new Set(visible.map((node) => node.id));
  return { ...data, nodes: visible, edges: data.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)) };
}

export function findScaleV3Matches(data, query, limit = 8) {
  const search = query.trim().toLowerCase();
  if (!search) return [];
  return data.nodes.filter((node) => `${node.title} ${node.id} ${node.kind} ${node.status}`.toLowerCase().includes(search)).slice(0, limit);
}
