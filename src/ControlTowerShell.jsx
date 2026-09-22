import { useState } from 'react';
import {
  Archive, Bot, ChevronDown, ChevronRight, Database, LayoutDashboard,
  LockKeyhole, Menu, Monitor, Network, Newspaper, Smartphone, X,
} from 'lucide-react';
import App from './App.jsx';
import TodayDashboard from './TodayDashboard.jsx';
import DataReadiness from './DataReadiness.jsx';
import { sectors } from './sectorNavigation.js';

const sectorIcons = { project: Network, ai: Bot, data: Database, brief: Newspaper, archive: Archive };
const initialMode = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches ? 'mobile' : 'desktop';

export default function ControlTowerShell() {
  const [activeSector, setActiveSector] = useState('project');
  const [activePage, setActivePage] = useState('home');
  const [previewMode, setPreviewMode] = useState(initialMode);
  const [openSectors, setOpenSectors] = useState(['project']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Mount the legacy graph only after it is requested, then keep it mounted.
  // Hiding it on Home/other sectors must not erase graph positions or board checks.
  const [projectVisited, setProjectVisited] = useState(false);
  const sector = sectors.find((item) => item.id === activeSector);
  const page = sector.pages.find((item) => item.id === activePage) ?? sector.pages[0];
  const projectVisible = activeSector === 'project' && activePage !== 'home';

  function toggleSector(item) {
    setOpenSectors((current) => current.includes(item.id)
      ? current.filter((id) => id !== item.id)
      : [...current, item.id]);
  }

  function choosePage(nextSector, nextPage) {
    setActiveSector(nextSector.id);
    setActivePage(nextPage.id);
    if (nextSector.id === 'project' && nextPage.id !== 'home') setProjectVisited(true);
    setOpenSectors((current) => current.includes(nextSector.id) ? current : [...current, nextSector.id]);
    setMobileMenuOpen(false);
  }

  function goProject(view) {
    const projectSector = sectors.find((item) => item.id === 'project');
    const nextPage = projectSector.pages.find((item) => item.id === view);
    if (nextPage) choosePage(projectSector, nextPage);
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
                <button type="button" className="ct-mobile-menu-toggle" aria-label={mobileMenuOpen ? '메뉴 접기' : '메뉴 펼치기'} aria-expanded={mobileMenuOpen} aria-controls="ct-all-sectors" onClick={() => setMobileMenuOpen((open) => !open)}>
                  {mobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
                </button>
              </div>
              <nav id="ct-all-sectors" className={`ct-accordion ${mobileMenuOpen ? 'is-mobile-open' : ''}`} aria-label="Control Tower 분야 및 페이지">
                {sectors.map((item) => {
                  const Icon = sectorIcons[item.id];
                  const isOpen = openSectors.includes(item.id);
                  const isActive = activeSector === item.id;
                  return (
                    <section className={`ct-accordion-group ${isActive ? 'is-active' : ''}`} key={item.id}>
                      <button type="button" className="ct-accordion-trigger" aria-expanded={isOpen} aria-controls={`ct-pages-${item.id}`} onClick={() => toggleSector(item)}>
                        <Icon size={17} aria-hidden="true" /><span>{item.label}</span>
                        {isOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                      </button>
                      <div id={`ct-pages-${item.id}`} className="ct-accordion-pages" hidden={!isOpen}>
                        {item.pages.map((subpage) => (
                          <button type="button" key={subpage.id} className={`ct-accordion-page ${isActive && page.id === subpage.id ? 'is-active' : ''}`} aria-current={isActive && page.id === subpage.id ? 'page' : undefined} onClick={() => choosePage(item, subpage)}>
                            <span>{subpage.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </nav>
              <div className="ct-global-note"><LockKeyhole size={15} aria-hidden="true"/><span>공개 데모 · 개인 대화와 실제 일정은 연동하지 않습니다.</span></div>
            </aside>

            <div className="ct-global-content">
              {activeSector === 'project' && activePage === 'home' && (
                <TodayDashboard onOpenMap={() => goProject('map')} onTogglePreview={() => setPreviewMode((mode) => mode === 'mobile' ? 'desktop' : 'mobile')} previewMode={previewMode} />
              )}

              {projectVisited && (
                <div className={`ct-project-surface ${projectVisible ? '' : 'ct-workspace-hidden'}`} aria-hidden={!projectVisible}>
                  <App view={activeSector === 'project' && activePage !== 'home' ? activePage : 'map'} onNavigate={goProject} />
                </div>
              )}

              {activeSector === 'data' && <DataReadiness page={page} />}

              {activeSector !== 'project' && activeSector !== 'data' && (
                <div className="ct-secondary-layout ct-secondary-layout-no-sidebar">
                  <div className="ct-secondary-workspace">
                    <div className="ct-secondary-crumb">CONTROL TOWER <ChevronRight size={14} aria-hidden="true"/> {sector.label} <ChevronRight size={14} aria-hidden="true"/> <strong>{page.label}</strong></div>
                    <main className="ct-placeholder" id="ct-main-content">
                      <div className="ct-placeholder-eyebrow">PUBLIC UI PROTOTYPE</div>
                      <h1>{page.label}</h1><p>{page.description}</p>
                      <div className="ct-placeholder-card"><span className="ct-placeholder-pill">아직 구현 전</span><h2>{sector.title} · {page.label}</h2><p>이 페이지는 메뉴 구조만 구현됐습니다. 동작 기록이나 개인 정보가 연결된 것으로 표시하지 않습니다.</p><p className="ct-placeholder-lock"><LockKeyhole size={14} aria-hidden="true"/> 공개용 예시만 허용</p></div>
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
