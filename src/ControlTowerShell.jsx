import { useState } from 'react';
import {
  Archive, Bot, ChevronRight, Database, FolderOpen, LockKeyhole,
  Monitor, Network, Newspaper, Smartphone,
} from 'lucide-react';
import App from './App.jsx';
import TodayDashboard from './TodayDashboard.jsx';
import { sectors } from './sectorNavigation.js';

const sectorIcons = { project: Network, ai: Bot, data: Database, brief: Newspaper, archive: Archive };
const initialMode = () => (
  typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches
    ? 'mobile'
    : 'desktop'
);

export default function ControlTowerShell() {
  const [activeSector, setActiveSector] = useState('project');
  const [activePage, setActivePage] = useState('home');
  const [previewMode, setPreviewMode] = useState(initialMode);
  const sector = sectors.find((item) => item.id === activeSector);
  const page = sector.pages.find((item) => item.id === activePage) ?? sector.pages[0];

  function chooseSector(nextSector) {
    setActiveSector(nextSector.id);
    setActivePage(nextSector.pages[0].id);
  }

  return (
    <div className="ct-shell">
      <div className="ct-stage-scroller">
        <div className={`ct-stage ct-preview-${previewMode}`}>
          <header className="ct-sector-bar">
            <div className="ct-sector-brand"><Network size={19} aria-hidden="true"/><span>CONTROL TOWER <small>PUBLIC UI EXPERIMENT</small></span></div>
            <nav className="ct-sector-tabs" aria-label="분야 선택">
              {sectors.map((item) => {
                const Icon = sectorIcons[item.id];
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`ct-sector-tab ${activeSector === item.id ? 'is-active' : ''}`}
                    aria-pressed={activeSector === item.id}
                    onClick={() => chooseSector(item)}
                  ><Icon size={15} aria-hidden="true"/><span>{item.label}</span></button>
                );
              })}
            </nav>
          </header>

          {activeSector === 'project' && activePage === 'home' && (
            <TodayDashboard onOpenMap={() => setActivePage('map')} />
          )}

          {/* Original project screens remain unchanged; only the initial landing view is new. */}
          {activeSector === 'project' && activePage !== 'home' && <div className="ct-project-surface"><App /></div>}

          {activeSector !== 'project' && (
            <div className="ct-secondary-layout">
              <aside className="ct-secondary-sidebar">
                <div className="ct-side-heading"><FolderOpen size={18} aria-hidden="true"/><strong>{sector.title}</strong></div>
                <div className="ct-menu-caption">{sector.label.toUpperCase()} / MENU</div>
                <nav aria-label={`${sector.title} 세부 메뉴`} className="ct-secondary-nav">
                  {sector.pages.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`ct-secondary-item ${page.id === item.id ? 'is-active' : ''}`}
                      aria-current={page.id === item.id ? 'page' : undefined}
                      onClick={() => setActivePage(item.id)}
                    ><span>{item.label}</span><ChevronRight size={15} aria-hidden="true"/></button>
                  ))}
                </nav>
                <div className="ct-private-notice"><LockKeyhole size={17} aria-hidden="true"/><span>비공개 원본·개인 일정은 이 공개 데모에 포함되지 않습니다.</span></div>
              </aside>
              <div className="ct-secondary-workspace">
                <div className="ct-secondary-crumb">OPEN SOURCE TEST <ChevronRight size={14} aria-hidden="true"/> {sector.label} <ChevronRight size={14} aria-hidden="true"/> <strong>{page.label}</strong></div>
                <main className="ct-placeholder" id="ct-main-content">
                  <div className="ct-placeholder-eyebrow">CONTROL TOWER / NAVIGATION V1</div>
                  <h1>{page.label}</h1>
                  <p>{page.description}</p>
                  <div className="ct-placeholder-card"><span className="ct-placeholder-pill">화면 구조만 준비됨</span><h2>{sector.title} · {page.label}</h2><p>현재 1차 작업은 분야 전환과 메뉴 탐색입니다. 실제 데이터 연동이나 새 기능을 완료한 것으로 표시하지 않습니다.</p><p className="ct-placeholder-lock"><LockKeyhole size={14} aria-hidden="true"/> 공개 가능한 예시 데이터만 추후 반영</p></div>
                </main>
                <footer className="ct-secondary-footer">OPEN SOURCE TEST · MENU PROTOTYPE · NO PERSONAL DATA</footer>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ct-preview-switch" role="group" aria-label="화면 미리보기 모드">
        <button type="button" aria-pressed={previewMode === 'desktop'} className={previewMode === 'desktop' ? 'is-active' : ''} onClick={() => setPreviewMode('desktop')}><Monitor size={16} aria-hidden="true"/>PC</button>
        <button type="button" aria-pressed={previewMode === 'mobile'} className={previewMode === 'mobile' ? 'is-active' : ''} onClick={() => setPreviewMode('mobile')}><Smartphone size={16} aria-hidden="true"/>모바일</button>
      </div>
    </div>
  );
}
