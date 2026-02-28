import React, { useState } from 'react';
import GeneralInfoTab from './GeneralInfoTab';
import ModulesTab from './ModulesTab';
import ColorsTab from './ColorsTab';
import DetailsTab from './DetailsTab';
import PricingTab from './PricingTab';

const ConfigPanel = (props) => {
  const [activeTab, setActiveTab] = useState('Forma');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
 
  // Komponenty tabów
  const tabComponents = {
    'Forma': GeneralInfoTab,
    'Funkcja': ModulesTab,
    'Kolorystyka': ColorsTab,
    'Detale': DetailsTab,
    'Wycena': PricingTab
  };
 
  // Ikony dla tabów
  const tabIcons = {
    'Forma': '📏',
    'Funkcja': '📦',
    'Kolorystyka': '🎨',
    'Detale': '⚙️',
    'Wycena': '💰'
  };

  // Callback do aktualizacji ceny z PricingTab
  const handleOptimizedPriceUpdate = (newPrice) => {
    setCalculatedPrice(newPrice);
  };
 
  // Sprawdź czy tab ma jakieś błędy/ostrzeżenia
  const getTabStatus = (tabName) => {
    switch (tabName) {
      case 'Forma':
        // Sprawdź czy wymiary są prawidłowe
        if (props.width < 800 || props.height < 2000 || props.depth < 350) {
          return 'warning';
        }
        // Sprawdź czy wysokość podstawy jest sensowna
        if (props.baseModuleHeight && props.height < props.baseModuleHeight) {
          return 'error';
        }
        break;
      case 'Funkcja':
        // Sprawdź czy konfiguracja modułów jest prawidłowa
        if (!props.isValid) {
          return 'error';
        }
        break;
      case 'Kolorystyka':
        // Wszystko OK z kolorami
        break;
      case 'Detale':
        // Sprawdź czy są jakieś problemy z detalami
        break;
      case 'Wycena':
        // Sprawdź czy wycena jest dostępna
        if (!props.width || !props.height || !props.depth || !props.numModules) {
          return 'warning';
        }
        break;
      default:
        break;
    }
    return 'ok';
  };

  // Przygotuj props dla różnych tabów
  const getTabProps = (tabName) => {
    if (tabName === 'Wycena') {
      return {
        ...props,
        onOptimizedPriceUpdate: handleOptimizedPriceUpdate
      };
    }
    return props;
  };
 
  const CurrentTabComponent = tabComponents[activeTab];
 
  return (
    <div>
      {/* Nawigacja tabów */}
      <div className="tab-carousel">
        <div className="tab-buttons">
          {Object.keys(tabComponents).map(tabName => {
            const status = getTabStatus(tabName);
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={activeTab === tabName ? 'active' : ''}
                style={{
                  position: 'relative'
                }}
              >
                <span style={{ marginRight: '6px' }}>{tabIcons[tabName]}</span>
                {tabName}
               
                {/* Wskaźniki statusu */}
                {status === 'error' && (
                  <span style={{
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
                  }}>
                    !
                  </span>
                )}
               
                {status === 'warning' && (
                  <span style={{
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
                  }}>
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
        <CurrentTabComponent {...getTabProps(activeTab)} />
      </div>

      {/* Sekcja podsumowania - ZAKTUALIZOWANA Z DOKŁADNĄ CENĄ */}
      <div className="summary-section">
        <h3>
          {calculatedPrice > 0 ? 'Dokładna cena:' : 'Szacunkowa cena:'} 
          <span>
            {calculatedPrice > 0 
              ? calculatedPrice.toLocaleString('pl-PL') 
              : (props.price || 0).toLocaleString('pl-PL')
            } PLN
          </span>
        </h3>
        <small style={{
          color: '#757575', 
          fontSize: '12px', 
          marginTop: '8px', 
          display: 'block',
          lineHeight: '1.4'
        }}>
          {calculatedPrice > 0 
            ? '*Cena zawiera: materiały z 30% marżą, szuflady, zawiasy, optymalizację rozkroju'
            : '*Cena orientacyjna zawiera: korpus, fronty'
          }
          {props.handleType !== 'none' && ', uchwyty'}
          {props.blenda !== 'none' && ', blendy boczne'}
          <br/>
          Wymiary: {props.width/10} × {props.height/10} × {props.depth/10} cm • 
          Podstawa: {props.baseModuleHeight/10}cm • {props.numModules} modułów
          {calculatedPrice > 0 && (
            <>
              <br/>
              <span style={{ color: '#28a745', fontWeight: '600' }}>
                ✓ Optymalizacja rozkroju uwzględniona
              </span>
            </>
          )}
        </small>
        
        {/* Wskaźniki stanu */}
        <div style={{ 
          marginTop: '15px', 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap' 
        }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            backgroundColor: props.isValid ? '#d4edda' : '#f8d7da',
            color: props.isValid ? '#155724' : '#721c24'
          }}>
            {props.isValid ? '✓ Konfiguracja OK' : '⚠ Sprawdź ustawienia'}
          </div>
          
          {calculatedPrice > 0 && (
            <div style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              backgroundColor: '#d1ecf1',
              color: '#0c5460'
            }}>
              💰 Wycena dokładna
            </div>
          )}
          
          <div style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            backgroundColor: props.numModules <= 4 ? '#d4edda' : '#fff3cd',
            color: props.numModules <= 4 ? '#155724' : '#856404'
          }}>
            📦 {props.numModules} {props.numModules === 1 ? 'moduł' : props.numModules < 5 ? 'moduły' : 'modułów'}
          </div>
        </div>

        {/* Informacja o przejściu do wyceny */}
        {activeTab !== 'Wycena' && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#e7f3ff',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#004085',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('Wycena')}
          >
            💡 Kliknij zakładkę "Wycena" aby zobaczyć szczegółową kalkulację z optymalizacją rozkroju
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;