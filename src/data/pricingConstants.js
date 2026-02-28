// src/data/pricingConstants.js
export const PRICING_CONSTANTS = {
  // Płyta laminowana Egger U708 ST9 Szary Jasny
  BOARD_PRICE: 154.01, // PLN za sztukę
  BOARD_SIZE: { 
    width: 2070,  // mm
    height: 2800  // mm
  },
  BOARD_THICKNESS: 18, // mm
  
  // Obrzeże ABS Szary Jasny U708 ST9
  EDGE_PRICE_PER_MB: 64.05 / 33.1, // PLN/mb (cena za 33.1mb = 64.05 PLN)
  EDGE_THICKNESS: 2, // mm
  EDGE_WIDTH: 23, // mm
  
  // Usługi
  CUTTING_SERVICE_PER_MB: 49.98 / 24, // PLN/mb (24mb cięcia = 49.98 PLN)
  EDGE_SERVICE_PER_MB: 137.86 / 33.1, // PLN/mb (33.1mb obróbki = 137.86 PLN)
  PACKAGING_SERVICE: 35.00, // PLN za sztukę
  
  // Parametry techniczne
  CUT_ALLOWANCE: 5, // mm - odstęp na cięcie
  MIN_PIECE_SIZE: 50, // mm - minimalna wielkość kawałka
  SAFETY_MARGIN: 2, // mm - margines bezpieczeństwa
  
  // Optymalizacja
  MAX_EFFICIENCY_ITERATIONS: 100,
  TARGET_EFFICIENCY: 85 // % - docelowa efektywność
};