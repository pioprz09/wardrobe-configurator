import React, { useState, useEffect } from 'react';
import WardrobeViewer from './components/WardrobeViewer';
import ConfigPanel from './components/ConfigPanel';
import { DEFAULT_COLORS } from './data/colors';
import {
  getModuleCountRange,
  calculateModuleWidths,
  validateModuleConfiguration,
  calculatePrice,
  isHeightAvailable
} from './data/constants';

import { computeInnerDimensions } from './utils/blendaUtils';

function App() {
  const [width, setWidth] = useState(2200);
  const [height, setHeight] = useState(2400);
  const [depth, setDepth] = useState(600);
  const [baseModuleHeight, setBaseModuleHeight] = useState(2000);

  const [exteriorColor, setExteriorColor] = useState(DEFAULT_COLORS.exterior);
  const [interiorColor, setInteriorColor] = useState(DEFAULT_COLORS.interior);
  const [wallColor, setWallColor] = useState(DEFAULT_COLORS.wall);

  // ✅ NOWE: blendy osobno (lewa/prawa/górna)
  // teraz obsługujemy wartości typu: none | strip-18 | strip-36 | strip-50 | full-18 | full-36 | full-50
  // oraz legacy: none | 100 | full
  const [sideBlendaLeft, setSideBlendaLeft] = useState('none');
  const [sideBlendaRight, setSideBlendaRight] = useState('none');
  // top: none | mask100-18/36/50 | full-18/36/50 oraz legacy: none | 100 | full
  const [topBlenda, setTopBlenda] = useState('none');

  // legacy blenda/blendaWidth zostawiamy dla kompatybilności starych funkcji,
  // ale realne zmniejszenie szerokości modułów robimy przez innerWidth.
  const [blenda, setBlenda] = useState('none');
  const blendaWidth = 18;

  const [numModules, setNumModules] = useState(3);
  const [distribution, setDistribution] = useState('equal');

  // uchwyty
  const [handleType, setHandleType] = useState('none');

  // parametry uchwytów
  const [edgeHandleLength, setEdgeHandleLength] = useState(900);
  const [barHandleLength, setBarHandleLength] = useState(900);

  // ✅ NOWE: kolor uchwytu
  const [handleColor, setHandleColor] = useState('black');

  // LED i uwagi
  const [ledEnabled, setLedEnabled] = useState(false);
  const [handleReference, setHandleReference] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [otherNotes, setOtherNotes] = useState('');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState('3d');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [hoveredModuleIndex, setHoveredModuleIndex] = useState(null);

  const [modules, setModules] = useState([]);
  const [isConfigurationValid, setIsConfigurationValid] = useState(true);
  const [moduleCountRange, setModuleCountRange] = useState({ min: 1, max: 5 });
  const [price, setPrice] = useState(0);

  // ✅ WYLICZONE: wymiary wewnętrzne po blendach
  const dims = computeInnerDimensions({
    outerWidthMm: width,
    outerHeightMm: height,
    sideLeft: sideBlendaLeft,
    sideRight: sideBlendaRight,
    top: topBlenda
  });

  const effectiveWidthForModules = dims.innerWidthMm;

  useEffect(() => {
    if (height > baseModuleHeight && height < baseModuleHeight + 200) {
      setHeight(baseModuleHeight);
    }

    if (!isHeightAvailable(height)) {
      if (height < 2350) setHeight(baseModuleHeight);
      else setHeight(2400);
    }

    if (height < baseModuleHeight) {
      setHeight(baseModuleHeight);
    }
  }, [height, baseModuleHeight]);

  // ✅ UWAGA: zakres modułów liczymy od szerokości WEWNĘTRZNEJ (po blendach)
  useEffect(() => {
    const range = getModuleCountRange(effectiveWidthForModules, blenda, blendaWidth);
    setModuleCountRange(range);

    if (numModules < range.min) setNumModules(range.min);
    if (numModules > range.max) setNumModules(range.max);
  }, [effectiveWidthForModules, blenda, numModules]);

  // ✅ szerokości modułów liczymy od szerokości WEWNĘTRZNEJ (po blendach)
  useEffect(() => {
    const moduleWidths = calculateModuleWidths(
      effectiveWidthForModules,
      numModules,
      distribution,
      blenda,
      blendaWidth
    );

    const isValid = validateModuleConfiguration(moduleWidths);
    setIsConfigurationValid(isValid);

    setModules((currentModules) => {
      const newModules = Array.from({ length: numModules }, (_, i) =>
        currentModules[i] || { id: 'mod1', width: 0, hinge: 'left' }
      );

      return newModules.map((mod, i) => ({ ...mod, width: moduleWidths[i] || 0 }));
    });

    if (activeModuleIndex >= numModules) {
      setActiveModuleIndex(Math.max(0, numModules - 1));
    }
  }, [effectiveWidthForModules, numModules, distribution, blenda, blendaWidth, activeModuleIndex]);

  useEffect(() => {
    // Cena: na razie zostawiam outer width/height/depth jak było (żeby nie zmienić logiki wyceny bez ustaleń).
    const calculatedPrice = calculatePrice(width, height, depth, modules, exteriorColor, handleType, numModules);
    setPrice(calculatedPrice);
  }, [width, height, depth, modules, exteriorColor, handleType, numModules]);

  const handleModuleTypeChange = (index, newId) => {
    const newModules = [...modules];
    if (newModules[index]) {
      newModules[index].id = newId;
      setModules(newModules);
    }
  };

  const handleHingeChange = (index, newHingeSide) => {
    const newModules = [...modules];
    if (newModules[index]) {
      newModules[index].hinge = newHingeSide;
      setModules(newModules);
    }
  };

  const handleModuleClick = (index) => setActiveModuleIndex(index);

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    setHoveredModuleIndex(null);
  };

  return (
    <div className="app-container">
      <div className="viewer-area">
        <WardrobeViewer
          width={width}
          height={height}
          depth={depth}
          baseModuleHeight={baseModuleHeight}
          exteriorColor={exteriorColor}
          interiorColor={interiorColor}

          // legacy:
          blenda={blenda}
          blendaWidth={blendaWidth}

          // ✅ nowe:
          sideBlendaLeft={sideBlendaLeft}
          sideBlendaRight={sideBlendaRight}
          topBlenda={topBlenda}

          modules={modules}
          isViewOpen={isViewOpen}
          activeModuleIndex={activeModuleIndex}
          onModuleClick={handleModuleClick}
          wallColor={wallColor}
          onViewChange={setIsViewOpen}
          handleType={handleType}
          hoveredModuleIndex={hoveredModuleIndex}
          setHoveredModuleIndex={setHoveredModuleIndex}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          edgeHandleLength={edgeHandleLength}
          barHandleLength={barHandleLength}
          handleColor={handleColor}
        />
      </div>

      <div className="config-panel-area">
        <ConfigPanel
          width={width} setWidth={setWidth}
          height={height} setHeight={setHeight}
          depth={depth} setDepth={setDepth}
          baseModuleHeight={baseModuleHeight} setBaseModuleHeight={setBaseModuleHeight}

          exteriorColor={exteriorColor} setExteriorColor={setExteriorColor}
          interiorColor={interiorColor} setInteriorColor={setInteriorColor}
          wallColor={wallColor} setWallColor={setWallColor}

          // legacy:
          blenda={blenda} setBlenda={setBlenda}

          // ✅ nowe (TO BYŁO POPRAWNE W APP, ale GeneralInfoTab miało inne nazwy):
          sideBlendaLeft={sideBlendaLeft} setSideBlendaLeft={setSideBlendaLeft}
          sideBlendaRight={sideBlendaRight} setSideBlendaRight={setSideBlendaRight}
          topBlenda={topBlenda} setTopBlenda={setTopBlenda}

          numModules={numModules} setNumModules={setNumModules}
          distribution={distribution} setDistribution={setDistribution}
          handleType={handleType} setHandleType={setHandleType}

          handleColor={handleColor}
          setHandleColor={setHandleColor}

          modules={modules}
          onModuleTypeChange={handleModuleTypeChange}
          onHingeChange={handleHingeChange}

          isValid={isConfigurationValid}
          activeModuleIndex={activeModuleIndex}
          onModuleClick={handleModuleClick}
          moduleCountRange={moduleCountRange}
          price={price}

          edgeHandleLength={edgeHandleLength}
          setEdgeHandleLength={setEdgeHandleLength}
          barHandleLength={barHandleLength}
          setBarHandleLength={setBarHandleLength}

          ledEnabled={ledEnabled}
          setLedEnabled={setLedEnabled}

          handleReference={handleReference}
          setHandleReference={setHandleReference}

          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}

          otherNotes={otherNotes}
          setOtherNotes={setOtherNotes}
        />
      </div>
    </div>
  );
}

export default App;
