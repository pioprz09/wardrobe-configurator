// src/services/pricingService.js
const PRICING_CONSTANTS = {
  // CENY WEDŁUG TWOICH WYTYCZNYCH
  BOARD_PRICE_PER_SQM: 65, // PLN za m²
  BOARD_SIZE: { 
    width: 2070,  // mm
    height: 2800  // mm
  },
  BOARD_THICKNESS: 18, // mm
  
  // Obrzeże i cięcie
  EDGE_PRICE_PER_MB: 4, // PLN/mb
  CUTTING_PRICE_PER_MB: 2.08, // PLN/mb
  
  // Dodatkowe elementy
  DRAWER_PRICE: 180, // PLN za szufladę
  SINGLE_DOOR_HINGES: 8 * 18, // PLN za pojedyncze drzwi
  DOUBLE_DOOR_HINGES: 16 * 18, // PLN za podwójne drzwi
  
  // Parametry techniczne
  CUT_ALLOWANCE: 5, // mm - odstęp na cięcie
  MIN_PIECE_SIZE: 50 // mm - minimalna wielkość kawałka
};

export const calculateOptimizedPricing = async (config) => {
  const { width, height, depth, numModules, modules, baseModuleHeight, distribution } = config;
  
  console.log('🚀 calculateOptimizedPricing called with:', config);
  
  // 1. Oblicz potrzebne elementy
  const pieces = calculateRequiredPieces(config);
  
  // 2. Optymalizuj rozkrój
  const optimizedSheets = optimizeCutting(pieces);
  
  // 3. Oblicz koszty
  const costs = calculateCosts(pieces, optimizedSheets, modules);
  
  // 4. Oblicz efektywność
  const efficiency = calculateEfficiency(pieces, optimizedSheets);
  
  return {
    pieces,
    sheets: optimizedSheets,
    costs,
    efficiency
  };
};

