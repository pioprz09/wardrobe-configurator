// src/components/GeneralInfoTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { WARDROBE_CONSTANTS } from '../../data/constants';

const GeneralInfoTab = ({
  width, setWidth,
  height, setHeight,
  depth, setDepth,
  numModules, setNumModules,
  moduleCountRange,
  baseModuleHeight, setBaseModuleHeight,
  distribution, setDistribution,
  isValid,

  // ✅ POPRAWIONE: nazwy zgodne z App.jsx
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

    setInputValues(prev => ({
      ...prev,
      [field]: Math.round(value / unit).toString()
    }));
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
    return {
      background: `linear-gradient(to right, #E17C4F ${percentage}%, #EAE4DC ${percentage}%)`
    };
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

      {/* Szerokość */}
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

        <input
          type="range"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          step="10"
          style={updateRangeBackground(width, MIN_WIDTH, MAX_WIDTH)}
        />

        <small>Zakres: {MIN_WIDTH / 10} - {MAX_WIDTH / 10} cm</small>
      </div>

      {/* Wysokość modułu podstawowego – KARUZELA */}
      <div className="config-group">
        <label>Wysokość modułu podstawowego</label>

        <div className="carousel-container" style={{ marginTop: 8 }}>
          <div className="carousel-arrow left" onClick={() => scrollBaseHeight(-1)} role="button" tabIndex={0}>
            ❮
          </div>

          <div
            className="module-carousel"
            ref={baseHeightCarouselRef}
            onWheel={handleBaseHeightWheel}
            style={{ padding: '12px 0' }}
          >
            {baseHeightOptions.map(option => {
              const selected = baseModuleHeight === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setBaseModuleHeight(option.value);
                    if (height < option.value) setHeight(option.value);
                  }}
                  className={`thumbnail-card ${selected ? 'active' : ''}`}
                  style={{ width: 140, borderRadius: 14, padding: 12 }}
                  title={option.description}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#2C2C2C' }}>
                    {option.label}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#757575', lineHeight: 1.25 }}>
                    {selected ? 'Wybrane' : option.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="carousel-arrow right" onClick={() => scrollBaseHeight(1)} role="button" tabIndex={0}>
            ❯
          </div>
        </div>
      </div>

      {/* Wysokość całkowita */}
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

        <input
          type="range"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          min={baseModuleHeight}
          max={MAX_HEIGHT}
          step="10"
          style={updateRangeBackground(height, baseModuleHeight, MAX_HEIGHT)}
        />
      </div>

      {/* Głębokość */}
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

        <input
          type="range"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          min={MIN_DEPTH}
          max={MAX_DEPTH}
          step="10"
          style={updateRangeBackground(depth, MIN_DEPTH, MAX_DEPTH)}
        />
      </div>

      {/* Układ modułów */}
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

      {/* ✅ BLENDY */}
      <hr />
      <h3>Blendy (grubość odejmuje światło wewnętrzne)</h3>

      <div className="config-group">
        <label>Blenda lewa</label>
        <select value={sideBlendaLeft} onChange={(e) => setSideBlendaLeft(e.target.value)}>
          <option value="none">Brak</option>

          <optgroup label="Listwa 100mm">
            <option value="strip-18">100mm • 18mm</option>
            <option value="strip-36">100mm • 36mm</option>
            <option value="strip-50">100mm • 50mm</option>
          </optgroup>

          <optgroup label="Pełna na całą głębokość">
            <option value="full-18">Pełna • 18mm</option>
            <option value="full-36">Pełna • 36mm</option>
            <option value="full-50">Pełna • 50mm</option>
          </optgroup>

          {/* kompatybilność wstecz */}
          <optgroup label="(Starsze)">
            <option value="100">Listwa 100mm (legacy)</option>
            <option value="full">Pełna (legacy)</option>
          </optgroup>
        </select>
        <small>Odejmie od światła wewnętrznego grubość 18/36/50mm.</small>
      </div>

      <div className="config-group">
        <label>Blenda prawa</label>
        <select value={sideBlendaRight} onChange={(e) => setSideBlendaRight(e.target.value)}>
          <option value="none">Brak</option>

          <optgroup label="Listwa 100mm">
            <option value="strip-18">100mm • 18mm</option>
            <option value="strip-36">100mm • 36mm</option>
            <option value="strip-50">100mm • 50mm</option>
          </optgroup>

          <optgroup label="Pełna na całą głębokość">
            <option value="full-18">Pełna • 18mm</option>
            <option value="full-36">Pełna • 36mm</option>
            <option value="full-50">Pełna • 50mm</option>
          </optgroup>

          {/* kompatybilność wstecz */}
          <optgroup label="(Starsze)">
            <option value="100">Listwa 100mm (legacy)</option>
            <option value="full">Pełna (legacy)</option>
          </optgroup>
        </select>
        <small>Odejmie od światła wewnętrznego grubość 18/36/50mm.</small>
      </div>

      <div className="config-group">
        <label>Blenda górna</label>
        <select value={topBlenda} onChange={(e) => setTopBlenda(e.target.value)}>
          <option value="none">Brak</option>

          <optgroup label="Listwa maskująca 100mm">
            <option value="mask100-18">100mm • 18mm</option>
            <option value="mask100-36">100mm • 36mm</option>
            <option value="mask100-50">100mm • 50mm</option>
          </optgroup>

          <optgroup label="Pełna na całą głębokość">
            <option value="full-18">Pełna • 18mm</option>
            <option value="full-36">Pełna • 36mm</option>
            <option value="full-50">Pełna • 50mm</option>
          </optgroup>

          {/* kompatybilność wstecz */}
          <optgroup label="(Starsze)">
            <option value="100">Listwa 100mm (legacy)</option>
            <option value="full">Pełna (legacy)</option>
          </optgroup>
        </select>
        <small>Odejmie od światła wewnętrznego wysokość 18/36/50mm.</small>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
