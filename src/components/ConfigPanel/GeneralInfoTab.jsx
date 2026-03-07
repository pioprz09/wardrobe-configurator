// src/components/GeneralInfoTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { WARDROBE_CONSTANTS } from '../../data/constants';

const InfoTooltip = ({ content }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const updateCoords = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCoords({ top: rect.top - 8, left: rect.left + rect.width / 2 });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setVisible(false);
    };
    if (visible) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => { updateCoords(); setVisible(true); }}
        onMouseLeave={() => setVisible(false)}
        onClick={() => { updateCoords(); setVisible(v => !v); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          width: 18, height: 18, borderRadius: '50%',
          backgroundColor: '#3B82F6', color: '#fff',
          fontSize: 11, fontWeight: 700, lineHeight: '18px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, verticalAlign: 'middle'
        }}
        aria-label="Więcej informacji"
      >
        i
      </button>

      {visible && (
        <div style={{
          position: 'fixed',
          bottom: `calc(100vh - ${coords.top}px + 6px)`,
          left: `min(${coords.left}px, calc(100vw - 300px))`,
          transform: 'translateX(-50%)',
          width: 280, background: '#1e293b', color: '#f1f5f9',
          borderRadius: 10, padding: '12px 14px', fontSize: 12,
          lineHeight: 1.6, zIndex: 99999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {content}
          <div style={{
            position: 'absolute', bottom: -6, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1e293b'
          }} />
        </div>
      )}
    </span>
  );
};


const BlendaSelect = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%' }}>
    <option value="none">Brak</option>
    <optgroup label="Listwa 100mm">
      <option value="strip-18">szerokość 18mm</option>
      <option value="strip-36">szerokość 36mm</option>
      <option value="strip-50">szerokość 50mm</option>
    </optgroup>
    <optgroup label="Pełna na całą głębokość">
      <option value="full-18">szerokość 18mm</option>
      <option value="full-36">szerokość 36mm</option>
    </optgroup>
  </select>
);

