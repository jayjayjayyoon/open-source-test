import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, useNodesState } from '@xyflow/react';
import {
  Activity, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2,
  ChevronRight, CircleHelp, ClipboardCheck, ExternalLink, FlaskConical,
  GitBranch, Layers3, LayoutDashboard, ListChecks, LockKeyhole, Network,
  RotateCcw, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { STATUS, REPO_URL, projects, relationships, checks } from './data.js';

const initialNodes = projects.map((project) => ({
  id: project.id, type: 'project', position: { x: project.x, y: project.y }, data: project,
}));
const initialEdges = relationships.map(([source, target], index) => ({
  id: `relation-${index}`, source, target, type: 'smoothstep',
  style: { stroke: '#46647e', strokeWidth: 1.5, opacity: 0.7 },
}));

function ProjectNode({ data, selected }) {
  return (
    <div className={`project-node node-${data.kind} ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="graph-handle" />
      <div className={`node-symbol status-${data.status.toLowerCase()}`}>{data.icon}</div>
      <div className="node-copy"><strong>{data.title}</strong><span>{data.subtitle}</span></div>
      <span className={`node-status status-${data.status.toLowerCase()}`}>{data.status}</span>
      <Handle type="source" position={Position.Right} className="graph-handle" />
    </div>
  );
}

const nodeTypes = { project: ProjectNode };
const navigation = [
  { id: 'map', label: '프로젝트 맵', icon: Network },
  { id: 'board', label: '검증 보드', icon: ListChecks },
  { id: 'about', label: '실험 안내', icon: BookOpen },
];
const validViews = new Set(navigation.map(({ id }) => id));

function StatusBadge({ status }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}><i />{STATUS[status].label}</span>;
}

// When embedded in Control Tower, view is controlled by its ONE shared sidebar.
// Standalone usage remains possible with the initialView fallback.
export default function App({ initialView = 'map', view: controlledView, onNavigate }) {
  const [localView, setLocalView] = useState(initialView);
  const view = validViews.has(controlledView) ? controlledView : localView;
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('experiment');
  const [completed, setCompleted] = useState([]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const navigate = (nextView) => {
    if (!validViews.has(nextView)) return;
    if (onNavigate) onNavigate(nextView);
    else setLocalView(nextView);
  };

  const selectedProject = projects.find((project) => project.id === selectedId);
  const visibleNodes = useMemo(() => nodes.filter((node) => {
    const text = `${node.data.title} ${node.data.subtitle} ${node.data.summary}`.toLowerCase();
    return (filter === 'ALL' || node.data.status === filter) && text.includes(query.trim().toLowerCase());
  }), [nodes, filter, query]);
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = initialEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const statusCounts = Object.fromEntries(Object.keys(STATUS).map((key) => [key, projects.filter((p) => p.status === key).length]));
  const filteredChecks = checks.filter((item) => {
    const project = projects.find((p) => p.id === item.projectId);
    const matchesText = `${item.title} ${item.description} ${project.title}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = filter === 'ALL' || (completed.includes(item.id) ? 'DONE' : item.projectId === 'tower' ? 'WAITING' : 'NEXT') === filter;
    return matchesText && matchesStatus;
  });

  function openProject(projectId) {
    setFilter('ALL'); setQuery(''); setSelectedId(projectId); navigate('map');
  }
  function resetDemo() {
    setFilter('ALL'); setQuery(''); setCompleted([]); setSelectedId('experiment');
    onNodesChange(initialNodes.map((node) => ({ id: node.id, type: 'position', position: node.position })));
    navigate('map');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Network size={22} strokeWidth={2.1} /></div><div><strong>Project Map Lab</strong><span>OPEN SOURCE EXPERIMENT</span></div></div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="주 메뉴" className="navigation">
          {navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => navigate(id)}><Icon size={18}/><span>{label}</span>{view === id && <ChevronRight size={15}/>}</button>)}
        </nav>
        <div className="sidebar-label project-label">PROJECT STATUS</div>
        <div className="status-nav">
          {Object.entries(STATUS).map(([status, metadata]) => <button key={status} className={filter === status ? 'selected' : ''} onClick={() => { setFilter(filter === status ? 'ALL' : status); navigate('map'); }}><span className="status-dot" style={{ backgroundColor: metadata.color }}/><span>{metadata.description}</span><small>{statusCounts[status]}</small></button>)}
        </div>
        <div className="sidebar-bottom"><div className="environment-card"><div className="environment-icon"><ShieldCheck size={17}/></div><strong>독립 실험 환경</strong><p>정식 Control Tower와 분리된 샘플 데이터입니다.</p><span><i/> LIVE SYNC OFF</span></div><a className="repo-sidebar" href={REPO_URL} target="_blank" rel="noreferrer"><GitBranch size={17}/><span>GitHub 저장소</span><ExternalLink size={14}/></a></div>
      </aside>

      <div className="workspace">
        <header className="topbar"><div className="breadcrumbs"><span>OPEN SOURCE TEST</span><ChevronRight size={13}/><strong>{view === 'map' ? 'Project Map' : view === 'board' ? 'Validation Board' : 'Experiment Guide'}</strong></div><div className="topbar-right"><span className="top-demo"><i/> DEMO MODE</span><a href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub 저장소 열기"><GitBranch size={18}/></a></div></header>
        <main className="content">
          <div className="headline"><div><div className="eyebrow"><Sparkles size={14}/> DESIGN & INTERACTION PROTOTYPE <span>· V0.1</span></div><h1>{view === 'map' ? '흩어진 프로젝트를, 하나의 지도로.' : view === 'board' ? '직접 확인하는 검증 보드.' : '무엇을 실험하는가?'}</h1><p>{view === 'map' ? '현재 대화에서 정한 범위만 사용한 인터랙티브 그래프 데모' : view === 'board' ? '버튼을 직접 눌러 기능을 확인하세요. 체크 결과는 실제 데이터로 저장되지 않습니다.' : '실험 목표와 실제 데이터의 경계를 분명하게 구분합니다.'}</p></div><button className="reset-button" onClick={resetDemo}><RotateCcw size={15}/>데모 초기화</button></div>
          <div className="metrics"><div className="metric"><span>데모 노드</span><strong>{projects.length}<small>개</small></strong><div className="metric-sub"><Layers3 size={13}/> 현재 대화 기준</div></div><div className="metric"><span>연결 관계</span><strong>{relationships.length}<small>개</small></strong><div className="metric-sub"><GitBranch size={13}/> 관계 시각화</div></div><div className="metric"><span>검증 체크리스트</span><strong>{completed.length}<small> / {checks.length}</small></strong><div className="metric-sub"><ClipboardCheck size={13}/> 이 탭에서만 임시 유지</div></div><div className="metric metric-alert"><span>실제 데이터 연동</span><strong className="metric-off">OFF</strong><div className="metric-sub"><LockKeyhole size={13}/> 개인 데이터 미연결</div></div></div>

          {view === 'map' && <>
            <div className="map-toolbar"><div className="section-title"><Network size={18}/><strong>프로젝트 관계 맵</strong><span>{visibleNodes.length} / {projects.length} nodes</span></div><div className="toolbar-right"><div className="search-box"><Search size={15}/><input aria-label="노드 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="노드 검색..."/>{query && <button aria-label="검색 초기화" onClick={() => setQuery('')}><X size={14}/></button>}</div><div className="filter-tabs" aria-label="상태 필터">{['ALL', ...Object.keys(STATUS)].map((status) => <button key={status} aria-pressed={filter === status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}</button>)}</div></div></div>
            <div className="map-and-detail">
              <section className="graph-panel" aria-label="인터랙티브 프로젝트 그래프"><div className="graph-overlay"><span className="graph-live"><i/> INTERACTIVE GRAPH</span><span>드래그 · 줌 · 클릭</span></div><ReactFlow nodes={visibleNodes} edges={visibleEdges} onNodesChange={onNodesChange} onNodeClick={(_, node) => setSelectedId(node.id)} onPaneClick={() => setSelectedId(null)} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2, minZoom: 0.38, maxZoom: 1.1 }} minZoom={0.25} maxZoom={2} attributionPosition="bottom-right"><Background color="#20314b" gap={26} size={1}/><Controls showInteractive={false}/><MiniMap pannable zoomable nodeColor={(node) => STATUS[node.data.status]?.color ?? '#7d90a8'} maskColor="rgba(8, 15, 29, 0.72)"/></ReactFlow>{visibleNodes.length === 0 && <div className="empty-graph"><CircleHelp size={28}/><strong>일치하는 노드가 없습니다</strong><button onClick={() => { setQuery(''); setFilter('ALL'); }}>필터 초기화</button></div>}<div className="graph-legend">{Object.entries(STATUS).map(([key, metadata]) => <span key={key}><i style={{ backgroundColor: metadata.color }}/>{key}</span>)}</div></section>
              <aside className="detail-panel">{selectedProject ? <><div className="detail-top"><span>SELECTED NODE</span><button aria-label="상세 패널 닫기" onClick={() => setSelectedId(null)}><X size={17}/></button></div><div className="detail-hero"><div className={`detail-symbol status-${selectedProject.status.toLowerCase()}`}>{selectedProject.icon}</div><h2>{selectedProject.title}</h2><p>{selectedProject.subtitle}</p><StatusBadge status={selectedProject.status}/></div><div className="detail-section"><span className="detail-label">현재 의미</span><p>{selectedProject.summary}</p></div><div className="detail-section next-section"><span className="detail-label"><ArrowRight size={14}/> 다음 행동</span><p>{selectedProject.next}</p></div><div className="detail-section source-section"><span className="detail-label"><ShieldCheck size={14}/> 판단 근거</span><p>{selectedProject.source}</p><span className="evidence-tag">{selectedProject.evidence} · 현재 대화</span></div>{selectedProject.link && <a className="detail-link" href={selectedProject.link} target="_blank" rel="noreferrer">관련 페이지 열기 <ArrowUpRight size={16}/></a>}<div className="detail-footnote">이 정보는 실시간 동기화 결과가 아닙니다.</div></> : <div className="detail-empty"><div><Network size={24}/></div><h2>노드를 선택하세요</h2><p>그래프에서 노드를 클릭하면 현재 의미와 다음 행동을 확인할 수 있습니다.</p><button onClick={() => setSelectedId('experiment')}>핵심 실험 보기 <ArrowRight size={15}/></button></div>}</aside>
            </div>
            <div className="hint-bar"><Activity size={16}/><span>이 화면은 <strong>실제 작동하는 UI 데모</strong>입니다. 상태 정보는 이번 대화에서 수동으로 작성했으며 외부 서비스와 연결되지 않았습니다.</span><button onClick={() => navigate('board')}>검증 시작 <ArrowRight size={15}/></button></div>
          </>}

          {view === 'board' && <>
            <div className="board-header"><div className="section-title"><ClipboardCheck size={19}/><strong>사용성 체크리스트</strong><span>{completed.length} / {checks.length} 완료 표시</span></div><div className="search-box"><Search size={15}/><input aria-label="검증 항목 검색" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검증 항목 검색..."/></div></div>
            <div className="board-layout"><section className="checklist-panel">{filteredChecks.length === 0 && <div className="no-checks">일치하는 검증 항목이 없습니다. <button onClick={() => { setQuery(''); setFilter('ALL'); }}>필터 초기화</button></div>}{filteredChecks.map((item, index) => { const isDone = completed.includes(item.id); const related = projects.find((p) => p.id === item.projectId); return <div className={`check-item ${isDone ? 'is-done' : ''}`} key={item.id}><button className="check-toggle" aria-label={`${item.title} ${isDone ? '완료 취소' : '완료 표시'}`} aria-pressed={isDone} onClick={() => setCompleted((previous) => isDone ? previous.filter((id) => id !== item.id) : [...previous, item.id])}>{isDone ? <Check size={18}/> : String(index + 1).padStart(2, '0')}</button><div className="check-copy"><div className="check-heading"><h3>{item.title}</h3><StatusBadge status={isDone ? 'DONE' : item.projectId === 'tower' ? 'WAITING' : 'NEXT'}/></div><p>{item.description}</p><button className="related-link" onClick={() => openProject(item.projectId)}>연결 노드: {related.title} <ArrowUpRight size={13}/></button></div></div>; })}</section><aside className="board-aside"><div className="board-aside-icon"><FlaskConical size={22}/></div><h2>실험 성공은 직접 결정</h2><p>체크를 모두 눌렀다고 자동으로 정식 Control Tower를 생성하지 않습니다. 화면이 실제로 원하는 경험인지 확인한 뒤 진행 여부를 결정합니다.</p><div className="progress-track"><div style={{ width: `${completed.length / checks.length * 100}%` }}/></div><strong>{completed.length} / {checks.length} 확인 표시</strong><button onClick={() => openProject('tower')}>정식 프로젝트 조건 보기 <ArrowRight size={15}/></button></aside></div>
            <div className="hint-bar"><CircleHelp size={16}/><span>체크 정보는 이 페이지를 열린 상태로 두면 보존되지만, 새로고침하면 초기화됩니다. 실제 GitHub·Notion에 쓰지 않습니다.</span></div>
          </>}

          {view === 'about' && <section className="guide-grid"><article className="guide-card"><div className="guide-number">01 / WHAT</div><Network size={25}/><h2>그래프 UX 검증</h2><p>원형 노드, 연결 관계, 드래그, 확대·축소, 상세 패널, 검색과 필터의 사용성을 실제 브라우저에서 시험합니다.</p><button onClick={() => navigate('map')}>그래프 열기 <ArrowRight size={15}/></button></article><article className="guide-card"><div className="guide-number">02 / DATA</div><ShieldCheck size={25}/><h2>현재 대화만 사용</h2><p>노드 내용은 이번 채팅에서 확정한 범위로 구성한 수동 샘플입니다. 실제 일정·진척도·기타 개인 자료를 가져오지 않습니다.</p><button onClick={() => openProject('conversation')}>데이터 범위 보기 <ArrowRight size={15}/></button></article><article className="guide-card"><div className="guide-number">03 / NEXT</div><LayoutDashboard size={25}/><h2>성공 후 정식 개발</h2><p>오픈소스 테스트 결과를 확인한 후 별도의 Control Tower 저장소를 생성하고, 검증된 기능을 이전할지 결정합니다.</p><button onClick={() => navigate('board')}>검증 보드 열기 <ArrowRight size={15}/></button></article></section>}
        </main>
        <footer className="footer"><span>PROJECT MAP LAB <b>·</b> DEMO DATA ONLY</span><span>React Flow Open Source Experiment <CheckCircle2 size={14}/></span></footer>
      </div>
    </div>
  );
}
