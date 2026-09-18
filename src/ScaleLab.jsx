import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, useNodesState } from '@xyflow/react';
import { AREAS, SCALE_SIZES, SCENARIOS, createScaleData, selectScaleGraph, getNodePath } from './scaleData.js';

const KINDS = { root: '전체', area: '분야', project: '프로젝트', task: '작업', document: '문서', decision: '결정' };
const STORAGE_KEY = 'project-map-scale-lab-v03';

function GraphNode({ data }) {
  return (
    <div className={`lab-node lab-${data.kind} ${data.active ? 'lab-active' : ''} ${data.ancestor ? 'lab-ancestor' : ''}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <small>{KINDS[data.kind]} · {data.status}</small>
      <strong>{data.title}</strong>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}
const nodeTypes = { lab: GraphNode };

function nodePosition(node, mode) {
  if (mode === 'full') return { x: node.x, y: node.y };
  if (node.kind === 'root') return { x: 35, y: 300 };
  if (node.kind === 'area') return { x: 270, y: node.area * 145 + 25 };
  if (node.kind === 'project') return { x: 535, y: (node.project % 5) * 120 + 55 };
  const ordinal = Number(node.id.split('-').pop()) || 0;
  return { x: 820 + Math.floor(ordinal / 8) * 210, y: (ordinal % 8) * 77 + 25 };
}

const CHECKS = [
  '50개에서 전체 보기와 단계별 보기 비교',
  '200개에서 분야 → 프로젝트 → 작업 탐색',
  '검색으로 원하는 노드 바로 찾기',
  '작업 선택 시 상위 분야·프로젝트가 즉시 보이는지 확인',
  '프로젝트 증가형·작업 집중형·복합형·관계 증가형 비교',
  '1,000개 단계별 보기 조작',
  '1,000개 전체 보기 반응 확인 (선택)',
  '내게 편한 화면 구성을 결정하고 이유 기록',
];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function ScaleLab() {
  const saved = useMemo(loadSaved, []);
  const [size, setSize] = useState(saved.size ?? 200);
  const [scenario, setScenario] = useState(saved.scenario ?? 'balanced');
  const [mode, setMode] = useState(saved.mode ?? 'hierarchy');
  const [area, setArea] = useState(null);
  const [project, setProject] = useState(null);
  const [picked, setPicked] = useState('root');
  const [done, setDone] = useState(saved.done ?? []);
  const [memo, setMemo] = useState(saved.memo ?? '');
  const [query, setQuery] = useState('');
  const [flow, setFlow] = useState(null);
  const [renderMs, setRenderMs] = useState(null);
  const dataset = useMemo(() => createScaleData(size, scenario), [size, scenario]);
  const shown = useMemo(() => selectScaleGraph(dataset, mode, area, project), [dataset, mode, area, project]);
  const selected = dataset.nodes.find((node) => node.id === picked) ?? dataset.nodes[0];
  const path = getNodePath(dataset, selected);
  const ancestorIds = new Set(path.map((label) => dataset.nodes.find((node) => node.title === label)?.id).filter(Boolean));

  const mappedNodes = useMemo(() => shown.nodes.map((node) => ({
    id: node.id,
    type: 'lab',
    position: nodePosition(node, mode),
    data: { ...node, active: node.id === picked, ancestor: ancestorIds.has(node.id) && node.id !== picked },
  })), [shown.nodes, mode, picked, path.join('|')]);
  const [nodes, setNodes, onNodesChange] = useNodesState(mappedNodes);

  useEffect(() => setNodes(mappedNodes), [mappedNodes, setNodes]);

  const edges = useMemo(() => shown.edges.map((edge) => ({
    ...edge,
    type: edge.relation === 'related' ? 'smoothstep' : 'straight',
    animated: edge.relation === 'related',
    style: { stroke: edge.relation === 'related' ? '#b58cff' : '#4e698a', strokeWidth: edge.relation === 'related' ? 1.7 : 1.3, opacity: edge.relation === 'related' ? 0.82 : 0.65 },
  })), [shown.edges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ size, scenario, mode, done, memo }));
  }, [size, scenario, mode, done, memo]);

  useEffect(() => {
    const started = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(() => setRenderMs(Math.round(performance.now() - started))));
  }, [size, scenario, mode, area, project]);

  const visiblePercent = Math.round(shown.nodes.length / size * 100);
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return dataset.nodes.filter((node) => node.title.toLowerCase().includes(term) || node.id.toLowerCase().includes(term)).slice(0, 8);
  }, [query, dataset]);

  function resetFocus() {
    setArea(null); setProject(null); setPicked('root');
  }
  function chooseSize(value) {
    setSize(value); setMode('hierarchy'); resetFocus();
  }
  function chooseScenario(value) {
    setScenario(value); setMode('hierarchy'); resetFocus();
  }
  function focusNode(node, keepMode = false) {
    setPicked(node.id);
    if (!keepMode && mode !== 'full') {
      if (node.kind === 'root') { setArea(null); setProject(null); }
      else if (node.kind === 'area') { setArea(node.area); setProject(null); }
      else { setArea(node.area); setProject(node.project); }
    }
    setQuery('');
    setTimeout(() => flow?.fitView({ nodes: [{ id: node.id }], padding: 1.5, maxZoom: 1.25, duration: 450 }), 40);
  }
  function chooseNode(node) { focusNode(node); }
  function overview() { setMode('hierarchy'); resetFocus(); setTimeout(() => flow?.fitView({ padding: 0.3, duration: 400 }), 40); }
  function full() { setMode('full'); resetFocus(); setTimeout(() => flow?.fitView({ padding: 0.08, duration: 400 }), 40); }
  function toggle(index) { setDone((previous) => previous.includes(index) ? previous.filter((id) => id !== index) : [...previous, index]); }

  return (
    <div className="lab-app">
      <header className="lab-header">
        <div><span className="lab-logo">◈</span><strong>Project Map Lab</strong><span className="lab-divider">/</span><span>Scale Experiment · V0.3</span></div>
        <a href="./">← 기존 11개 노드 데모</a>
      </header>
      <main className="lab-main">
        <div className="lab-title"><div><span className="lab-eyebrow">SYNTHETIC DATA · NO LIVE SYNC</span><h1>많은 프로젝트를 어떻게 찾고, 맥락까지 바로 볼까?</h1><p>가상 데이터로 규모·구조·탐색 방식을 바꿔 보는 실험입니다. 개인 프로젝트 정보는 사용하지 않았습니다.</p></div><span className="lab-stamp">V0.3 개선판</span></div>

        <section className="lab-controls" aria-label="그래프 실험 설정">
          <div className="lab-field"><span>① 데이터 규모</span><div className="lab-buttons">{SCALE_SIZES.map((value) => <button key={value} className={size === value ? 'chosen' : ''} onClick={() => chooseSize(value)}>{value.toLocaleString()}개</button>)}</div></div>
          <div className="lab-field"><span>② 데이터 구조</span><div className="lab-buttons">{Object.entries(SCENARIOS).map(([key, value]) => <button key={key} title={value.description} className={scenario === key ? 'chosen' : ''} onClick={() => chooseScenario(key)}>{value.label}</button>)}</div></div>
          <div className="lab-field"><span>③ 표시 방식</span><div className="lab-buttons"><button className={mode === 'hierarchy' ? 'chosen' : ''} onClick={overview}>단계별 탐색</button><button className={mode === 'full' ? 'chosen danger' : ''} onClick={full}>전체 표시</button></div></div>
          <div className="lab-hint">{SCENARIOS[scenario].description} · {mode === 'full' ? '모든 노드를 한 번에 렌더링합니다.' : '분야 → 프로젝트 → 세부 항목 순으로 펼칩니다.'}</div>
        </section>

        <section className="lab-search-wrap">
          <div className="lab-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트·작업·문서 검색..." /></div>
          {searchResults.length > 0 && <div className="lab-search-results">{searchResults.map((node) => <button key={node.id} onClick={() => focusNode(node)}><span>{KINDS[node.kind]}</span><strong>{node.title}</strong><small>{getNodePath(dataset, node).slice(0, -1).join(' → ')}</small></button>)}</div>}
        </section>

        <section className="lab-stats" aria-label="현재 그래프 수치"><div><small>전체 데이터</small><strong>{size.toLocaleString()}</strong><span>가상 노드</span></div><div><small>화면 노드</small><strong>{shown.nodes.length.toLocaleString()}</strong><span>전체의 {visiblePercent}%</span></div><div><small>화면 연결선</small><strong>{shown.edges.length.toLocaleString()}</strong><span>{scenario === 'crossLinked' ? '교차 관계 포함' : '계층 관계'}</span></div><div><small>화면 갱신 측정</small><strong className="lab-mode-name">{renderMs ?? '—'} ms</strong><span>브라우저 단순 측정값</span></div></section>

        <div className="lab-breadcrumb" aria-label="선택 항목 경로">{path.map((item, index) => <span key={`${item}-${index}`}>{index > 0 && <b>›</b>}{item}</span>)}</div>

        <div className="lab-content">
          <section className="lab-graph" aria-label="노드 규모 비교 그래프">
            <div className="lab-graph-top"><span>LIVE GRAPH PREVIEW · {SCENARIOS[scenario].label}</span><div><button onClick={() => flow?.fitView({ padding: 0.25, duration: 350 })}>화면 맞춤</button><button onClick={overview}>전체 단계 접기 ↺</button></div></div>
            <div className="lab-flow"><ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onNodeClick={(_, node) => chooseNode(node.data)}
              onInit={setFlow}
              nodesConnectable={false}
              nodesDraggable
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={0.035}
              maxZoom={2}
              onlyRenderVisibleElements={mode === 'full'}
              attributionPosition="bottom-right"
            ><Background color="#253751" gap={25} size={1}/><Controls showInteractive={false}/>{mode !== 'full' && <MiniMap pannable zoomable nodeColor={(node) => node.data?.kind === 'task' ? '#627f9e' : '#58a7ec'} maskColor="rgba(8,12,22,.7)"/>}</ReactFlow></div>
            <div className="lab-graph-bottom"><span>드래그 · 확대 · 축소 · 노드 클릭 · 검색 이동</span><span>선택한 항목의 상위 경로는 위 breadcrumb와 강조 노드로 확인합니다.</span></div>
          </section>

          <aside className="lab-side">
            <div className="lab-side-title">SELECTED NODE</div>
            <div className="lab-selected"><span className="lab-kind">{KINDS[selected.kind]}</span><h2>{selected.title}</h2><span className="lab-status">{selected.status}</span></div>
            <div className="lab-context"><strong>상위 맥락</strong>{path.map((item, index) => <div key={`${item}-context`} className={index === path.length - 1 ? 'current' : ''}><span>{index + 1}</span>{item}</div>)}</div>
            <div className="lab-detail-row"><span>현재 상태</span><strong>{selected.status}</strong></div>
            <div className="lab-detail-row"><span>데이터 종류</span><strong>가상 예시</strong></div>
            <div className="lab-detail-row"><span>상위 프로젝트</span><strong>{selected.kind === 'root' || selected.kind === 'area' ? '—' : path[path.length - (selected.kind === 'project' ? 1 : 2)]}</strong></div>
            <p className="lab-side-note">{selected.kind === 'root' ? '분야를 선택하면 관련 프로젝트가 펼쳐집니다.' : selected.kind === 'area' ? '이 분야의 프로젝트를 선택해 세부 항목으로 내려가세요.' : selected.kind === 'project' ? '프로젝트를 선택하면 관련 세부 항목만 펼쳐집니다.' : '세부 항목을 선택해도 어떤 분야와 프로젝트 아래에 있는지 바로 확인할 수 있습니다.'}</p>
            <div className="lab-path"><strong>바로 이동</strong><button onClick={overview}>전체 작업 영역</button>{selected.area >= 0 && <button onClick={() => focusNode(dataset.nodes.find((node) => node.id === `area-${selected.area}`))}>{AREAS[selected.area]}</button>}{selected.project >= 0 && <button onClick={() => focusNode(dataset.nodes.find((node) => node.id === `project-${selected.project}`))}>상위 프로젝트</button>}</div>
          </aside>
        </div>

        <section className="lab-bottom"><div className="lab-checks"><h2>직접 비교 체크리스트 <span>{done.length}/{CHECKS.length}</span></h2>{CHECKS.map((item, index) => <label key={item}><input type="checkbox" checked={done.includes(index)} onChange={() => toggle(index)}/><span>{item}</span></label>)}</div><div className="lab-notes"><h2>어떤 구성이 편했어?</h2><p>메모와 체크 결과는 이 브라우저의 localStorage에 자동 저장돼. 다른 기기와는 아직 공유되지 않아.</p><textarea aria-label="실험 소감" placeholder="예: 작업을 눌렀을 때 상위 프로젝트가 우측에 바로 보여서 좋다..." value={memo} onChange={(event) => setMemo(event.target.value)}/><button onClick={() => navigator.clipboard?.writeText(`Scale Lab V0.3 기록\n데이터: ${size}개\n구조: ${SCENARIOS[scenario].label}\n표시: ${mode}\n체크: ${done.length}/${CHECKS.length}\n의견: ${memo}`)}>결과 텍스트 복사</button></div></section>
        <p className="lab-footer">V0.3는 사용성·구조 실험입니다. 갱신 시간은 브라우저의 간단한 비교용 측정값이며 정식 벤치마크가 아닙니다. 실제 프로젝트 저장·수정·동기화 기능은 없습니다. <a href="./">원래 데모로 돌아가기 →</a></p>
      </main>
    </div>
  );
}