const GeneralInfoTab = ({
  width, setWidth,
  height, setHeight,
  depth, setDepth,
  numModules, setNumModules,
  moduleCountRange,
  baseModuleHeight, setBaseModuleHeight,
  distribution, setDistribution,
  isValid,
  sideBlendaLeft, setSideBlendaLeft,
  sideBlendaRight, setSideBlendaRight,
  topBlenda, setTopBlenda
}) => {
  const baseHeightCarouselRef = useRef(null);

  const [inputValues, setInputValues] = useState({
    width: Math.round(width / 10).toString(),
    height: Math.round(height / 10).toString(),
    depth: Math.round(depth / 10).toString(),
    numModules: numModules.toString()
  });

  const handleInputValueChange = (field) => (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValues(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInputApply = (field, setter, min, max, unit = 1) => () => {
    const inputValue = inputValues[field];
    let value = parseInt(inputValue, 10) * unit;
    if (isNaN(value) || value < min) value = min;
    else if (value > max) value = max;
    setter(value);
    setInputValues(prev => ({ ...prev, [field]: Math.round(value / unit).toString() }));
  };

  const handleInputKeyPress = (field, setter, min, max, unit = 1) => (e) => {
    if (e.key === 'Enter') {
      handleInputApply(field, setter, min, max, unit)();
      e.target.blur();
    }
  };

  useEffect(() => {
    setInputValues(prev => ({
      ...prev,
      width: Math.round(width / 10).toString(),
      height: Math.round(height / 10).toString(),
      depth: Math.round(depth / 10).toString(),
      numModules: numModules.toString()
    }));
  }, [width, height, depth, numModules]);

  const updateRangeBackground = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return { background: `linear-gradient(to right, #E17C4F ${percentage}%, #EAE4DC ${percentage}%)` };
  };

  const { MIN_WIDTH, MAX_WIDTH, MAX_HEIGHT, MIN_DEPTH, MAX_DEPTH } = WARDROBE_CONSTANTS;

  const baseHeightOptions = [
    { value: 1800, label: '180cm', description: 'Niższa, łatwiejszy dostęp' },
    { value: 1900, label: '190cm', description: 'Standardowa wysokość' },
    { value: 2000, label: '200cm', description: 'Popularna wysokość' },
    { value: 2100, label: '210cm', description: 'Wysoka, więcej miejsca' },
    { value: 2200, label: '220cm', description: 'Maksymalna wysokość podstawy' }
  ];

  const scrollBaseHeight = (direction) => {
    if (!baseHeightCarouselRef.current) return;
    baseHeightCarouselRef.current.scrollBy({ left: direction * 140, behavior: 'smooth' });
  };

  const handleBaseHeightWheel = (e) => {
    e.preventDefault();
    if (!baseHeightCarouselRef.current) return;
    baseHeightCarouselRef.current.scrollLeft += e.deltaY;
  };

  return (
    <div>
      <h3>Wymiary Zewnętrzne</h3>

      <div className="config-group">
        <label>
          Szerokość całkowita
          <div className="value-input value-input--center">
            <input
              type="text"
              value={inputValues.width}
              onChange={handleInputValueChange('width')}
              onBlur={handleInputApply('width', setWidth, MIN_WIDTH, MAX_WIDTH, 10)}
              onKeyPress={handleInputKeyPress('width', setWidth, MIN_WIDTH, MAX_WIDTH, 10)}
              placeholder="220"
            />
            <span className="unit">cm</span>
          </div>
        </label>
        <input type="range" value={width} onChange={(e) => setWidth(Number(e.target.value))}
          min={MIN_WIDTH} max={MAX_WIDTH} step="10" style={updateRangeBackground(width, MIN_WIDTH, MAX_WIDTH)} />
        <small>Zakres: {MIN_WIDTH / 10} - {MAX_WIDTH / 10} cm</small>
      </div>

      <div className="config-group">
        <label>Wysokość modułu podstawowego</label>
        <div className="carousel-container" style={{ marginTop: 8 }}>
          <div className="carousel-arrow left" onClick={() => scrollBaseHeight(-1)} role="button" tabIndex={0}>❮</div>
          <div className="module-carousel" ref={baseHeightCarouselRef} onWheel={handleBaseHeightWheel} style={{ padding: '12px 0' }}>
            {baseHeightOptions.map(option => {
              const selected = baseModuleHeight === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => { setBaseModuleHeight(option.value); if (height < option.value) setHeight(option.value); }}
                  className={`thumbnail-card ${selected ? 'active' : ''}`}
                  style={{ width: 140, borderRadius: 14, padding: 12 }}
                  title={option.description}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#2C2C2C' }}>{option.label}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#757575', lineHeight: 1.25 }}>
                    {selected ? 'Wybrane' : option.description}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="carousel-arrow right" onClick={() => scrollBaseHeight(1)} role="button" tabIndex={0}>❯</div>
        </div>
      </div>

      <div className="config-group">
        <label>
          Wysokość całkowita
          <div className="value-input value-input--center">
            <input
              type="text"
              value={inputValues.height}
              onChange={handleInputValueChange('height')}
              onBlur={handleInputApply('height', setHeight, baseModuleHeight, MAX_HEIGHT, 10)}
              onKeyPress={handleInputKeyPress('height', setHeight, baseModuleHeight, MAX_HEIGHT, 10)}
              placeholder="240"
            />
            <span className="unit">cm</span>
          </div>
        </label>
        <input type="range" value={height} onChange={(e) => setHeight(Number(e.target.value))}
          min={baseModuleHeight} max={MAX_HEIGHT} step="10" style={updateRangeBackground(height, baseModuleHeight, MAX_HEIGHT)} />
        <div style={{
          marginTop: 8, fontSize: 12, color: '#666', lineHeight: 1.6,
          padding: '8px 10px', background: '#f8f7f5', borderRadius: 8,
          borderLeft: '3px solid #E17C4F'
        }}>
          <strong style={{ color: '#444' }}>Jak zmierzyć?</strong> Zmierz wysokość wnęki i odejmij 5–10 mm. Ten mały luz ułatwia montaż szafy.
          <div style={{ marginTop: 5, color: '#777' }}>
            💡 <strong>Masz blendę górną?</strong> Podaj dokładny wymiar wnęki — blenda zakryje szczelinę.
          </div>
        </div>
      </div>

      <div className="config-group">
        <label>
          Głębokość
          <div className="value-input value-input--center">
            <input
              type="text"
              value={inputValues.depth}
              onChange={handleInputValueChange('depth')}
              onBlur={handleInputApply('depth', setDepth, MIN_DEPTH, MAX_DEPTH, 10)}
              onKeyPress={handleInputKeyPress('depth', setDepth, MIN_DEPTH, MAX_DEPTH, 10)}
              placeholder="60"
            />
            <span className="unit">cm</span>
          </div>
        </label>
        <input type="range" value={depth} onChange={(e) => setDepth(Number(e.target.value))}
          min={MIN_DEPTH} max={MAX_DEPTH} step="10" style={updateRangeBackground(depth, MIN_DEPTH, MAX_DEPTH)} />
      </div>

      <hr />
      <h3>Układ</h3>

      <div className="config-group">
        <label>Liczba modułów</label>
        <input
          type="range"
          value={numModules}
          onChange={(e) => setNumModules(Number(e.target.value))}
          min={moduleCountRange?.min ?? 1}
          max={moduleCountRange?.max ?? 6}
          step="1"
          style={updateRangeBackground(numModules, moduleCountRange?.min ?? 1, moduleCountRange?.max ?? 6)}
        />
        <small>Zakres: {moduleCountRange?.min ?? 1} - {moduleCountRange?.max ?? 6}</small>
        {!isValid && (
          <div className="error-message">
            ⚠️ Szerokości modułów poza zakresem (35–110 cm). Zwiększ szerokość szafy lub zmniejsz liczbę modułów.
          </div>
        )}
      </div>

      <hr />
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        Blendy
        <InfoTooltip content={
          <>
            <strong style={{ color: '#93c5fd' }}>Blenda przy ścianie (100 mm)</strong>
            <br /><br />
            Zakrywa szczelinę, gdy ściana lub wnęka nie są idealnie proste.
            <br /><br />
            <strong style={{ color: '#fbbf24' }}>Opcja 50 mm</strong> — płyta jak front (18 mm). Można ją dociąć do krzywej ściany.
          </>
        } />
        <InfoTooltip content={
          <>
            <strong style={{ color: '#a78bfa' }}>Blenda pełna głębokość</strong>
            <br /><br />
            Gdy szafa jest widoczna z boku — np. z jednej strony stoi przy ścianie, z drugiej jest otwarta.
            <br /><br />
            Bok wygląda tak samo jak front, więc szafa prezentuje się estetycznie z każdej strony.
          </>
        } />
      </h3>
      <p style={{ fontSize: 12, color: '#888', marginTop: -8, marginBottom: 12 }}>
        Grubość blendy odejmuje światło wewnętrzne szafy.
      </p>

      <div className="config-group">
        <label>Blenda lewa</label>
        <BlendaSelect value={sideBlendaLeft} onChange={setSideBlendaLeft} />
      </div>

      <div className="config-group">
        <label>Blenda prawa</label>
        <BlendaSelect value={sideBlendaRight} onChange={setSideBlendaRight} />
      </div>

      <div className="config-group">
        <label>Blenda górna</label>
        <BlendaSelect value={topBlenda} onChange={setTopBlenda} />
      </div>
    </div>
  );
};

export default GeneralInfoTab;