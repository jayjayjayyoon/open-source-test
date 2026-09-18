import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from '@xyflow/react';
import {
  SCALE_SIZES, SCENARIOS, PAGE_SIZE, CHILD_PAGE_SIZE, createScaleV3Data,
  selectScaleV3Graph, ancestors, areaProjects, projectChildren, findScaleV3Matches,
} from './scaleV3Data.js';

const LABELS = { root: '전체', area: '분야', project: '프로젝트', task: '작업', document: '문서', decision: '결정' };
const CHECKS = [
  '작업을 클릭했을 때 전체 → 분야 → 프로젝트 → 작업 경로가 이해된다',
  '상위 프로젝트 버튼으로 바로 돌아갈 수 있다',
  '노드를 옮긴 후 다른 노드를 클릭해도 위치가 유지된다',
  '검색으로 특정 항목을 찾고 그래프 중앙으로 이동한다',
  '단계 전환 후 원치 않게 그래프가 전체 초기화되지 않는다',
  '전체/단계별 비교 화면에서 같은 항목을 확인한다',
  '50개·200개·1,000개에서 반응 차이를 확인한다',
  '프로젝트 증가·관계 증가·작업 집중·복합 자료를 비교한다',
  '새로고침 후 체크와 메모가 현재 브라우저에 남아 있다',
];
const STORAGE_KEY = 'project-map-scale-lab-v03';