const calculateRequiredPieces = (config) => {
  const { width, height, depth, numModules, modules, distribution } = config;
  const pieces = [];
  
  console.log('📐 calculateRequiredPieces - modules:', modules);
  
  // Oblicz szerokości modułów
  const moduleWidths = calculateModuleWidths(width, numModules, distribution);
  
  // Elementy dla każdego modułu
  moduleWidths.forEach((moduleWidth, index) => {
    const moduleConfig = modules ? modules[index] : null;
    console.log(`Module ${index}: config =`, moduleConfig);
    
    // Boki zewnętrzne
    if (index === 0) {
      pieces.push({
        name: `Bok L-${index + 1}`,
        width: depth - PRICING_CONSTANTS.BOARD_THICKNESS,
        height: height,
        quantity: 1,
        type: 'side',
        moduleIndex: index,
        edgeLength: calculateEdgeLength(depth - PRICING_CONSTANTS.BOARD_THICKNESS, height, 'side')
      });
    }
    
    if (index === numModules - 1) {
      pieces.push({
        name: `Bok P-${index + 1}`,
        width: depth - PRICING_CONSTANTS.BOARD_THICKNESS,
        height: height,
        quantity: 1,
        type: 'side',
        moduleIndex: index,
        edgeLength: calculateEdgeLength(depth - PRICING_CONSTANTS.BOARD_THICKNESS, height, 'side')
      });
    }
    
    // Działówki między modułami
    if (index > 0) {
      pieces.push({
        name: `Działówka-${index}`,
        width: depth - PRICING_CONSTANTS.BOARD_THICKNESS,
        height: height,
        quantity: 1,
        type: 'divider',
        moduleIndex: index,
        edgeLength: calculateEdgeLength(depth - PRICING_CONSTANTS.BOARD_THICKNESS, height, 'side')
      });
    }
    
    // Góra i dół
    const horizontalWidth = moduleWidth - (index === 0 || index === numModules - 1 ? PRICING_CONSTANTS.BOARD_THICKNESS : 0);
    const horizontalDepth = depth - PRICING_CONSTANTS.BOARD_THICKNESS;
    
    pieces.push(
      {
        name: `Góra-${index + 1}`,
        width: horizontalWidth,
        height: horizontalDepth,
        quantity: 1,
        type: 'horizontal',
        moduleIndex: index,
        edgeLength: calculateEdgeLength(horizontalWidth, horizontalDepth, 'horizontal')
      },
      {
        name: `Dno-${index + 1}`,
        width: horizontalWidth,
        height: horizontalDepth,
        quantity: 1,
        type: 'horizontal',
        moduleIndex: index,
        edgeLength: calculateEdgeLength(horizontalWidth, horizontalDepth, 'horizontal')
      }
    );
    
    // Plecy
    pieces.push({
      name: `Plecy-${index + 1}`,
      width: moduleWidth - (index === 0 || index === numModules - 1 ? PRICING_CONSTANTS.BOARD_THICKNESS : 0),
      height: height - 2 * PRICING_CONSTANTS.BOARD_THICKNESS,
      quantity: 1,
      type: 'back',
      moduleIndex: index,
      edgeLength: 0
    });
    
    // Fronty
    const isDoubleDoor = moduleWidth > 550;
    const frontWidth = isDoubleDoor ? (moduleWidth / 2) - 1 : moduleWidth - 2;
    const frontCount = isDoubleDoor ? 2 : 1;
    
    for (let f = 0; f < frontCount; f++) {
      pieces.push({
        name: `Front-${index + 1}${frontCount > 1 ? `-${f + 1}` : ''}`,
        width: frontWidth,
        height: height - 4,
        quantity: 1,
        type: 'front',
        moduleIndex: index,
        isDoubleDoor: isDoubleDoor,
        edgeLength: calculateEdgeLength(frontWidth, height - 4, 'front')
      });
    }
    
    // Półki
    const shelfCount = getShelfCount(moduleConfig);
    console.log(`Module ${index} shelf count:`, shelfCount);
    
    for (let s = 0; s < shelfCount; s++) {
      pieces.push({
        name: `Półka-${index + 1}-${s + 1}`,
        width: horizontalWidth - 4,
        height: horizontalDepth - 4,
        quantity: 1,
        type: 'shelf',
        moduleIndex: index,
        edgeLength: calculateEdgeLength(horizontalWidth - 4, horizontalDepth - 4, 'shelf')
      });
    }
    
    // SZUFLADY - SPRAWDŹ WSZYSTKIE MOŻLIWE NAZWY
    const isDrawerModule = moduleConfig?.id === 'drawers' || 
                          moduleConfig?.type === 'drawers' || 
                          moduleConfig?.name === 'drawers' ||
                          moduleConfig === 'drawers';
    
    console.log(`🗃️ Module ${index} is drawer module?`, isDrawerModule, 'config:', moduleConfig);
    
    if (isDrawerModule) {
      console.log(`✅ Adding drawers to module ${index}`);
      const numDrawers = 4;
      
      for (let d = 0; d < numDrawers; d++) {
        // Front szuflady
        const drawerFrontWidth = horizontalWidth - 20;
        pieces.push({
          name: `Front szuflady ${d + 1}-${index + 1}`,
          width: drawerFrontWidth,
          height: 180,
          quantity: 1,
          type: 'drawer_front',
          moduleIndex: index,
          drawerIndex: d,
          edgeLength: calculateEdgeLength(drawerFrontWidth, 180, 'front')
        });
        
        // Boki szuflady (2 sztuki)
        const drawerSideDepth = depth - 40;
        for (let side = 0; side < 2; side++) {
          pieces.push({
            name: `Bok ${side + 1} szuflady ${d + 1}-${index + 1}`,
            width: drawerSideDepth,
            height: 180,
            quantity: 1,
            type: 'drawer_side',
            moduleIndex: index,
            drawerIndex: d,
            edgeLength: calculateEdgeLength(drawerSideDepth, 180, 'side')
          });
        }
        
        // Tył szuflady
        pieces.push({
          name: `Tył szuflady ${d + 1}-${index + 1}`,
          width: drawerFrontWidth - 32,
          height: 180,
          quantity: 1,
          type: 'drawer_back',
          moduleIndex: index,
          drawerIndex: d,
          edgeLength: calculateEdgeLength(drawerFrontWidth - 32, 180, 'side')
        });
        
        // Dno szuflady (HDF)
        pieces.push({
          name: `Dno szuflady ${d + 1}-${index + 1}`,
          width: drawerFrontWidth,
          height: drawerSideDepth,
          quantity: 1,
          type: 'drawer_bottom',
          material: 'HDF',
          moduleIndex: index,
          drawerIndex: d,
          edgeLength: 0
        });
      }
    }
  });
  
  // Cokół
  pieces.push({
    name: 'Cokół',
    width: width,
    height: 100,
    quantity: 1,
    type: 'plinth',
    edgeLength: calculateEdgeLength(width, 100, 'plinth')
  });
  
  console.log('📦 Total pieces generated:', pieces.length);
  const drawerPieces = pieces.filter(p => p.type?.includes('drawer'));
  console.log('🗃️ Drawer pieces:', drawerPieces.length);
  
  return pieces;
};

