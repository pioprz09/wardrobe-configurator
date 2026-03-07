// src/components/DetailsTab.jsx
import React, { useMemo } from 'react';
import { WARDROBE_CONSTANTS } from '../../data/constants';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Komponent inputu numerycznego z przyciskami ± i walidacją
const NumericInput = ({ value, onChange, min, max, step = 10, unit = 'mm', label, hint }) => {
  const handleChange = (raw) => {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits === '') return;
    onChange(clamp(parseInt(digits, 10), min, max));
  };
  const inc = () => onChange(clamp(value + step, min, max));
  const dec = () => onChange(clamp(value - step, min, max));

  return (
    <div className="config-group" style={{ marginBottom: 10 }}>
      {label && <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: 'block' }}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={dec}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #D5CFC6',
            background: '#f5f2ee', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}
        >−</button>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D5CFC6', borderRadius: 8, overflow: 'hidden' }}>
          <input
            type="text"
            inputMode="numeric"
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={(e) => handleChange(e.target.value)}
            style={{
              width: 70, textAlign: 'center', border: 'none', outline: 'none',
              fontSize: 14, fontWeight: 600, padding: '6px 4px', background: '#fff'
            }}
          />
          <span style={{
            padding: '6px 10px', background: '#f5f2ee', fontSize: 12,
            color: '#888', borderLeft: '1px solid #D5CFC6'
          }}>{unit}</span>
        </div>
        <button
          type="button"
          onClick={inc}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #D5CFC6',
            background: '#f5f2ee', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}
        >+</button>
      </div>
      {hint && <small style={{ color: '#999', fontSize: 11, marginTop: 3, display: 'block' }}>{hint}</small>}
    </div>
  );
};

