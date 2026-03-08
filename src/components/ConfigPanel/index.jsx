import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import GeneralInfoTab from './GeneralInfoTab';
import ModulesTab from './ModulesTab';
import ColorsTab from './ColorsTab';
import DetailsTab from './DetailsTab';

const TABS = ['Forma', 'Funkcja', 'Kolorystyka', 'Detale'];

const tabComponents = {
  Forma: GeneralInfoTab,
  Funkcja: ModulesTab,
  Kolorystyka: ColorsTab,
  Detale: DetailsTab
};

// ─── shared logic hook ────────────────────────────────────────────────────────
const useConfigPanel = (props) => {
  const [activeTab, setActiveTab]     = useState('Forma');
  const [visitedTabs, setVisitedTabs] = useState(new Set(['Forma']));
  const [ctaStatus, setCtaStatus]     = useState('idle');

  const allTabsVisited = TABS.every(t => visitedTabs.has(t));
  const progress       = (visitedTabs.size / TABS.length) * 100;
  const activeTabIndex = TABS.indexOf(activeTab);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setVisitedTabs(prev => new Set([...prev, tabName]));
  };

  const getTabStatus = (tabName) => {
    switch (tabName) {
      case 'Forma':
        if (props.width < 800 || props.height < 2000 || props.depth < 350) return 'warning';
        if (props.baseModuleHeight && props.height < props.baseModuleHeight) return 'error';
        break;
      case 'Funkcja':
        if (!props.isValid) return 'error';
        break;
      default: break;
    }
    return 'ok';
  };

  const inquiryText = useMemo(() => {
    const cm = (v) => (typeof v === 'number' ? `${Math.round(v / 10)} cm` : '-');
    const modulesText = (props.modules || [])
      .map((m, i) => {
        const w     = m?.width ? cm(m.width) : '-';
        const id    = m?.id || '-';
        const hinge = m?.hinge ? (m.hinge === 'right' ? 'Prawy' : 'Lewy') : '-';
        return `- Moduł ${i + 1}: ${w}, typ: ${id}, zawias: ${hinge}`;
      }).join('\n');

    return [
      `ZAPYTANIE – Konfigurator szaf`, ``,
      `Wymiary: ${cm(props.width)} × ${cm(props.height)} × ${cm(props.depth)}`,
      `Liczba modułów: ${props.numModules ?? '-'}`,
      `Układ szerokości: ${props.distribution ?? '-'}`,
      `Podstawa: ${cm(props.baseModuleHeight)}`,
      `Blenda: ${props.blenda ?? '-'}`,
      `Uchwyt: ${props.handleType ?? '-'}`, ``,
      `Moduły:`, modulesText || '- brak', ``,
      `Kolory:`,
      `- zewnętrzny: ${props.exteriorColor ?? '-'}`,
      `- wewnętrzny: ${props.interiorColor ?? '-'}`, ``,
      `LED: ${props.ledEnabled ? 'TAK' : 'NIE'}`,
      `Referencja uchwytu: ${props.handleReference || '-'}`,
      `Uwagi: ${props.orderNotes || '-'}`, ``,
      `Walidacja: ${props.isValid ? 'OK' : 'WYMAGA SPRAWDZENIA'}`
    ].join('\n');
  }, [
    props.width, props.height, props.depth, props.numModules, props.distribution,
    props.baseModuleHeight, props.blenda, props.handleType, props.modules,
    props.exteriorColor, props.interiorColor, props.ledEnabled,
    props.handleReference, props.orderNotes, props.isValid
  ]);

  const handleSendInquiry = async () => {
    if (!allTabsVisited) return;
    try {
      await navigator.clipboard.writeText(inquiryText);
      setCtaStatus('copied');
      setTimeout(() => setCtaStatus('idle'), 1800);
    } catch {
      setCtaStatus('error');
      setTimeout(() => setCtaStatus('idle'), 2200);
    }
  };

  return {
    activeTab, visitedTabs, ctaStatus, allTabsVisited,
    progress, activeTabIndex, handleTabClick, getTabStatus, handleSendInquiry
  };
};

