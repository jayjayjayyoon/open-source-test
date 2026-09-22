// Public demo tasks only. Never include real schedules or private chat content here.
export const TASK_STORAGE_KEY = 'control-tower-public-demo-tasks-v1';

export const exampleTasks = [
  { id: 'map', title: '프로젝트 맵에서 노드를 선택해 보기', detail: '프로젝트 맵으로 바로 이동', tag: '탐색', destination: 'map' },
  { id: 'responsive', title: 'PC·모바일 화면에서 요소가 겹치지 않는지 확인', detail: '누르면 화면 미리보기 모드 전환', tag: '검증', destination: 'preview' },
  { id: 'relationship', title: '다중 관계 그래프의 연결 이유 살펴보기', detail: '관계 실험 페이지에서 확인', tag: '검증', destination: './relationship-lab.html' },
];

export function koreaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function remainingTasks(completedIds, tasks = exampleTasks) {
  return tasks.filter((task) => !completedIds.includes(task.id));
}

export function readDemoProgress(storage, dateKey) {
  try {
    const saved = JSON.parse(storage.getItem(TASK_STORAGE_KEY) || 'null');
    if (saved?.date !== dateKey || !Array.isArray(saved.completedIds)) return [];
    const validIds = new Set(exampleTasks.map(({ id }) => id));
    return [...new Set(saved.completedIds.filter((id) => validIds.has(id)))];
  } catch {
    return [];
  }
}

export function progressForDate(progress, dateKey) {
  return progress.date === dateKey ? progress : { date: dateKey, completedIds: [] };
}
