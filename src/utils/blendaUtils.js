// src/utils/blendaUtils.js
// Wspólne narzędzia do obsługi blend (lewa/prawa/górna) z zachowaniem stałego gabarytu zewnętrznego.

/**
 * Obsługiwane wartości (kompatybilność wstecz + nowe):
 * - 'none'
 * - '100'            (legacy z UI: listwa 100mm) -> domyślnie grubość 18mm
 * - 'full'           (legacy) -> domyślnie grubość 18mm
 * - 'strip18'|'strip36'|'strip50' (starsze)
 * - 'mask100'        (legacy top) -> domyślnie grubość 18mm
 * - 'full-18'|'full-36'|'full-50'
 * - 'strip-18'|'strip-36'|'strip-50'
 * - 'mask100-18'|'mask100-36'|'mask100-50'
 */

const toInt = (v, fallback = 0) => {
  const n = Number.parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

const parsePattern = (value) => {
  const v = String(value ?? 'none').trim();
  if (!v || v === 'none') return { mode: 'none', thickness: 0 };

  // legacy: '100' / 'full' / 'mask100'
  if (v === '100') return { mode: 'strip', thickness: 18, depthMm: 100 };
  if (v === 'full') return { mode: 'full', thickness: 18 };
  if (v === 'mask100') return { mode: 'mask100', thickness: 18, depthMm: 100 };

  // legacy: strip18/strip36/strip50
  if (v === 'strip18') return { mode: 'strip', thickness: 18, depthMm: 100 };
  if (v === 'strip36') return { mode: 'strip', thickness: 36, depthMm: 100 };
  if (v === 'strip50') return { mode: 'strip', thickness: 50, depthMm: 100 };

  // nowe: mode-thickness (np. full-36, strip-18, mask100-50)
  const m = v.match(/^(full|strip|mask100)\s*[-_]\s*(18|36|50)$/i);
  if (m) {
    const mode = m[1].toLowerCase();
    const thickness = toInt(m[2], 18);
    const depthMm = mode === 'strip' || mode === 'mask100' ? 100 : undefined;
    return { mode, thickness, depthMm };
  }

  // bezpieczeństwo: jeśli ktoś podał samą liczbę 18/36/50
  if (v === '18' || v === '36' || v === '50') return { mode: 'full', thickness: toInt(v, 18) };

  return { mode: 'none', thickness: 0 };
};

export const getBlendThicknessMm = (value) => {
  return parsePattern(value).thickness || 0;
};

export const getSideBlendDepthMm = (value, totalDepthMm) => {
  const p = parsePattern(value);
  if (p.mode === 'none') return 0;
  if (p.mode === 'strip') return Math.min(100, totalDepthMm);
  if (p.mode === 'full') return totalDepthMm;
  if (p.mode === 'mask100') return Math.min(100, totalDepthMm); // awaryjnie
  return 0;
};

export const getTopBlendDepthMm = (value, totalDepthMm) => {
  const p = parsePattern(value);
  if (p.mode === 'none') return 0;
  if (p.mode === 'mask100' || p.mode === 'strip') return Math.min(100, totalDepthMm);
  if (p.mode === 'full') return totalDepthMm;
  return 0;
};

export const computeInnerDimensions = ({
  outerWidthMm,
  outerHeightMm,
  sideLeft,
  sideRight,
  top
}) => {
  const leftT = getBlendThicknessMm(sideLeft);
  const rightT = getBlendThicknessMm(sideRight);
  const topT = getBlendThicknessMm(top);

  return {
    outerWidthMm,
    outerHeightMm,
    innerWidthMm: Math.max(0, outerWidthMm - leftT - rightT),
    innerHeightMm: Math.max(0, outerHeightMm - topT),
    leftThicknessMm: leftT,
    rightThicknessMm: rightT,
    topThicknessMm: topT
  };
};
