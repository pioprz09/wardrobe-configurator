import React, { useState, useEffect } from 'react';
import WardrobeViewer from './components/WardrobeViewer';
import ConfigPanel from './components/ConfigPanel';
import { DEFAULT_COLORS } from './data/colors';
import { getModuleCountRange, validateModuleConfiguration, calculatePrice, isHeightAvailable } from './data/constants';
import { REGAL_IDS, MODULE_WIDTH_MIN, MODULE_WIDTH_MAX, BENCH_BLENDA_THICKNESS } from './data/moduleTypes';
import { computeInnerDimensions } from './utils/blendaUtils';

const THICKNESS = 18;

function App() {
  const [width, setWidth] = useState(2200);
  const [height, setHeight] = useState(2400);
  const [depth, setDepth] = useState(600);
  const [baseModuleHeight, setBaseModuleHeight] = useState(2000);

  const [exteriorColor, setExteriorColor] = useState(DEFAULT_COLORS.exterior);
  const [interiorColor, setInteriorColor] = useState(DEFAULT_COLORS.interior);
  const [wallColor, setWallColor] = useState(DEFAULT_COLORS.wall);

  const [sideBlendaLeft, setSideBlendaLeft] = useState('none');
  const [sideBlendaRight, setSideBlendaRight] = useState('none');
  const [topBlenda, setTopBlenda] = useState('none');
  const [blenda, setBlenda] = useState('none');
  const blendaWidth = 18;

  const [numModules, setNumModules] = useState(3);
  const [widthMode, setWidthMode] = useState('equal');

  const [handleType, setHandleType] = useState('none');
  const [edgeHandleLength, setEdgeHandleLength] = useState(900);
  const [barHandleLength, setBarHandleLength] = useState(900);
  const [drawerHandleLength, setDrawerHandleLength] = useState(160);
  const [handleHeightMm, setHandleHeightMm] = useState(1200);
  const [benchDrawerEdgeLength, setBenchDrawerEdgeLength] = useState(400);
  const [benchDrawerBarLength, setBenchDrawerBarLength] = useState(400);
  const [handleColor, setHandleColor] = useState('black');

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

  const [blendaCollisionLeft, setBlendaCollisionLeft] = useState(false);
  const [blendaCollisionRight, setBlendaCollisionRight] = useState(false);

  const firstIs30L = modules.length > 0 && modules[0]?.id === 'mod30L';
  const lastIs30P  = modules.length > 0 && modules[modules.length - 1]?.id === 'mod30P';
  const benchBlendaLeft  = firstIs30L ? BENCH_BLENDA_THICKNESS : 0;
  const benchBlendaRight = lastIs30P  ? BENCH_BLENDA_THICKNESS : 0;

  const effectiveSideLeft  = firstIs30L ? `full-${BENCH_BLENDA_THICKNESS}` : sideBlendaLeft;
  const effectiveSideRight = lastIs30P  ? `full-${BENCH_BLENDA_THICKNESS}` : sideBlendaRight;

  const dims = computeInnerDimensions({
    outerWidthMm:  width,
    outerHeightMm: height,
    sideLeft:  effectiveSideLeft,
    sideRight: effectiveSideRight,
    top:       topBlenda,
  });
  const effectiveWidthForModules = dims.innerWidthMm;

  useEffect(() => {
    if (modules.length === 0) return;
    if (firstIs30L && sideBlendaLeft !== 'none') {
      setSideBlendaLeft('none');
      setBlendaCollisionLeft(true);
    }
    if (lastIs30P && sideBlendaRight !== 'none') {
      setSideBlendaRight('none');
      setBlendaCollisionRight(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules]);

  useEffect(() => {
    if (height > baseModuleHeight && height < baseModuleHeight + 200) setHeight(baseModuleHeight);
    if (!isHeightAvailable(height)) setHeight(height < 2350 ? baseModuleHeight : 2400);
    if (height < baseModuleHeight) setHeight(baseModuleHeight);
  }, [height, baseModuleHeight]);

  useEffect(() => {
    const range = getModuleCountRange(effectiveWidthForModules, blenda, blendaWidth);
    setModuleCountRange(range);
    if (numModules < range.min) setNumModules(range.min);
    if (numModules > range.max) setNumModules(range.max);
  }, [effectiveWidthForModules, blenda, numModules]);

  const recalcWidths = (mods) => {
    const n = mods.length;
    if (n === 0) return mods;
    const nHalf = widthMode === 'equal' ? 0 : mods.filter((m) => m.halfWidth).length;
    const nFull = n - nHalf;
    const totalSlotSpace = effectiveWidthForModules - (n + 1) * THICKNESS;
    const denom = nFull + nHalf * 0.5;
    const W = denom > 0 ? totalSlotSpace / denom : 0;
    const result = mods.map((m) => ({
      ...m,
      halfWidth: widthMode === 'equal' ? false : (m.halfWidth || false),
      width: (widthMode === 'equal' ? false : m.halfWidth) ? W / 2 : W,
    }));
    const isValid =
      result.every((m) => m.width >= MODULE_WIDTH_MIN && m.width <= MODULE_WIDTH_MAX) &&
      validateModuleConfiguration(result.map((m) => m.width));
    setIsConfigurationValid(isValid);
    return result;
  };

  useEffect(() => {
    setModules((cur) => {
      const next = Array.from({ length: numModules }, (_, i) =>
        cur[i] ? { ...cur[i] } : { id: 'mod1', width: 0, hinge: 'left', halfWidth: false }
      );
      return recalcWidths(next);
    });
    if (activeModuleIndex >= numModules) setActiveModuleIndex(Math.max(0, numModules - 1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveWidthForModules, numModules, widthMode]);

  const moduleKey = modules.map((m) => `${m?.id}:${m?.halfWidth ? 'h' : 'f'}`).join(',');
  useEffect(() => {
    if (modules.length === 0) return;
    setModules((cur) => recalcWidths(cur));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey, effectiveWidthForModules]);

  useEffect(() => {
    setPrice(calculatePrice(width, height, depth, modules, exteriorColor, handleType, numModules));
  }, [width, height, depth, modules, exteriorColor, handleType, numModules]);

  const handleModuleTypeChange = (index, newId) =>
    setModules((prev) => prev.map((m, i) => i === index ? { ...m, id: newId } : m));

  const handleHingeChange = (index, hinge) =>
    setModules((prev) => prev.map((m, i) => i === index ? { ...m, hinge } : m));

  const handleHalfWidthToggle = (index) =>
    setModules((prev) => prev.map((m, i) => i === index ? { ...m, halfWidth: !m.halfWidth } : m));

  const handleSetAllEqual = () => {
    setWidthMode('equal');
    setModules((prev) => prev.map((m) => ({ ...m, halfWidth: false })));
  };

  return (
    <div className="app-container">
      <div className="viewer-area">
        <WardrobeViewer
          width={width} height={height} depth={depth} baseModuleHeight={baseModuleHeight}
          exteriorColor={exteriorColor} interiorColor={interiorColor}
          blenda={blenda} blendaWidth={blendaWidth}
          sideBlendaLeft={effectiveSideLeft} sideBlendaRight={effectiveSideRight} topBlenda={topBlenda}
          benchBlendaLeft={benchBlendaLeft} benchBlendaRight={benchBlendaRight}
          modules={modules} isViewOpen={isViewOpen}
          activeModuleIndex={activeModuleIndex} onModuleClick={setActiveModuleIndex}
          wallColor={wallColor} onViewChange={setIsViewOpen}
          handleType={handleType} hoveredModuleIndex={hoveredModuleIndex}
          setHoveredModuleIndex={setHoveredModuleIndex} viewMode={viewMode}
          onViewModeChange={(m) => { setViewMode(m); setHoveredModuleIndex(null); }}
          edgeHandleLength={edgeHandleLength} barHandleLength={barHandleLength}
          drawerHandleLength={drawerHandleLength} handleColor={handleColor}
          handleHeightMm={handleHeightMm}
          benchDrawerEdgeLength={benchDrawerEdgeLength}
          benchDrawerBarLength={benchDrawerBarLength}
        />
      </div>
      <div className="config-panel-area">
        <ConfigPanel
          width={width} setWidth={setWidth} height={height} setHeight={setHeight}
          depth={depth} setDepth={setDepth}
          baseModuleHeight={baseModuleHeight} setBaseModuleHeight={setBaseModuleHeight}
          exteriorColor={exteriorColor} setExteriorColor={setExteriorColor}
          interiorColor={interiorColor} setInteriorColor={setInteriorColor}
          wallColor={wallColor} setWallColor={setWallColor}
          blenda={blenda} setBlenda={setBlenda}
          sideBlendaLeft={sideBlendaLeft} setSideBlendaLeft={setSideBlendaLeft}
          sideBlendaRight={sideBlendaRight} setSideBlendaRight={setSideBlendaRight}
          topBlenda={topBlenda} setTopBlenda={setTopBlenda}
          benchBlendaLeft={!!benchBlendaLeft} benchBlendaRight={!!benchBlendaRight}
          numModules={numModules} setNumModules={setNumModules}
          moduleCountRange={moduleCountRange}
          widthMode={widthMode} setWidthMode={setWidthMode}
          onSetAllEqual={handleSetAllEqual} onHalfWidthToggle={handleHalfWidthToggle}
          handleType={handleType} setHandleType={setHandleType}
          handleColor={handleColor} setHandleColor={setHandleColor}
          edgeHandleLength={edgeHandleLength} setEdgeHandleLength={setEdgeHandleLength}
          barHandleLength={barHandleLength} setBarHandleLength={setBarHandleLength}
          drawerHandleLength={drawerHandleLength} setDrawerHandleLength={setDrawerHandleLength}
          handleHeightMm={handleHeightMm} setHandleHeightMm={setHandleHeightMm}
          benchDrawerEdgeLength={benchDrawerEdgeLength} setBenchDrawerEdgeLength={setBenchDrawerEdgeLength}
          benchDrawerBarLength={benchDrawerBarLength} setBenchDrawerBarLength={setBenchDrawerBarLength}
          modules={modules}
          onModuleTypeChange={handleModuleTypeChange} onHingeChange={handleHingeChange}
          isValid={isConfigurationValid}
          activeModuleIndex={activeModuleIndex} onModuleClick={setActiveModuleIndex}
          price={price}
          ledEnabled={ledEnabled} setLedEnabled={setLedEnabled}
          handleReference={handleReference} setHandleReference={setHandleReference}
          orderNotes={orderNotes} setOrderNotes={setOrderNotes}
          otherNotes={otherNotes} setOtherNotes={setOtherNotes}
          blendaCollisionLeft={blendaCollisionLeft} blendaCollisionRight={blendaCollisionRight}
        />
      </div>
    </div>
  );
}

export default App;