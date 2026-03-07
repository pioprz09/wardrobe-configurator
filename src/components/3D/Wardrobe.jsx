import React, { useMemo } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import Plank from './Plank';
import Drawer from './Drawer';
import Handle from './Handle';
import AnimatedDoor from './AnimatedDoor';
import { WARDROBE_CONSTANTS } from '../../data/constants';
import { getBlendThicknessMm, getSideBlendDepthMm, getTopBlendDepthMm } from '../../utils/blendaUtils';

// Wysunięcie frontu szuflady TYLKO dla modułów bench/przedpokój
const BenchFrontSlide = ({ isHov, slideZ, children }) => {
  const { posZ } = useSpring({
    to: { posZ: isHov ? slideZ : 0 },
    config: { mass: 2, tension: 280, friction: 60 }
  });
  const pos = posZ.to(z => [0, 0, z]);
  return <animated.group position={pos}>{children}</animated.group>;
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const REGAL_IDS    = ['mod25', 'mod26'];
const BENCH_IDS    = ['mod30L', 'mod30P', 'mod31', 'mod32'];
const BENCH_SEAT_H = 500;  // górna płaszczyzna siedziska = 500mm od podłogi
const BENCH_BL     = 18;   // grubość wbudowanej blendy ławki

const Wardrobe = ({
  width = 2200,
  height = 2400,
  depth = 600,
  interiorColor = '#F8F8FF',
  exteriorColor = '#D2B48C',
  blenda = 'none',
  blendaWidth = 18,
  sideBlendaLeft  = undefined,
  sideBlendaRight = undefined,
  topBlenda       = undefined,
  benchBlendaLeft  = 0,
  benchBlendaRight = 0,
  modules = [],
  isViewOpen = false,
  activeModuleIndex = 0,
  onModuleClick = () => {},
  handleType = 'none',
  hoveredModuleIndex = null,
  setHoveredModuleIndex = () => {},
  viewMode = '3d',
  baseModuleHeight = 2000,
  edgeHandleLength   = 800,
  barHandleLength    = 800,
  handleHeightMm      = 1200,
  drawerHandleLength = 160,
  benchDrawerEdgeLength = 400,
  benchDrawerBarLength  = 400,
  handleColor = 'black',
}) => {
  const {
    THICKNESS,
    PLINTH_HEIGHT,
    FRONT_GAP,
    FRONT_DOOR_GAP,
    DRAWER_SIDE_GAP,
    RAIL_OFFSET_FROM_TOP,
    DOUBLE_DOOR_THRESHOLD,
  } = WARDROBE_CONSTANTS;

  const CORPUS_DEPTH = depth - THICKNESS - FRONT_GAP;

  const intMat = useMemo(() => ({
    color: interiorColor, side: THREE.FrontSide,
    transparent: false, opacity: 1, roughness: 0.9, metalness: 0.1,
  }), [interiorColor]);

  const extMat = useMemo(() => ({
    color: exteriorColor, side: THREE.FrontSide,
    transparent: false, opacity: 1, roughness: 0.7, metalness: 0.1,
  }), [exteriorColor]);

  // ── BLENDY ───────────────────────────────────────────────────────────────
  const resolveLegacySide = (side) => {
    if (blenda === 'both') return `full-${blendaWidth}`;
    if (blenda === side)   return `full-${blendaWidth}`;
    return 'none';
  };
  const leftValue  = sideBlendaLeft  ?? resolveLegacySide('left');
  const rightValue = sideBlendaRight ?? resolveLegacySide('right');
  const topValue   = topBlenda ?? 'none';

  const leftThickness  = getBlendThicknessMm(leftValue);
  const rightThickness = getBlendThicknessMm(rightValue);
  const topThickness   = getBlendThicknessMm(topValue);
  const leftDepth      = getSideBlendDepthMm(leftValue, depth);
  const rightDepth     = getSideBlendDepthMm(rightValue, depth);
  const topDepth       = getTopBlendDepthMm(topValue, depth);

  const zFromFront = (d) => depth / 2 - d / 2;

  const firstIs30L = modules.length > 0 && modules[0]?.id === 'mod30L';
  const lastIs30P  = modules.length > 0 && modules[modules.length - 1]?.id === 'mod30P';

  // Korpus zawsze: pełna szerokość minus blendy boczne
  // Gdy bench na krawędzi: blenda nie jest rysowana, więc eff* = 0,
  // ale carcassWidth MUSI być spójne z sumą slotów (nie zmieniamy go dla bench)
  const effLeftThick  = firstIs30L ? 0 : leftThickness;
  const effRightThick = lastIs30P  ? 0 : rightThickness;
  const carcassWidth   = width - leftThickness - rightThickness;
  const carcassHeight  = height - topThickness;
  const carcassYOffset = -topThickness / 2;
  const carcassStartX  = -width / 2 + leftThickness;

  const totalInternalWidth = modules.reduce((s, m) => s + m.width, 0);
  const hasNadstawka = carcassHeight > baseModuleHeight;

  // ── UCHWYTY ──────────────────────────────────────────────────────────────
  const hHgt    = clamp(Number(handleHeightMm) || 1200, 100, 2200);
  // Dla krawędziowego: góra uchwytu = hHgt; dla podłużnego: góra uchwytu = hHgt + 50mm
  const EDGE_TOP_MM = hHgt;
  const BAR_TOP_MM  = hHgt + 50;
  const edgeLen = clamp(Number(edgeHandleLength)   || 800,  60, 1200);
  const barLen  = clamp(Number(barHandleLength)    || 800,  60, 1200);
  const drwLen       = clamp(Number(drawerHandleLength)    || 160, 30, 600);
  const benchEdgeLen = clamp(Number(benchDrawerEdgeLength) || 400, 30, 800);
  const benchBarLen  = clamp(Number(benchDrawerBarLength)  || 400, 30, 800);
  const INSET_TOWARD_HINGE_MM = 30;

  // hHgt = mm od podłogi do górnej krawędzi uchwytu
  // Y w 3D: dół korpusu = -carcassHeight/2, góra = +carcassHeight/2
  // środek uchwytu Y = -carcassHeight/2 + hHgt - lengthMm/2
  const handleCenterY = (fromFloorMm, lengthMm) => -carcassHeight / 2 + fromFloorMm - lengthMm / 2;
  const getHandleY = () => {
    if (handleType === 'edge') return handleCenterY(EDGE_TOP_MM, edgeLen);
    if (handleType === 'bar')  return handleCenterY(BAR_TOP_MM,  barLen);
    return handleCenterY(hHgt, 0);  // knob: środek na hHgt od podłogi
  };
  const getHandleLength = () => {
    if (handleType === 'edge') return edgeLen;
    if (handleType === 'bar')  return barLen;
    return 200;
  };
  const handleXOnFreeEdge = (hinge, lw) => hinge === 'left' ? lw / 2 : -(lw / 2);
  const insetTowardHinge  = (hinge) => hinge === 'left' ? -INSET_TOWARD_HINGE_MM : INSET_TOWARD_HINGE_MM;
  const getHandleZ = () => THICKNESS / 2;
  const placeHandleX = (hinge, lw) => {
    const fe = handleXOnFreeEdge(hinge, lw);
    if (handleType === 'edge') return fe;
    if (handleType === 'bar' || handleType === 'knob') return fe + insetTowardHinge(hinge);
    return fe;
  };
  const drawerHandlePos = (fCY, frontH) => {
    if (handleType === 'edge') return [0, fCY + frontH / 2 - drwLen / 2, getHandleZ()];
    return [0, fCY, getHandleZ()];
  };

  // ── WNĘTRZA MODUŁÓW ──────────────────────────────────────────────────────
  const render3DInternals = (module, mW, isHov) => {
    const isRegal = REGAL_IDS.includes(module.id);
    const modBot  = isRegal ? THICKNESS : (PLINTH_HEIGHT + THICKNESS);
    const basTop  = baseModuleHeight;
    const shD     = CORPUS_DEPTH - 8;
    const shA     = [mW, THICKNESS, shD];
    const hT      = THICKNESS / 2;

    const drawStack = (heights, startY, gap = 50) => {
      const base = startY !== undefined ? startY : modBot;
      let elems = [], cum = 0;
      heights.forEach((h, i) => {
        elems.push(
          <Drawer key={`d${i}`}
            position={[0, base + cum + h / 2, 0]}
            height={h} width={mW - DRAWER_SIDE_GAP * 2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={isHov} />
        );
        cum += h;
        if (i < heights.length - 1) cum += gap;
      });
      const sy = base + cum + hT;
      return {
        drawers:     <>{elems}</>,
        shelfAbove:  <Plank key="sa" position={[0, sy, 0]} args={shA} materialProps={intMat} />,
        shelfAboveY: sy,
      };
    };

    const shStack = (n, y0, y1) => {
      if (n <= 0 || y1 <= y0) return null;
      const step = (y1 - y0) / (n + 1);
      return <>{Array.from({ length: n }, (_, i) => (
        <Plank key={i} position={[0, y0 + step * (i + 1), 0]} args={shA} materialProps={intMat} />
      ))}</>;
    };

    const rail = <Plank key="rail" position={[0, basTop - RAIL_OFFSET_FROM_TOP, 0]}
      args={[mW, 30, 15]} materialProps={{ color: '#444', metalness: 0.7, roughness: 0.3 }} />;

    const pY = (y) => {
      const bot = PLINTH_HEIGHT + THICKNESS;
      return bot + ((y - bot) / (2000 - bot)) * (basTop - bot);
    };

    // ── Formuła wysokości frontu szuflady ławki ──────────────────────────
    // Układ: PH | 3mm | front1 | 3mm | front2 = BENCH_SEAT_H
    // => 2×frontH = BENCH_SEAT_H - PH - 6  =>  frontH = (BENCH_SEAT_H - PH - 6) / 2
    const benchFrontH = (BENCH_SEAT_H - PLINTH_HEIGHT - 6) / 2;

    switch (module.id) {
      case 'mod1': return rail;

      case 'mod2': {
        const lrY = modBot + (basTop - modBot) * 0.48;
        return <>{rail}
          <Plank key="lr" position={[0, lrY, 0]} args={[mW, 30, 15]}
            materialProps={{ color: '#444', metalness: 0.7, roughness: 0.3 }} />
          <Plank key="hs" position={[0, lrY + 90, -(CORPUS_DEPTH - 8) / 4]}
            args={[mW, THICKNESS, (CORPUS_DEPTH - 8) / 2]} materialProps={intMat} />
        </>;
      }

      case 'mod3': return <>{rail}
        <Plank position={[0, modBot + 320, 0]} args={shA} materialProps={intMat} /></>;

      case 'mod4': return <>{rail}
        <Plank position={[0, pY(418), 0]} args={shA} materialProps={intMat} />
        <Plank position={[0, pY(718), 0]} args={shA} materialProps={intMat} /></>;

      case 'mod5': return <>{rail}
        <Plank position={[0, pY(368), 0]} args={shA} materialProps={intMat} />
        <Plank position={[0, pY(618), 0]} args={shA} materialProps={intMat} />
        <Plank position={[0, pY(868), 0]} args={shA} materialProps={intMat} /></>;

      case 'mod6':  { const r = drawStack([200]);                   return <>{rail}{r.drawers}{r.shelfAbove}</>; }
      case 'mod7':  { const r = drawStack([200,200]);               return <>{rail}{r.drawers}{r.shelfAbove}</>; }
      case 'mod8':  { const r = drawStack([200,200,200]);           return <>{rail}{r.drawers}{r.shelfAbove}</>; }
      case 'mod9':  { const r = drawStack([110,110]);               return <>{rail}{r.drawers}{r.shelfAbove}</>; }
      case 'mod10': { const r = drawStack([110,110,110]);           return <>{rail}{r.drawers}{r.shelfAbove}</>; }
      case 'mod11': { const r = drawStack([110,110,110,110]);       return <>{rail}{r.drawers}{r.shelfAbove}</>; }
      case 'mod12': { const r = drawStack([110,110,110,110,110]);   return <>{rail}{r.drawers}{r.shelfAbove}</>; }

      case 'mod13': return shStack(3, modBot, basTop - THICKNESS);

      case 'mod14': {
        const sy = modBot + 320;
        const r  = drawStack([200, 200], sy + THICKNESS + 50);
        return <>{rail}
          <Plank position={[0, sy, 0]} args={shA} materialProps={intMat} />
          {r.drawers}{r.shelfAbove}</>;
      }

      case 'mod15': { const r = drawStack([200]);
        return <>{r.drawers}{r.shelfAbove}{shStack(3, r.shelfAboveY + hT, basTop - THICKNESS)}</>; }
      case 'mod16': { const r = drawStack([200,200]);
        return <>{r.drawers}{r.shelfAbove}{shStack(3, r.shelfAboveY + hT, basTop - THICKNESS)}</>; }
      case 'mod17': { const r = drawStack([200,200,200]);
        return <>{r.drawers}{r.shelfAbove}{shStack(2, r.shelfAboveY + hT, basTop - THICKNESS)}</>; }
      case 'mod18': { const r = drawStack([110,110,110,110,110,110]);
        return <>{r.drawers}{r.shelfAbove}{shStack(2, r.shelfAboveY + hT, basTop - THICKNESS)}</>; }
      case 'mod19': { const r = drawStack([110,110,110,110,110]);
        return <>{r.drawers}{r.shelfAbove}{shStack(2, r.shelfAboveY + hT, basTop - THICKNESS)}</>; }

      case 'mod20': return shStack(5, modBot, basTop - THICKNESS);
      case 'mod21': return shStack(6, modBot, basTop - THICKNESS);
      case 'mod22': return shStack(4, modBot, basTop - THICKNESS);

      case 'mod23': {
        const divX = -mW * 0.12;
        const divH = basTop - modBot;
        const rW   = mW / 2 - hT + mW * 0.12;
        const rCX  = divX + hT + rW / 2;
        return <>
          <Plank position={[divX, modBot + divH / 2, 0]}
            args={[THICKNESS, divH, shD]} materialProps={intMat} />
          {[1,2,3,4].map(i => (
            <Plank key={i} position={[rCX, modBot + divH / 5 * i, 0]}
              args={[rW, THICKNESS, shD]} materialProps={intMat} />
          ))}
        </>;
      }

      case 'mod24': {
        const hY   = basTop - 300;
        const divH = hY - modBot;
        return <>
          <Plank position={[0, hY, 0]} args={shA} materialProps={intMat} />
          <Plank position={[0, modBot + divH / 2, 0]}
            args={[THICKNESS, divH, shD]} materialProps={intMat} />
        </>;
      }

      case 'mod25': {
        return <>{shStack(4, modBot, basTop - THICKNESS)}</>;
      }

      case 'mod26': {
        const s1  = modBot + 320;
        const r   = drawStack([200], s1 + THICKNESS + 320);
        return <>
          <Plank position={[0, s1, 0]} args={shA} materialProps={intMat} />
          {r.drawers}{r.shelfAbove}{shStack(3, r.shelfAboveY + hT, basTop - THICKNESS)}
        </>;
      }

      case 'mod29': {
        const frontTopY = 800;
        const midShelfY = (modBot + frontTopY) / 2;
        return <>
          <Plank position={[0, midShelfY, 0]} args={shA} materialProps={intMat} />
          <Plank position={[0, frontTopY - hT, 0]} args={shA} materialProps={intMat} />
          {shStack(2, frontTopY, basTop - THICKNESS)}
        </>;
      }

      // ── mod30L — ławka lewa krawędź ──────────────────────────────────────
      // SIEDZISKO (z Doc2): rozszerzone o BENCH_BL=18mm w lewo (zakryte blendą)
      //   seatW  = mW + 18mm  (pełna szerokość łącznie z blendą)
      //   seatOffX = -9mm     (środek siedziska przesuniętyw lewo)
      //   seatCY = BENCH_SEAT_H - hT  (góra = dokładnie 500mm)
      // SZUFLADY (z Doc1): pozycje z benchFrontH i 3mm szczelin
      case 'mod30L': {
        // Siedzisko — pełna szerokość slotu: dociera do wewnętrznej ściany obu boków
        const seatOffX = 0;
        const seatW    = mW;
        const seatCY   = BENCH_SEAT_H - hT;            // góra siedziska = 500mm

        // Szuflady — z Doc1: pozycje z 3mm szczelin, góra f2 zlicowana z siedziskiem
        const d1CY = PLINTH_HEIGHT + 3 + benchFrontH / 2;
        const d2CY = BENCH_SEAT_H - THICKNESS - benchFrontH / 2;

        return <>
          <Plank position={[seatOffX, seatCY, 0]}
            args={[seatW, THICKNESS, shD]} materialProps={intMat} />
          <Drawer key="d1" position={[0, d1CY, 0]}
            height={benchFrontH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={false} />
          <Drawer key="d2" position={[0, d2CY, 0]}
            height={benchFrontH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={isHov} />
        </>;
      }

      // ── mod30P — ławka prawa krawędź ─────────────────────────────────────
      // SIEDZISKO (z Doc2): rozszerzone o BENCH_BL=18mm w prawo (zakryte blendą)
      //   seatOffX = +9mm (środek przesuniętyw prawo)
      // SZUFLADY (z Doc1): identyczne formuły
      case 'mod30P': {
        // Siedzisko — rozszerzone w prawo o THICKNESS: dociera do wewnętrznej ściany extMat boku
        // (symetria do 30L gdzie slot zaczyna się dokładnie przy wewnętrznej ścianie lewego boku)
        const seatOffX = THICKNESS / 2;
        const seatW    = mW + THICKNESS;
        const seatCY   = BENCH_SEAT_H - hT;

        const d1CY = PLINTH_HEIGHT + 3 + benchFrontH / 2;
        const d2CY = BENCH_SEAT_H - THICKNESS - benchFrontH / 2;

        return <>
          <Plank position={[seatOffX, seatCY, 0]}
            args={[seatW, THICKNESS, shD]} materialProps={intMat} />
          <Drawer key="d1" position={[0, d1CY, 0]}
            height={benchFrontH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={false} />
          <Drawer key="d2" position={[0, d2CY, 0]}
            height={benchFrontH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={isHov} />
        </>;
      }

      // ── mod31 — ławka środkowa (2 szuflady, oba boki) ────────────────────
      case 'mod31': {
        const seatCY  = BENCH_SEAT_H - hT;
        const sideH   = basTop - BENCH_SEAT_H;
        const d1CY    = PLINTH_HEIGHT + 3 + benchFrontH / 2;
        const d2CY    = BENCH_SEAT_H - THICKNESS - benchFrontH / 2;
        return <>
          <Plank position={[0, seatCY, 0]} args={shA} materialProps={intMat} />
          <Plank position={[-mW/2+hT, BENCH_SEAT_H + sideH/2, 0]}
            args={[THICKNESS, sideH, CORPUS_DEPTH]} materialProps={intMat} />
          <Plank position={[ mW/2-hT, BENCH_SEAT_H + sideH/2, 0]}
            args={[THICKNESS, sideH, CORPUS_DEPTH]} materialProps={intMat} />
          <Drawer key="d1" position={[0, d1CY, 0]}
            height={benchFrontH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={false} />
          <Drawer key="d2" position={[0, d2CY, 0]}
            height={benchFrontH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={isHov} />
        </>;
      }

      // ── mod32 — ławka środkowa (1 szuflada) ──────────────────────────────
      case 'mod32': {
        const seatCY  = BENCH_SEAT_H - hT;
        const sideH   = basTop - BENCH_SEAT_H;
        const oneH    = BENCH_SEAT_H - PLINTH_HEIGHT - THICKNESS - 6;
        const d1CY    = PLINTH_HEIGHT + 3 + oneH / 2;
        return <>
          <Plank position={[0, seatCY, 0]} args={shA} materialProps={intMat} />
          <Plank position={[-mW/2+hT, BENCH_SEAT_H + sideH/2, 0]}
            args={[THICKNESS, sideH, CORPUS_DEPTH]} materialProps={intMat} />
          <Plank position={[ mW/2-hT, BENCH_SEAT_H + sideH/2, 0]}
            args={[THICKNESS, sideH, CORPUS_DEPTH]} materialProps={intMat} />
          <Drawer key="d1" position={[0, d1CY, 0]}
            height={oneH} width={mW - DRAWER_SIDE_GAP*2} depth={CORPUS_DEPTH - 50}
            materialProps={intMat} isHovered={isHov} />
        </>;
      }

      default: return null;
    }
  };

  // ── Segmentowane ściany boczne (bench edge) ───────────────────────────────
  // mod30L na lewej krawędzi: ściana lewa w kolorze frontów (extMat)
  //   Seg 1: podłoga → BENCH_SEAT_H (500mm) — przy szufladach jest front
  //   PRZERWA: BENCH_SEAT_H → baseModuleHeight — otwarte siedzisko, brak boku
  //   Seg 2: baseModuleHeight → carcassHeight — nadstawka z drzwiami
  const renderLeftWall = () => {
    if (!firstIs30L) return (
      <Plank position={[THICKNESS/2, 0, 0]}
        args={[THICKNESS, carcassHeight, CORPUS_DEPTH]} materialProps={intMat} />
    );
    const botH = BENCH_SEAT_H, botY = -carcassHeight/2 + botH/2;
    // Bok nadstawki zaczyna się T niżej niż baseModuleHeight,
    // dzięki czemu dolna powierzchnia wieńca licuje się z bokiem
    // Górna krawędź boku licuje z górną powierzchnią wieńca górnego (carcassHeight/2)
    // Nakładanie na wieniec od dołu jest niewidoczne w renderze
    const topH = carcassHeight - baseModuleHeight;
    const topY = -carcassHeight/2 + baseModuleHeight + topH/2;
    return <>
      <Plank position={[THICKNESS/2, botY, 0]}
        args={[THICKNESS, botH, CORPUS_DEPTH]} materialProps={extMat} />
      {hasNadstawka && topH > 0 && (
        <Plank position={[THICKNESS/2, topY, 0]}
          args={[THICKNESS, topH, CORPUS_DEPTH]} materialProps={extMat} />
      )}
    </>;
  };

  // mod30P na prawej krawędzi: ściana prawa segmentowana w kolorze frontów (extMat)
  //   Seg 1: podłoga → BENCH_SEAT_H (500mm) — strefa szuflad/cokołu
  //   PRZERWA: BENCH_SEAT_H → baseModuleHeight — otwarte siedzisko, brak boku
  //   Seg 2: baseModuleHeight → carcassHeight — nadstawka z drzwiami
  const renderRightWall = () => {
    if (!lastIs30P) return (
      <Plank position={[carcassWidth - THICKNESS/2, 0, 0]}
        args={[THICKNESS, carcassHeight, CORPUS_DEPTH]} materialProps={intMat} />
    );
    const botH = BENCH_SEAT_H, botY = -carcassHeight/2 + botH/2;
    // Górna krawędź boku licuje z górną powierzchnią wieńca górnego (carcassHeight/2)
    // Nakładanie na wieniec od dołu jest niewidoczne w renderze
    const topH = carcassHeight - baseModuleHeight;
    const topY = -carcassHeight/2 + baseModuleHeight + topH/2;
    return <>
      <Plank position={[carcassWidth - THICKNESS/2, botY, 0]}
        args={[THICKNESS, botH, CORPUS_DEPTH]} materialProps={extMat} />
      {hasNadstawka && topH > 0 && (
        <Plank position={[carcassWidth - THICKNESS/2, topY, 0]}
          args={[THICKNESS, topH, CORPUS_DEPTH]} materialProps={extMat} />
      )}
    </>;
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <group position={[0, height / 2, 0]}>

      {/* Regularne blendy boczne (nie bench) */}
      {leftThickness > 0 && leftDepth > 0 && !benchBlendaLeft && !firstIs30L && (
        <Plank position={[-width/2 + leftThickness/2, 0, zFromFront(leftDepth)]}
          args={[leftThickness, height, leftDepth]} materialProps={extMat} />
      )}
      {rightThickness > 0 && rightDepth > 0 && !benchBlendaRight && !lastIs30P && (
        <Plank position={[width/2 - rightThickness/2, 0, zFromFront(rightDepth)]}
          args={[rightThickness, height, rightDepth]} materialProps={extMat} />
      )}

      {/* Blenda górna — skrócona po stronach bench (extMat bok zachodzi na krawędź) */}
      {topThickness > 0 && topDepth > 0 && (() => {
        const leftAdj  = firstIs30L ? leftThickness : 0;
        const rightAdj = lastIs30P  ? rightThickness : 0;
        const tW = width - leftAdj - rightAdj;
        const tX = -width/2 + leftAdj + tW / 2;
        return (
          <Plank position={[tX, height/2 - topThickness/2, zFromFront(topDepth)]}
            args={[tW, topThickness, topDepth]} materialProps={extMat} />
        );
      })()}

      {/*
        Wbudowana blenda ławki L (lewa) — DWA SEGMENTY, przerwa = otwarte siedzisko:
          Seg 1: podłoga (0) → siedzisko (500mm)   — są szuflady z frontem
          PRZERWA: 500mm → baseModuleHeight         — otwarte siedzisko, BRAK blendy
          Seg 2: nadstawka (baseModuleHeight → carcassHeight) — są drzwi
      */}
      {!!benchBlendaLeft && !firstIs30L && (() => {
        const s1H = BENCH_SEAT_H, s1Y = -height/2 + s1H/2;
        const s2H = carcassHeight - baseModuleHeight;
        const s2Y = -height/2 + baseModuleHeight + s2H/2;
        const bX  = -width/2 + BENCH_BL/2;
        return <>
          <Plank position={[bX, s1Y, 0]}
            args={[BENCH_BL, s1H, depth]} materialProps={extMat} />
          {hasNadstawka && s2H > 0 && (
            <Plank position={[bX, s2Y, 0]}
              args={[BENCH_BL, s2H, depth]} materialProps={extMat} />
          )}
        </>;
      })()}

      {/*
        Wbudowana blenda ławki P (prawa) — DWA SEGMENTY, przerwa = otwarte siedzisko:
          Seg 1: podłoga → siedzisko (500mm)        — są szuflady z frontem
          PRZERWA: 500mm → baseModuleHeight         — otwarte siedzisko, BRAK blendy
          Seg 2: nadstawka (baseModuleHeight → carcassHeight)
      */}
      {!!benchBlendaRight && !lastIs30P && (() => {
        const s1H = BENCH_SEAT_H, s1Y = -height/2 + s1H/2;
        const s2H = carcassHeight - baseModuleHeight;
        const s2Y = -height/2 + baseModuleHeight + s2H/2;
        const bX  = width/2 - BENCH_BL/2;
        return <>
          <Plank position={[bX, s1Y, 0]}
            args={[BENCH_BL, s1H, depth]} materialProps={extMat} />
          {hasNadstawka && s2H > 0 && (
            <Plank position={[bX, s2Y, 0]}
              args={[BENCH_BL, s2H, depth]} materialProps={extMat} />
          )}
        </>;
      })()}

      {/* ── KORPUS ── */}
      <group position={[carcassStartX, carcassYOffset, -(THICKNESS + FRONT_GAP) / 2]}>

        {renderLeftWall()}
        {renderRightWall()}

        {/* Plecy */}
        <Plank position={[carcassWidth/2, 0, -CORPUS_DEPTH/2 + 4.5]}
          args={[carcassWidth - THICKNESS*2, carcassHeight, 8]} materialProps={intMat} />

        {/* Wieniec górny — skrócony o THICKNESS na stronach bench (extMat bok zakrywa krawędź) */}
        {(() => {
          const leftAdj  = firstIs30L ? THICKNESS : 0;
          const rightAdj = lastIs30P  ? THICKNESS : 0;
          const wW = carcassWidth - leftAdj - rightAdj;
          const wX = leftAdj + wW / 2;
          return (
            <Plank position={[wX, carcassHeight/2 - THICKNESS/2, 0]}
              args={[wW, THICKNESS, CORPUS_DEPTH]} materialProps={intMat} />
          );
        })()}

        {/* Wieniec górny strefy bazowej — rozszerzony o blendę bench */}
        {hasNadstawka && (() => {
          // Wieniec dolny nadstawki: skrócony o THICKNESS na stronach z extMat bokiem,
          // żeby nie prześwitywał przez bok w kolorze frontu
          const leftAdj  = firstIs30L ? THICKNESS : 0;
          const rightAdj = lastIs30P  ? THICKNESS : 0;
          const wW = carcassWidth - leftAdj - rightAdj;
          const wX = leftAdj + wW / 2;
          return (
            <Plank position={[wX, -carcassHeight/2 + baseModuleHeight, 0]}
              args={[wW, THICKNESS, CORPUS_DEPTH]} materialProps={intMat} />
          );
        })()}

        {/* ── MODUŁY ── */}
        {(() => {
          let cumX = THICKNESS;
          return modules.map((module, index) => {
            const isRegal = REGAL_IDS.includes(module.id);
            const slotW   = module.width;
            const isHov   = hoveredModuleIndex === index && !isViewOpen;

            const el = (
              <group key={index} position={[cumX, 0, 0]}>
                <mesh
                  onClick={(e) => { e.stopPropagation(); onModuleClick(index); }}
                  onPointerOver={(e) => { e.stopPropagation(); setHoveredModuleIndex(index); }}
                  onPointerOut={() => setHoveredModuleIndex(null)}
                  visible={false} position={[slotW/2, 0, 0]}>
                  <boxGeometry args={[slotW, carcassHeight, CORPUS_DEPTH]} />
                  <meshBasicMaterial transparent opacity={0} />
                </mesh>

                <group position={[slotW/2, -carcassHeight/2, 0]}>
                  {/* Dno: regały bez cokołu (startują od THICKNESS) */}
                  <Plank
                    position={[0, isRegal ? THICKNESS/2 : PLINTH_HEIGHT + THICKNESS/2, 0]}
                    args={[slotW, THICKNESS, CORPUS_DEPTH]} materialProps={intMat} />

                  {render3DInternals(module, slotW, isHov)}

                  {/* Półka na baseModuleHeight — gdy jest nadstawka, renderuje globalny wieniec */}
                  {!isRegal && !hasNadstawka && (
                    <Plank position={[0, baseModuleHeight - THICKNESS/2, 0]}
                      args={[slotW, THICKNESS, CORPUS_DEPTH]} materialProps={intMat} />
                  )}






                  {/* Górna płyta — renderowana globalnie powyżej pętli modułów */}
                </group>

                {isViewOpen && activeModuleIndex === index && (
                  <mesh position={[slotW/2, 0, 1]}>
                    <boxGeometry args={[slotW, carcassHeight, depth]} />
                    <meshStandardMaterial color="#E17C4F" emissive="#E17C4F"
                      emissiveIntensity={0.3} transparent opacity={0.12} />
                  </mesh>
                )}

                {/* Przegroda pionowa między modułami */}
                {index < modules.length - 1 && (
                  <Plank position={[slotW + THICKNESS/2, 0, 0]}
                    args={[THICKNESS, carcassHeight, CORPUS_DEPTH]} materialProps={intMat} />
                )}
              </group>
            );
            cumX += slotW + THICKNESS;
            return el;
          });
        })()}
      </group>

      {/* ── FRONTY ── */}
      {!isViewOpen && (
        <group position={[carcassStartX, carcassYOffset, depth/2 - THICKNESS/2 - 4]}>
          {(() => {
            let cumX = 0;

            return modules.map((module, index) => {
              const isRegal     = REGAL_IDS.includes(module.id);
              const isBench     = BENCH_IDS.includes(module.id);
              const isPartFront = module.id === 'mod29';
              const isHov       = hoveredModuleIndex === index && !isViewOpen;
              const hinge       = module.hinge || 'left';

              // Pula szerokości frontów = carcassWidth minus wszystkie szczeliny między drzwiami
              // Dzięki temu suma frontów + szczelin = dokładnie carcassWidth (bez przekroczenia obrysu)
              const totalGaps = modules.length * FRONT_DOOR_GAP;
              const frontPool = totalInternalWidth > 0 ? carcassWidth - totalGaps : 0;
              const dW = totalInternalWidth > 0
                ? (module.width / totalInternalWidth) * frontPool : 0;
              if (dW <= 0) { cumX += dW + FRONT_DOOR_GAP; return null; }

              const mainH = (hasNadstawka ? baseModuleHeight : carcassHeight) - PLINTH_HEIGHT - FRONT_DOOR_GAP;
              const nadH  = hasNadstawka ? carcassHeight - baseModuleHeight - FRONT_DOOR_GAP : 0;
              const mainY = -carcassHeight/2 + PLINTH_HEIGHT + FRONT_DOOR_GAP/2 + mainH/2;
              const nadY  = -carcassHeight/2 + baseModuleHeight + FRONT_DOOR_GAP/2 + nadH/2;

              // Cokół per-moduł (nie dla regałów)
              const plinthEl = !isRegal ? (
                <Plank key="plinth"
                  position={[dW/2, -carcassHeight/2 + PLINTH_HEIGHT/2, 0]}
                  args={[dW, PLINTH_HEIGHT, THICKNESS]}
                  materialProps={extMat} />
              ) : null;

              // Helper: standardowe drzwi
              const stdDoors = (dH, dY, overrideHinge, showNad, noHandle = false) => {
                const h = overrideHinge || hinge;
                if (dW > DOUBLE_DOOR_THRESHOLD) {
                  const lw = dW/2 - FRONT_DOOR_GAP/2;
                  return <>
                    <group position={[dW/4, 0, 0]}>
                      <AnimatedDoor isHovered={isHov} hinge="left" doorWidth={lw}>
                        <Plank position={[0, dY, 0]} args={[lw, dH, THICKNESS]} materialProps={extMat} />
                        {showNad && hasNadstawka && nadH > 0 && (
                          <Plank position={[0, nadY, 0]} args={[lw, nadH, THICKNESS]} materialProps={extMat} />
                        )}
                        {!noHandle && handleType !== 'none' && (
                          <Handle type={handleType} handleColor={handleColor} isHovered={isHov}
                            lengthMm={getHandleLength()}
                            position={[placeHandleX('left', lw), getHandleY(), getHandleZ()]} />
                        )}
                      </AnimatedDoor>
                    </group>
                    <group position={[dW*0.75 + FRONT_DOOR_GAP, 0, 0]}>
                      <AnimatedDoor isHovered={isHov} hinge="right" doorWidth={lw}>
                        <Plank position={[0, dY, 0]} args={[lw, dH, THICKNESS]} materialProps={extMat} />
                        {showNad && hasNadstawka && nadH > 0 && (
                          <Plank position={[0, nadY, 0]} args={[lw, nadH, THICKNESS]} materialProps={extMat} />
                        )}
                        {!noHandle && handleType !== 'none' && (
                          <Handle type={handleType} handleColor={handleColor} isHovered={isHov}
                            lengthMm={getHandleLength()}
                            position={[placeHandleX('right', lw), getHandleY(), getHandleZ()]} />
                        )}
                      </AnimatedDoor>
                    </group>
                  </>;
                }
                const lw = dW - FRONT_DOOR_GAP;
                return (
                  <group position={[dW/2, 0, 0]}>
                    <AnimatedDoor isHovered={isHov} hinge={h} doorWidth={lw}>
                      <Plank position={[0, dY, 0]} args={[lw, dH, THICKNESS]} materialProps={extMat} />
                      {showNad && hasNadstawka && nadH > 0 && (
                        <Plank position={[0, nadY, 0]} args={[lw, nadH, THICKNESS]} materialProps={extMat} />
                      )}
                      {!noHandle && handleType !== 'none' && (
                        <Handle type={handleType} handleColor={handleColor} isHovered={isHov}
                          lengthMm={getHandleLength()}
                          position={[placeHandleX(h, lw), getHandleY(), getHandleZ()]} />
                      )}
                    </AnimatedDoor>
                  </group>
                );
              };

              let content = null;

              // ── Regał: krawędzie, bez cokołu ─────────────────────────────
              if (isRegal) {
                const regalH = hasNadstawka ? baseModuleHeight : carcassHeight;
                content = <>
                  <Plank position={[THICKNESS/2, -carcassHeight/2 + regalH/2, 0]}
                    args={[THICKNESS, regalH, THICKNESS]} materialProps={intMat} />
                  <Plank position={[dW - THICKNESS/2, -carcassHeight/2 + regalH/2, 0]}
                    args={[THICKNESS, regalH, THICKNESS]} materialProps={intMat} />
                </>;

              // ── Bench: fronty szuflad + nadstawka ────────────────────────
              // Formuła (z Doc1): benchFH = (BENCH_SEAT_H - PH - 6) / 2
              //   f1 dolna krawędź = PH + 3mm (szczelina od cokołu)
              //   f2 górna krawędź = BENCH_SEAT_H (zlicowana z siedziskiem)
              } else if (isBench) {
                const benchFH = (BENCH_SEAT_H - PLINTH_HEIGHT - 6) / 2;
                const fw      = dW - FRONT_DOOR_GAP;

                // Pozycje środków frontów w układzie grupy (Y=0 = środek carcassHeight)
                const f1CY = -carcassHeight/2 + PLINTH_HEIGHT + 3 + benchFH/2;
                const f2CY = -carcassHeight/2 + BENCH_SEAT_H - benchFH/2;

                // Uchwyt poziomy dla szuflad ławki
                // Środek na X=0 (środek modułu), obrót 90° wokół Z → poziomo
                // edge: na górnej krawędzi; bar/knob: na środku wysokości frontu
                const benchHandle = (fCY, frontH) => {
                  if (handleType === 'none') return null;
                  const isEdge = handleType === 'edge';
                  const len    = isEdge ? benchEdgeLen : benchBarLen;
                  // worldY: edge → górna krawędź frontu, pozostałe → środek
                  const worldY = isEdge ? fCY + frontH / 2 : fCY;
                  // Obrót grupy [0,0,π/2]: oś Y uchwytu staje się osią X świata
                  // Pozycja w lokalnym układzie obróconej grupy: [worldY, 0, z]
                  // Środek uchwytu = środek modułu (X = dW/2)
                  // Po obrocie [0,0,π/2]: local[a,b,z] → world[-b,a,z]
                  // Żeby world.x = dW/2: local.b = -dW/2
                  return (
                    <group rotation={[0, 0, Math.PI / 2]}>
                      <Handle type={handleType} handleColor={handleColor} isHovered={isHov}
                        lengthMm={len} position={[worldY, -dW / 2, THICKNESS / 2]} />
                    </group>
                  );
                };

                const is32 = module.id === 'mod32';
                let df;
                const benchSlideZ = (CORPUS_DEPTH - 50) / 2;
                if (is32) {
                  const oneH = BENCH_SEAT_H - PLINTH_HEIGHT - 6;
                  const oneY = -carcassHeight/2 + PLINTH_HEIGHT + 3 + oneH/2;
                  df = <>
                    <BenchFrontSlide key={`bfs-${index}`} isHov={isHov} slideZ={benchSlideZ}>
                      <Plank position={[dW/2, oneY, 0]} args={[fw, oneH, THICKNESS]} materialProps={extMat} />
                      {benchHandle(oneY, oneH)}
                    </BenchFrontSlide>
                  </>;
                } else {
                  df = <>
                    <Plank position={[dW/2, f1CY, 0]} args={[fw, benchFH, THICKNESS]} materialProps={extMat} />
                    {benchHandle(f1CY, benchFH)}
                    <BenchFrontSlide key={`bfs2-${index}`} isHov={isHov} slideZ={benchSlideZ}>
                      <Plank position={[dW/2, f2CY, 0]} args={[fw, benchFH, THICKNESS]} materialProps={extMat} />
                      {benchHandle(f2CY, benchFH)}
                    </BenchFrontSlide>
                  </>;
                }

                // Nadstawka bench — standardowe drzwi BEZ uchwytów (noHandle=true)
                const nad = hasNadstawka && nadH > 0 ? stdDoors(nadH, nadY, hinge, false, true) : null;
                content = <>{plinthEl}{df}{nad}</>;

              // ── mod29: front dolny 800mm (bez uchwytu) + nadstawka ────────
              } else if (isPartFront) {
                const partH = 800 - PLINTH_HEIGHT - FRONT_DOOR_GAP;
                const partY = -carcassHeight/2 + PLINTH_HEIGHT + FRONT_DOOR_GAP/2 + partH/2;
                let partFront;
                if (dW > DOUBLE_DOOR_THRESHOLD) {
                  const lw = dW/2 - FRONT_DOOR_GAP/2;
                  partFront = <>
                    <group position={[dW/4, 0, 0]}>
                      <AnimatedDoor isHovered={isHov} hinge="left" doorWidth={lw}>
                        <Plank position={[0, partY, 0]} args={[lw, partH, THICKNESS]} materialProps={extMat} />
                      </AnimatedDoor>
                    </group>
                    <group position={[dW*0.75 + FRONT_DOOR_GAP, 0, 0]}>
                      <AnimatedDoor isHovered={isHov} hinge="right" doorWidth={lw}>
                        <Plank position={[0, partY, 0]} args={[lw, partH, THICKNESS]} materialProps={extMat} />
                      </AnimatedDoor>
                    </group>
                  </>;
                } else {
                  const lw = dW - FRONT_DOOR_GAP;
                  partFront = (
                    <group position={[dW/2, 0, 0]}>
                      <AnimatedDoor isHovered={isHov} hinge={hinge} doorWidth={lw}>
                        <Plank position={[0, partY, 0]} args={[lw, partH, THICKNESS]} materialProps={extMat} />
                      </AnimatedDoor>
                    </group>
                  );
                }
                const nad29 = hasNadstawka && nadH > 0 ? stdDoors(nadH, nadY, hinge, false, true) : null;
                content = <>{plinthEl}{partFront}{nad29}</>;

              // ── Standardowe drzwi ─────────────────────────────────────────
              } else {
                content = <>{plinthEl}{stdDoors(mainH, mainY, null, true)}</>;
              }

              const grp = (
                <group key={`fg-${index}`} position={[cumX, 0, 0]}>
                  {content}
                </group>
              );

              cumX += dW + FRONT_DOOR_GAP;
              return grp;
            });
          })()}
        </group>
      )}
    </group>
  );
};

export default Wardrobe;