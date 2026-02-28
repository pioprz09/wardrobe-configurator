// Stałe wymiary i parametry szafy
export const WARDROBE_CONSTANTS = {
  // Grubości materiałów
  THICKNESS: 18,
  BACK_PANEL_THICKNESS: 8,
  
  // Wysokości
  PLINTH_HEIGHT: 100,
  RAIL_OFFSET_FROM_TOP: 80,
  BASE_MODULE_TOP: 2000,
  
  // Szczeliny i odstępy
  FRONT_GAP: 1,
  FRONT_DOOR_GAP: 4,
  DRAWER_SIDE_GAP: 4,
  DRAWER_VERTICAL_GAP: 40,
  SHELF_GAP: 40,
  
  // Limity wymiarów
  MIN_WIDTH: 800,
  MAX_WIDTH: 4000,
  MIN_HEIGHT: 2000,
  MAX_HEIGHT: 2750,
  MIN_DEPTH: 350,
  MAX_DEPTH: 800,
  
  // Limity modułów
  MIN_MODULE_WIDTH: 350,
  MAX_MODULE_WIDTH: 1100,
  DOUBLE_DOOR_THRESHOLD: 550, // powyżej tej szerokości = podwójne drzwi
  
  // Standardowe wysokości szuflad
  DRAWER_HEIGHTS: {
    SMALL: 150,
    MEDIUM: 200,
    LARGE: 250
  },
  
  // Ceny bazowe
  BASE_PRICES: {
    AREA_MULTIPLIER: 280, // PLN za m²
    DEPTH_MULTIPLIER: 120, // PLN za m głębokości
    HANDLE_PRICE: 35, // PLN za uchwyt
    COLOR_PREMIUM_MULTIPLIER: 1.15 // mnożnik dla kolorów premium
  },
  
  // 3D Scene settings
  SCENE: {
    SHADOW_MAP_SIZE: 4096,
    CAMERA_FOV: 50,
    CAMERA_FAR: 20000,
    FLOOR_SIZE: 25000
  }
};

// Funkcje pomocnicze do walidacji
export const validateDimensions = (width, height, depth) => {
  const { MIN_WIDTH, MAX_WIDTH, MIN_HEIGHT, MAX_HEIGHT, MIN_DEPTH, MAX_DEPTH } = WARDROBE_CONSTANTS;
  
  return {
    width: width >= MIN_WIDTH && width <= MAX_WIDTH,
    height: height >= MIN_HEIGHT && height <= MAX_HEIGHT,
    depth: depth >= MIN_DEPTH && depth <= MAX_DEPTH
  };
};

export const getModuleCountRange = (totalWidth, blendaConfig, blendaWidth = 18) => {
  const { THICKNESS, MIN_MODULE_WIDTH, MAX_MODULE_WIDTH } = WARDROBE_CONSTANTS;
  
  // Oblicz szerokość korpusu (bez blend)
  const blendaReduction = blendaConfig === 'both' ? blendaWidth * 2 : 
                          (blendaConfig === 'left' || blendaConfig === 'right') ? blendaWidth : 0;
  
  const carcassWidth = totalWidth - blendaReduction;
  
  // Oblicz zakres liczby modułów
  const minModules = Math.ceil((carcassWidth - THICKNESS) / (MAX_MODULE_WIDTH + THICKNESS));
  const maxModules = Math.floor((carcassWidth - THICKNESS) / (MIN_MODULE_WIDTH + THICKNESS));
  
  return {
    min: Math.max(1, minModules),
    max: Math.max(1, maxModules)
  };
};

export const calculateModuleWidths = (totalWidth, numModules, distribution, blendaConfig, blendaWidth = 18) => {
  const { THICKNESS } = WARDROBE_CONSTANTS;
  
  // Oblicz szerokość korpusu
  const blendaReduction = blendaConfig === 'both' ? blendaWidth * 2 : 
                          (blendaConfig === 'left' || blendaConfig === 'right') ? blendaWidth : 0;
  
  const carcassWidth = totalWidth - blendaReduction;
  const availableWidth = carcassWidth - (numModules + 1) * THICKNESS;
  
  if (availableWidth <= 0 || numModules <= 0) return [];
  
  let widths = [];
  
  switch (distribution) {
    case 'left-half':
    case 'right-half':
      if (numModules > 1) {
        const denominator = numModules - 0.5;
        const fullWidth = availableWidth / denominator;
        const halfWidth = fullWidth / 2;
        
        widths = Array(numModules).fill(fullWidth);
        const halfIndex = distribution === 'left-half' ? 0 : numModules - 1;
        widths[halfIndex] = halfWidth;
      } else {
        widths = [availableWidth];
      }
      break;
      
    default: // 'equal'
      const equalWidth = availableWidth / numModules;
      widths = Array(numModules).fill(equalWidth);
      break;
  }
  
  return widths;
};

// Sprawdź czy konfiguracja modułów jest prawidłowa
export const validateModuleConfiguration = (moduleWidths) => {
  const { MIN_MODULE_WIDTH, MAX_MODULE_WIDTH } = WARDROBE_CONSTANTS;
  
  return moduleWidths.every(width => 
    width >= MIN_MODULE_WIDTH && width <= MAX_MODULE_WIDTH
  );
};

// Oblicz cenę szafy
export const calculatePrice = (width, height, depth, modules, exteriorColor, handleType, numModules) => {
  const { BASE_PRICES } = WARDROBE_CONSTANTS;
  
  // Cena bazowa na podstawie powierzchni
  const areaInMeters = (width / 1000) * (height / 1000);
  const basePrice = areaInMeters * BASE_PRICES.AREA_MULTIPLIER;
  
  // Dopłata za głębokość
  const depthPrice = (depth / 1000) * BASE_PRICES.DEPTH_MULTIPLIER;
  
  // Dopłata za kolory premium (wszystkie oprócz białego)
  const colorMultiplier = exteriorColor === '#F8F8FF' ? 1.0 : BASE_PRICES.COLOR_PREMIUM_MULTIPLIER;
  
  // Cena uchwytów
  const handlePrice = handleType === 'none' ? 0 : numModules * BASE_PRICES.HANDLE_PRICE;
  
  // Dopłaty za specjalne moduły (można rozszerzyć)
  const modulePrice = modules.reduce((sum, module) => {
    // Tutaj można dodać indywidualne ceny modułów z moduleTypes.js
    return sum + 0; // Na razie bez dopłat
  }, 0);
  
  const totalPrice = (basePrice + depthPrice + modulePrice) * colorMultiplier + handlePrice;
  
  return Math.round(totalPrice);
};

// Sprawdź czy wysokość jest dostępna (gap między 200-234cm)
export const isHeightAvailable = (height) => {
  return !(height > 2000 && height < 2350);
};

export default WARDROBE_CONSTANTS;
