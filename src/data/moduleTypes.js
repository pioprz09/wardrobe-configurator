// Definicje wszystkich typów modułów szafy
export const MODULE_TYPES = [
  {
    id: 'mod1',
    name: 'Drążek',
    description: 'Podstawowy drążek na ubrania',
    price: 0 // cena bazowa
  },
  {
    id: 'mod2',
    name: 'Drążek, 1 półka',
    description: 'Drążek z jedną półką na dole',
    price: 50
  },
  {
    id: 'mod3',
    name: 'Drążek, 2 półki',
    description: 'Drążek z dwiema półkami',
    price: 80
  },
  {
    id: 'mod4',
    name: 'Drążek, 2 szuflady',
    description: 'Drążek z dwiema szufladami na dole',
    price: 120
  },
  {
    id: 'mod5',
    name: 'Drążek, 3 szuflady',
    description: 'Drążek z trzema szufladami',
    price: 180
  },
  {
    id: 'mod6',
    name: 'Drążek, 4 szuflady',
    description: 'Drążek z czterema szufladami',
    price: 240
  },
  {
    id: 'mod7',
    name: 'Drążek, półka, 2 szuflady',
    description: 'Kombinacja drążka, półki i szuflad',
    price: 150
  },
  {
    id: 'mod8',
    name: '4 półki',
    description: 'Cztery półki regulowane',
    price: 100
  },
  {
    id: 'mod9',
    name: '5 półek',
    description: 'Pięć półek regulowanych',
    price: 120
  },
  {
    id: 'mod10',
    name: '6 półek',
    description: 'Sześć półek regulowanych',
    price: 150
  },

  // ✅ POPRAWIONE (liczymy też półkę nad szufladami):
  {
    id: 'mod11',
    name: '2 szuflady, 5 półek',
    description: 'Dwie szuflady + półka nad szufladami + 4 półki',
    price: 200
  },
  {
    id: 'mod12',
    name: '2 szuflady, 4 półki',
    description: 'Dwie szuflady + półka nad szufladami + 3 półki',
    price: 190
  },

  {
    id: 'mod13',
    name: '2 drążki',
    description: 'Dwa drążki na różnych wysokościach',
    price: 60
  },

  // ✅ POPRAWIONE (liczymy też półkę nad szufladami):
  {
    id: 'mod14',
    name: '6 szuflad, 3 półki',
    description: 'Sześć szuflad + półka nad szufladami + 2 półki',
    price: 300
  },

  {
    id: 'mod15',
    name: '1x250, 2x150 szuflady, Półka, Drążek',
    description: 'Szuflady różnej wysokości z drążkiem',
    price: 250
  },
  {
    id: 'mod16',
    name: '1x250 szuflada, Półka, Drążek',
    description: 'Jedna duża szuflada z drążkiem',
    price: 180
  },
  {
    id: 'mod17',
    name: '2x250 szuflady, Półka, Drążek',
    description: 'Dwie duże szuflady z drążkiem',
    price: 220
  },
  {
    id: 'mod18',
    name: 'Przegroda pionowa, Półka',
    description: 'Przegroda dzieląca przestrzeń z półką',
    price: 80
  },
  {
    id: 'mod19',
    name: 'Przestrzeń, 2x150 szuflady, Półka, Drążek',
    description: 'Wolna przestrzeń z szufladami i drążkiem',
    price: 200
  }
];

// Funkcja do znajdowania typu modułu po ID
export const getModuleTypeById = (id) => {
  return MODULE_TYPES.find((type) => type.id === id);
};

// Funkcja do pobierania ceny modułu
export const getModulePrice = (id) => {
  const moduleType = getModuleTypeById(id);
  return moduleType ? moduleType.price : 0;
};

// Domyślny typ modułu
export const DEFAULT_MODULE_TYPE = MODULE_TYPES[0]; // mod1
