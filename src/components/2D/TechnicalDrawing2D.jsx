import React, { useMemo } from 'react';
import { WARDROBE_CONSTANTS, calculateModuleWidths } from '../../data/constants';

/**
 * TechnicalDrawing2D
 * - Widok 2D „Wnętrze” (bez frontów)
 * - Rysuje podziały na moduły, półki, szuflady, drążki
 * - Wymiaruje odległości pomiędzy elementami (półki/szuflady) w obrębie każdego modułu
 */
const TechnicalDrawing2D = ({
  width = 2200,
  height = 2400,
  depth = 600,
  baseModuleHeight = 2000,
  modules = [],
  blenda = 'none',
  blendaWidth = 18,
  activeModuleIndex = 0,
  onModuleClick = () => {}
}) => {
  const { THICKNESS, PLINTH_HEIGHT, RAIL_OFFSET_FROM_TOP } = WARDROBE_CONSTANTS;

  // --- SVG layout ---
  const pad = 20;
  const canvasW = 920;
  const canvasH = 520;
  const viewW = canvasW - pad * 2;
  const viewH = canvasH - pad * 2;

  const blendaReduction =
    blenda === 'both'
      ? blendaWidth * 2
      : blenda === 'left' || blenda === 'right'
        ? blendaWidth
        : 0;

  const carcassOuterW = width; // dla czytelności zostawiamy szerokość całkowitą
  const carcassInnerW = width - blendaReduction;
  const carcassInnerH = height;

  const scale = Math.min(viewW / carcassOuterW, viewH / carcassInnerH);
  const ox = pad + (viewW - carcassOuterW * scale) / 2;
  const oy = pad + (viewH - carcassInnerH * scale) / 2;

  const sx = (mm) => ox + mm * scale;
  const sy = (mmFromBottom) => oy + (height - mmFromBottom) * scale; // od dołu
  const sw = (mm) => mm * scale;
  const sh = (mm) => mm * scale;

  // Marker strzałek do wymiarów
  const defs = (
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="#6b7280" />
      </marker>
    </defs>
  );

  // Wylicz szerokości modułów identycznie jak w 3D/kalkulacjach
  const moduleWidths = useMemo(() => {
    // Najpierw bierzemy width z aktualnego stanu modułów (to jest „źródło prawdy” z App.jsx)
    const fromState = (modules || [])
      .map((m) => m?.width)
      .filter((v) => typeof v === 'number' && v > 0);

    if (fromState.length === (modules || []).length && fromState.length > 0) return fromState;

    // fallback: policz równo (najbezpieczniej)
    try {
      return calculateModuleWidths(width, (modules || []).length || 1, 'equal', blenda, blendaWidth);
    } catch {
      const n = (modules || []).length || 1;
      return Array(n).fill(carcassInnerW / n);
    }
  }, [modules, width, blenda, blendaWidth, carcassInnerW]);

  // --- Layout internals (mm from bottom) ---
  const bottomY = PLINTH_HEIGHT + THICKNESS;
  const baseTopY = baseModuleHeight; // linia podziału (nadstawka)

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const proportionalY = (yOriginalFor2000) => {
    // mapuj stare wartości (dla base=2000) na aktualny baseModuleHeight
    const denom = (2000 - bottomY);
    if (denom <= 0) return yOriginalFor2000;
    const t = (yOriginalFor2000 - bottomY) / denom;
    return bottomY + t * (baseTopY - bottomY);
  };

  const confirmFinite = (v) => (Number.isFinite(v) ? v : 0);
  const formatCm = (mm) => `${Math.round(mm / 10)} cm`;

  const layoutForModule = (moduleId) => {
    // Zwraca: shelvesY[], drawers[{y,h}], railsY[]
    const shelvesY = [];
    const drawers = [];
    const railsY = [];

    const railY = clamp(baseTopY - RAIL_OFFSET_FROM_TOP, bottomY + 120, baseTopY - 60);
    const addRail = () => railsY.push(railY);

    const addDrawerStack = (heights, start = bottomY) => {
      // w 3D jest DRAWER_VERTICAL_GAP = 40
      const gap = WARDROBE_CONSTANTS.DRAWER_VERTICAL_GAP || 40;
      let y = start;
      heights.forEach((h, i) => {
        drawers.push({ y: y, h });
        y += h;
        if (i < heights.length - 1) y += gap;
      });
      return y; // zwraca top stack
    };

    const addEvenShelves = (count, start, end) => {
      const span = end - start;
      const step = span / (count + 1);
      for (let i = 0; i < count; i++) {
        shelvesY.push(start + (i + 1) * step);
      }
    };

    switch (moduleId) {
      case 'mod1':
        addRail();
        break;

      case 'mod2':
        addRail();
        shelvesY.push(proportionalY(341));
        break;

      case 'mod3':
        addRail();
        shelvesY.push(proportionalY(341));
        shelvesY.push(proportionalY(691));
        break;

      case 'mod4': {
        addRail();
        const top = addDrawerStack([150, 150]);
        shelvesY.push(top + (WARDROBE_CONSTANTS.SHELF_GAP || 40) + THICKNESS / 2);
        break;
      }

      case 'mod5': {
        addRail();
        const top = addDrawerStack([150, 150, 150]);
        shelvesY.push(top + (WARDROBE_CONSTANTS.SHELF_GAP || 40) + THICKNESS / 2);
        break;
      }

      case 'mod6': {
        addRail();
        const top = addDrawerStack([150, 150, 150, 150]);
        shelvesY.push(top + (WARDROBE_CONSTANTS.SHELF_GAP || 40) + THICKNESS / 2);
        break;
      }

      case 'mod7': {
        addRail();
        // dodatkowa półka
        shelvesY.push(proportionalY(520));
        addDrawerStack([150, 150]);
        break;
      }

      case 'mod8':
        addEvenShelves(4, bottomY, baseTopY - THICKNESS);
        break;

      case 'mod9':
        addEvenShelves(5, bottomY, baseTopY - THICKNESS);
        break;

      case 'mod10':
        addEvenShelves(6, bottomY, baseTopY - THICKNESS);
        break;

      case 'mod11': {
        const top = addDrawerStack([150, 150]);
        const shelfY = top + (WARDROBE_CONSTANTS.SHELF_GAP || 40) + THICKNESS / 2;
        shelvesY.push(shelfY);
        addEvenShelves(4, shelfY + THICKNESS / 2, baseTopY - THICKNESS);
        break;
      }

      case 'mod12': {
        const top = addDrawerStack([150, 150]);
        const shelfY = top + (WARDROBE_CONSTANTS.SHELF_GAP || 40) + THICKNESS / 2;
        shelvesY.push(shelfY);
        addEvenShelves(3, shelfY + THICKNESS / 2, baseTopY - THICKNESS);
        break;
      }

      case 'mod13': {
        addRail();
        const mid = bottomY + (baseTopY - bottomY) / 2;
        railsY.push(mid);
        break;
      }

      case 'mod14': {
        const top = addDrawerStack([150, 150, 150, 150, 150, 150]);
        const shelfY = top + (WARDROBE_CONSTANTS.SHELF_GAP || 40) + THICKNESS / 2;
        shelvesY.push(shelfY);
        addEvenShelves(2, shelfY + THICKNESS / 2, baseTopY - THICKNESS);
        break;
      }

      case 'mod15': {
        addDrawerStack([250, 150, 150]);
        shelvesY.push(proportionalY(650));
        addRail();
        break;
      }

      case 'mod16': {
        addDrawerStack([250]);
        shelvesY.push(proportionalY(650));
        addRail();
        break;
      }

      case 'mod17': {
        addDrawerStack([250, 250]);
        shelvesY.push(proportionalY(650));
        addRail();
        break;
      }

      case 'mod18': {
        // przegroda pionowa + półka (półka rysowana jako linia)
        shelvesY.push(proportionalY(1700));
        break;
      }

      case 'mod19': {
        const start = proportionalY(380);
        addDrawerStack([150, 150], start);
        shelvesY.push(proportionalY(650));
        addRail();
        break;
      }

      default:
        addRail();
        break;
    }

    // sort i filtr do zakresu
    const shelves = shelvesY
      .map((y) => confirmFinite(y))
      .filter((y) => y > bottomY + 10 && y < baseTopY - 10)
      .sort((a, b) => a - b);

    const rails = railsY
      .map((y) => confirmFinite(y))
      .filter((y) => y > bottomY + 10 && y < baseTopY - 10)
      .sort((a, b) => a - b);

    const dws = drawers
      .map((d) => ({ y: confirmFinite(d.y), h: confirmFinite(d.h) }))
      .filter((d) => d.h > 0 && d.y >= bottomY && d.y + d.h <= baseTopY)
      .sort((a, b) => a.y - b.y);

    return { shelvesY: shelves, railsY: rails, drawers: dws };
  };

  // --- Build module x positions (we draw inside carcass inner width) ---
  const xStartInner = blenda === 'left' || blenda === 'both' ? blendaWidth : 0;

  const modulesX = useMemo(() => {
    // x = od lewej krawędzi całej szafy
    let x = xStartInner + THICKNESS; // lewa ścianka
    const list = [];
    for (let i = 0; i < (modules || []).length; i++) {
      const w = moduleWidths[i] || 0;
      list.push({ x, w, i });
      x += w + THICKNESS;
    }
    return list;
  }, [modules, moduleWidths, xStartInner, THICKNESS]);

  // --- Dimension helpers ---
  const DimV = ({ x, y1, y2, label }) => {
    const yTop = Math.max(y1, y2);
    const yBot = Math.min(y1, y2);
    const mid = (yTop + yBot) / 2;
    return (
      <g>
        <line
          x1={x}
          y1={sy(yBot)}
          x2={x}
          y2={sy(yTop)}
          stroke="#6b7280"
          strokeWidth="1"
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        <text
          x={x + 6}
          y={sy(mid) - 4}
          fill="#374151"
          fontSize="11"
          fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        >
          {label}
        </text>
      </g>
    );
  };

  const DimH = ({ y, x1, x2, label }) => {
    const xL = Math.min(x1, x2);
    const xR = Math.max(x1, x2);
    const mid = (xL + xR) / 2;
    return (
      <g>
        <line
          x1={sx(xL)}
          y1={y}
          x2={sx(xR)}
          y2={y}
          stroke="#6b7280"
          strokeWidth="1"
          markerStart="url(#arrow)"
          markerEnd="url(#arrow)"
        />
        <text
          x={sx(mid)}
          y={y - 6}
          textAnchor="middle"
          fill="#374151"
          fontSize="11"
          fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        >
          {label}
        </text>
      </g>
    );
  };

  // --- Render ---
  return (
    <div className="technical-drawing" style={{ margin: 0 }}>
      <h4>Widok 2D – Wnętrze (bez frontów) + wymiary</h4>

      <svg width="100%" viewBox={`0 0 ${canvasW} ${canvasH}`} role="img" aria-label="Rysunek techniczny wnętrza szafy">
        {defs}

        {/* Tło */}
        <rect x="0" y="0" width={canvasW} height={canvasH} fill="#ffffff" />

        {/* Obrys zewnętrzny */}
        <rect
          x={sx(0)}
          y={sy(height)}
          width={sw(width)}
          height={sh(height)}
          fill="none"
          stroke="#111827"
          strokeWidth="2"
        />

        {/* Blendy (opcjonalnie) */}
        {(blenda === 'left' || blenda === 'both') && (
          <rect
            x={sx(0)}
            y={sy(height)}
            width={sw(blendaWidth)}
            height={sh(height)}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="1"
          />
        )}
        {(blenda === 'right' || blenda === 'both') && (
          <rect
            x={sx(width - blendaWidth)}
            y={sy(height)}
            width={sw(blendaWidth)}
            height={sh(height)}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="1"
          />
        )}

        {/* Cokół */}
        <rect
          x={sx(xStartInner)}
          y={sy(PLINTH_HEIGHT)}
          width={sw(carcassInnerW)}
          height={sh(PLINTH_HEIGHT)}
          fill="#f9fafb"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Linia podziału (nadstawka) */}
        {height > baseModuleHeight && (
          <line
            x1={sx(xStartInner)}
            y1={sy(baseModuleHeight)}
            x2={sx(xStartInner + carcassInnerW)}
            y2={sy(baseModuleHeight)}
            stroke="#e17c4f"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}

        {/* Ścianki wewnętrzne i moduły */}
        {modulesX.map(({ x, w, i }) => {
          const mod = modules[i] || { id: 'mod1' };
          const isActive = i === activeModuleIndex;
          const { shelvesY, drawers, railsY } = layoutForModule(mod.id);

          // Obszar modułu (bez grubości ścianek)
          const moduleLeft = x;
          const moduleRight = x + w;
          const moduleTop = height - THICKNESS;
          const moduleBottom = THICKNESS + PLINTH_HEIGHT;

          // Linie wymiarów w module: liczymy odstępy w pionie w obrębie części podstawowej
          const keyYs = [
            bottomY,
            ...drawers.map((d) => d.y),
            ...drawers.map((d) => d.y + d.h),
            ...shelvesY,
            baseTopY - THICKNESS
          ];
          const uniq = Array.from(new Set(keyYs.map((v) => Math.round(v)))).sort((a, b) => a - b);

          // Wymiarujemy tylko sensowne odcinki (>= 80mm)
          const dims = [];
          for (let k = 0; k < uniq.length - 1; k++) {
            const a = uniq[k];
            const b = uniq[k + 1];
            const d = b - a;
            if (d >= 80) dims.push({ y1: a, y2: b, d });
          }

          return (
            <g key={`mod-${i}`}>
              {/* Klikalny obszar modułu */}
              <rect
                x={sx(moduleLeft)}
                y={sy(height)}
                width={sw(w)}
                height={sh(height)}
                fill={isActive ? 'rgba(225,124,79,0.06)' : 'transparent'}
                stroke={isActive ? '#e17c4f' : 'transparent'}
                strokeWidth="2"
                onClick={() => onModuleClick(i)}
                style={{ cursor: 'pointer' }}
              />

              {/* Ramka modułu (wewnętrzny prostokąt) */}
              <rect
                x={sx(moduleLeft)}
                y={sy(moduleTop)}
                width={sw(w)}
                height={sh(moduleTop - moduleBottom)}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* Półki */}
              {shelvesY.map((y, idx) => (
                <line
                  key={`s-${i}-${idx}`}
                  x1={sx(moduleLeft + 6)}
                  y1={sy(y)}
                  x2={sx(moduleRight - 6)}
                  y2={sy(y)}
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
              ))}

              {/* Drążki */}
              {railsY.map((y, idx) => (
                <line
                  key={`r-${i}-${idx}`}
                  x1={sx(moduleLeft + 10)}
                  y1={sy(y)}
                  x2={sx(moduleRight - 10)}
                  y2={sy(y)}
                  stroke="#374151"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}

              {/* Szuflady */}
              {drawers.map((d, idx) => (
                <g key={`d-${i}-${idx}`}>
                  <rect
                    x={sx(moduleLeft + 10)}
                    y={sy(d.y + d.h)}
                    width={sw(w - 20)}
                    height={sh(d.h)}
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                  <text
                    x={sx(moduleLeft + w / 2)}
                    y={sy(d.y + d.h / 2) + 4}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="10"
                    fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
                  >
                    {formatCm(d.h)}
                  </text>
                </g>
              ))}

              {/* Wymiary pionowe w module */}
              {dims.slice(0, 6).map((d, idx) => (
                <DimV
                  key={`dim-${i}-${idx}`}
                  x={sx(moduleRight) + 10}
                  y1={d.y1}
                  y2={d.y2}
                  label={formatCm(d.d)}
                />
              ))}

              {/* Etykieta modułu */}
              <text
                x={sx(moduleLeft + w / 2)}
                y={sy(height) - 8}
                textAnchor="middle"
                fill={isActive ? '#e17c4f' : '#6b7280'}
                fontSize="12"
                fontWeight={isActive ? 700 : 600}
                fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
              >
                Moduł {i + 1}
              </text>
            </g>
          );
        })}

        {/* Działówki (linie pionowe) */}
        {(() => {
          const lines = [];
          // lewa ścianka korpusu (wewnętrzna)
          lines.push(
            <line
              key="wall-l"
              x1={sx(xStartInner + THICKNESS)}
              y1={sy(height)}
              x2={sx(xStartInner + THICKNESS)}
              y2={sy(0)}
              stroke="#d1d5db"
              strokeWidth="2"
            />
          );
          // prawa ścianka korpusu (wewnętrzna)
          lines.push(
            <line
              key="wall-r"
              x1={sx(xStartInner + carcassInnerW - THICKNESS)}
              y1={sy(height)}
              x2={sx(xStartInner + carcassInnerW - THICKNESS)}
              y2={sy(0)}
              stroke="#d1d5db"
              strokeWidth="2"
            />
          );
          // podziały między modułami
          modulesX.forEach(({ x, w, i }) => {
            if (i === modulesX.length - 1) return;
            const dividerX = x + w + THICKNESS / 2;
            lines.push(
              <line
                key={`div-${i}`}
                x1={sx(dividerX)}
                y1={sy(height)}
                x2={sx(dividerX)}
                y2={sy(0)}
                stroke="#e5e7eb"
                strokeWidth="2"
              />
            );
          });
          return lines;
        })()}

        {/* Wymiary ogólne (szer./wys.) */}
        <DimH y={pad + 10} x1={0} x2={width} label={`Szerokość: ${formatCm(width)}`} />
        <DimV x={sx(width) + 30} y1={0} y2={height} label={`Wysokość: ${formatCm(height)}`} />
      </svg>

      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10, lineHeight: 1.4 }}>
        Kliknij moduł na rysunku, aby go podświetlić (zgodnie z wyborem w zakładce „Funkcja”).
        <br />
        Wymiary pokazują odległości w części podstawowej (do {formatCm(baseModuleHeight)}).
      </div>
    </div>
  );
};

export default TechnicalDrawing2D;
