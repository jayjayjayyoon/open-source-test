import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronRight, ClipboardList,
  Clock3, ExternalLink, FolderOpen, GitBranch, LayoutDashboard,
  LockKeyhole, MonitorSmartphone, Network, ShieldCheck,
} from 'lucide-react';

const displayDate = () => new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
}).format(new Date());

const demoSections = [
  {
    id: 'today', icon: CalendarDays, kicker: 'TODAY / 확인할 화면',
    title: '오늘 확인', count: '2개 항목', tone: 'blue',
    note: '오늘의 실제 일정이 아니라, 이번 공개 UI 실험에서 확인할 항목입니다.',
    items: [
      { title: '첫 화면에서 필요한 정보가 바로 보이는지', meta: '홈 대시보드 · 화면 검토' },
      { title: 'PC·모바일 전환 시 요소가 겹치지 않는지', meta: '오른쪽 하단 전환 버튼으로 확인' },
    ],
  },
  {
    id: 'doing', icon: Clock3, kicker: 'IN PROGRESS / 이어서',
    title: '하던 일', count: '2개 실험', tone: 'violet',
    note: '현재 웹사이트의 공개 실험 흐름입니다. 개인 프로젝트 진행률이 아닙니다.',
    items: [
      { title: '프로젝트 관계 맵 탐색·가독성 검증', meta: '프로젝트 맵에서 이어보기' },
      { title: 'Control Tower 분야·메뉴 사용성 점검', meta: '상단 분야 전환으로 확인' },
    ],
  },
  {
    id: 'next', icon: ClipboardList, kicker: 'NEXT / 다음 단계',
    title: '해야 할 일', count: '2개 후보', tone: 'amber',
    note: '마감일이 지정된 개인 할 일 목록이 아니라, 실험 후속 작업 후보입니다.',
    items: [
      { title: '첫 화면 사용 후 발견한 문제 정리', meta: '피드백 확인 후 수정' },
      { title: '실제 개인 데이터의 비공개 연동 방식 결정', meta: '승인 및 저장 환경 확보 후' },
    ],
  },
];

export default function TodayDashboard({ onOpenMap }) {
  return (
    <div className="ct-home-layout">
      <aside className="ct-home-sidebar">
        <div className="ct-home-sidebar-brand"><span className="ct-home-logo"><LayoutDashboard size={21} aria-hidden="true" /></span><span><strong>Control Tower</strong><small>HOME / PUBLIC DEMO</small></span></div>
        <span className="ct-home-menu-label">WORKSPACE</span>
        <nav className="ct-home-nav" aria-label="프로젝트 홈 메뉴">
          <span className="ct-home-nav-current" aria-current="page"><LayoutDashboard size={18} aria-hidden="true" />오늘 요약<ChevronRight size={15} aria-hidden="true" /></span>
          <button type="button" onClick={onOpenMap}><Network size={18} aria-hidden="true" />프로젝트 맵<ArrowRight size={15} aria-hidden="true" /></button>
        </nav>
        <div className="ct-home-sidebar-note"><ShieldCheck size={18} aria-hidden="true" /><div><strong>공개 UI 실험</strong><p>개인 일정·메일·대화 원문은 이 화면에서 불러오지 않습니다.</p></div></div>
      </aside>

      <div className="ct-home-workspace">
        <div className="ct-home-crumb"><span>OPEN SOURCE TEST</span><ChevronRight size={13} aria-hidden="true" /><strong>오늘 요약</strong><span className="ct-home-mode">DEMO DATA ONLY</span></div>
        <main className="ct-home-main">
          <div className="ct-home-hero">
            <div className="ct-home-hero-copy"><div className="ct-home-date"><CalendarDays size={15} aria-hidden="true" /> {displayDate()} · KST</div><h1>오늘, 무엇부터 확인할까?</h1><p>오늘 확인할 화면, 하던 일, 다음 작업을 먼저 보여주는 Control Tower 홈 시안입니다.</p><span className="ct-home-hero-disclaimer"><LockKeyhole size={13} aria-hidden="true" /> 공개 실험용 항목 · 개인 일정 및 실제 할 일 미연동</span></div>
            <button type="button" className="ct-home-primary" onClick={onOpenMap}>프로젝트 맵 이어보기 <ArrowRight size={17} aria-hidden="true" /></button>
          </div>

          <div className="ct-home-connection" role="status"><span className="ct-home-connection-icon"><CalendarDays size={19} aria-hidden="true" /></span><div><strong>내 실제 오늘 일정은 아직 연결되지 않았어요.</strong><span>아래 항목은 이번 공개 웹사이트 실험의 확인 목록이며, 캘린더·할 일·메일에서 가져온 정보가 아닙니다.</span></div><span className="ct-home-off">LIVE SYNC OFF</span></div>

          <div className="ct-home-section-heading"><div><span>YOUR WORKSPACE / DEMO</span><h2>지금 필요한 세 가지</h2></div><p>이 화면에서 개인 정보나 마감일을 추정하지 않습니다.</p></div>
          <div className="ct-home-cards">
            {demoSections.map(({ id, icon: Icon, kicker, title, count, tone, note, items }) => (
              <section key={id} className={`ct-home-card ct-home-card-${tone}`} aria-labelledby={`ct-home-${id}`}>
                <div className="ct-home-card-top"><span className="ct-home-card-icon"><Icon size={20} aria-hidden="true" /></span><span className="ct-home-count">{count}</span></div>
                <span className="ct-home-kicker">{kicker}</span><h3 id={`ct-home-${id}`}>{title}</h3>
                <div className="ct-home-items">{items.map((item) => <div className="ct-home-item" key={item.title}><span className="ct-home-item-dot" /><div><strong>{item.title}</strong><small>{item.meta}</small></div></div>)}</div>
                <p className="ct-home-card-note">{note}</p>
                {id === 'doing' && <button type="button" className="ct-home-card-link" onClick={onOpenMap}>관계 맵 바로가기 <ArrowRight size={14} aria-hidden="true" /></button>}
              </section>
            ))}
          </div>

          <div className="ct-home-bottom-grid">
            <section className="ct-home-focus"><div className="ct-home-bottom-title"><CheckCircle2 size={19} aria-hidden="true" /><strong>실사용 검증 순서</strong></div><p>홈 화면 → PC·모바일 전환 → 프로젝트 맵. 실제로 사용해 보고 불편한 부분만 다음 수정에 반영합니다.</p><button type="button" onClick={onOpenMap}>프로젝트 맵 열기 <ArrowRight size={14} aria-hidden="true" /></button></section>
            <section className="ct-home-tools"><div className="ct-home-bottom-title"><FolderOpen size={19} aria-hidden="true" /><strong>실험 도구</strong></div><p>기존 규모 실험은 화면을 가리지 않도록 여기로 옮겼습니다.</p><div className="ct-home-tool-links"><a href="./scale-lab.html">규모 실험 V0.3 <ExternalLink size={14} aria-hidden="true" /></a><a href="./relationship-lab.html">다중 관계 실험 <GitBranch size={14} aria-hidden="true" /></a></div></section>
          </div>
          <div className="ct-home-footnote"><MonitorSmartphone size={15} aria-hidden="true" /> PC·모바일 미리보기는 화면 오른쪽 아래에서 전환할 수 있습니다. 전환 버튼이 콘텐츠를 가리지 않도록 하단 여백을 확보했습니다.</div>
        </main>
        <footer className="ct-home-footer">CONTROL TOWER · PUBLIC UI PROTOTYPE · NO PERSONAL DATA</footer>
      </div>
    </div>
  );
}
