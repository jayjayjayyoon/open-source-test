import { useState } from 'react';
import {
  ArrowRight, CalendarDays, Check, ChevronRight, ClipboardList,
  ExternalLink, LayoutDashboard, Network, ShieldCheck,
} from 'lucide-react';

// These are deliberately fictional UI examples, not a user's calendar or task records.
const exampleTasks = [
  { id: 'first-screen', title: '첫 화면에서 오늘 할 일을 바로 찾을 수 있는지 확인', detail: '홈 화면 가독성 테스트', tag: '확인' },
  { id: 'responsive', title: 'PC·모바일 화면에서 글자와 버튼 확인', detail: '오른쪽 아래 전환 버튼 사용', tag: '확인' },
  { id: 'map', title: '프로젝트 관계 맵을 열어 탐색해 보기', detail: '기존 실험 페이지에서 이어서', tag: '탐색' },
];

const exampleProjects = [
  { title: '웹사이트 화면 구성', description: '메뉴와 홈 화면을 간단하게 정리하는 예시', status: '진행 예시' },
  { title: '프로젝트 관계 그래프', description: '노드 선택과 연결 관계를 살펴보는 예시', status: '검증 예시' },
];

const displayDate = () => new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
}).format(new Date());

export default function TodayDashboard({ onOpenMap }) {
  const [checked, setChecked] = useState([]);
  const toggleTask = (id) => setChecked((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]);

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
            <div><div className="ct-home-date"><CalendarDays size={15} aria-hidden="true" />{displayDate()} · KST</div><h1>오늘의 작업</h1><p>오늘 확인할 일과 진행 중인 프로젝트를 빠르게 살펴보는 화면입니다.</p></div>
            <span className="ct-home-demo-label">샘플 데이터 · 실제 일정 아님</span>
          </header>

          <section className="ct-home-section" aria-labelledby="ct-home-tasks-title">
            <div className="ct-home-section-title"><h2 id="ct-home-tasks-title">오늘 할 일</h2><span>{checked.length} / {exampleTasks.length} 확인</span></div>
            <div className="ct-home-task-list">
              {exampleTasks.map((task) => {
                const done = checked.includes(task.id);
                return (
                  <label key={task.id} className={`ct-home-task ${done ? 'is-checked' : ''}`}>
                    <input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} aria-label={`${task.title} 확인 표시`} />
                    <span className="ct-home-checkbox" aria-hidden="true">{done && <Check size={15}/>}</span>
                    <span className="ct-home-task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                    <span className="ct-home-task-tag">{task.tag}</span>
                  </label>
                );
              })}
            </div>
            <p className="ct-home-help">체크는 화면 사용 예시입니다. 저장되지 않으며 새로고침하면 초기화됩니다.</p>
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
