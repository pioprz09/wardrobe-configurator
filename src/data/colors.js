// Kolory z bazy EGGER
export const EGGER_COLORS = [
  // Drewno naturalne
  { name: 'Dąb Halifax Naturalny', value: '#C4A373', category: 'natural', brand: 'EGGER' },
  { name: 'Dąb Sonoma Truflowy', value: '#B08D57', category: 'natural', brand: 'EGGER' },
  { name: 'Buk Bavarian', value: '#D4A373', category: 'natural', brand: 'EGGER' },
  { name: 'Orzech Dijon', value: '#8B4513', category: 'natural', brand: 'EGGER' },
  { name: 'Jesion Kashira', value: '#E6D5B8', category: 'natural', brand: 'EGGER' },
  
  // Kolory nowoczesne
  { name: 'Biały Alpejski', value: '#F8F8FF', category: 'modern', brand: 'EGGER' },
  { name: 'Antracyt Chicago', value: '#36454F', category: 'modern', brand: 'EGGER' },
  { name: 'Grafit Metallic', value: '#2F4F4F', category: 'modern', brand: 'EGGER' },
  { name: 'Czarny Matt', value: '#1C1C1C', category: 'modern', brand: 'EGGER' },
  { name: 'Szary Bazalt', value: '#4A4A4A', category: 'modern', brand: 'EGGER' },
];

// Kolory z bazy KRONOSPAN
export const KRONOSPAN_COLORS = [
  // Drewno klasyczne
  { name: 'Dąb Craft Złoty', value: '#CD853F', category: 'natural', brand: 'KRONOSPAN' },
  { name: 'Jesion Nordycki', value: '#F5DEB3', category: 'natural', brand: 'KRONOSPAN' },
  { name: 'Orzech Tanganika', value: '#8B4513', category: 'natural', brand: 'KRONOSPAN' },
  { name: 'Dąb Wotan', value: '#A0826D', category: 'natural', brand: 'KRONOSPAN' },
  { name: 'Akacja Champagne', value: '#D2B48C', category: 'natural', brand: 'KRONOSPAN' },
  
  // Kolory premium
  { name: 'Biel Arktyczna', value: '#F0F8FF', category: 'modern', brand: 'KRONOSPAN' },
  { name: 'Szary Wolfram', value: '#708090', category: 'modern', brand: 'KRONOSPAN' },
  { name: 'Czarny Głęboki', value: '#000000', category: 'modern', brand: 'KRONOSPAN' },
  { name: 'Granat Nocny', value: '#191970', category: 'modern', brand: 'KRONOSPAN' },
  { name: 'Beż Saharyjski', value: '#F5E6D3', category: 'modern', brand: 'KRONOSPAN' },
];

// Wszystkie kolory razem
export const ALL_COLORS = [...EGGER_COLORS, ...KRONOSPAN_COLORS];

// Kolory pogrupowane według kategorii
export const getColorsByCategory = (category) => {
  return ALL_COLORS.filter(color => color.category === category);
};

// Kolory pogrupowane według marki
export const getColorsByBrand = (brand) => {
  return ALL_COLORS.filter(color => color.brand === brand);
};

// Domyślne kolory
export const DEFAULT_COLORS = {
  exterior: '#D2B48C', // Akacja Champagne
  interior: '#F8F8FF',  // Biały Alpejski
  wall: '#F7F5F2'      // Tło aplikacji
};