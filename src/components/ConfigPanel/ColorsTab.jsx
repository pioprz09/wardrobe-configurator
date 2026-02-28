import React, { useState } from 'react';
import { ColorGroup } from '../UI/ColorSwatch';
import { ALL_COLORS, getColorsByCategory, getColorsByBrand } from '../../data/colors';

const ColorsTab = ({ 
  exteriorColor, setExteriorColor, 
  interiorColor, setInteriorColor, 
  wallColor, setWallColor 
}) => {
  const [colorFilter, setColorFilter] = useState('all'); // all, egger, kronospan
  
  // Filtruj kolory według wybranego filtru
  const getFilteredColors = (category) => {
    const categoryColors = getColorsByCategory(category);
    if (colorFilter === 'all') return categoryColors;
    return categoryColors.filter(color => color.brand.toLowerCase() === colorFilter);
  };

  const naturalColors = getFilteredColors('natural');
  const modernColors = getFilteredColors('modern');
  
  // Sprawdź czy wybrany kolor jest premium (nie biały)
  const isPremiumColor = (colorValue) => {
    return colorValue !== '#F8F8FF' && colorValue !== '#F0F8FF';
  };

  return (
    <div>
      <h3>Wykończenie Zewnętrzne</h3>
      
      {/* Filtry marek */}
      <div className="config-group">
        <label>Marka płyty</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button 
            onClick={() => setColorFilter('all')}
            className={`module-selector button ${colorFilter === 'all' ? 'active' : ''}`}
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px',
              backgroundColor: colorFilter === 'all' ? '#556B58' : '#fff',
              color: colorFilter === 'all' ? '#fff' : '#757575'
            }}
          >
            Wszystkie
          </button>
          <button 
            onClick={() => setColorFilter('egger')}
            className={`module-selector button ${colorFilter === 'egger' ? 'active' : ''}`}
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px',
              backgroundColor: colorFilter === 'egger' ? '#556B58' : '#fff',
              color: colorFilter === 'egger' ? '#fff' : '#757575'
            }}
          >
            EGGER
          </button>
          <button 
            onClick={() => setColorFilter('kronospan')}
            className={`module-selector button ${colorFilter === 'kronospan' ? 'active' : ''}`}
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px',
              backgroundColor: colorFilter === 'kronospan' ? '#556B58' : '#fff',
              color: colorFilter === 'kronospan' ? '#fff' : '#757575'
            }}
          >
            KRONOSPAN
          </button>
        </div>
      </div>

      {/* Kolory naturalne */}
      {naturalColors.length > 0 && (
        <ColorGroup 
          title="Drewno naturalne" 
          colors={naturalColors} 
          selectedColor={exteriorColor} 
          onColorSelect={setExteriorColor} 
        />
      )}
      
      {/* Kolory nowoczesne */}
      {modernColors.length > 0 && (
        <ColorGroup 
          title="Kolory nowoczesne" 
          colors={modernColors} 
          selectedColor={exteriorColor} 
          onColorSelect={setExteriorColor} 
        />
      )}

      {/* Informacja o kolorze premium */}
      {isPremiumColor(exteriorColor) && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#856404',
          marginTop: '10px'
        }}>
          ✨ Kolor premium - dodatkowa opłata 15%
        </div>
      )}

      <hr />

      <h3>Wykończenie Wnętrza</h3>
      
      {/* Kolory wnętrza - naturalne */}
      {naturalColors.length > 0 && (
        <ColorGroup 
          title="Drewno naturalne" 
          colors={naturalColors} 
          selectedColor={interiorColor} 
          onColorSelect={setInteriorColor} 
        />
      )}
      
      {/* Kolory wnętrza - nowoczesne */}
      {modernColors.length > 0 && (
        <ColorGroup 
          title="Kolory nowoczesne" 
          colors={modernColors} 
          selectedColor={interiorColor} 
          onColorSelect={setInteriorColor} 
        />
      )}

      <hr />

      {/* Konfiguracja otoczenia */}
      <h3>Otoczenie</h3>
      <div className="config-group">
        <label>Kolor ściany</label>
        <input 
          type="text" 
          value={wallColor} 
          onChange={(e) => setWallColor(e.target.value)} 
          placeholder="np. #F0EBE5, green, rgb(200,210,220)" 
        />
        <small>
          Wpisz kod koloru (hex, rgb) lub nazwę koloru.<br/>
          Przykłady: #ffffff, rgb(255,255,255), lightgray, beige
        </small>
      </div>

      {/* Szybki wybór kolorów ścian */}
      <div className="config-group">
        <label>Gotowe kolory ścian</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {[
            { name: 'Jasny beż', value: '#F7F5F2' },
            { name: 'Biały', value: '#FFFFFF' },
            { name: 'Szary', value: '#F5F5F5' },
            { name: 'Ciepły beż', value: '#F0EBE5' },
            { name: 'Jasny niebieski', value: '#F0F8FF' },
            { name: 'Miętowy', value: '#F0FFF0' }
          ].map(wallColorOption => (
            <button
              key={wallColorOption.value}
              onClick={() => setWallColor(wallColorOption.value)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: wallColor === wallColorOption.value ? '#556B58' : wallColorOption.value,
                color: wallColor === wallColorOption.value ? '#fff' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {wallColorOption.name}
            </button>
          ))}
        </div>
      </div>

      {/* Podgląd kolorów */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <strong style={{ fontSize: '14px' }}>Podgląd kombinacji:</strong>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginTop: '10px',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '30px',
              height: '30px',
              backgroundColor: exteriorColor,
              border: '2px solid #ddd',
              borderRadius: '4px',
              marginBottom: '5px'
            }} />
            <div style={{ fontSize: '10px', color: '#666' }}>Zewnętrze</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '30px',
              height: '30px',
              backgroundColor: interiorColor,
              border: '2px solid #ddd',
              borderRadius: '4px',
              marginBottom: '5px'
            }} />
            <div style={{ fontSize: '10px', color: '#666' }}>Wnętrze</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '30px',
              height: '30px',
              backgroundColor: wallColor,
              border: '2px solid #ddd',
              borderRadius: '4px',
              marginBottom: '5px'
            }} />
            <div style={{ fontSize: '10px', color: '#666' }}>Ściana</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorsTab;
