// Public, conversation-scoped experiment. No private Notion, past chats, personal records or live APIs.
// Status = documented milestone or plan in THIS conversation, not an automatically verified live status.
export const NODE_KINDS = {
  project: '프로젝트', experiment: '실험', technology: '기술', feature: '기능',
  source: '근거', decision: '결정', future: '추후 검토', deployment: '배포',
};
export const LINK_TYPES = {
  part: { label: '구성·포함', color: '#6cb8ff' },
  uses: { label: '사용·구현', color: '#45d6bf' },
  informs: { label: '근거·개선', color: '#d4a7ff' },
  depends: { label: '선행·의존', color: '#ffbc79' },
};

const item = (id, title, kind, state, x, y, summary, url = null) => ({
  id, title, kind, state, position: { x, y }, summary, url,
  provenance: '현재 대화에서 확인한 내용 · 2026-09-18 기준',
});

export const RELATION_NODES = [
  item('lab', 'Project Map Lab', 'project', '진행', 690, 390, '오픈소스로 프로젝트 관계 시각화를 검증하는 현재 실험.'),
  item('repo', 'open-source-test', 'project', '운영', 230, 390, '실험 코드를 분리해 보관하는 공개 GitHub 저장소.', 'https://github.com/jayjayjayyoon/open-source-test'),
  item('v01', '첫 그래프 데모', 'experiment', '구현', 335, 105, '최근 대화만으로 만든 11개 노드의 초기 화면.'),
  item('v02', '규모 실험 V0.2', 'experiment', '구현', 470, 605, '가상 노드 50·200·1,000개 및 단계별 표시를 비교한 실험.'),
  item('v03', '사용성 개선 V0.3', 'experiment', '구현', 690, 795, '선택 맥락, 검색, 드래그, 다양한 데이터 구조를 추가한 실험.'),
  item('network', '다중 관계 실험', 'experiment', '이번 실험', 1000, 405, '하나의 부모에만 매달리지 않는 다대다 연결을 실제 대화 근거로 검증.'),
  item('pages', 'GitHub Pages', 'deployment', '배포됨', 170, 735, '현재 데모를 집 PC를 켜두지 않고 접속할 수 있도록 배포.', 'https://jayjayjayyoon.github.io/open-source-test/'),
  item('actions', 'GitHub Actions', 'technology', '사용', 120, 935, '테스트와 빌드 및 Pages 배포를 자동 실행.'),
  item('vite', 'React · Vite', 'technology', '사용', 370, 1000, '데모 UI와 정적 웹사이트 빌드에 사용한 기술.'),
  item('reactflow', 'React Flow', 'technology', '사용', 680, 115, '노드 드래그, 줌, 연결선 등 그래프 UI의 기반.', 'https://reactflow.dev/'),
  item('graph', '그래프 화면', 'feature', '구현', 490, 330, '노드와 연결선을 탐색하는 시각화 화면.'),
  item('context', '상위 맥락 표시', 'feature', '구현', 1010, 700, '세부 항목에서 상위 분야·프로젝트를 즉시 보이도록 한 개선.'),
  item('search', '노드 검색·이동', 'feature', '구현', 1240, 860, '많은 항목에서 원하는 노드를 찾아 이동하는 기능.'),
  item('scale', '데이터 규모 검증', 'feature', '실험', 790, 1020, '무작정 1,000개를 표시하는 방식 대신 실제 적절한 규모를 검토.'),
  item('drag', '노드 이동', 'feature', '구현', 935, 130, '노드 드래그와 선택 동작을 테스트.'),
  item('reference', '관계망 참고 이미지', 'source', '참고', 1330, 115, '사용자가 공유한 정보→지식 관계망 이미지. 시각 구조 참고용이며 데이터 출처는 아님.'),
  item('conversation', '이번 대화', 'source', '근거', 1440, 1000, '현재 대화에서 직접 합의·확인한 사항만 이 데모의 데이터로 사용.'),
  item('gate', '정식 개발 보류', 'decision', '결정', 1420, 440, '그래프 실험이 만족스러울 때 Control Tower 저장소를 별도로 만드는 결정.'),
  item('tower', 'Control Tower', 'future', '계획', 1700, 435, '실험이 성공하면 정식 프로젝트로 분리해 진행할 구상. 아직 정식 구축 아님.'),
  item('notion', 'Notion 연동', 'future', '미연동', 1880, 190, '정식 단계에서 프로젝트 상태 데이터 연동을 검토하는 구상.'),
  item('gitdata', 'GitHub 데이터 연동', 'future', '미연동', 1910, 650, '정식 단계에서 코드·작업 기록을 연결하는 구상. 데모는 API를 사용하지 않음.'),
  item('database', '공통 데이터 저장', 'future', '미구현', 1750, 935, '다른 기기에서 작업 상태를 공유하려면 별도로 필요한 저장 기능.'),
  item('sync', '실시간 동기화', 'future', '미구현', 2090, 830, '데이터 저장과 별도로 설계할 실시간 변경 전파 기능.'),
  item('safety', '공개 데이터 경계', 'decision', '유지', 1040, 1110, '공개 저장소에 개인 자료·API 키를 넣지 않고 현재 대화의 공개 가능한 사실만 사용.'),
];

