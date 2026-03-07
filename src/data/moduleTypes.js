export const REGAL_IDS = ['mod25', 'mod26'];
export const BENCH_IDS = ['mod30L', 'mod30P', 'mod31', 'mod32'];
export const MODULE_WIDTH_MIN = 300;
export const MODULE_WIDTH_MAX = 1100;
export const BENCH_BLENDA_THICKNESS = 18;

export const MODULE_CATEGORIES = [
  { id: 'all',       label: 'Wszystkie' },
  { id: 'wieszak',   label: 'Wieszak'   },
  { id: 'szuflady',  label: 'Szuflady'  },
  { id: 'polki',     label: 'Półki'     },
  { id: 'regal',     label: 'Regał'     },
  { id: 'siedzisko', label: 'Siedzisko' },
];

export const MODULE_TYPES = [
  // ── WIESZAK ─────────────────────────────────────────────────────────────────
  { id: 'mod1',  category: 'wieszak',   name: 'Drążek',             description: 'Drążek na ubrania — pełna wysokość', price: 0 },
  { id: 'mod2',  category: 'wieszak',   name: '2× drążek',          description: '2 poziomy krótkich ubrań — górny i dolny', price: 80 },
  { id: 'mod3',  category: 'wieszak',   name: 'Drążek + półka',     description: 'Drążek + półka 320 mm od dołu', price: 50 },
  { id: 'mod4',  category: 'wieszak',   name: 'Drążek + 2 półki',   description: 'Drążek + 2 półki od dołu', price: 80 },
  { id: 'mod5',  category: 'wieszak',   name: 'Drążek + 3 półki',   description: 'Drążek + 3 półki od dołu', price: 100 },
  // ── DRĄŻEK + SZUFLADY ───────────────────────────────────────────────────────
  { id: 'mod6',  category: 'szuflady',  name: 'Drążek + 1 sz.',     description: 'Drążek + 1 szuflada 200 mm na dole', price: 120 },
  { id: 'mod7',  category: 'szuflady',  name: 'Drążek + 2 sz.',     description: 'Drążek + 2 szuflady 200 mm na dole', price: 180 },
  { id: 'mod8',  category: 'szuflady',  name: 'Drążek + 3 sz.',     description: 'Drążek + 3 szuflady 200 mm na dole', price: 240 },
  { id: 'mod9',  category: 'szuflady',  name: 'Drążek + 2 niskie',  description: 'Drążek + 2 szuflady 110 mm na dole', price: 140 },
  { id: 'mod10', category: 'szuflady',  name: 'Drążek + 3 niskie',  description: 'Drążek + 3 szuflady 110 mm na dole', price: 180 },
  { id: 'mod11', category: 'szuflady',  name: 'Drążek + 4 niskie',  description: 'Drążek + 4 szuflady 110 mm na dole', price: 220 },
  { id: 'mod12', category: 'szuflady',  name: 'Drążek + 5 niskich', description: 'Drążek + 5 szuflad 110 mm na dole', price: 260 },
  // ── TYLKO PÓŁKI ─────────────────────────────────────────────────────────────
  { id: 'mod13', category: 'polki',     name: '3 półki',            description: 'Trzy półki równomiernie', price: 80 },
  { id: 'mod22', category: 'polki',     name: '4 półki',            description: 'Cztery półki równomiernie', price: 100 },
  { id: 'mod20', category: 'polki',     name: '5 półek',            description: 'Pięć półek równomiernie', price: 120 },
  { id: 'mod21', category: 'polki',     name: '6 półek',            description: 'Sześć półek równomiernie', price: 150 },
  // ── DRĄŻEK + PÓŁKI + SZUFLADY ───────────────────────────────────────────────
  { id: 'mod14', category: 'szuflady',  name: 'Drążek + półka + 2 sz.', description: 'Drążek + 2 sz. 200 mm + półka 320 mm od dołu', price: 200 },
  { id: 'mod15', category: 'szuflady',  name: '1 sz. + 4 półki',    description: '1 szuflada 200 mm + 4 półki', price: 160 },
  { id: 'mod16', category: 'szuflady',  name: '2 sz. + 4 półki',    description: '2 szuflady 200 mm + 4 półki', price: 200 },
  { id: 'mod17', category: 'szuflady',  name: '3 sz. + 3 półki',    description: '3 szuflady 200 mm + 3 półki', price: 240 },
  { id: 'mod18', category: 'szuflady',  name: '6 niskich + 3 półki',description: '6 szuflad 110 mm + 3 półki', price: 280 },
  { id: 'mod19', category: 'szuflady',  name: '5 niskich + 3 półki',description: '5 szuflad 110 mm + 3 półki', price: 250 },
  // ── PRZEGRODY ───────────────────────────────────────────────────────────────
  { id: 'mod23', category: 'polki',     name: 'Przegroda + 4 półki',description: 'Pionowa przegroda lewa + 4 półki po prawej', price: 120 },
  { id: 'mod24', category: 'polki',     name: 'Przegroda + pozioma',description: 'Pozioma półka u góry + pionowa przegroda poniżej', price: 80 },
  // ── REGAŁY ──────────────────────────────────────────────────────────────────
  { id: 'mod25', category: 'regal',     name: 'Regał 4 półki',      description: 'Otwarty, 4 półki', price: 160, noFront: true },
  { id: 'mod26', category: 'regal',     name: 'Regał mix',          description: 'Otwarty, półka 320 + szuflada + półki', price: 200, noFront: true },
  { id: 'mod29', category: 'regal',     name: 'Szafka + 2 półki',   description: 'Drzwiczki na dolne 800 mm + 2 półki powyżej', price: 180 },
  // ── SIEDZISKO ───────────────────────────────────────────────────────────────
  { id: 'mod30L',category: 'siedzisko', name: 'Ławka lewa',         description: 'Moduł skrajny lewy — ławka z szufladą, wbudowana blenda lewa', price: 300, edgeOnly: 'left'  },
  { id: 'mod30P',category: 'siedzisko', name: 'Ławka prawa',        description: 'Moduł skrajny prawy — ławka z szufladą, wbudowana blenda prawa', price: 300, edgeOnly: 'right' },
  { id: 'mod31', category: 'siedzisko', name: 'Ławka 2 sz.',        description: 'Siedzisko + 2 szuflady + nadstawka', price: 280 },
  { id: 'mod32', category: 'siedzisko', name: 'Ławka 1 sz.',        description: 'Siedzisko + 1 szuflada + nadstawka', price: 240 },
];

export const getModuleTypeById = id => MODULE_TYPES.find(t => t.id === id);
export const getModulePrice    = id => (getModuleTypeById(id)?.price ?? 0);
export const DEFAULT_MODULE_TYPE = MODULE_TYPES[0];