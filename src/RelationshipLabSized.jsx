import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, useNodesState } from '@xyflow/react';
import { RELATION_NODES, RELATION_EDGES, NODE_KINDS, LINK_TYPES, getRelations } from './relationshipData.js';
import { IMPORTANCE_LEVELS, visualImportance } from './importance.js';
import { relationshipNeighborhood, describeTwoStepRoute } from './relationshipTraversal.js';

const nodeIndex = new Map(RELATION_NODES.map((node) => [node.id, node]));
const initialNodes = RELATION_NODES.map((node) => ({ id: node.id, type: 'knowledge', position: node.position, data: node }));
const TYPE_KEYS = Object.keys(LINK_TYPES);

function KnowledgeNode({ data }) {
  const node = data.item;
  return (
    <div className={`kn-node kn-${node.kind} ${data.active ? 'kn-active' : ''} ${data.dim ? 'kn-dim' : ''}`} title={`${node.title} · ${IMPORTANCE_LEVELS[visualImportance(node.id)].label}: ${node.summary}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <div className="kn-orb"><span>{node.title}</span></div>
      <div className="kn-tag">{NODE_KINDS[node.kind]}</div>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}
const nodeTypes = { knowledge: KnowledgeNode };

export default function RelationshipLabSized() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [selectedId, setSelectedId] = useState('network');
  const [enabledTypes, setEnabledTypes] = useState(TYPE_KEYS);
  const [mode, setMode] = useState('all');
  const [query, setQuery] = useState('');
  const [flow, setFlow] = useState(null);
  const selected = nodeIndex.get(selectedId);
  const allRelations = useMemo(() => getRelations(selectedId, enabledTypes), [selectedId, enabledTypes]);
  const neighborhood = useMemo(() => relationshipNeighborhood(selectedId, enabledTypes, 2), [selectedId, enabledTypes]);
  const directCount = [...neighborhood.distances.values()].filter((distance) => distance === 1).length;
  const twoStepNodes = useMemo(() => RELATION_NODES.filter((node) => neighborhood.distances.get(node.id) === 2), [neighborhood]);
  const visibleNodes = useMemo(() => nodes.filter((node) => {
    const distance = neighborhood.distances.get(node.id);
    return mode === 'all' || (mode === 'neighbors' ? distance !== undefined && distance <= 1 : distance !== undefined && distance <= 2);
  }).map((node) => {
    const distance = neighborhood.distances.get(node.id);
    return {
      ...node,
      className: `importance-${visualImportance(node.id)}`,
      style: { opacity: mode === 'two' && distance === 2 ? 0.72 : 1 },
      data: { item: node.data, active: node.id === selectedId, dim: mode === 'all' && distance === undefined },
    };
  }), [nodes, mode, neighborhood, selectedId]);
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => RELATION_EDGES.filter((link) => enabledTypes.includes(link.type) && visibleIds.has(link.source) && visibleIds.has(link.target)).map((link) => {
    const directlyConnected = link.source === selectedId || link.target === selectedId;
    return {
      id: link.id, source: link.source, target: link.target, type: 'default',
      style: { stroke: LINK_TYPES[link.type].color, strokeWidth: directlyConnected ? 2.9 : 1.3,
        opacity: directlyConnected ? 0.95 : mode === 'all' ? 0.25 : 0.6 },
      zIndex: directlyConnected ? 5 : 0,
    };
  }), [enabledTypes, visibleIds, mode, selectedId]);
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? RELATION_NODES.filter((node) => `${node.title} ${node.summary} ${NODE_KINDS[node.kind]}`.toLocaleLowerCase().includes(term)).slice(0, 8) : [];
  }, [query]);

  function fitAfterUpdate() {
    requestAnimationFrame(() => requestAnimationFrame(() => flow?.fitView({ padding: 0.17, duration: 420 })));
  }
  function choose(id, move = false) {
    setSelectedId(id);
    setQuery('');
    if (move && flow) {
      const current = nodes.find((node) => node.id === id);
      if (current) {
        const size = IMPORTANCE_LEVELS[visualImportance(id)].diameter;
        requestAnimationFrame(() => flow.setCenter(current.position.x + (size + 28) / 2, current.position.y + size / 2, { zoom: 1.12, duration: 450 }));
      }
    }
  }
  function changeMode(nextMode) { setMode(nextMode); fitAfterUpdate(); }
  function toggleType(key) {
    setEnabledTypes((previous) => previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]);
  }
  function reset() {
    setNodes(initialNodes);
    setSelectedId('network'); setEnabledTypes(TYPE_KEYS); setMode('all'); setQuery('');
    fitAfterUpdate();
  }

  return (
    <div className="relationship-app">
      <header className="relationship-header">
        <a className="relationship-brand" href="./"><span>◉</span> Project Map Lab <small>/ 관계 탐색 V0.5</small></a>
        <nav><a href="./">11개 노드 데모</a><a href="./scale-lab.html">규모 실험 V0.3</a></nav>
      </header>
      <main className="relationship-main">
        <div className="relationship-intro"><div><span className="relationship-eyebrow">RELATIONSHIP EXPERIMENT · TWO-STEP NAVIGATION V0.5</span><h1>하나를 선택하고, 연결된 관계를 두 단계까지 따라가기</h1><p>직접 연결된 항목과 중간 항목을 거쳐 연결된 항목을 구분해 봐. 기존 24개 노드·44개 관계와 크기 기준은 유지했어.</p></div><span className="relationship-demo">공개 가능한 대화 데이터 · 실험용</span></div>
        <section className="relationship-notice"><strong>데이터 경계</strong> 이 대화에서 공개 가능한 실험 내용만 수동으로 입력했어. 크기는 임시 시각적 역할이며 실제 업무 우선순위가 아냐. 두 단계 경로는 기존 관계를 탐색한 결과일 뿐 새로운 사실 관계를 뜻하지 않아. 비공개 자료·실시간 API는 연결하지 않았어.</section>
        <section className="relationship-controls" aria-label="그래프 탐색 도구">
          <div className="relationship-search"><span aria-hidden="true">⌕</span><input aria-label="노드 찾기" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트·기술·기능 검색…" />{query && <button onClick={() => setQuery('')} aria-label="검색 지우기">×</button>}
            {query && <div className="relationship-results">{results.length ? results.map((node) => <button key={node.id} onClick={() => choose(node.id, true)}><span>{NODE_KINDS[node.kind]}</span><strong>{node.title}</strong></button>) : <div className="relationship-no-result">검색 결과가 없어.</div>}</div>}
          </div>
          <div className="relationship-modes" aria-label="표시 범위">
            <button className={mode === 'all' ? 'chosen' : ''} aria-pressed={mode === 'all'} onClick={() => changeMode('all')}>전체 관계</button>
            <button className={mode === 'neighbors' ? 'chosen' : ''} aria-pressed={mode === 'neighbors'} onClick={() => changeMode('neighbors')}>직접 연결</button>
            <button className={mode === 'two' ? 'chosen' : ''} aria-pressed={mode === 'two'} onClick={() => changeMode('two')}>두 단계 연결</button>
          </div>
          <button className="relationship-reset" onClick={reset}>위치·필터 초기화 ↺</button>
        </section>
        <section className="importance-legend" aria-label="노드 크기 범례"><strong>크기 기준 · 임시 시각 중요도</strong>{Object.entries(IMPORTANCE_LEVELS).map(([key, level]) => <span key={key}><i className={`importance-dot importance-dot-${key}`} />{level.label}<small>{level.diameter}px</small></span>)}<em>원 크기는 실제 업무 우선순위나 연결 수 점수가 아니야.</em></section>
        <section className="relationship-types" aria-label="연결 유형 필터"><strong>연결선 종류</strong>{TYPE_KEYS.map((key) => <button key={key} className={!enabledTypes.includes(key) ? 'off' : ''} onClick={() => toggleType(key)} aria-pressed={enabledTypes.includes(key)}><i style={{background: LINK_TYPES[key].color}} />{LINK_TYPES[key].label}</button>)}<span>두 단계 항목은 조금 흐리게 표시해 직접 연결과 구분해.</span></section>
        <div className="relationship-stats"><span>항목 <b>{visibleNodes.length} / {RELATION_NODES.length}</b></span><span>연결 <b>{visibleEdges.length} / {RELATION_EDGES.length}</b></span><span>직접 연결 <b>{directCount}</b></span><span>두 단계 연결 <b>{twoStepNodes.length}</b></span></div>
        <div className="relationship-layout">
          <section className="relationship-graph" aria-label="대화 기반 다중 관계 그래프">
            <div className="relationship-graphbar"><span><i /> 관계망 · {mode === 'all' ? '전체' : mode === 'neighbors' ? '직접 관계' : '두 단계 경로'}</span><div><button onClick={() => flow?.fitView({ padding: 0.12, duration: 450 })}>화면 맞춤</button><button onClick={() => changeMode('all')}>모든 노드 보기</button></div></div>
            <div className="relationship-flow"><ReactFlow nodes={visibleNodes} edges={visibleEdges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} onNodeClick={(_, node) => choose(node.id)} onInit={setFlow} nodesConnectable={false} fitView fitViewOptions={{padding:0.15}} minZoom={0.18} maxZoom={2} attributionPosition="bottom-right"><Background color="#30415b" gap={29} size={1} /><Controls showInteractive={false}/><MiniMap nodeColor={(n) => ({ project:'#78bfff', experiment:'#ae91fb', future:'#edba7d', technology:'#48d6bd', source:'#d3a4e8', decision:'#faaf8b', feature:'#6e96ee', deployment:'#5bccae' }[n.data?.item?.kind] || '#90b5d2')} maskColor="rgba(8,13,24,.64)" /></ReactFlow></div>
            <div className="relationship-graphfoot">노드 선택 → 직접 연결 강조 · 두 단계 보기는 간접 항목 흐리게 · 드래그와 검색 이동 지원</div>
          </section>
          <aside className="relationship-detail" aria-label="선택한 노드 상세">
            <div className="relationship-caption">SELECTED NODE</div><span className={`relationship-kind kind-${selected.kind}`}>{NODE_KINDS[selected.kind]} · {selected.state}</span><h2>{selected.title}</h2><p>{selected.summary}</p>
            <div className="relationship-visual-level"><strong>화면 중요도: {IMPORTANCE_LEVELS[visualImportance(selected.id)].label}</strong><span>{IMPORTANCE_LEVELS[visualImportance(selected.id)].rationale} · 임시 기준</span></div>
            {selected.url && <a className="relationship-source-link" href={selected.url} target="_blank" rel="noreferrer">관련 공개 페이지 열기 ↗</a>}
            <div className="relationship-provenance">근거: {selected.provenance}<br/>현재 상태는 실시간 조회 결과가 아님.</div>
            <div className="relationship-neighbors-heading"><strong>① 직접 연결</strong><span>{allRelations.length}개 관계</span></div>
            <div className="relationship-neighbors">{allRelations.length ? allRelations.map((link) => {const node = nodeIndex.get(link.neighborId); return <button key={link.id} onClick={() => choose(node.id, true)}><span className="relationship-linktype" style={{color:LINK_TYPES[link.type].color}}>● {LINK_TYPES[link.type].label}</span><strong>{node.title} ↗</strong><small>{link.reason}</small></button>;}) : <p>선택한 필터에 직접 연결이 없어.</p>}</div>
            <div className="relationship-neighbors-heading"><strong>② 한 단계를 거쳐 연결</strong><span>{twoStepNodes.length}개 항목</span></div>
            <div className="relationship-neighbors">{twoStepNodes.length ? twoStepNodes.map((node) => { const route = describeTwoStepRoute(node.id, neighborhood.via); return <button key={node.id} onClick={() => choose(node.id, true)}><span className="relationship-linktype">경유: {route.throughTitle}</span><strong>{node.title} ↗</strong><small>첫 관계: {route.first.reason}<br/>다음 관계: {route.second.reason}</small></button>; }) : <p>이 필터에서 두 단계로 이어지는 항목이 없어.</p>}</div>
          </aside>
        </div>
        <section className="relationship-next"><strong>이번 검증</strong><p>하나의 노드를 선택하고 ‘직접 연결’과 ‘두 단계 연결’을 바꿔 봐. 오른쪽 목록에서 경유 항목과 각 관계의 근거를 확인하고, 원하는 노드로 이동할 수 있어.</p><p>배치 변경과 다른 대화·Notion 자료의 추가 수집은 하지 않았어. 이 기능이 필요한 만큼 맥락을 보여주는지 확인한 뒤 실제 프로젝트 데이터 확대 범위를 정하자.</p></section>
      </main>
    </div>
  );
}
