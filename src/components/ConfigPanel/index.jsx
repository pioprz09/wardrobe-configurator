import React, { useMemo, useState } from 'react';
import GeneralInfoTab from './GeneralInfoTab';
import ModulesTab from './ModulesTab';
import ColorsTab from './ColorsTab';
import DetailsTab from './DetailsTab';

const ConfigPanel = (props) => {
  const [activeTab, setActiveTab] = useState('Forma');
  const [ctaStatus, setCtaStatus] = useState('idle'); // idle | copied | error

  // Komponenty tabów
  const tabComponents = {
    Forma: GeneralInfoTab,
    Funkcja: ModulesTab,
    Kolorystyka: ColorsTab,
    Detale: DetailsTab
  };

  // Ikony dla tabów
  const tabIcons = {
    Forma: '📏',
    Funkcja: '📦',
    Kolorystyka: '🎨',
    Detale: '⚙️'
  };

  const CurrentTabComponent = tabComponents[activeTab];

  // Status tabów
  const getTabStatus = (tabName) => {
    switch (tabName) {
      case 'Forma':
        if (props.width < 800 || props.height < 2000 || props.depth < 350) return 'warning';
        if (props.baseModuleHeight && props.height < props.baseModuleHeight) return 'error';
        break;
      case 'Funkcja':
        if (!props.isValid) return 'error';
        break;
      default:
        break;
    }
    return 'ok';
  };

  // Budujemy tekst zapytania (do maila/CRM)
  const inquiryText = useMemo(() => {
    const cm = (v) => (typeof v === 'number' ? `${Math.round(v / 10)} cm` : '-');
    const mm = (v) => (typeof v === 'number' ? `${v} mm` : '-');

    const modulesText = (props.modules || [])
      .map((m, i) => {
        const w = m?.width ? cm(m.width) : '-';
        const id = m?.id || '-';
        const hinge = m?.hinge ? (m.hinge === 'right' ? 'Prawy' : 'Lewy') : '-';
        return `- Moduł ${i + 1}: ${w}, typ: ${id}, zawias: ${hinge}`;
      })
      .join('\n');

    const lines = [
      `ZAPYTANIE – Konfigurator szaf`,
      ``,
      `Wymiary: ${cm(props.width)} × ${cm(props.height)} × ${cm(props.depth)}`,
      `Liczba modułów: ${props.numModules ?? '-'}`,
      `Układ szerokości (distribution): ${props.distribution ?? '-'}`,
      `Podstawa (base module): ${cm(props.baseModuleHeight)}`,
      `Blenda: ${props.blenda ?? '-'}`,
      `Uchwyt (handleType): ${props.handleType ?? '-'}`,
      ``,
      `Moduły:`,
      modulesText || '- brak',
      ``,
      `Kolory:`,
      `- zewnętrzny: ${props.exteriorColor ?? '-'}`,
      `- wewnętrzny: ${props.interiorColor ?? '-'}`,
      ``,
      `Dodatkowe informacje z konfiguratora:`,
      `- LED: ${props.ledEnabled ? 'TAK' : 'NIE'}`,
      `- Referencja uchwytu (link/zdjęcie): ${props.handleReference ? props.handleReference : '-'}`,
      `- Uwagi do zamówienia: ${props.orderNotes ? props.orderNotes : '-'}`,
      `- Inne uwagi: ${props.otherNotes ? props.otherNotes : '-'}`,
      ``,
      `Walidacja konfiguracji: ${props.isValid ? 'OK' : 'WYMAGA SPRAWDZENIA'}`
    ];

    return lines.join('\n');
  }, [
    props.width,
    props.height,
    props.depth,
    props.numModules,
    props.distribution,
    props.baseModuleHeight,
    props.blenda,
    props.handleType,
    props.modules,
    props.exteriorColor,
    props.interiorColor,
    props.ledEnabled,
    props.handleReference,
    props.orderNotes,
    props.otherNotes,
    props.isValid
  ]);

  const handleSendInquiry = async () => {
    try {
      // Jeśli w przyszłości podepniesz wysyłkę do API/CRM:
      // props.onSendInquiry?.(inquiryText, props);

      // Na teraz: kopiujemy gotowy tekst do schowka jako „wyślij zapytanie”
      await navigator.clipboard.writeText(inquiryText);
      setCtaStatus('copied');
      setTimeout(() => setCtaStatus('idle'), 1800);
    } catch (e) {
      console.error('Nie udało się skopiować zapytania:', e);
      setCtaStatus('error');
      setTimeout(() => setCtaStatus('idle'), 2200);
    }
  };

  return (
    <div>
      {/* STAŁY CALL TO ACTION – ZAWSZE NA GÓRZE */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          paddingBottom: '12px',
          background: 'linear-gradient(to bottom, #F7F5F2 70%, rgba(247,245,242,0))'
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            padding: '14px',
            background: '#ffffff',
            border: '1px solid #EAE4DC',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleSendInquiry}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                background: 'linear-gradient(135deg, #E17C4F 0%, #D4A373 100%)',
                boxShadow: '0 10px 22px rgba(225,124,79,0.22)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Wyślij zapytanie
            </button>
          </div>

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#666'
            }}
          >
            <div style={{ lineHeight: 1.25 }}>
              Wymiary: <strong>{Math.round(props.width / 10)}</strong> ×{' '}
              <strong>{Math.round(props.height / 10)}</strong> ×{' '}
              <strong>{Math.round(props.depth / 10)}</strong> cm •{' '}
              <strong>{props.numModules}</strong> moduły
            </div>

            <div
              style={{
                padding: '5px 10px',
                borderRadius: '999px',
                fontWeight: 600,
                backgroundColor:
                  ctaStatus === 'copied'
                    ? '#e8f5e8'
                    : ctaStatus === 'error'
                    ? '#fdecec'
                    : '#f3f4f6',
                color:
                  ctaStatus === 'copied'
                    ? '#2d5a2d'
                    : ctaStatus === 'error'
                    ? '#9b1c1c'
                    : '#555'
              }}
              aria-live="polite"
            >
              {ctaStatus === 'copied'
                ? 'Skopiowano ✅'
                : ctaStatus === 'error'
                ? 'Błąd kopiowania'
                : 'Gotowe do wysyłki'}
            </div>
          </div>

          {/* USUNIĘTE: tekst o kopiowaniu do schowka */}
        </div>
      </div>

      {/* Nawigacja tabów */}
      <div className="tab-carousel">
        <div className="tab-buttons">
          {Object.keys(tabComponents).map((tabName) => {
            const status = getTabStatus(tabName);
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={activeTab === tabName ? 'active' : ''}
                style={{ position: 'relative' }}
              >
                <span style={{ marginRight: '6px' }}>{tabIcons[tabName]}</span>
                {tabName}

                {/* Wskaźniki statusu */}
                {status === 'error' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#dc3545',
                      borderRadius: '50%',
                      fontSize: '8px',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    !
                  </span>
                )}

                {status === 'warning' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#ffc107',
                      borderRadius: '50%',
                      fontSize: '8px',
                      color: 'black',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zawartość aktywnego taba */}
      <div className="tab-content">
        <CurrentTabComponent {...props} />
      </div>

      {/* Wskaźniki stanu – NA DOLE (bez “cena z optymalizacją…”) */}
      <div
        style={{
          marginTop: '15px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            backgroundColor: props.isValid ? '#d4edda' : '#f8d7da',
            color: props.isValid ? '#155724' : '#721c24'
          }}
        >
          {props.isValid ? '✓ Konfiguracja OK' : '⚠ Sprawdź ustawienia'}
        </div>

        {props.modules && props.modules.some((m) => String(m?.id || '').includes('mod')) && (
          <div
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              backgroundColor: '#eef2ff',
              color: '#3730a3'
            }}
          >
            🧩 Moduły skonfigurowane
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;
