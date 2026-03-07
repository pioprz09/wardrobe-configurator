import React, { useRef, useState } from 'react';
import ModuleThumbnail from '../UI/ModuleThumbnail';
import { MODULE_TYPES, MODULE_CATEGORIES, REGAL_IDS, BENCH_IDS, MODULE_WIDTH_MIN, MODULE_WIDTH_MAX } from '../../data/moduleTypes';
import { WARDROBE_CONSTANTS } from '../../data/constants';

const ModulesTab = ({
  modules,
  activeModuleIndex,
  onModuleClick,
  onModuleTypeChange,
  onHingeChange,
  numModules,
  setNumModules,
  moduleCountRange,
  widthMode,
  setWidthMode,
  onSetAllEqual,
  onHalfWidthToggle,
  blendaCollisionLeft,
  blendaCollisionRight,
}) => {
  const carouselRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const activeModule = activeModuleIndex != null ? modules[activeModuleIndex] : null;
  const activeModuleType = modules[activeModuleIndex]?.id;

  const isRegalActive = !!activeModule && REGAL_IDS.includes(activeModule.id);
  const isBenchActive = !!activeModule && BENCH_IDS.includes(activeModule.id);

  const isSingleDoorActive =
    !!activeModule && !isRegalActive && !isBenchActive &&
    activeModule.width <= WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD;

  const singleDoorModuleIndexes = (modules || [])
    .map((m, i) => {
      if (!m || REGAL_IDS.includes(m.id) || BENCH_IDS.includes(m.id)) return null;
      return m.width <= WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD ? i : null;
    })
    .filter((i) => i !== null);

  const widthViolations = (modules || []).filter(
    (m) => m?.width > 0 && (m.width < MODULE_WIDTH_MIN || m.width > MODULE_WIDTH_MAX)
  );

  const hasEdgeViolation = (modules || []).some((m, i) => {
    const t = MODULE_TYPES.find((t) => t.id === m?.id);
    if (!t?.edgeOnly) return false;
    if (t.edgeOnly === 'left' && i !== 0) return true;
    if (t.edgeOnly === 'right' && i !== modules.length - 1) return true;
    return false;
  });

  const handleSelectModuleType = (typeId) => {
    if (activeModuleIndex == null) return;
    onModuleTypeChange(activeModuleIndex, typeId);
  };

  const scroll = (dir) =>
    carouselRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });

  const handleWheel = (e) => {
    e.preventDefault();
    if (carouselRef.current) carouselRef.current.scrollLeft += e.deltaY;
  };

  const hingeSideFor = (m) => (m?.hinge === 'right' ? 'right' : 'left');
  const hingeLabel = (s) => (s === 'left' ? 'Lewy' : 'Prawy');

  return (
    <div>

      {/* ── LICZBA MODUŁÓW ──────────────────────────────────────────────── */}
      <h3>Liczba modułów</h3>
      <div className="config-group" style={{ marginBottom: '16px' }}>
        <input
          type="range"
          value={numModules}
          onChange={(e) => setNumModules(Number(e.target.value))}
          min={moduleCountRange.min}
          max={moduleCountRange.max}
          step="1"
          style={{
            background: `linear-gradient(to right, #E17C4F ${
              ((numModules - moduleCountRange.min) / (moduleCountRange.max - moduleCountRange.min)) * 100
            }%, #EAE4DC ${
              ((numModules - moduleCountRange.min) / (moduleCountRange.max - moduleCountRange.min)) * 100
            }%)`
          }}
        />
        <small>
          Liczba modułów: <strong>{numModules}</strong> &nbsp;·&nbsp; zakres: {moduleCountRange.min}–{moduleCountRange.max}
        </small>
      </div>

      {/* ── TRYB SZEROKOŚCI ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={onSetAllEqual}
          style={{
            padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
            border: `1px solid ${widthMode === 'equal' ? '#556B58' : '#ccc'}`,
            background: widthMode === 'equal' ? '#f0f4f0' : '#fff',
            fontWeight: widthMode === 'equal' ? 700 : 400,
            color: widthMode === 'equal' ? '#2d4a30' : '#555'
          }}
        >
          ▤ Wszystkie moduły równej szerokości
        </button>
        <button
          onClick={() => setWidthMode('custom')}
          style={{
            padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
            border: `1px solid ${widthMode === 'custom' ? '#556B58' : '#ccc'}`,
            background: widthMode === 'custom' ? '#f0f4f0' : '#fff',
            fontWeight: widthMode === 'custom' ? 700 : 400,
            color: widthMode === 'custom' ? '#2d4a30' : '#555'
          }}
        >
          ◧ Dostosuj szerokości
        </button>
      </div>

      {widthMode === 'custom' && (
        <div style={{
          padding: '10px 12px', background: '#f8f8f4', borderRadius: '10px',
          border: '1px solid #DDD8CE', fontSize: '12px', color: '#666', marginBottom: '14px'
        }}>
          Każdy moduł może mieć pełną (<strong>1</strong>) lub połowę (<strong>½</strong>) szerokości.
          Wszystkie „pełne" moduły mają tę samą szerokość W, a „połówkowe" — W/2.
        </div>
      )}

      {/* ── SELEKTOR MODUŁÓW ─────────────────────────────────────────────── */}
      <h3>Wybierz moduł do edycji</h3>
      <div className="module-selector">
        {modules.map((module, index) => {
          const isRegal = REGAL_IDS.includes(module.id);
          const isBench = BENCH_IDS.includes(module.id);
          const isSingleDoor =
            !isRegal && !isBench && module.width <= WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD;
          const hinge = hingeSideFor(module);
          const isActive = activeModuleIndex === index;
          const isHalf = widthMode === 'custom' && module.halfWidth;
          const isWidthInvalid =
            module.width > 0 && (module.width < MODULE_WIDTH_MIN || module.width > MODULE_WIDTH_MAX);

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => onModuleClick(index)}
                className={isActive ? 'active' : ''}
                style={{
                  ...(isSingleDoor && !isActive ? { backgroundColor: '#fff7e6', borderColor: '#D4A373' } : {}),
                  ...(isRegal ? { backgroundColor: isActive ? '#e8f0e8' : '#f0f6f0', borderColor: '#556B58' } : {}),
                  ...(isBench ? { backgroundColor: isActive ? '#e8f4ff' : '#f4f9ff', borderColor: '#5588aa' } : {}),
                  ...(isWidthInvalid ? { borderColor: '#dc3545' } : {}),
                  position: 'relative'
                }}
                title={`Moduł ${index + 1} — ${Math.round(module.width / 10)}cm${isHalf ? ' (½)' : ''}`}
              >
                <div>
                  Moduł {index + 1}
                  <br />
                  <small style={{ fontSize: '10px', opacity: 0.8 }}>
                    {Math.round(module.width / 10)}cm{isHalf ? ' ½' : ''}
                  </small>
                </div>
                {isSingleDoor && (
                  <div style={{
                    position: 'absolute', top: '4px', right: '4px', fontSize: '9px',
                    padding: '1px 4px', borderRadius: '999px',
                    background: 'rgba(225,124,79,0.12)', border: '1px solid rgba(225,124,79,0.3)',
                    color: '#7a3d24'
                  }}>
                    🚪{hinge === 'left' ? 'L' : 'P'}
                  </div>
                )}
                {isRegal && (
                  <div style={{
                    position: 'absolute', top: '4px', right: '4px', fontSize: '9px',
                    padding: '1px 4px', borderRadius: '999px',
                    background: 'rgba(85,107,88,0.12)', border: '1px solid rgba(85,107,88,0.3)',
                    color: '#2d4a30'
                  }}>📚</div>
                )}
                {isWidthInvalid && (
                  <div style={{
                    position: 'absolute', bottom: '4px', right: '4px',
                    fontSize: '10px', color: '#dc3545', fontWeight: 700
                  }}>⚠</div>
                )}
              </button>

              {/* Toggle ½ w trybie custom */}
              {widthMode === 'custom' && (
                <button
                  onClick={() => onHalfWidthToggle(index)}
                  style={{
                    fontSize: '11px', padding: '3px 0', borderRadius: '6px', cursor: 'pointer',
                    border: `1px solid ${module.halfWidth ? '#556B58' : '#ddd'}`,
                    background: module.halfWidth ? '#e8f0e8' : '#fafafa',
                    color: module.halfWidth ? '#2d4a30' : '#999',
                    fontWeight: module.halfWidth ? 700 : 400,
                    lineHeight: 1
                  }}
                  title={module.halfWidth ? 'Kliknij → pełna szerokość' : 'Kliknij → połowa szerokości'}
                >
                  {module.halfWidth ? '½ szer.' : '1 szer.'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── OSTRZEŻENIA ──────────────────────────────────────────────────── */}

      {(blendaCollisionLeft || blendaCollisionRight) && (
        <div style={{
          margin: '10px 0', padding: '10px 14px', background: '#fff8e1',
          borderRadius: '10px', border: '1px solid #ffcc02', fontSize: '12px', color: '#7a5c00'
        }}>
          ⚠️{' '}
          {blendaCollisionLeft && blendaCollisionRight
            ? 'Blendy boczne zostały usunięte — kolidują z modułami Przedpokój L i P.'
            : blendaCollisionLeft
            ? 'Blenda lewa została usunięta — koliduje z modułem Przedpokój L.'
            : 'Blenda prawa została usunięta — koliduje z modułem Przedpokój P.'}
        </div>
      )}

      {widthViolations.length > 0 && (
        <div style={{
          margin: '10px 0', padding: '10px 14px', background: '#fdecec',
          borderRadius: '10px', border: '1px solid #f5c6c6', fontSize: '12px', color: '#721c24'
        }}>
          ⚠️ Szerokość modułu powinna wynosić <strong>{MODULE_WIDTH_MIN}–{MODULE_WIDTH_MAX}mm</strong>.
          Zmień wymiary szafy lub liczbę modułów.
        </div>
      )}

      {hasEdgeViolation && (
        <div style={{
          margin: '10px 0', padding: '10px 14px', background: '#fdecec',
          borderRadius: '10px', border: '1px solid #f5c6c6', fontSize: '12px', color: '#721c24'
        }}>
          ⚠️ <strong>Przedpokój L</strong> musi być pierwszym modułem,{' '}
          <strong>Przedpokój P</strong> — ostatnim.
        </div>
      )}

      {/* ── KIERUNEK DRZWI ───────────────────────────────────────────────── */}
      {singleDoorModuleIndexes.length > 0 && (
        <div style={{ marginTop: '16px', marginBottom: '18px' }}>
          <h3>Kierunek otwierania drzwi</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {singleDoorModuleIndexes.map((i) => {
              const hinge = hingeSideFor(modules[i]);
              const isActive = activeModuleIndex === i;
              return (
                <button key={i} onClick={() => onModuleClick(i)} style={{
                  border: '1px solid #EAE4DC', borderRadius: '999px', padding: '6px 10px',
                  fontSize: '12px', cursor: 'pointer',
                  background: isActive ? '#fff3cd' : '#fff',
                  boxShadow: isActive ? '0 2px 8px rgba(212,163,115,0.25)' : 'none'
                }}>
                  Moduł {i + 1}: 🚪 {hingeLabel(hinge)}
                </button>
              );
            })}
          </div>

          {isSingleDoorActive && activeModuleIndex != null && activeModule && (
            <div style={{
              padding: '12px', backgroundColor: '#fff3cd',
              borderRadius: '10px', border: '1px solid #ffeeba'
            }}>
              <div style={{ fontSize: '12px', color: '#856404', marginBottom: '10px' }}>
                🚪 Moduł {activeModuleIndex + 1} — szerokość: {Math.round(activeModule.width / 10)}cm.
              </div>
              <div className="config-group radio-group" style={{ marginBottom: 0 }}>
                <label>
                  <input type="radio" name={`hinge-${activeModuleIndex}`} value="left"
                    checked={hingeSideFor(activeModule) === 'left'}
                    onChange={() => onHingeChange(activeModuleIndex, 'left')} />
                  Zawiasy po lewej
                </label>
                <label>
                  <input type="radio" name={`hinge-${activeModuleIndex}`} value="right"
                    checked={hingeSideFor(activeModule) === 'right'}
                    onChange={() => onHingeChange(activeModuleIndex, 'right')} />
                  Zawiasy po prawej
                </label>
              </div>
            </div>
          )}
          <small style={{ color: '#777' }}>
            Dotyczy modułów do {Math.round(WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD / 10)}cm.
          </small>
        </div>
      )}

      <hr />

      {/* ── WYBÓR FUNKCJI ────────────────────────────────────────────────── */}
      <h3>Wybierz funkcję modułu</h3>

      {/* Filtry kategorii */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {MODULE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); carouselRef.current && (carouselRef.current.scrollLeft = 0); }}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1.5px solid ${activeCategory === cat.id ? '#556B58' : '#D0C8BF'}`,
              background: activeCategory === cat.id ? '#556B58' : '#fff',
              color: activeCategory === cat.id ? '#fff' : '#555',
              fontWeight: activeCategory === cat.id ? 700 : 400,
              transition: 'all 0.15s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="carousel-container">
        <div className="carousel-arrow left" onClick={() => scroll(-1)} role="button" tabIndex={0}>❮</div>
        <div className="module-carousel" ref={carouselRef} onWheel={handleWheel}>
          {MODULE_TYPES
            .filter(type => activeCategory === 'all' || type.category === activeCategory)
            .map((type) => (
              <ModuleThumbnail key={type.id} type={type}
                isActive={activeModuleType === type.id}
                onClick={handleSelectModuleType}
              />
            ))}
        </div>
        <div className="carousel-arrow right" onClick={() => scroll(1)} role="button" tabIndex={0}>❯</div>
      </div>

      {activeModuleType && (() => {
        const t = MODULE_TYPES.find((t) => t.id === activeModuleType);
        if (!t) return null;
        return (
          <div style={{
            marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa',
            borderRadius: '8px', borderLeft: '4px solid #556B58'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#556B58' }}>{t.name}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{t.description}</p>
          </div>
        );
      })()}
    </div>
  );
};

export default ModulesTab;