function GraphNode({ data }) {
  return (
    <div title={`${data.title} · ${data.status}`} className={`lab-node lab-${data.kind} ${data.active ? 'lab-active' : ''} ${data.inPath ? 'lab-in-path' : ''} ${data.compact ? 'lab-compact' : ''}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <small>{LABELS[data.kind]} · {data.status}</small>
      <strong>{data.title}</strong>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}
const nodeTypes = { lab: GraphNode };

function positionOf(node, layout, dataset) {
  if (layout === 'full') return { x: node.x, y: node.y };
  if (node.kind === 'root') return { x: 35, y: 315 };
  if (node.kind === 'area') return { x: 280, y: 40 + node.area * 145 };
  if (node.kind === 'project') {
    const local = areaProjects(dataset, node.area).findIndex((item) => item.id === node.id) % PAGE_SIZE;
    return { x: 560, y: 35 + local * 95 };
  }
  const local = node.sequence % CHILD_PAGE_SIZE;
  return { x: 835 + Math.floor(local / 10) * 205, y: 40 + (local % 10) * 75 };
}

function readDraft() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return { done: Array.isArray(value.done) ? value.done.filter(Number.isInteger) : [], memo: typeof value.memo === 'string' ? value.memo : '' };
  } catch {
    return { done: [], memo: '' };
  }
}

export default function ScaleLabV3() {
  const [size, setSize] = useState(50);
  const [scenario, setScenario] = useState('balanced');
  const [mode, setMode] = useState('hierarchy');
  const [area, setArea] = useState(null);
  const [project, setProject] = useState(null);
  const [page, setPage] = useState(0);
  const [childPage, setChildPage] = useState(0);
  const [picked, setPicked] = useState('root');
  const [positions, setPositions] = useState({ full: {}, hierarchy: {} });
  const [query, setQuery] = useState('');
  const [focusTarget, setFocusTarget] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);
  const [latency, setLatency] = useState(null);
  const [draft] = useState(readDraft);
  const [done, setDone] = useState(draft.done);
  const [memo, setMemo] = useState(draft.memo);
  const flows = useRef({ full: null, hierarchy: null });
  const started = useRef(null);

  const dataset = useMemo(() => createScaleV3Data(size, scenario), [size, scenario]);
  const hierarchy = useMemo(() => selectScaleV3Graph(dataset, 'hierarchy', area, project, page, childPage), [dataset, area, project, page, childPage]);
  const full = dataset;
  const selected = dataset.nodes.find((node) => node.id === picked) || dataset.nodes[0];
  const path = useMemo(() => ancestors(dataset, selected.id), [dataset, selected.id]);
  const pathIds = useMemo(() => new Set(path.map((node) => node.id)), [path]);
  const matches = useMemo(() => findScaleV3Matches(dataset, query), [dataset, query]);
  const projectPages = area === null ? 0 : Math.ceil(areaProjects(dataset, area).length / PAGE_SIZE);
  const children = project === null ? [] : projectChildren(dataset, project);
  const childPages = Math.ceil(children.length / CHILD_PAGE_SIZE);
  const visible = mode === 'full' ? full : hierarchy;
  const related = dataset.edges.filter((edge) => edge.relation === 'related' && (edge.source === selected.id || edge.target === selected.id))
    .map((edge) => dataset.nodes.find((node) => node.id === (edge.source === selected.id ? edge.target : edge.source))).filter(Boolean);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ done, memo })); } catch { /* Storage may be disabled by the browser. */ }
  }, [done, memo]);

  function startMeasurement() { started.current = performance.now(); setLatency(null); }
  useEffect(() => {
    if (started.current === null) return undefined;
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        setLatency(Math.round(performance.now() - started.current));
        started.current = null;
      });
    });
    return () => { cancelAnimationFrame(first); if (second) cancelAnimationFrame(second); };
  }, [size, scenario, mode, area, project, page, childPage, picked]);

  useEffect(() => {
    if (!focusTarget) return undefined;
    const frame = requestAnimationFrame(() => {
      for (const layout of (mode === 'compare' ? ['hierarchy', 'full'] : [mode])) {
        const available = layout === 'full' ? full.nodes : hierarchy.nodes;
        if (available.some((node) => node.id === focusTarget)) {
          flows.current[layout]?.fitView({ nodes: [{ id: focusTarget }], padding: 0.7, maxZoom: 1.05, duration: 400 });
        }
      }
      setFocusTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [focusTarget, hierarchy.nodes, full.nodes, mode]);

  function resetFocus() {
    startMeasurement(); setArea(null); setProject(null); setPage(0); setChildPage(0); setPicked('root'); setQuery('');
    if (mode === 'full') setMode('hierarchy');
    setFocusTarget('root');
  }
  function changeSize(value) {
    startMeasurement(); setSize(value); setMode('hierarchy'); setArea(null); setProject(null); setPage(0); setChildPage(0);
    setPicked('root'); setQuery(''); setPositions({ full: {}, hierarchy: {} }); setPendingMode(null);
  }
  function changeScenario(value) {
    startMeasurement(); setScenario(value); setMode('hierarchy'); setArea(null); setProject(null); setPage(0); setChildPage(0);
    setPicked('root'); setQuery(''); setPositions({ full: {}, hierarchy: {} }); setPendingMode(null);
  }
  function changeMode(value) {
    if (size === 1000 && value !== 'hierarchy' && mode !== value) { setPendingMode(value); return; }
    startMeasurement(); setMode(value); setPendingMode(null);
  }
  function choose(node, jump = false) {
    startMeasurement(); setPicked(node.id);
    if (node.kind === 'root') { setArea(null); setProject(null); setPage(0); setChildPage(0); }
    else if (node.kind === 'area') { setArea(node.area); setProject(null); setPage(0); setChildPage(0); }
    else {
      const index = areaProjects(dataset, node.area).findIndex((item) => item.project === node.project);
      setArea(node.area); setPage(Math.max(0, Math.floor(index / PAGE_SIZE)));
      setProject(node.project); setChildPage(node.kind === 'project' ? 0 : Math.floor(node.sequence / CHILD_PAGE_SIZE));
    }
    if (jump) { setMode('hierarchy'); setQuery(''); setFocusTarget(node.id); }
  }
  function focusSelected() { setFocusTarget(selected.id); }
  function movePage(type, direction) {
    startMeasurement();
    if (type === 'project') { setPage((current) => Math.max(0, Math.min(projectPages - 1, current + direction))); setProject(null); setChildPage(0); }
    else setChildPage((current) => Math.max(0, Math.min(childPages - 1, current + direction)));
    setPicked(type === 'project' ? `area-${area}` : `project-${project}`);
  }
  function graphNodes(layout) {
    const source = layout === 'full' ? full.nodes : hierarchy.nodes;
    const compact = layout === 'full' && size >= 200;
    return source.map((node) => ({
      id: node.id, type: 'lab',
      position: positions[layout][node.id] || positionOf(node, layout, dataset),
      data: { ...node, active: node.id === selected.id, inPath: pathIds.has(node.id), compact },
    }));
  }
  function graphEdges(layout) {
    return (layout === 'full' ? full.edges : hierarchy.edges).map((edge) => ({
      ...edge, type: 'straight', animated: false,
      style: { stroke: edge.relation === 'related' ? '#e2a95d' : '#59799b', strokeWidth: pathIds.has(edge.source) && pathIds.has(edge.target) ? 2.4 : 1.1, opacity: edge.relation === 'related' ? 0.44 : 0.68, strokeDasharray: edge.relation === 'related' ? '5 5' : undefined },
    }));
  }
  function changePositions(layout, changes) {
    const moved = changes.filter((change) => change.type === 'position' && change.position);
    if (!moved.length) return;
    setPositions((previous) => {
      const next = { ...previous[layout] };
      for (const change of moved) next[change.id] = change.position;
      return { ...previous, [layout]: next };
    });
  }
  function graph(layout) {
    const count = layout === 'full' ? full.nodes.length : hierarchy.nodes.length;
    return <section key={layout} className="lab-graph" aria-label={`${layout === 'full' ? '전체 표시' : '단계별 탐색'} 그래프`}>
      <div className="lab-graph-top"><span>{layout === 'full' ? '전체 지도' : '단계별 지도'} · {count.toLocaleString()}개</span><button onClick={focusSelected}>선택 노드 찾기 ◎</button></div>
      <div className="lab-flow"><ReactFlow
        nodes={graphNodes(layout)} edges={graphEdges(layout)} nodeTypes={nodeTypes}
        onInit={(instance) => { flows.current[layout] = instance; }}
        onNodesChange={(changes) => changePositions(layout, changes)}
        onNodeDragStop={(_, node) => changePositions(layout, [{ type: 'position', id: node.id, position: node.position }])}
        onNodeClick={(_, node) => choose(node.data)}
        nodesConnectable={false} nodesDraggable fitView fitViewOptions={{ padding: 0.22 }}
        minZoom={0.025} maxZoom={1.8} onlyRenderVisibleElements={layout === 'full'} attributionPosition="bottom-right"
      ><Background color="#253751" gap={25} size={1}/><Controls showInteractive={false}/>{layout === 'hierarchy' && <MiniMap pannable zoomable nodeColor={(node) => node.data?.active ? '#79cbff' : '#587ea6'} maskColor="rgba(8,12,22,.7)"/>}</ReactFlow></div>
      <div className="lab-graph-bottom"><span>드래그·확대·클릭 가능 · 위치 유지</span><span>{layout === 'full' && size >= 200 ? '노드를 점으로 축약 표시 · 클릭 후 상세 확인' : '선택한 노드의 상위 경로를 확인하세요'}</span></div>
    </section>;
  }
  function exportNotes() {
    const text = `Project Map Lab V0.3 사용성 기록\n데이터: ${size}개 / ${SCENARIOS.find((item) => item.id === scenario).title}\n표시: ${mode}\n체크: ${done.length}/${CHECKS.length}\n${CHECKS.map((item, index) => `${done.includes(index) ? '[x]' : '[ ]'} ${item}`).join('\n')}\n\n의견:\n${memo}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'scale-lab-v03-feedback.txt'; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function clearDraft() { setDone([]); setMemo(''); try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Browser storage disabled. */ } }
  return <div className="lab-app lab-v3">
    <header className="lab-header"><div><span className="lab-logo">◈</span><strong>Project Map Lab</strong><span className="lab-divider">/</span><span>Scale Experiment · V0.3</span></div><a href="./">← 기존 11개 데모</a></header>
    <main className="lab-main">
      <div className="lab-title"><div><span className="lab-eyebrow">SYNTHETIC DATA · NO LIVE SYNC</span><h1>먼저 찾고, 관계를 따라가고, 다음 행동을 확인한다.</h1><p>가상 데이터로 탐색 구조를 비교합니다. 실제 프로젝트나 Notion·GitHub 내용은 사용하지 않습니다.</p></div><span className="lab-stamp">V0.3</span></div>
      <section className="lab-controls" aria-label="실험 조건">
        <div className="lab-field"><span>① 데이터 규모</span><div className="lab-buttons">{SCALE_SIZES.map((value) => <button key={value} aria-pressed={size === value} className={size === value ? 'chosen' : ''} onClick={() => changeSize(value)}>{value.toLocaleString()}개</button>)}</div></div>
        <div className="lab-field"><label htmlFor="lab-scenario">② 데이터 구조</label><select id="lab-scenario" value={scenario} onChange={(event) => changeScenario(event.target.value)}>{SCENARIOS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
        <div className="lab-field"><span>③ 표시 방식</span><div className="lab-buttons">{[['hierarchy', '단계별'], ['full', '전체 지도'], ['compare', '나란히 비교']].map(([value, label]) => <button key={value} aria-pressed={mode === value} className={mode === value ? 'chosen' : ''} onClick={() => changeMode(value)}>{label}</button>)}</div></div>
        <p className="lab-hint">{SCENARIOS.find((item) => item.id === scenario).description}. 1,000개 전체 보기에는 기기 부하가 발생할 수 있습니다.</p>
      </section>
      {pendingMode && <div className="lab-warning" role="alert"><strong>1,000개 전체 그래프를 렌더링할까요?</strong><span>브라우저가 잠시 느려질 수 있어요. 상단의 ‘단계별’을 눌러 돌아갈 수 있습니다.</span><button onClick={() => setPendingMode(null)}>취소</button><button onClick={() => { startMeasurement(); setMode(pendingMode); setPendingMode(null); }}>계속 진행</button></div>}
      <section className="lab-stats" aria-label="실험 지표"><div><small>전체 데이터</small><strong>{size.toLocaleString()}</strong><span>프로젝트 {dataset.projectCount}개</span></div><div><small>{mode === 'compare' ? '단계별 화면' : '현재 화면'}</small><strong>{visible.nodes.length.toLocaleString()}</strong><span>전체의 {Math.round(visible.nodes.length / size * 100)}%</span></div><div><small>전체 연결선</small><strong>{dataset.edges.length.toLocaleString()}</strong><span>교차 연결 {dataset.edges.filter((edge) => edge.relation === 'related').length}개</span></div><div><small>화면 전환 지연</small><strong className="lab-mode-name">{latency === null ? '—' : `${latency}ms`}</strong><span>클릭→화면 갱신의 참고값 · 공식 벤치마크 아님</span></div></section>
      <div className="lab-find"><div className="lab-search"><label htmlFor="lab-search-input">노드 검색</label><input id="lab-search-input" placeholder="프로젝트 번호·작업 이름·ID 검색" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && matches.length) choose(matches[0], true); }}/>{query && <button onClick={() => setQuery('')}>지우기</button>}</div>{query && <div className="lab-results" role="list" aria-label="검색 결과">{matches.length ? matches.map((node) => <button role="listitem" key={node.id} onClick={() => choose(node, true)}><strong>{node.title}</strong><small>{LABELS[node.kind]} · {node.id} · 상위 프로젝트 {node.project < 0 ? '없음' : node.project + 1}</small></button>) : <span>일치하는 결과 없음</span>}<small>최대 8개 표시 · 선택하면 해당 노드가 있는 단계로 이동</small></div>}</div>
      <div className="lab-breadcrumb" aria-label="선택한 항목의 상위 경로"><span>선택 경로</span>{path.map((node, index) => <span key={node.id} className="lab-crumb"><span aria-hidden="true">{index > 0 ? '›' : ''}</span><button aria-current={node.id === selected.id ? 'location' : undefined} className={node.id === selected.id ? 'current' : ''} onClick={() => choose(node, true)}>{node.title}</button></span>)}<button className="lab-focus-action" onClick={focusSelected}>지도에서 찾기 ◎</button></div>
      <div className={`lab-content ${mode === 'compare' ? 'lab-comparison' : ''}`}>
        {graph(mode === 'full' ? 'full' : 'hierarchy')}
        {mode === 'compare' && graph('full')}
        <aside className="lab-side" aria-label="선택 노드 상세"><div className="lab-side-title">SELECTED NODE · {LABELS[selected.kind]}</div><div className="lab-selected"><span className="lab-kind">{LABELS[selected.kind]}</span><h2>{selected.title}</h2><span className="lab-status">{selected.status} · 가상 데이터</span></div>
          <div className="lab-context"><strong>어디에 속해 있나요?</strong><div>{path.map((node, index) => <span key={node.id}>{index > 0 ? ' → ' : ''}{node.title}</span>)}</div>{selected.parentId && <button onClick={() => choose(dataset.nodes.find((node) => node.id === selected.parentId), true)}>↖ 상위 {LABELS[dataset.nodes.find((node) => node.id === selected.parentId)?.kind]} 바로 보기</button>}</div>
          <div className="lab-detail-row"><span>현재 상태</span><strong>{selected.status}</strong></div><div className="lab-detail-row"><span>현재 의미</span><strong>{selected.kind === 'root' ? '전체 영역 탐색' : selected.kind === 'area' ? '분야별 프로젝트 확인' : selected.kind === 'project' ? '세부 자료 및 작업 확인' : '해당 프로젝트에 속한 가상 항목'}</strong></div>
          <div className="lab-next"><strong>다음 행동 · 데모 안내</strong><p>{selected.kind === 'root' ? '분야를 선택해 프로젝트를 펼쳐 보세요.' : selected.kind === 'area' ? '연결된 프로젝트를 선택하세요.' : selected.kind === 'project' ? '이 프로젝트의 작업·문서를 클릭해 소속 경로를 확인하세요.' : '상위 프로젝트 버튼을 눌러 소속을 확인해 보세요.'}</p></div>
          {related.length > 0 && <div className="lab-related"><strong>관련 프로젝트 · 교차 관계</strong>{related.map((node) => <button key={node.id} onClick={() => choose(node, true)}>↗ {node.title}</button>)}</div>}
          <div className="lab-detail-row"><span>출처</span><strong>자동 생성 샘플 · 실제 상태 아님</strong></div>
          <div className="lab-path"><strong>탐색과 위치</strong><p>검색이나 경로 버튼으로 이동해도 직접 옮긴 노드의 위치는 이 화면에서 유지됩니다.</p><button onClick={resetFocus}>전체 단계로 돌아가기</button></div>
        </aside>
      </div>
      <section className="lab-pagination" aria-label="단계별 페이지 이동"><div><strong>프로젝트 페이지</strong><span>{area === null ? '분야 선택 필요' : `${page + 1} / ${projectPages} · 한 화면 최대 ${PAGE_SIZE}개`}</span><button disabled={area === null || page <= 0} onClick={() => movePage('project', -1)}>이전</button><button disabled={area === null || page >= projectPages - 1} onClick={() => movePage('project', 1)}>다음</button></div><div><strong>세부 항목 페이지</strong><span>{project === null ? '프로젝트 선택 필요' : `${childPage + 1} / ${childPages || 1} · 총 ${children.length}개`}</span><button disabled={project === null || childPage <= 0} onClick={() => movePage('child', -1)}>이전</button><button disabled={project === null || childPage >= childPages - 1} onClick={() => movePage('child', 1)}>다음</button></div></section>
      <section className="lab-bottom"><div className="lab-checks"><h2>V0.3 사용성 확인 <span>{done.length}/{CHECKS.length}</span></h2>{CHECKS.map((item, index) => <label key={item}><input type="checkbox" checked={done.includes(index)} onChange={() => setDone((previous) => previous.includes(index) ? previous.filter((value) => value !== index) : [...previous, index])}/><span>{item}</span></label>)}</div><div className="lab-notes"><h2>사용하면서 발견한 문제</h2><p>이 기기의 브라우저에 자동 저장돼요. 다른 PC와 공유되지는 않으며 브라우저 데이터를 지우면 사라질 수 있습니다.</p><textarea aria-label="사용성 의견" placeholder="예: 문서에서 프로젝트로 돌아갈 때 어느 버튼이 편했는지..." value={memo} onChange={(event) => setMemo(event.target.value)}/><div className="lab-note-actions"><button onClick={exportNotes}>결과 파일 다운로드</button><button className="lab-clear" onClick={clearDraft}>체크·메모 초기화</button></div></div></section>
      <p className="lab-footer">V0.3은 가상 데이터 UI 실험입니다. 이 페이지는 개인 프로젝트 데이터 저장소가 아니며 실제 동기화·권한·외부 API가 연결되지 않았습니다. <a href="./">기존 데모로 이동 →</a></p>
    </main>
  </div>;
}