const edge = (id, source, target, type, reason) => ({ id, source, target, type, reason });
export const RELATION_EDGES = [
  edge('e01','repo','lab','part','실험의 코드가 이 저장소에 있음.'),
  edge('e02','lab','v01','part','첫 번째 그래프 실험.'),
  edge('e03','lab','v02','part','규모 확장 실험.'),
  edge('e04','lab','v03','part','사용성 개선 실험.'),
  edge('e05','lab','network','part','현재 추가한 다중 관계 실험.'),
  edge('e06','repo','pages','uses','GitHub Pages로 웹사이트를 제공.'),
  edge('e07','actions','pages','uses','배포 워크플로가 Pages에 게시.'),
  edge('e08','actions','vite','uses','Vite 빌드를 자동 실행.'),
  edge('e09','vite','v01','uses','첫 데모를 React·Vite로 구현.'),
  edge('e10','vite','v02','uses','규모 실험을 빌드.'),
  edge('e11','vite','network','uses','관계 실험도 동일한 웹 기술 사용.'),
  edge('e12','reactflow','graph','uses','노드·엣지 렌더링에 사용.'),
  edge('e13','reactflow','v02','uses','규모 실험의 그래프 컴포넌트.'),
  edge('e14','reactflow','network','uses','다대다 관계 시각화에도 사용.'),
  edge('e15','graph','v01','part','초기 그래프 화면.'),
  edge('e16','graph','network','part','이번에는 하나의 부모만 가진 트리에서 벗어남.'),
  edge('e17','v02','v03','informs','V0.2 피드백을 V0.3에 반영.'),
  edge('e18','context','v03','part','V0.3에서 상위 맥락 표시 구현.'),
  edge('e19','context','network','informs','상위 맥락과 교차 관계를 함께 보여줄 필요가 있음.'),
  edge('e20','search','v03','part','V0.3에 검색·선택 이동 추가.'),
  edge('e21','search','network','uses','연결 관계 화면에서도 검색 사용.'),
  edge('e22','scale','v02','part','50·200·1,000개 노드를 비교.'),
  edge('e23','scale','v03','informs','서로 다른 데이터 구조를 비교하도록 확장.'),
  edge('e24','scale','network','informs','실제 관계의 밀도와 탐색성을 규모 숫자보다 우선 검토.'),
  edge('e25','drag','reactflow','uses','노드 위치 이동 기능의 기반.'),
  edge('e26','drag','v03','part','기존 드래그 동작 문제를 개선.'),
  edge('e27','reference','network','informs','사용자가 원하는 자유로운 관계망 구조의 참고 이미지.'),
  edge('e28','reference','graph','informs','고정 조직도가 아닌 다중 연결의 시각화 방향.'),
  edge('e29','conversation','lab','informs','실험 목적은 현재 대화에서 정해짐.'),
  edge('e30','conversation','network','informs','이번 실험의 노드·관계 근거.'),
  edge('e31','conversation','gate','informs','정식 개발 보류 결정의 근거.'),
  edge('e32','gate','tower','depends','데모 검증 후 정식 개발을 결정.'),
  edge('e33','network','gate','informs','관계 그래프 사용성도 정식 개발 판단의 일부.'),
  edge('e34','context','tower','informs','실제 프로젝트 맥락을 보여줘야 한다는 요구.'),
  edge('e35','search','tower','informs','프로젝트 탐색 기능의 요구사항.'),
  edge('e36','notion','tower','depends','정식 단계에서만 Notion 데이터 연동 검토.'),
  edge('e37','gitdata','tower','depends','정식 단계에서만 GitHub 데이터 연동 검토.'),
  edge('e38','database','tower','depends','기기간 공유하려면 공통 저장소 필요.'),
  edge('e39','database','sync','depends','실시간 반영에 앞서 공통 데이터 저장 필요.'),
  edge('e40','pages','database','informs','Pages 배포만으로는 공유 데이터베이스가 생기지 않음.'),
  edge('e41','safety','repo','informs','공개 저장소에 넣을 데이터의 경계를 정함.'),
  edge('e42','safety','conversation','informs','현재 대화의 공개 가능한 정보만 반영.'),
  edge('e43','safety','notion','informs','비공개 Notion 자료는 현재 공개 실험에서 제외.'),
  edge('e44','repo','actions','uses','저장소 변경으로 배포 작업 실행.'),
];

export function getRelations(id, types = Object.keys(LINK_TYPES)) {
  const enabled = new Set(types);
  return RELATION_EDGES.filter((link) => enabled.has(link.type) && (link.source === id || link.target === id)).map((link) => ({
    ...link,
    neighborId: link.source === id ? link.target : link.source,
  }));
}

export function connectedIds(id, types = Object.keys(LINK_TYPES)) {
  return new Set([id, ...getRelations(id, types).map((link) => link.neighborId)]);
}
