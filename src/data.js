// This demo intentionally contains only decisions from the current conversation.
// Suggested next steps are labeled as proposals, not verified personal progress.
export const REPO_URL = 'https://github.com/jayjayjayyoon/open-source-test';

export const STATUS = {
  NOW: { label: 'NOW', description: '현재 실험', color: '#4eaeff' },
  NEXT: { label: 'NEXT', description: '다음 검증', color: '#ae8dff' },
  WAITING: { label: 'WAITING', description: '성공 후 진행', color: '#f7ba70' },
  DONE: { label: 'DONE', description: '대화에서 확정', color: '#51d7ac' },
};

export const projects = [
  {
    id: 'experiment', title: '오픈소스 실험', subtitle: '현재 진행하는 핵심 테스트', kind: 'core', status: 'NOW',
    x: 425, y: 260, icon: '◇',
    summary: '정식 Control Tower를 만들기 전에 그래프 UI가 실제로 작동하는지 확인합니다.',
    next: '화면을 직접 조작하고 원하는 디자인과 동작인지 판단하기',
    source: '현재 대화에서 확정한 실험 순서', evidence: '확정',
  },
  {
    id: 'repo', title: '테스트 저장소', subtitle: 'open-source-test', kind: 'source', status: 'DONE',
    x: 72, y: 304, icon: '⌘',
    summary: '모든 오픈소스 시험을 별도의 GitHub 저장소에서 진행하기로 정했습니다.',
    next: '이 저장소에서 데모 코드를 열고 실행하기',
    source: '사용자가 지정한 GitHub 저장소 URL', evidence: '확정', link: REPO_URL,
  },
  {
    id: 'conversation', title: '최근 대화', subtitle: '데모 데이터의 범위', kind: 'source', status: 'DONE',
    x: 72, y: 74, icon: '≋',
    summary: '이번 대화에서 정한 프로젝트 목표와 구현 범위만 샘플 데이터로 사용합니다.',
    next: '실제 Notion·다른 대화 기록을 자동으로 가져오지 않기',
    source: '사용자 요청: 최근 대화 기반으로만', evidence: '확정',
  },
  {
    id: 'sample', title: '샘플 데이터', subtitle: '연동 없는 데모', kind: 'source', status: 'DONE',
    x: 74, y: 529, icon: '{ }',
    summary: '실제 프로젝트 진척률·마감일을 만들어내지 않고 대화에서 나온 결정만 표시합니다.',
    next: '데모 정보와 검증된 실제 정보를 혼동하지 않기',
    source: '대화에서 확정된 V0 범위', evidence: '확정',
  },
  {
    id: 'reactflow', title: 'React Flow', subtitle: '그래프 오픈소스', kind: 'tool', status: 'NOW',
    x: 448, y: 42, icon: '◎',
    summary: '드래그, 확대·축소, 연결선을 제공하는 오픈소스 라이브러리로 동작을 확인합니다.',
    next: '노드를 움직이고 연결선과 미니맵이 동작하는지 확인하기',
    source: '이번 대화에서 선택한 실험 도구', evidence: '확정', link: 'https://reactflow.dev/',
  },
  {
    id: 'graph', title: '프로젝트 맵', subtitle: '관계가 보이는 화면', kind: 'feature', status: 'NOW',
    x: 765, y: 144, icon: '✳',
    summary: '프로젝트를 원형 노드로 표시하고 연결 관계를 한눈에 살펴봅니다.',
    next: '노드 이동·확대·축소 및 관계 표시 확인하기',
    source: '사용자가 승인한 그래프형 화면 구상', evidence: '확정',
  },
  {
    id: 'details', title: '상세 패널', subtitle: '노드를 클릭하면 열림', kind: 'feature', status: 'NOW',
    x: 770, y: 360, icon: '▤',
    summary: '선택한 노드의 목적, 상태, 다음 행동, 정보 출처를 표시합니다.',
    next: '서로 다른 노드를 클릭해 정보가 올바르게 바뀌는지 확인하기',
    source: '이번 대화의 프로젝트 상세 보기 시안', evidence: '확정',
  },
  {
    id: 'filters', title: '상태 필터', subtitle: 'NOW · NEXT · WAITING', kind: 'feature', status: 'NOW',
    x: 768, y: 555, icon: '☷',
    summary: '상태별로 노드를 좁혀 보고 검색어로 프로젝트를 찾습니다.',
    next: '필터를 바꿨을 때 실제로 그래프가 달라지는지 확인하기',
    source: '이번 대화의 V0 기능 범위', evidence: '확정',
  },
  {
    id: 'validation', title: '사용성 검증', subtitle: '직접 테스트할 항목', kind: 'decision', status: 'NEXT',
    x: 400, y: 600, icon: '✓',
    summary: '디자인, 노드 조작, 상세 정보, 필터가 기대대로 작동하는지 확인합니다.',
    next: '검증 보드에서 체크리스트를 하나씩 테스트하기',
    source: '이번 대화에서 정한 검증 단계', evidence: '확정',
  },
  {
    id: 'sync', title: '데이터 연동', subtitle: 'Notion · GitHub', kind: 'later', status: 'WAITING',
    x: 1105, y: 168, icon: '⇄',
    summary: 'Notion·GitHub 실제 데이터 연동은 데모 검증 후 고려합니다. 현재 연결하지 않았습니다.',
    next: '시제품 성공 여부를 결정한 후 연결 범위 정하기',
    source: '정식 개발은 테스트 성공 후 진행한다는 결정', evidence: '확정',
  },
  {
    id: 'tower', title: 'Control Tower', subtitle: '정식 프로젝트는 보류', kind: 'later', status: 'WAITING',
    x: 1112, y: 430, icon: '⬡',
    summary: '테스트가 성공했을 때 별도 저장소를 만들고 검증된 기능을 이전합니다.',
    next: '현재 실험의 성공 기준을 충족한 뒤 정식 개발 결정하기',
    source: '사용자가 확정한 저장소 분리 원칙', evidence: '확정',
  },
];

export const relationships = [
  ['conversation', 'experiment'], ['repo', 'experiment'], ['sample', 'experiment'],
  ['reactflow', 'experiment'], ['experiment', 'graph'], ['experiment', 'details'],
  ['experiment', 'filters'], ['experiment', 'validation'], ['graph', 'sync'],
  ['details', 'tower'], ['validation', 'tower'], ['sync', 'tower'],
];

export const checks = [
  { id: 'drag', title: '노드 드래그와 확대·축소', description: '그래프에서 노드를 움직이고 휠·컨트롤로 줌을 확인', projectId: 'reactflow' },
  { id: 'select', title: '노드 클릭 → 상세 정보', description: '다른 노드를 선택하면 우측 내용이 바뀌는지 확인', projectId: 'details' },
  { id: 'filter', title: '상태 필터 및 검색', description: 'NOW·WAITING 필터와 검색이 실제로 적용되는지 확인', projectId: 'filters' },
  { id: 'layout', title: '화면 디자인과 가독성', description: '화면 크기를 바꿔도 노드와 패널을 읽을 수 있는지 확인', projectId: 'graph' },
  { id: 'decision', title: '정식 개발 여부 결정', description: '앞선 항목을 확인한 뒤 Control Tower 착수 여부 판단', projectId: 'tower' },
];