const DetailsTab = ({
  handleType,
  setHandleType,
  modules,

  handleColor,
  setHandleColor,

  // drzwi — długości
  edgeHandleLength,
  setEdgeHandleLength,
  barHandleLength,
  setBarHandleLength,

  // wysokość uchwytu drzwiowego (od góry szafy)
  handleHeightMm,
  setHandleHeightMm,

  // szuflady bench — długości
  benchDrawerEdgeLength,
  setBenchDrawerEdgeLength,
  benchDrawerBarLength,
  setBenchDrawerBarLength,

  // długość uchwytu szuflady (dla modułów zwykłych szufladowych)
  drawerHandleLength,
  setDrawerHandleLength,

  // LED
  ledEnabled,
  setLedEnabled,

  // pola uwag
  handleReference,
  setHandleReference,
  otherNotes,
  setOtherNotes,
  orderNotes,
  setOrderNotes
}) => {
  const handleCost = useMemo(() => {
    return handleType === 'none'
      ? 0
      : (modules?.length || 0) * WARDROBE_CONSTANTS.BASE_PRICES.HANDLE_PRICE;
  }, [handleType, modules]);

  // Sprawdź czy są moduły bench lub szufladowe
  const hasBench  = modules?.some(m => ['mod30L','mod30P','mod31','mod32'].includes(m.id));
  const hasDrawer = modules?.some(m => ['mod6','mod7','mod8','mod9','mod10','mod11','mod12','mod14','mod15','mod16','mod17','mod18','mod19'].includes(m.id));

  const boxStyle = {
    marginTop: 12, padding: 14, borderRadius: 12,
    border: '1px solid #EAE4DC', background: '#fff'
  };
  const sectionTitle = { fontWeight: 700, fontSize: 13, marginBottom: 10 };

  return (
    <div>
      <h3>Uchwyty</h3>

      <div className="config-group radio-group">
        <label>
          <input type="radio" name="handle" value="none"
            checked={handleType === 'none'}
            onChange={(e) => setHandleType(e.target.value)} />
          Bez uchwytów
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>(push to open)</span>
        </label>
        <label>
          <input type="radio" name="handle" value="knob"
            checked={handleType === 'knob'}
            onChange={(e) => setHandleType(e.target.value)} />
          Gałki
        </label>
        <label>
          <input type="radio" name="handle" value="edge"
            checked={handleType === 'edge'}
            onChange={(e) => setHandleType(e.target.value)} />
          Uchwyt krawędziowy (profil)
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>(pionowy przy krawędzi)</span>
        </label>
        <label>
          <input type="radio" name="handle" value="bar"
            checked={handleType === 'bar'}
            onChange={(e) => setHandleType(e.target.value)} />
          Uchwyt meblowy podłużny
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>(pionowy)</span>
        </label>
      </div>

      {/* Kolor */}
      {handleType !== 'none' && (
        <>
          <hr />
          <h3>Kolor uchwytu</h3>
          <div className="config-group">
            <select value={handleColor} onChange={(e) => setHandleColor(e.target.value)}>
              <option value="black">Czarny</option>
              <option value="silver">Srebrny</option>
              <option value="gold_matte">Złoty mat</option>
              <option value="gold_gloss">Złoty połysk</option>
              <option value="rose">Różowy</option>
              <option value="white">Biały</option>
            </select>
          </div>
        </>
      )}

      {/* ── Uchwyt krawędziowy ── */}
      {handleType === 'edge' && (
        <div style={boxStyle}>
          <div style={sectionTitle}>Uchwyt krawędziowy — drzwi</div>
          <NumericInput
            label="Długość uchwytu drzwi"
            value={edgeHandleLength ?? 800}
            onChange={setEdgeHandleLength}
            min={60} max={1200} step={10}
            hint="Zakres: 60–1200 mm. Uchwyt po stronie przeciwnej do zawiasu."
          />
          <NumericInput
            label="Wysokość górnej krawędzi uchwytu od podłogi"
            value={handleHeightMm ?? 1200}
            onChange={setHandleHeightMm}
            min={200} max={2200} step={10}
            hint="Domyślnie: 1200 mm od podłogi."
          />
          {hasBench && (
            <>
              <div style={{ borderTop: '1px solid #EAE4DC', margin: '10px 0' }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: '#888', marginBottom: 8 }}>
                Uchwyty poziome — szuflady ławki/przedpokój
              </div>
              <NumericInput
                label="Długość uchwytu szuflady"
                value={benchDrawerEdgeLength ?? 400}
                onChange={setBenchDrawerEdgeLength}
                min={30} max={800} step={10}
                hint="Uchwyt poziomy na górnej krawędzi frontu szuflady."
              />
            </>
          )}
        </div>
      )}

      {/* ── Uchwyt podłużny ── */}
      {handleType === 'bar' && (
        <div style={boxStyle}>
          <div style={sectionTitle}>Uchwyt podłużny — drzwi</div>
          <NumericInput
            label="Długość uchwytu drzwi"
            value={barHandleLength ?? 800}
            onChange={setBarHandleLength}
            min={60} max={1200} step={10}
            hint="Zakres: 60–1200 mm. Uchwyt po stronie przeciwnej do zawiasu."
          />
          <NumericInput
            label="Wysokość górnej krawędzi uchwytu od podłogi"
            value={handleHeightMm ?? 1200}
            onChange={setHandleHeightMm}
            min={200} max={2200} step={10}
            hint="Domyślnie: 1200 mm od podłogi."
          />
          {hasBench && (
            <>
              <div style={{ borderTop: '1px solid #EAE4DC', margin: '10px 0' }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: '#888', marginBottom: 8 }}>
                Uchwyty poziome — szuflady ławki/przedpokój
              </div>
              <NumericInput
                label="Długość uchwytu szuflady"
                value={benchDrawerBarLength ?? 400}
                onChange={setBenchDrawerBarLength}
                min={30} max={800} step={10}
                hint="Uchwyt poziomy na środku wysokości frontu szuflady."
              />
            </>
          )}
        </div>
      )}

      {/* ── Gałki ── */}
      {handleType === 'knob' && (
        <div style={boxStyle}>
          <div style={sectionTitle}>Gałki</div>
          <NumericInput
            label="Wysokość górnej krawędzi uchwytu od podłogi"
            value={handleHeightMm ?? 1200}
            onChange={setHandleHeightMm}
            min={200} max={2200} step={10}
            hint="Domyślnie: 1200 mm od podłogi."
          />
        </div>
      )}

      {/* Koszt */}
      {handleType !== 'none' && (
        <div style={{
          padding: '12px', backgroundColor: '#e8f4fd',
          borderRadius: '6px', fontSize: '13px', marginTop: '12px'
        }}>
          💰 Koszt uchwytów: <strong>{handleCost} PLN</strong>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
            {modules?.length || 0} modułów × {WARDROBE_CONSTANTS.BASE_PRICES.HANDLE_PRICE} PLN
          </div>
        </div>
      )}

      <hr />
      <h3>Akcesoria</h3>
      <div className="config-group">
        <label>Oświetlenie LED</label>
        <select value={ledEnabled ? 'yes' : 'no'} onChange={(e) => setLedEnabled(e.target.value === 'yes')}>
          <option value="no">Nie</option>
          <option value="yes">Tak</option>
        </select>
        <small>Opcja do wyceny – LED montowane w górnej części szafy.</small>
      </div>

      <hr />
      <h3>Referencja uchwytu</h3>
      <div className="config-group">
        <label>Wklej link lub opis</label>
        <input
          type="text"
          value={handleReference || ''}
          onChange={(e) => setHandleReference(e.target.value)}
          placeholder="np. link do Allegro / zdjęcie w Google Drive / opis modelu"
        />
        <small>Jeśli chcesz inny uchwyt niż w konfiguratorze – wklej tutaj referencję.</small>
      </div>

      <h3>Uwagi do zamówienia</h3>
      <div className="config-group">
        <input
          type="text"
          value={orderNotes || ''}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Np. montaż w weekend, nietypowa ściana, listwy..."
        />
      </div>

      <h3>Uwagi inne</h3>
      <div className="config-group">
        <input
          type="text"
          value={otherNotes || ''}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="Wszystko czego nie przewiduje konfigurator"
        />
      </div>
    </div>
  );
};

export default DetailsTab;