// ─── DESKTOP layout (unchanged) ──────────────────────────────────────────────
const DesktopPanel = ({ props, state }) => {
  const {
    activeTab, visitedTabs, ctaStatus, allTabsVisited,
    progress, activeTabIndex, handleTabClick, getTabStatus, handleSendInquiry
  } = state;

  const CurrentTabComponent = tabComponents[activeTab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#F7F5F2',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        {/* progress */}
        <div style={{ height: 3, background: '#EAE4DC' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(to right, #E17C4F, #D4A373)',
            transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0'
          }} />
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 4px', gap: 4 }}>
          {TABS.map((tab, i) => {
            const visited  = visitedTabs.has(tab);
            const isActive = activeTab === tab;
            const status   = getTabStatus(tab);
            return (
              <button key={tab} onClick={() => handleTabClick(tab)} style={{
                flex: 1, padding: '6px 4px', borderRadius: 10,
                border: isActive ? '2px solid #E17C4F' : `1.5px solid ${visited ? '#C8BDB4' : '#E0D9D2'}`,
                background: isActive ? '#FFF5F0' : visited ? '#FAFAF9' : '#F5F3F0',
                cursor: 'pointer', position: 'relative', transition: 'all 0.15s'
              }}>
                <div style={{
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#E17C4F' : visited ? '#555' : '#AAA', lineHeight: 1.2
                }}>{tab}</div>
                {visited && !isActive && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 13, height: 13, borderRadius: '50%',
                    background: status === 'error' ? '#dc3545' : status === 'warning' ? '#ffc107' : '#4CAF50',
                    fontSize: 8, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}>
                    {status === 'error' ? '!' : status === 'warning' ? '?' : '✓'}
                  </div>
                )}
                {isActive && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 13, height: 13, borderRadius: '50%',
                    background: '#E17C4F', fontSize: 8, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}>{i + 1}</div>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'Detale' && allTabsVisited ? (
          <div style={{ padding: '6px 12px 10px' }}>
            <button onClick={handleSendInquiry} style={{
              width: '100%', padding: '11px 14px', borderRadius: 14, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff',
              background: 'linear-gradient(135deg, #E17C4F 0%, #D4A373 100%)',
              boxShadow: '0 6px 18px rgba(225,124,79,0.30)', transition: 'transform 0.15s ease'
            }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {ctaStatus === 'copied' ? '✅ Skopiowano — wyślij na WhatsApp lub e-mail' :
               ctaStatus === 'error'  ? 'Błąd — spróbuj ponownie' : '🔍 Sprawdź cenę'}
            </button>
            <div style={{ marginTop: 6, fontSize: 11, color: '#888', textAlign: 'center' }}>
              {Math.round(props.width / 10)} × {Math.round(props.height / 10)} × {Math.round(props.depth / 10)} cm
              &nbsp;·&nbsp; {props.numModules} moduły
              &nbsp;·&nbsp; {props.isValid
                ? <span style={{ color: '#4CAF50' }}>✓ gotowe</span>
                : <span style={{ color: '#dc3545' }}>⚠ sprawdź</span>}
            </div>
          </div>
        ) : activeTabIndex < TABS.length - 1 ? (
          <div style={{ padding: '2px 12px 8px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => handleTabClick(TABS[activeTabIndex + 1])} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none',
              background: '#E17C4F', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}>Dalej →</button>
          </div>
        ) : (
          <div style={{ padding: '2px 12px 8px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSendInquiry} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none',
              background: '#E17C4F', color: '#fff', fontSize: 11,
              fontWeight: 700, cursor: 'pointer', opacity: allTabsVisited ? 1 : 0.5
            }}>🔍 Sprawdź cenę</button>
          </div>
        )}
      </div>

      <div className="tab-content" style={{ flex: 1 }}>
        <CurrentTabComponent {...props} />
      </div>

      <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{
          padding: '4px 8px', borderRadius: 12, fontSize: 11,
          backgroundColor: props.isValid ? '#d4edda' : '#f8d7da',
          color: props.isValid ? '#155724' : '#721c24'
        }}>
          {props.isValid ? '✓ Konfiguracja OK' : '⚠ Sprawdź ustawienia'}
        </div>
        {props.modules?.some(m => String(m?.id || '').includes('mod')) && (
          <div style={{ padding: '4px 8px', borderRadius: 12, fontSize: 11, backgroundColor: '#eef2ff', color: '#3730a3' }}>
            🧩 Moduły skonfigurowane
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MOBILE bottom sheet ──────────────────────────────────────────────────────
const MobileBottomSheet = ({ props, state, onMobileViewRequest }) => {
  const {
    activeTab, visitedTabs, ctaStatus, allTabsVisited,
    progress, activeTabIndex, handleTabClick, getTabStatus, handleSendInquiry
  } = state;

  const [sheetState, setSheetState] = useState('peek');
  const [dragH, setDragH]           = useState(null); // live drag px height, null = snap mode
  const startY   = useRef(null);
  const startH   = useRef(null);
  const sheetRef = useRef(null);

  const CurrentTabComponent = tabComponents[activeTab];

  const resolvedH = (s) => {
    if (s === 'peek') return 100;
    const vh = window.innerHeight;
    return s === 'half' ? Math.round(vh * 0.55) : Math.round(vh * 0.92);
  };

  const cycleUp   = () => setSheetState(s => s === 'peek' ? 'half' : 'full');
  const cycleDown = () => setSheetState(s => s === 'full' ? 'half' : 'peek');

  // ── live drag ────────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startH.current = sheetRef.current?.offsetHeight ?? resolvedH(sheetState);
  }, [sheetState]);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    e.preventDefault(); // blokuje scroll strony podczas ciągnięcia
    const delta = startY.current - e.touches[0].clientY;
    const newH  = Math.max(60, Math.min(window.innerHeight * 0.97, startH.current + delta));
    setDragH(newH);
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startY.current === null) return;
    const delta = startY.current - e.changedTouches[0].clientY;
    const vh    = window.innerHeight;
    const curH  = dragH ?? startH.current ?? resolvedH(sheetState);

    // snap do najbliższego stanu
    let next;
    if      (curH < vh * 0.30) next = 'peek';
    else if (curH < vh * 0.74) next = 'half';
    else                       next = 'full';

    // flick (szybkie > 60px) override — kierunek ważniejszy niż pozycja
    if      (delta >  60) next = sheetState === 'peek' ? 'half' : 'full';
    else if (delta < -60) next = sheetState === 'full' ? 'half' : 'peek';

    setSheetState(next);
    setDragH(null);
    startY.current = null;
  }, [dragH, sheetState]);

  // ── tab click ─────────────────────────────────────────────────────────────────
  const onTabClick = (tab) => {
    handleTabClick(tab);
    if (sheetState === 'peek') setSheetState('half');
    // reset kamery gdy user wchodzi do zakładki z modułami
    if (tab === 'Funkcja' && onMobileViewRequest) onMobileViewRequest();
  };

  // ── dynamiczna wysokość ───────────────────────────────────────────────────────
  const sheetHeight     = dragH !== null ? `${dragH}px`
    : sheetState === 'peek' ? '100px'
    : sheetState === 'half' ? '55vh' : '92vh';
  const sheetTransition = dragH !== null ? 'none' : 'height 0.38s cubic-bezier(0.32,0.72,0,1)';

  return (
    <>
      {/* dim backdrop when full */}
      <div
        onClick={() => sheetState === 'full' && setSheetState('half')}
        style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(0,0,0,0.25)',
          opacity: sheetState === 'full' ? 1 : 0,
          pointerEvents: sheetState === 'full' ? 'auto' : 'none',
          transition: 'opacity 0.3s'
        }}
      />

      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: sheetHeight,
          background: '#FDFCFB',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.13)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transition: sheetTransition,
          overflow: 'hidden',
        }}
      >
        {/* drag handle — obsługuje cały touch gestur */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={sheetState === 'peek' ? cycleUp : undefined}
          style={{
            padding: '10px 0 2px', display: 'flex',
            justifyContent: 'center', flexShrink: 0, cursor: 'grab',
            touchAction: 'none', // niezbędne żeby onTouchMove działało bez scrollowania
          }}
        >
          <div style={{ width: 36, height: 4, background: '#D0C8C0', borderRadius: 2 }} />
        </div>

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 16px 6px', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2D2D2D' }}>
              {sheetState === 'peek'
                ? 'Konfiguruj szafę'
                : `${activeTab} — krok ${TABS.indexOf(activeTab) + 1} / ${TABS.length}`}
            </div>
            {sheetState === 'peek' && (
              <div style={{ fontSize: 11, color: '#AAA', marginTop: 1 }}>
                Przesuń w górę aby zacząć
              </div>
            )}
          </div>
          <button
            onClick={sheetState === 'peek' ? cycleUp : cycleDown}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#F0EDE8', border: 'none', cursor: 'pointer',
              fontSize: 14, color: '#666',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >{sheetState === 'peek' ? '↑' : '↓'}</button>
        </div>

        {/* progress bar */}
        {sheetState !== 'peek' && (
          <div style={{ height: 3, background: '#EAE4DC', flexShrink: 0, margin: '0 16px 0' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(to right, #E17C4F, #D4A373)',
              transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0'
            }} />
          </div>
        )}

        {/* tab pills */}
        {sheetState !== 'peek' && (
          <div style={{
            display: 'flex', gap: 6,
            padding: '8px 16px 4px',
            overflowX: 'auto', flexShrink: 0,
            WebkitOverflowScrolling: 'touch',
          }}>
            {TABS.map((tab) => {
              const visited  = visitedTabs.has(tab);
              const isActive = activeTab === tab;
              const status   = getTabStatus(tab);
              return (
                <button key={tab} onClick={() => onTabClick(tab)} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  flexShrink: 0, position: 'relative', transition: 'all 0.15s',
                  background: isActive ? '#E17C4F' : visited ? '#F0EDE8' : '#F7F5F2',
                  color: isActive ? '#fff' : visited ? '#555' : '#BBB'
                }}>
                  {tab}
                  {visited && !isActive && (
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 13, height: 13, borderRadius: '50%',
                      background: status === 'error' ? '#dc3545' : status === 'warning' ? '#ffc107' : '#4CAF50',
                      fontSize: 8, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                    }}>
                      {status === 'error' ? '!' : status === 'warning' ? '?' : '✓'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* scrollable tab content */}
        {sheetState !== 'peek' && (
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <CurrentTabComponent {...props} />
          </div>
        )}

        {/* sticky bottom bar — Dalej / CTA */}
        {sheetState !== 'peek' && (
          <div style={{
            padding: '8px 16px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            flexShrink: 0,
            borderTop: '1px solid #EAE4DC',
            background: '#FDFCFB'
          }}>
            {activeTab === 'Detale' && allTabsVisited ? (
              <>
                <button onClick={handleSendInquiry} style={{
                  width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                  cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#fff',
                  background: 'linear-gradient(135deg, #E17C4F 0%, #D4A373 100%)',
                  boxShadow: '0 6px 18px rgba(225,124,79,0.30)'
                }}>
                  {ctaStatus === 'copied' ? '✅ Skopiowano — wyślij na WhatsApp lub e-mail' :
                   ctaStatus === 'error'  ? 'Błąd — spróbuj ponownie' : '🔍 Sprawdź cenę'}
                </button>
                <div style={{ marginTop: 6, fontSize: 11, color: '#888', textAlign: 'center' }}>
                  {Math.round(props.width / 10)} × {Math.round(props.height / 10)} × {Math.round(props.depth / 10)} cm
                  &nbsp;·&nbsp;
                  {props.isValid
                    ? <span style={{ color: '#4CAF50' }}>✓ gotowe</span>
                    : <span style={{ color: '#dc3545' }}>⚠ sprawdź</span>}
                </div>
              </>
            ) : activeTabIndex < TABS.length - 1 ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { handleTabClick(TABS[activeTabIndex + 1]); if (sheetState === 'peek') setSheetState('half'); }}
                  style={{
                    padding: '9px 24px', borderRadius: 20, border: 'none',
                    background: '#E17C4F', color: '#fff', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >Dalej →</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSendInquiry} style={{
                  padding: '9px 24px', borderRadius: 20, border: 'none',
                  background: '#E17C4F', color: '#fff', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', opacity: allTabsVisited ? 1 : 0.5
                }}>🔍 Sprawdź cenę</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── ROOT — wybiera desktop / mobile ─────────────────────────────────────────
const ConfigPanel = (props) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const state = useConfigPanel(props);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile
    ? <MobileBottomSheet props={props} state={state} onMobileViewRequest={props.onMobileViewRequest} />
    : <DesktopPanel props={props} state={state} />;
};

export default ConfigPanel;