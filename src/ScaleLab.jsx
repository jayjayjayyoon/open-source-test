import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from '@xyflow/react';
import { AREAS, SCALE_SIZES, createScaleData, selectScaleGraph } from './scaleData.js';

const KINDS = { root: '전체', area: '분야', project: '프로젝트', task: '작업' };

function GraphNode({ data }) {
  return (
    <div className={`lab-node lab-${data.kind} ${data.active ? 'lab-active' : ''}`}>
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
  if (node.kind === 'project') return { x: 535, y: (node.project % 4) * 145 + 85 };
  const ordinal = Math.floor(Number(node.id.slice(5)) / 20);
  return { x: 820 + Math.floor(ordinal / 8) * 210, y: (ordinal % 8) * 77 + 25 };
}

const CHECKS = [
  '50개에서 전체 보기와 단계별 보기 비교',
  '200개에서 분야 → 프로젝트 → 작업 탐색',
  '1,000개에서 단계별 보기 조작',
  '1,000개 전체 보기의 가독성과 반응 확인 (선택)',
  '내게 편한 화면 구성을 결정하고 이유 기록',
];

export default function ScaleLab() {
  const [size, setSize] = useState(50);
  const [mode, setMode] = useState('hierarchy');
  const [area, setArea] = useState(null);
  const [project, setProject] = useState(null);
  const [picked, setPicked] = useState('root');
  const [done, setDone] = useState([]);
  const [memo, setMemo] = useState('');
  const dataset = useMemo(() => createScaleData(size), [size]);
  const shown = useMemo(() => selectScaleGraph(dataset, mode, area, project), [dataset, mode, area, project]);
  const selected = dataset.nodes.find((node) => node.id === picked) ?? dataset.nodes[0];
  const nodes = useMemo(() => shown.nodes.map((node) => ({
    id: node.id,
    type: 'lab',
    position: nodePosition(node, mode),
    data: { ...node, active: node.id === picked },
  })), [shown.nodes, mode, picked]);
  const edges = useMemo(() => shown.edges.map((edge) => ({
    ...edge,
    type: 'straight',
    style: { stroke: '#4e698a', strokeWidth: 1.3, opacity: 0.65 },
  })), [shown.edges]);
  const visiblePercent = Math.round(shown.nodes.length / size * 100);

  function chooseSize(value) {
    setSize(value);
    setMode('hierarchy');
    setArea(null);
    setProject(null);
    setPicked('root');
  }
  function chooseNode(node) {
    setPicked(node.id);
    if (node.kind === 'root') {
      setMode('hierarchy'); setArea(null); setProject(null);
    } else if (node.kind === 'area') {
      setMode('hierarchy'); setArea(node.area); setProject(null);
    } else if (node.kind === 'project') {
      setMode('hierarchy'); setArea(node.area); setProject(node.project);
    }
  }
  function overview() {
    setMode('hierarchy'); setArea(null); setProject(null); setPicked('root');
  }
  function full() {
    setMode('full'); setPicked('root');
  }
  function toggle(index) {
    setDone((previous) => previous.includes(index) ? previous.filter((id) => id !== index) : [...previous, index]);
  }
  return (
    <div className="lab-app">
      <header className="lab-header">
        <div><span className="lab-logo">◈</span><strong>Project Map Lab</strong><span className="lab-divider">/</span><span>Scale Experiment · V0.2</span></div>
        <a href="./">← 기존 11개 노드 데모</a>
      </header>
      <main className="lab-main">
        <div className="lab-title"><div><span className="lab-eyebrow">SYNTHETIC DATA · NO LIVE SYNC</span><h1>노드가 많아지면, 어떻게 보여줘야 할까?</h1><p>가상 데이터로 개수와 탐색 방식을 바꿔 보는 실험입니다. 개인 프로젝트 정보는 사용하지 않았습니다.</p></div><span className="lab-stamp">실험 화면</span></div>
        <section className="lab-controls" aria-label="그래프 실험 설정">
          <div className="lab-field"><span>① 데이터 규모</span><div className="lab-buttons">{SCALE_SIZES.map((value) => <button key={value} className={size === value ? 'chosen' : ''} onClick={() => chooseSize(value)}>{value.toLocaleString()}개</button>)}</div></div>
          <div className="lab-field"><span>② 표시 방식</span><div className="lab-buttons"><button className={mode === 'hierarchy' ? 'chosen' : ''} onClick={overview}>단계별 탐색</button><button className={mode === 'full' ? 'chosen danger' : ''} onClick={full}>전체 표시</button></div></div>
          <div className="lab-hint">{mode === 'full' ? '모든 노드를 렌더링합니다. 1,000개는 기기에 따라 느릴 수 있습니다. 단계별 탐색 버튼으로 되돌리세요.' : '분야를 누르고 → 프로젝트를 누르면 해당 작업만 펼쳐집니다.'}</div>
        </section>
        <section className="lab-stats" aria-label="현재 그래프 수치"><div><small>전체 데이터</small><strong>{size.toLocaleString()}</strong><span>가상 노드</span></div><div><small>화면 노드</small><strong>{shown.nodes.length.toLocaleString()}</strong><span>전체의 {visiblePercent}%</span></div><div><small>화면 연결선</small><strong>{shown.edges.length.toLocaleString()}</strong><span>가상 관계</span></div><div><small>현재 방식</small><strong className="lab-mode-name">{mode === 'full' ? '전체 표시' : '단계별 탐색'}</strong><span>{size === 1000 && mode === 'full' ? '부하 시험 중' : '실험 중'}</span></div></section>
        <div className="lab-content">
          <section className="lab-graph" aria-label="노드 규모 비교 그래프">
            <div className="lab-graph-top"><span>LIVE GRAPH PREVIEW</span><button onClick={overview}>전체 단계 접기 ↺</button></div>
            <div className="lab-flow"><ReactFlow
              key={`${size}-${mode}-${area}-${project}`}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => chooseNode(node.data)}
              nodesConnectable={false}
              nodesDraggable
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={0.035}
              maxZoom={2}
              onlyRenderVisibleElements={mode === 'full'}
              attributionPosition="bottom-right"
            ><Background color="#253751" gap={25} size={1}/><Controls showInteractive={false}/>{mode !== 'full' && <MiniMap pannable zoomable nodeColor={(node) => node.data?.kind === 'task' ? '#627f9e' : '#58a7ec'} maskColor="rgba(8,12,22,.7)"/>}</ReactFlow></div>
            <div className="lab-graph-bottom"><span>드래그 · 확대 · 축소 · 노드 클릭</span><span>전체 표시에서 글자가 작아지면 단계별 탐색과 비교하세요.</span></div>
          </section>
          <aside className="lab-side"><div className="lab-side-title">SELECTED NODE</div><div className="lab-selected"><span className="lab-kind">{KINDS[selected.kind]}</span><h2>{selected.title}</h2><span className="lab-status">{selected.status}</span></div><div className="lab-detail-row"><span>식별자</span><strong>{selected.id}</strong></div><div className="lab-detail-row"><span>상위 노드</span><strong>{selected.parentId ?? '없음'}</strong></div><div className="lab-detail-row"><span>데이터 종류</span><strong>가상 예시</strong></div><p className="lab-side-note">{selected.kind === 'root' ? '분야를 선택하면 네 개의 예시 프로젝트가 펼쳐집니다.' : selected.kind === 'area' ? '선택한 분야의 프로젝트 4개가 표시됩니다. 프로젝트를 한 번 더 눌러 보세요.' : selected.kind === 'project' ? '이 프로젝트에 연결된 작업만 펼쳐집니다.' : '이 항목은 성능 실험을 위해 자동 생성한 가상 작업입니다.'}</p><div className="lab-path"><strong>탐색 경로</strong><div>전체 {area === null ? '' : `→ ${AREAS[area]}`} {project === null ? '' : `→ 예시 프로젝트 ${project + 1}`}</div><button onClick={overview}>처음으로 돌아가기</button></div></aside>
        </div>
        <section className="lab-bottom"><div className="lab-checks"><h2>직접 비교 체크리스트 <span>{done.length}/{CHECKS.length}</span></h2>{CHECKS.map((item, index) => <label key={item}><input type="checkbox" checked={done.includes(index)} onChange={() => toggle(index)}/><span>{item}</span></label>)}</div><div className="lab-notes"><h2>어떤 구성이 편했어?</h2><p>테스트 후 느낀 점을 적어 봐. 이 메모와 체크 결과는 저장되지 않으며 새로고침하면 사라져.</p><textarea aria-label="실험 소감" placeholder="예: 200개부터는 전체 맵보다 분야별 탐색이 편했다..." value={memo} onChange={(event) => setMemo(event.target.value)}/><button onClick={() => navigator.clipboard?.writeText(`Scale Lab 기록\n데이터: ${size}개\n표시: ${mode}\n체크: ${done.length}/${CHECKS.length}\n의견: ${memo}`)}>결과 텍스트 복사</button></div></section>
        <p className="lab-footer">V0.2는 사용성 실험입니다. 성능 수치는 직접 측정해 보지 않았으며, 실제 프로젝트 저장·수정·동기화 기능은 없습니다. <a href="./">원래 데모로 돌아가기 →</a></p>
      </main>
    </div>
  );
}