const calculateModuleWidths = (totalWidth, numModules, distribution) => {
  const baseWidth = totalWidth / numModules;
  const widths = [];
  
  switch (distribution) {
    case 'equal':
      return Array(numModules).fill(baseWidth);
      
    case 'left-half':
      widths.push(baseWidth * 0.5);
      const remainingWidth = totalWidth - baseWidth * 0.5;
      const otherWidth = remainingWidth / (numModules - 1);
      for (let i = 1; i < numModules; i++) {
        widths.push(otherWidth);
      }
      return widths;
      
    case 'right-half':
      const rightOtherWidth = (totalWidth - baseWidth * 0.5) / (numModules - 1);
      for (let i = 0; i < numModules - 1; i++) {
        widths.push(rightOtherWidth);
      }
      widths.push(baseWidth * 0.5);
      return widths;
      
    default:
      return Array(numModules).fill(baseWidth);
  }
};

const calculateEdgeLength = (width, height, type) => {
  switch (type) {
    case 'side':
    case 'divider':
      return 2 * (width + height);
    case 'horizontal':
      return 2 * width + height;
    case 'front':
      return 2 * (width + height);
    case 'shelf':
      return 2 * width;
    case 'plinth':
      return 2 * width;
    case 'back':
    default:
      return 0;
  }
};

const getShelfCount = (moduleConfig) => {
  // Sprawdź wszystkie możliwe nazwy
  const moduleType = moduleConfig?.id || moduleConfig?.type || moduleConfig?.name || moduleConfig;
  
  switch (moduleType) {
    case 'shelf': return 3;
    case 'hanging': return 1;
    case 'drawers': return 1;
    case 'mixed': return 2;
    default: return 1;
  }
};

const getDrawerCount = (modules) => {
  console.log('🔍 getDrawerCount called with:', modules);
  
  if (!modules || !Array.isArray(modules)) {
    console.log('❌ No modules or not array');
    return 0;
  }
  
  let count = 0;
  modules.forEach((module, index) => {
    // Sprawdź wszystkie możliwe nazwy
    const isDrawers = module?.id === 'drawers' || 
                     module?.type === 'drawers' || 
                     module?.name === 'drawers' ||
                     module === 'drawers';
    
    console.log(`Module ${index}:`, module, 'is drawers?', isDrawers);
    
    if (isDrawers) {
      count += 4; // 4 szuflady na moduł
    }
  });
  
  console.log('🗃️ Total drawer count:', count);
  return count;
};

