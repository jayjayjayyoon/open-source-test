import { ChevronRight, Database, LockKeyhole, ShieldCheck } from 'lucide-react';
import { PUBLIC_DATA_STATUS, REQUIRED_FIELDS } from './publicDataContract.js';

const pageDetails = {
  intake: { heading: '대화 수집', body: 'ChatGPT 대화 자동 수집은 아직 연결되지 않았습니다. 새 내보내기 ZIP은 비공개 환경에서만 처리할 계획이며, 이 공개 사이트에는 업로드하지 않습니다.' },
  processing: { heading: '전처리', body: '원본 → 객체 분류 → 근거 확인 → 상태·관계 검증 순서로 처리합니다. 공개 가능한 데이터가 아직 없으므로 실제 처리 건수를 표시하지 않습니다.' },
  missing: { heading: '누락·충돌', body: '누락 여부를 확정하려면 원본 확보 범위부터 검증해야 합니다. 비공개 자료의 개수나 대화 제목을 공개 화면에 표시하지 않습니다.' },
  sources: { heading: '원본 보관', body: '개인 대화 전문과 첨부파일은 공개 저장소에 저장하지 않습니다. 별도의 비공개 보관소가 준비되기 전에는 원본을 가져오지 않습니다.' },
};

export default function DataReadiness({ page }) {
  const detail = pageDetails[page.id] ?? pageDetails.intake;
  return (
    <div className="ct-data-workspace">
      <div className="ct-secondary-crumb">CONTROL TOWER <ChevronRight size={14} aria-hidden="true"/> Data <ChevronRight size={14} aria-hidden="true"/> <strong>{detail.heading}</strong></div>
      <main className="ct-data-main">
        <span className="ct-data-eyebrow"><Database size={16} aria-hidden="true"/> 데이터 준비 현황 · 공개용</span>
        <h1>{detail.heading}</h1><p>{detail.body}</p>
        <section className="ct-data-panel" aria-labelledby="ct-data-connection"><h2 id="ct-data-connection">현재 연결 상태</h2>
          <dl><div><dt>대화 원본</dt><dd>미연결</dd></div><div><dt>비공개 저장소</dt><dd>미구성</dd></div><div><dt>실시간 동기화</dt><dd>{PUBLIC_DATA_STATUS.liveSync ? '연결' : 'OFF'}</dd></div><div><dt>공개 승인 데이터</dt><dd>등록 없음</dd></div></dl>
        </section>
        <section className="ct-data-panel" aria-labelledby="ct-data-schema"><h2 id="ct-data-schema">구조화 데이터의 최소 기준</h2><p>다음 필드에 근거가 있어야 기록을 만들 수 있습니다. 형식이 맞더라도 공개 승인이 없으면 사이트에 표시하지 않습니다.</p>
          <div className="ct-data-fields">{REQUIRED_FIELDS.map(({ key, description }) => <div key={key}><code>{key}</code><span>{description}</span></div>)}</div>
        </section>
        <div className="ct-data-warning"><LockKeyhole size={17} aria-hidden="true"/><span>이 화면은 실제 개인 데이터 현황이 아닙니다. 공개 승인, 공개 출처 및 검증을 모두 통과한 정보만 추후 게시합니다.</span></div>
        <p className="ct-data-policy"><ShieldCheck size={15} aria-hidden="true"/> 공개 UI 실험과 비공개 대화 처리 환경은 계속 분리합니다.</p>
      </main>
    </div>
  );
}
