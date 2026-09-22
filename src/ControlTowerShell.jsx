import { useState } from 'react';
import {
  Archive, Bot, ChevronDown, ChevronRight, Database, LayoutDashboard,
  LockKeyhole, Monitor, Network, Newspaper, Smartphone,
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
  const [openSectors, setOpenSectors] = useState(['project']);
  const sector = sectors.find((item) => item.id === activeSector);
  const page = sector.pages.find((item) => item.id === activePage) ?? sector.pages[0];

  function toggleSector(item) {
    setOpenSectors((current) => current.includes(item.id)
      ? current.filter((id) => id !== item.id)
      : [...current, item.id]);
  }

  function choosePage(nextSector, nextPage) {
    setActiveSector(nextSector.id);
    setActivePage(nextPage.id);
    if (!openSectors.includes(nextSector.id)) {
      setOpenSectors((current) => [...current, nextSector.id]);
    }
  }

  return (
    <div className="ct-shell">
      <div className="ct-stage-scroller">
        <div className={`ct-stage ct-preview-${previewMode}`}>
          <div className="ct-global-layout">
            <aside className="ct-global-sidebar">
              <div className="ct-global-brand">
                <span className="ct-global-brand-icon"><LayoutDashboard size={20} aria-hidden="true" /></span>
                <span><strong>CONTROL TOWER</strong><small>PUBLIC UI EXPERIMENT</small></span>
              </div>

              <nav className="ct-accordion" aria-label="Control Tower 분야 및 페이지">
                {sectors.map((item) => {
                  const Icon = sectorIcons[item.id];
                  const isOpen = openSectors.includes(item.id);
                  const isActive = activeSector === item.id;
                  return (
                    <section className={`ct-accordion-group ${isActive ? 'is-active' : ''}`} key={item.id}>
                      <button
                        type="button"
                        className="ct-accordion-trigger"
                        aria-expanded={isOpen}
                        onClick={() => toggleSector(item)}
                      >
                        <Icon size={17} aria-hidden="true" />
                        <span>{item.label}</span>
                        {isOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                      </button>
                      {isOpen && (
                        <div className="ct-accordion-pages">
                          {item.pages.map((subpage) => (
                            <button
                              type="button"
                              key={subpage.id}
                              className={`ct-accordion-page ${isActive && page.id === subpage.id ? 'is-active' : ''}`}
                              aria-current={isActive && page.id === subpage.id ? 'page' : undefined}
                              onClick={() => choosePage(item, subpage)}
                            >
                              <span>{subpage.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </nav>

              <div className="ct-global-note"><LockKeyhole size={15} aria-hidden="true"/><span>현재 공개 데모에는 실제 개인 데이터가 연결되지 않았습니다.</span></div>
            </aside>

            <div className="ct-global-content">
              {activeSector === 'project' && activePage === 'home' && (
                <TodayDashboard onOpenMap={() => setActivePage('map')} />
              )}

              {activeSector === 'project' && activePage !== 'home' && (
                <div className="ct-project-surface"><App key={activePage} initialView={activePage} /></div>
              )}

              {activeSector !== 'project' && (
                <div className="ct-secondary-layout ct-secondary-layout-no-sidebar">
                  <div className="ct-secondary-workspace">
                    <div className="ct-secondary-crumb">CONTROL TOWER <ChevronRight size={14} aria-hidden="true"/> {sector.label} <ChevronRight size={14} aria-hidden="true"/> <strong>{page.label}</strong></div>
                    <main className="ct-placeholder" id="ct-main-content">
                      <div className="ct-placeholder-eyebrow">CONTROL TOWER / NAVIGATION V1</div>
                      <h1>{page.label}</h1>
                      <p>{page.description}</p>
                      <div className="ct-placeholder-card"><span className="ct-placeholder-pill">화면 구조만 준비됨</span><h2>{sector.title} · {page.label}</h2><p>왼쪽 토글 메뉴에서 필요한 섹터와 세부 페이지를 펼쳐 이동할 수 있습니다.</p><p className="ct-placeholder-lock"><LockKeyhole size={14} aria-hidden="true"/> 공개 가능한 예시 데이터만 추후 반영</p></div>
                    </main>
                    <footer className="ct-secondary-footer">OPEN SOURCE TEST · MENU PROTOTYPE · NO PERSONAL DATA</footer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ct-preview-switch" role="group" aria-label="화면 미리보기 모드">
        <button type="button" aria-pressed={previewMode === 'desktop'} className={previewMode === 'desktop' ? 'is-active' : ''} onClick={() => setPreviewMode('desktop')}><Monitor size={16} aria-hidden="true"/>PC</button>
        <button type="button" aria-pressed={previewMode === 'mobile'} className={previewMode === 'mobile' ? 'is-active' : ''} onClick={() => setPreviewMode('mobile')}><Smartphone size={16} aria-hidden="true"/>모바일</button>
      </div>
    </div>
  );
}
