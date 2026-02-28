import React, { useRef } from 'react';
import ModuleThumbnail from '../UI/ModuleThumbnail';
import { MODULE_TYPES } from '../../data/moduleTypes';
import { WARDROBE_CONSTANTS } from '../../data/constants';

const ModulesTab = ({
  modules,
  activeModuleIndex,
  onModuleClick,
  onModuleTypeChange,
  onHingeChange
}) => {
  const carouselRef = useRef(null);

  const activeModule = activeModuleIndex != null ? modules[activeModuleIndex] : null;
  const isSingleDoorActive =
    !!activeModule && activeModule.width <= WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD;

  const singleDoorModuleIndexes = (modules || [])
    .map((m, i) => (m && m.width <= WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD ? i : null))
    .filter((i) => i !== null);

  const handleSelectModuleType = (typeId) => {
    if (activeModuleIndex == null) return;
    onModuleTypeChange(activeModuleIndex, typeId);
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction * 120, behavior: 'smooth' });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += e.deltaY;
    }
  };

  const activeModuleType = modules[activeModuleIndex]?.id;

  const hingeSideFor = (module) => (module?.hinge === 'right' ? 'right' : 'left');
  const hingeLabel = (side) => (side === 'left' ? 'Lewy' : 'Prawy');
  const hingeShort = (side) => (side === 'left' ? 'L' : 'P');

  return (
    <div>
      <h3>Wybierz moduł do edycji</h3>
      <div className="module-selector">
        {modules.map((module, index) => {
          const isSingleDoor = module.width <= WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD;
          const hinge = hingeSideFor(module);
          const isActive = activeModuleIndex === index;

          const singleDoorStyle = !isActive && isSingleDoor
            ? { backgroundColor: '#fff7e6', borderColor: '#D4A373' }
            : undefined;

          const activeSingleDoorStyle = isActive && isSingleDoor
            ? { boxShadow: '0 4px 8px rgba(85, 107, 88, 0.3), 0 4px 10px rgba(212, 163, 115, 0.25)' }
            : undefined;

          return (
            <button
              key={index}
              onClick={() => onModuleClick(index)}
              className={isActive ? 'active' : ''}
              style={{ ...(singleDoorStyle || {}), ...(activeSingleDoorStyle || {}) }}
              title={isSingleDoor ? `Pojedyncze drzwi • Zawias: ${hingeLabel(hinge)}` : 'Podwójne drzwi'}
            >
              <div>
                Moduł {index + 1}
                <br />
                <small style={{ fontSize: '10px', opacity: 0.8 }}>
                  {Math.round(module.width / 10)}cm
                </small>
              </div>

              {isSingleDoor && (
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(225, 124, 79, 0.12)',
                    border: '1px solid rgba(225, 124, 79, 0.25)',
                    color: '#7a3d24',
                    lineHeight: 1
                  }}
                  aria-label="Kierunek otwierania"
                >
                  🚪 {hingeShort(hinge)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Kierunek otwierania */}
      {singleDoorModuleIndexes.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <h3>Kierunek otwierania drzwi</h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {singleDoorModuleIndexes.map((i) => {
              const hinge = hingeSideFor(modules[i]);
              const isActive = activeModuleIndex === i;

              return (
                <button
                  key={i}
                  onClick={() => onModuleClick(i)}
                  style={{
                    border: '1px solid #EAE4DC',
                    borderRadius: '999px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: isActive ? '#fff3cd' : '#fff',
                    boxShadow: isActive ? '0 2px 8px rgba(212,163,115,0.25)' : 'none'
                  }}
                >
                  Moduł {i + 1}: 🚪 {hingeLabel(hinge)}
                </button>
              );
            })}
          </div>

          {isSingleDoorActive && activeModuleIndex != null && activeModule && (
            <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeeba' }}>
              <div style={{ fontSize: '12px', color: '#856404', marginBottom: '10px' }}>
                🚪 Moduł {activeModuleIndex + 1} ma pojedyncze drzwi (szerokość: {Math.round(activeModule.width / 10)}cm). Wybierz stronę zawiasów.
              </div>

              <div className="config-group radio-group" style={{ marginBottom: 0 }}>
                <label>
                  <input
                    type="radio"
                    name={`hinge-${activeModuleIndex}`}
                    value="left"
                    checked={hingeSideFor(activeModule) === 'left'}
                    onChange={() => onHingeChange(activeModuleIndex, 'left')}
                  />
                  Zawiasy po lewej
                </label>
                <label>
                  <input
                    type="radio"
                    name={`hinge-${activeModuleIndex}`}
                    value="right"
                    checked={hingeSideFor(activeModule) === 'right'}
                    onChange={() => onHingeChange(activeModuleIndex, 'right')}
                  />
                  Zawiasy po prawej
                </label>
              </div>
            </div>
          )}

          <small style={{ color: '#777' }}>
            Opcja dotyczy modułów do {Math.round(WARDROBE_CONSTANTS.DOUBLE_DOOR_THRESHOLD / 10)}cm (powyżej są drzwi dwuskrzydłowe).
          </small>
        </div>
      )}

      <hr />

      <h3>Wybierz funkcję modułu</h3>
      <div className="carousel-container">
        <div className="carousel-arrow left" onClick={() => scroll(-1)} role="button" tabIndex={0}>❮</div>

        <div className="module-carousel" ref={carouselRef} onWheel={handleWheel}>
          {MODULE_TYPES.map((type) => (
            <ModuleThumbnail
              key={type.id}
              type={type}
              isActive={activeModuleType === type.id}
              onClick={handleSelectModuleType}
            />
          ))}
        </div>

        <div className="carousel-arrow right" onClick={() => scroll(1)} role="button" tabIndex={0}>❯</div>
      </div>

      {/* Opis bez ceny */}
      {activeModuleType && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            borderLeft: '4px solid #556B58'
          }}
        >
          {(() => {
            const moduleTypeData = MODULE_TYPES.find((t) => t.id === activeModuleType);
            if (!moduleTypeData) return null;

            return (
              <>
                <h4 style={{ margin: '0 0 8px 0', color: '#556B58' }}>
                  {moduleTypeData.name}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                  {moduleTypeData.description}
                </p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ModulesTab;
