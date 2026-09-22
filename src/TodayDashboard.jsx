import { useEffect, useState } from 'react';
import {
  ArrowRight, CalendarDays, Check, ChevronRight, ClipboardList,
  ExternalLink, LayoutDashboard, Network, RotateCcw, ShieldCheck,
} from 'lucide-react';
import {
  TASK_STORAGE_KEY, exampleTasks, koreaDateKey, readDemoProgress, remainingTasks,
} from './todayTaskState.js';

// These are deliberately public demo examples, not a user's calendar or task records.
const exampleProjects = [
  { title: '웹사이트 화면 구성', description: '메뉴와 홈 화면을 간단하게 정리하는 예시', status: '진행 예시' },
  { title: '프로젝트 관계 그래프', description: '노드 선택과 연결 관계를 살펴보는 예시', status: '검증 예시' },
];

const displayDate = () => new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
}).format(new Date());

export default function TodayDashboard({ onOpenMap }) {
  const [dateKey] = useState(koreaDateKey);
  const [checked, setChecked] = useState(() => {
    try {
      return readDemoProgress(window.localStorage, koreaDateKey());
    } catch {
      return [];
    }
  });
  const outstanding = remainingTasks(checked);

  useEffect(() => {
    // Only store predefined sample task IDs. This is browser-local and never syncs personal data.
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify({ date: dateKey, completedIds: checked }));
    } catch {
      // The UI still works when storage is disabled.
    }
  }, [checked, dateKey]);

  function completeTask(id) {
    setChecked((current) => current.includes(id) ? current : [...current, id]);
  }

  return (
    <div className="ct-home-layout">
      <aside className="ct-home-sidebar">
        <div className="ct-home-sidebar-brand"><span className="ct-home-logo"><LayoutDashboard size={20} aria-hidden="true" /></span><span><strong>Control Tower</strong><small>공개 화면 실험</small></span></div>
        <span className="ct-home-menu-label">PROJECT</span>
        <nav className="ct-home-nav" aria-label="프로젝트 홈 메뉴">
          <span className="ct-home-nav-current" aria-current="page"><LayoutDashboard size={17} aria-hidden="true" />오늘 요약<ChevronRight size={15} aria-hidden="true" /></span>
          <button type="button" onClick={onOpenMap}><Network size={17} aria-hidden="true" />프로젝트 맵<ArrowRight size={15} aria-hidden="true" /></button>
        </nav>
        <div className="ct-home-sidebar-note"><ShieldCheck size={17} aria-hidden="true" /><span>개인 정보와 실제 일정은 연결하지 않은 공개 예시 화면입니다.</span></div>
      </aside>

      <div className="ct-home-workspace">
        <div className="ct-home-crumb"><span>Project</span><ChevronRight size={13} aria-hidden="true" /><strong>오늘 요약</strong></div>
        <main className="ct-home-main">
          <header className="ct-home-heading">
            <div><div className="ct-home-date"><CalendarDays size={15} aria-hidden="true" />{displayDate()} · KST</div><h1>오늘의 작업</h1><p>남은 할 일을 확인하고, 바로 관련 화면으로 이동하세요.</p></div>
            <span className="ct-home-demo-label">샘플 데이터 · 실제 일정 아님</span>
          </header>

          <section className="ct-home-section" aria-labelledby="ct-home-tasks-title">
            <div className="ct-home-section-title"><h2 id="ct-home-tasks-title">오늘 할 일</h2><span>남은 {outstanding.length}개 · 완료 {checked.length}개</span></div>
            {outstanding.length > 0 ? (
              <div className="ct-home-task-list">
                {outstanding.map((task) => (
                  <div key={task.id} className="ct-home-task">
                    <label className="ct-home-task-main">
                      <input type="checkbox" checked={false} onChange={() => completeTask(task.id)} aria-label={`${task.title} 완료`} />
                      <span className="ct-home-checkbox" aria-hidden="true"><Check size={15}/></span>
                      <span className="ct-home-task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                    </label>
                    {task.destination === 'map' ? (
                      <button className="ct-home-task-action" type="button" onClick={onOpenMap}>맵 열기 <ArrowRight size={14} aria-hidden="true" /></button>
                    ) : (
                      <a className="ct-home-task-action" href={task.destination}>실험 열기 <ExternalLink size={14} aria-hidden="true" /></a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ct-home-all-done" role="status" aria-live="polite">
                <div className="ct-home-done-title"><Check size={20} aria-hidden="true"/><strong>오늘의 샘플 할 일을 모두 마쳤어요. 수고했어요!</strong></div>
                <p>모든 항목을 확인했어요. 잠시 쉬어도 좋고, 더 살펴보고 싶다면 아래 작업을 추천해요.</p>
                <div className="ct-home-recommendation"><span>추천 작업 · 선택 사항</span><strong>다중 관계 그래프의 필터를 바꾸며 연결 결과 비교하기</strong><a href="./relationship-lab.html">관계 실험 열기 <ArrowRight size={14} aria-hidden="true"/></a></div>
              </div>
            )}
            {checked.length > 0 && (
              <div className="ct-home-task-footer"><button type="button" onClick={() => setChecked([])}><RotateCcw size={13} aria-hidden="true"/> 완료 체크 모두 되돌리기</button></div>
            )}
            <p className="ct-home-help">샘플 체크만 이 브라우저에 날짜별로 저장됩니다. 다음 날 페이지를 다시 열면 초기화되며 다른 기기와 동기화되지 않습니다.</p>
          </section>

          <section className="ct-home-section" aria-labelledby="ct-home-projects-title">
            <div className="ct-home-section-title"><h2 id="ct-home-projects-title">진행 중인 프로젝트</h2><span>예시 {exampleProjects.length}개</span></div>
            <div className="ct-home-project-list">
              {exampleProjects.map((project) => (
                <div className="ct-home-project" key={project.title}>
                  <span className="ct-home-project-icon"><ClipboardList size={17} aria-hidden="true" /></span>
                  <div><strong>{project.title}</strong><small>{project.description}</small></div>
                  <span className="ct-home-project-status">{project.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ct-home-shortcuts" aria-label="빠른 이동">
            <h2>빠른 이동</h2>
            <button type="button" onClick={onOpenMap}><Network size={16} aria-hidden="true"/> 프로젝트 맵 열기 <ArrowRight size={15} aria-hidden="true"/></button>
            <a href="./scale-lab.html">규모 실험 <ExternalLink size={14} aria-hidden="true"/></a>
            <a href="./relationship-lab.html">관계 실험 <ExternalLink size={14} aria-hidden="true"/></a>
          </section>
          <p className="ct-home-data-note">실제 할 일·일정·메일 연동은 아직 없습니다. 이 페이지는 화면 구성만 확인하는 공개 데모입니다.</p>
        </main>
      </div>
    </div>
  );
}
