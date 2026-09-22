// Public demo navigation only. No private project records are bundled here.
export const sectors = [
  {
    id: 'project', label: 'Project', title: '프로젝트 관리', icon: 'project',
    pages: [
      { id: 'home', label: '오늘 요약', description: '오늘 확인할 항목, 진행 중 실험과 다음 작업을 보여주는 공개 데모 홈' },
      { id: 'map', label: '프로젝트 맵' },
      { id: 'board', label: '검증 보드' },
      { id: 'about', label: '실험 안내' },
    ],
  },
  {
    id: 'ai', label: 'AI / Agent', title: 'AI 활용체계', icon: 'ai',
    pages: [
      { id: 'agent', label: '에이전트 구조', description: '도구의 역할과 설계·검증·운영 상태를 분리해서 살펴볼 화면' },
      { id: 'models', label: '모델 비교', description: '실제로 확인한 실험 조건과 결과를 정리할 화면' },
      { id: 'automation', label: '자동화 현황', description: '실행 여부와 마지막 성공 근거를 확인할 화면' },
      { id: 'architect', label: '프롬프트·Architect', description: '메타 프롬프트와 도구 조언을 살펴볼 화면' },
    ],
  },
  {
    id: 'data', label: 'Data', title: '데이터 관리', icon: 'data',
    pages: [
      { id: 'intake', label: '대화 수집', description: '대화 원본과 신규 수집 내역을 구분할 화면' },
      { id: 'processing', label: '전처리', description: '객체 분류, 근거 검증, 관계 생성 과정을 살펴볼 화면' },
      { id: 'missing', label: '누락·충돌', description: '원문 누락과 병합 보류 항목을 확인할 화면' },
      { id: 'sources', label: '원본 보관', description: '비공개 원본의 출처 및 변경 이력을 관리할 화면' },
    ],
  },
  {
    id: 'brief', label: 'Daily Brief', title: '개인 브리핑', icon: 'brief',
    pages: [
      { id: 'morning', label: '아침 신문', description: '일정·알림·뉴스를 신문 형태로 보여줄 화면' },
      { id: 'schedule', label: '일정', description: '연결이 승인된 일정만 확인할 화면' },
      { id: 'alerts', label: '중요 알림', description: '확인과 결정이 필요한 항목을 구분할 화면' },
    ],
  },
  {
    id: 'archive', label: 'Archive', title: '기록 보관', icon: 'archive',
    pages: [
      { id: 'completed', label: '완료 프로젝트', description: '완료 근거가 확인된 결과물을 모을 화면' },
      { id: 'decisions', label: '결정 이력', description: '과거 결정과 현재 유효한 결정을 구분할 화면' },
      { id: 'references', label: '참고 자료', description: '출처와 접근 권한을 보존할 화면' },
    ],
  },
];
