// src/components/DetailsTab.jsx
import React, { useMemo } from 'react';
import { WARDROBE_CONSTANTS } from '../../data/constants';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const DetailsTab = ({
  handleType,
  setHandleType,
  modules,

  // ✅ NOWE: kolor uchwytu
  handleColor,
  setHandleColor,

  // uchwyty – długości w mm
  edgeHandleLength,
  setEdgeHandleLength,
  barHandleLength,
  setBarHandleLength,

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

  const edgeTopMm = 1200;
  const barTopMm = 1250;

  return (
    <div>
      <h3>Uchwyty</h3>

      <div className="config-group radio-group">
        <label>
          <input
            type="radio"
            name="handle"
            value="none"
            checked={handleType === 'none'}
            onChange={(e) => setHandleType(e.target.value)}
          />
          Bez uchwytów
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>
            (push to open)
          </span>
        </label>

        <label>
          <input
            type="radio"
            name="handle"
            value="knob"
            checked={handleType === 'knob'}
            onChange={(e) => setHandleType(e.target.value)}
          />
          Gałki
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>
            (klasyczne)
          </span>
        </label>

        <label>
          <input
            type="radio"
            name="handle"
            value="edge"
            checked={handleType === 'edge'}
            onChange={(e) => setHandleType(e.target.value)}
          />
          Uchwyt krawędziowy (profil)
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>
            (pionowy przy krawędzi)
          </span>
        </label>

        <label>
          <input
            type="radio"
            name="handle"
            value="bar"
            checked={handleType === 'bar'}
            onChange={(e) => setHandleType(e.target.value)}
          />
          Uchwyt meblowy podłużny
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>
            (pionowy)
          </span>
        </label>
      </div>

      {/* ✅ Kolor uchwytu */}
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
            <small>Kolor dotyczy gałki / uchwytu krawędziowego / podłużnego.</small>
          </div>
        </>
      )}

      {/* konfiguracja uchwytu edge */}
      {handleType === 'edge' && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #EAE4DC',
            background: '#fff'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
            Uchwyt krawędziowy
          </div>

          <div className="config-group" style={{ marginBottom: 12 }}>
            <label>
              Długość uchwytu (mm)
              <div className="value-input value-input--center">
                <input
                  type="text"
                  value={String(edgeHandleLength ?? 800)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    const n = clamp(parseInt(raw || '0', 10), 60, 1200);
                    setEdgeHandleLength(n);
                  }}
                />
                <span className="unit">mm</span>
              </div>
            </label>
            <small>
              Górna krawędź uchwytu: <strong>{edgeTopMm}mm</strong>. Zakres długości: <strong>60–1200mm</strong>.
              Uchwyt jest po stronie przeciwnej do zawiasu.
            </small>
          </div>
        </div>
      )}

      {/* konfiguracja uchwytu bar */}
      {handleType === 'bar' && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #EAE4DC',
            background: '#fff'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
            Uchwyt podłużny
          </div>

          <div className="config-group" style={{ marginBottom: 12 }}>
            <label>
              Długość uchwytu (mm)
              <div className="value-input value-input--center">
                <input
                  type="text"
                  value={String(barHandleLength ?? 800)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    const n = clamp(parseInt(raw || '0', 10), 60, 1200);
                    setBarHandleLength(n);
                  }}
                />
                <span className="unit">mm</span>
              </div>
            </label>
            <small>
              Górna krawędź uchwytu maks.: <strong>{barTopMm}mm</strong>. Zakres długości: <strong>60–1200mm</strong>.
              Uchwyt jest po stronie przeciwnej do zawiasu.
            </small>
          </div>
        </div>
      )}

      {/* Koszt uchwytów */}
      {handleType !== 'none' && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#e8f4fd',
            borderRadius: '6px',
            fontSize: '13px',
            marginTop: '12px'
          }}
        >
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
        <select
          value={ledEnabled ? 'yes' : 'no'}
          onChange={(e) => setLedEnabled(e.target.value === 'yes')}
        >
          <option value="no">Nie</option>
          <option value="yes">Tak</option>
        </select>
        <small>Opcja do wyceny – LED montowane w górnej części szafy.</small>
      </div>

      <hr />

      <h3>Referencja uchwytu (link / zdjęcie)</h3>
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
        <label>Uwagi (np. termin, montaż, nietypowe życzenia)</label>
        <input
          type="text"
          value={orderNotes || ''}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Np. montaż w weekend, nietypowa ściana, listwy..."
        />
      </div>

      <h3>Uwagi inne</h3>
      <div className="config-group">
        <label>Dodatkowe uwagi</label>
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
