import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, useNodesState } from '@xyflow/react';
import { RELATION_NODES, RELATION_EDGES, NODE_KINDS, LINK_TYPES, getRelations, connectedIds } from './relationshipData.js';

const nodeIndex = new Map(RELATION_NODES.map((node) => [node.id, node]));
const initialNodes = RELATION_NODES.map((node) => ({ id: node.id, type: 'knowledge', position: node.position, data: node }));
const TYPE_KEYS = Object.keys(LINK_TYPES);

function KnowledgeNode({ data }) {
  const node = data.item;
  return (
    <div className={`kn-node kn-${node.kind} ${data.active ? 'kn-active' : ''} ${data.dim ? 'kn-dim' : ''}`} title={`${node.title}: ${node.summary}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <div className="kn-orb"><span>{node.title}</span></div>
      <div className="kn-tag">{NODE_KINDS[node.kind]}</div>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  );
}
const nodeTypes = { knowledge: KnowledgeNode };

export default function RelationshipLab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [selectedId, setSelectedId] = useState('network');
  const [enabledTypes, setEnabledTypes] = useState(TYPE_KEYS);
  const [mode, setMode] = useState('all');
  const [query, setQuery] = useState('');
  const [flow, setFlow] = useState(null);
  const selected = nodeIndex.get(selectedId);
  const allRelations = useMemo(() => getRelations(selectedId, enabledTypes), [selectedId, enabledTypes]);
  const neighborIds = useMemo(() => connectedIds(selectedId, enabledTypes), [selectedId, enabledTypes]);
  const visibleNodes = useMemo(() => nodes.filter((node) => mode === 'all' || neighborIds.has(node.id)).map((node) => ({
    ...node,
    data: { item: node.data, active: node.id === selectedId, dim: mode === 'all' && !neighborIds.has(node.id) },
  })), [nodes, mode, neighborIds, selectedId]);
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => RELATION_EDGES.filter((link) => enabledTypes.includes(link.type) && visibleIds.has(link.source) && visibleIds.has(link.target)).map((link) => ({
    id: link.id,
    source: link.source,
    target: link.target,
    type: 'default',
    label: undefined,
    style: {
      stroke: LINK_TYPES[link.type].color,
      strokeWidth: link.source === selectedId || link.target === selectedId ? 2.9 : 1.3,
      opacity: mode === 'all' && link.source !== selectedId && link.target !== selectedId ? 0.25 : 0.9,
    },
    zIndex: link.source === selectedId || link.target === selectedId ? 5 : 0,
  })), [enabledTypes, visibleIds, mode, selectedId]);
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? RELATION_NODES.filter((node) => `${node.title} ${node.summary} ${NODE_KINDS[node.kind]}`.toLocaleLowerCase().includes(term)).slice(0, 8) : [];
  }, [query]);

  function choose(id, move = false) {
    setSelectedId(id);
    if (mode === 'neighbors' && !connectedIds(id, enabledTypes).has(id)) setMode('all');
    setQuery('');
    if (move && flow) {
      const current = nodes.find((node) => node.id === id);
      if (current) flow.setCenter(current.position.x + 60, current.position.y + 50, { zoom: 1.12, duration: 450 });
    }
  }
  function toggleType(key) {
    setEnabledTypes((previous) => previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]);
  }
  function reset() {
    setNodes(initialNodes);
    setSelectedId('network');
    setEnabledTypes(TYPE_KEYS);
    setMode('all');
    setQuery('');
    flow?.fitView({ padding: 0.14, duration: 500 });
  }

  return (
    <div className="relationship-app">
      <header className="relationship-header">
        <a className="relationship-brand" href="./"><span>◉</span> Project Map Lab <small>/ 실제 관계 실험</small></a>
        <nav><a href="./">11개 노드 데모</a><a href="./scale-lab.html">규모 실험 V0.3</a></nav>
      </header>
      <main className="relationship-main">
        <div className="relationship-intro"><div><span className="relationship-eyebrow">RELATIONSHIP EXPERIMENT · CONVERSATION-ONLY</span><h1>한 개의 부모가 아닌, 여러 관계로 연결하기</h1><p>현재 대화에서 확인된 사실·결정·계획만 연결했어. 노드 하나를 누르면 직접 연결된 항목과 연결 이유가 보여.</p></div><span className="relationship-demo">공개 가능한 대화 데이터 · 실험용</span></div>
        <section className="relationship-notice"><strong>데이터 경계</strong> 공개 가능한 현재 대화의 프로젝트 진행·기술·결정만 수동 입력. 개인 이력·비공개 Notion·기타 대화는 가져오지 않았으며 API/실시간 동기화도 없음. 연결선은 사실로 확인된 관계나 명시적으로 검토 중인 의존 관계만 뜻해.</section>
        <section className="relationship-controls" aria-label="그래프 탐색 도구">
          <div className="relationship-search"><span aria-hidden="true">⌕</span><input aria-label="노드 찾기" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트·기술·기능 검색…" />{query && <button onClick={() => setQuery('')} aria-label="검색 지우기">×</button>}
            {query && <div className="relationship-results">{results.length ? results.map((node) => <button key={node.id} onClick={() => choose(node.id, true)}><span>{NODE_KINDS[node.kind]}</span><strong>{node.title}</strong></button>) : <div className="relationship-no-result">검색 결과가 없어.</div>}</div>}
          </div>
          <div className="relationship-modes" aria-label="표시 범위"><button className={mode === 'all' ? 'chosen' : ''} onClick={() => setMode('all')}>전체 관계</button><button className={mode === 'neighbors' ? 'chosen' : ''} onClick={() => {setMode('neighbors'); flow?.fitView({ padding: 0.18, duration: 400 });}}>선택 노드 + 직접 연결</button></div>
          <button className="relationship-reset" onClick={reset}>위치·필터 초기화 ↺</button>
        </section>
        <section className="relationship-types" aria-label="연결 유형 필터"><strong>연결선 종류</strong>{TYPE_KEYS.map((key) => <button key={key} className={!enabledTypes.includes(key) ? 'off' : ''} onClick={() => toggleType(key)} aria-pressed={enabledTypes.includes(key)}><i style={{background: LINK_TYPES[key].color}} />{LINK_TYPES[key].label}</button>)}<span>색은 관계의 종류이며, 노드가 크다고 중요한 순위는 아님.</span></section>
        <div className="relationship-stats"><span>항목 <b>{visibleNodes.length} / {RELATION_NODES.length}</b></span><span>연결 <b>{visibleEdges.length} / {RELATION_EDGES.length}</b></span><span>선택 노드의 직접 관계 <b>{allRelations.length}</b></span><span>배치: 실험용 고정 시작 위치 + 자유 드래그</span></div>
        <div className="relationship-layout">
          <section className="relationship-graph" aria-label="실제 대화 기반 다중 관계 그래프">
            <div className="relationship-graphbar"><span><i /> 관계망 · 다대다 연결</span><div><button onClick={() => flow?.fitView({ padding: 0.12, duration: 450 })}>화면 맞춤</button><button onClick={() => setMode('all')}>모든 노드 보기</button></div></div>
            <div className="relationship-flow"><ReactFlow nodes={visibleNodes} edges={visibleEdges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} onNodeClick={(_, node) => choose(node.id)} onInit={setFlow} nodesConnectable={false} fitView fitViewOptions={{padding:0.15}} minZoom={0.18} maxZoom={2} attributionPosition="bottom-right"><Background color="#30415b" gap={29} size={1} /><Controls showInteractive={false}/><MiniMap nodeColor={(n) => ({ project:'#78bfff', experiment:'#ae91fb', future:'#edba7d', technology:'#48d6bd', source:'#d3a4e8', decision:'#faaf8b', feature:'#6e96ee', deployment:'#5bccae' }[n.data?.item?.kind] || '#90b5d2')} maskColor="rgba(8,13,24,.64)" /></ReactFlow></div>
            <div className="relationship-graphfoot">노드 클릭 → 직접 관계 강조 · 노드 드래그 · 확대/축소 · 검색으로 위치 이동</div>
          </section>
          <aside className="relationship-detail" aria-label="선택한 노드 상세">
            <div className="relationship-caption">SELECTED NODE</div><span className={`relationship-kind kind-${selected.kind}`}>{NODE_KINDS[selected.kind]} · {selected.state}</span><h2>{selected.title}</h2><p>{selected.summary}</p>
            {selected.url && <a className="relationship-source-link" href={selected.url} target="_blank" rel="noreferrer">관련 공개 페이지 열기 ↗</a>}
            <div className="relationship-provenance">근거: {selected.provenance}<br/>상태는 실시간 조회 결과가 아님.</div>
            <div className="relationship-neighbors-heading"><strong>직접 연결된 항목</strong><span>{allRelations.length}개 관계</span></div>
            <div className="relationship-neighbors">{allRelations.length ? allRelations.map((link) => {const node = nodeIndex.get(link.neighborId); return <button key={link.id} onClick={() => choose(node.id, true)}><span className="relationship-linktype" style={{color:LINK_TYPES[link.type].color}}>● {LINK_TYPES[link.type].label}</span><strong>{node.title} ↗</strong><small>{link.reason}</small></button>;}) : <p>선택한 필터에 연결이 없어. 연결선 필터를 켜 봐.</p>}</div>
          </aside>
        </div>
        <section className="relationship-next"><strong>이 화면에서 확인할 것</strong><p>① 다중 연결이 관계 이해에 도움이 되는가? ② 하나의 노드를 선택했을 때 연결 이유가 충분한가? ③ 프로젝트에 속하지 않는 기술·결정·자료 노드도 자연스럽게 탐색할 수 있는가?</p><p>이 실험은 배치 알고리즘, 데이터베이스, 실제 전체 프로젝트 목록의 완성본이 아니야. 결과를 보고 노드 정의와 관계 규칙을 정하자.</p></section>
      </main>
    </div>
  );
}