const optimizeCutting = (pieces) => {
  const sheets = [];
  const { width: sheetWidth, height: sheetHeight } = PRICING_CONSTANTS.BOARD_SIZE;
  
  const boardPieces = pieces.filter(piece => piece.material !== 'HDF');
  const sortedPieces = [...boardPieces].sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  sortedPieces.forEach(piece => {
    let placed = false;
    
    for (let sheet of sheets) {
      const position = findPositionOnSheet(sheet, piece, sheetWidth, sheetHeight);
      if (position) {
        sheet.pieces.push({
          ...piece,
          x: position.x,
          y: position.y
        });
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      if (piece.width + PRICING_CONSTANTS.CUT_ALLOWANCE <= sheetWidth && 
          piece.height + PRICING_CONSTANTS.CUT_ALLOWANCE <= sheetHeight) {
        sheets.push({
          id: sheets.length + 1,
          pieces: [{
            ...piece,
            x: PRICING_CONSTANTS.CUT_ALLOWANCE,
            y: PRICING_CONSTANTS.CUT_ALLOWANCE
          }]
        });
      } else {
        console.warn(`Element ${piece.name} jest za duży dla standardowego arkusza!`);
      }
    }
  });
  
  return sheets;
};

const findPositionOnSheet = (sheet, piece, sheetWidth, sheetHeight) => {
  const allowance = PRICING_CONSTANTS.CUT_ALLOWANCE;
  
  for (let y = allowance; y <= sheetHeight - piece.height - allowance; y += 10) {
    for (let x = allowance; x <= sheetWidth - piece.width - allowance; x += 10) {
      if (isPositionFree(sheet, x, y, piece.width, piece.height, allowance)) {
        return { x, y };
      }
    }
  }
  
  return null;
};

const isPositionFree = (sheet, x, y, width, height, allowance) => {
  const newRect = {
    x1: x - allowance,
    y1: y - allowance,
    x2: x + width + allowance,
    y2: y + height + allowance
  };
  
  return !sheet.pieces.some(piece => {
    const existingRect = {
      x1: piece.x - allowance,
      y1: piece.y - allowance,
      x2: piece.x + piece.width + allowance,
      y2: piece.y + piece.height + allowance
    };
    
    return !(newRect.x2 <= existingRect.x1 || 
             newRect.x1 >= existingRect.x2 || 
             newRect.y2 <= existingRect.y1 || 
             newRect.y1 >= existingRect.y2);
  });
};

const calculateCosts = (pieces, sheets, modules) => {
  console.log('🔍 calculateCosts called');
  console.log('📦 Modules received:', modules);
  
  // 1. Koszt płyt meblowych
  const boardPieces = pieces.filter(piece => piece.material !== 'HDF');
  const sheetArea = (PRICING_CONSTANTS.BOARD_SIZE.width * PRICING_CONSTANTS.BOARD_SIZE.height) / 1000000;
  const rawBoardCost = sheets.length * sheetArea * PRICING_CONSTANTS.BOARD_PRICE_PER_SQM;
  
  // 2. Koszt obrzeża
  const totalEdgeLength = boardPieces.reduce((sum, piece) => sum + piece.edgeLength, 0) / 1000;
  const rawEdgeCost = totalEdgeLength * PRICING_CONSTANTS.EDGE_PRICE_PER_MB;
  
  // 3. Koszt cięcia
  const rawCuttingCost = totalEdgeLength * PRICING_CONSTANTS.CUTTING_PRICE_PER_MB;
  
  // Marża 30%
  const materialMargin = 0.30;
  const boardCost = rawBoardCost * (1 + materialMargin);
  const edgeCost = rawEdgeCost * (1 + materialMargin);
  const cuttingCost = rawCuttingCost * (1 + materialMargin);
  
  // 4. Koszt szuflad
  const totalDrawerCount = getDrawerCount(modules);
  const drawerCost = totalDrawerCount * PRICING_CONSTANTS.DRAWER_PRICE;
  console.log('💰 Drawer cost calculation:', totalDrawerCount, 'x', PRICING_CONSTANTS.DRAWER_PRICE, '=', drawerCost);
  
  // 5. Koszt zawiasów
  let hingesCost = 0;
  let singleDoorCount = 0;
  let doubleDoorCount = 0;
  
  const frontsByModule = {};
  pieces.forEach(piece => {
    if (piece.type === 'front') {
      if (!frontsByModule[piece.moduleIndex]) {
        frontsByModule[piece.moduleIndex] = [];
      }
      frontsByModule[piece.moduleIndex].push(piece);
    }
  });
  
  Object.keys(frontsByModule).forEach(moduleIndex => {
    const frontsInModule = frontsByModule[moduleIndex];
    if (frontsInModule.length === 1) {
      singleDoorCount++;
    } else if (frontsInModule.length === 2) {
      doubleDoorCount++;
    }
  });
  
  hingesCost = (singleDoorCount * PRICING_CONSTANTS.SINGLE_DOOR_HINGES) + 
               (doubleDoorCount * PRICING_CONSTANTS.DOUBLE_DOOR_HINGES);
  
  const total = boardCost + edgeCost + cuttingCost + drawerCost + hingesCost;
  
  console.log('💵 COST BREAKDOWN:');
  console.log('Board cost:', boardCost.toFixed(2));
  console.log('Edge cost:', edgeCost.toFixed(2));
  console.log('Cutting cost:', cuttingCost.toFixed(2));
  console.log('Drawer cost:', drawerCost.toFixed(2));
  console.log('Hinges cost:', hingesCost.toFixed(2));
  console.log('🎯 TOTAL:', total.toFixed(2));
  
  return {
    boardCost,
    edgeCost,
    cuttingCost,
    drawerCost,
    hingesCost,
    total,
    sheetsUsed: sheets.length,
    totalEdgeLength,
    totalCuttingLength: totalEdgeLength,
    drawerCount: totalDrawerCount,
    singleDoorCount,
    doubleDoorCount,
    breakdown: {
      sheetArea: sheetArea.toFixed(2),
      pricePerSqm: PRICING_CONSTANTS.BOARD_PRICE_PER_SQM,
      materialMargin: materialMargin * 100,
      rawBoardCost: rawBoardCost,
      rawEdgeCost: rawEdgeCost,
      rawCuttingCost: rawCuttingCost
    }
  };
};

const calculateEfficiency = (pieces, sheets) => {
  const boardPieces = pieces.filter(piece => piece.material !== 'HDF');
  const usedArea = boardPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);
  const totalSheetArea = sheets.length * PRICING_CONSTANTS.BOARD_SIZE.width * PRICING_CONSTANTS.BOARD_SIZE.height;
  return totalSheetArea > 0 ? (usedArea / totalSheetArea * 100) : 0;
};