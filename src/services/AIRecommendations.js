// AI Recommendations Engine - Inteligentne sugestie dla użytkowników
import { MODULE_TYPES } from '../data/moduleTypes';
import { ALL_COLORS } from '../data/colors';
import { WARDROBE_CONSTANTS } from '../data/constants';

// Profil użytkownika na podstawie preferencji
export class UserProfile {
  constructor(answers = {}) {
    this.lifestyle = answers.lifestyle || 'mixed'; // formal, casual, mixed, sporty
    this.familySize = answers.familySize || 1;
    this.storageNeeds = answers.storageNeeds || 'medium'; // low, medium, high
    this.style = answers.style || 'modern'; // modern, classic, minimalist, scandinavian
    this.budget = answers.budget || 'medium'; // low, medium, high, premium
    this.roomType = answers.roomType || 'bedroom'; // bedroom, dressingRoom, hallway
    this.roomSize = answers.roomSize || 'medium'; // small, medium, large
    this.hasChildren = answers.hasChildren || false;
    this.workFromHome = answers.workFromHome || false;
    this.seasonalClothing = answers.seasonalClothing || 'normal'; // minimal, normal, extensive
  }
}

export class AIRecommendationEngine {
  constructor() {
    // Wzorce użytkowania na podstawie analizy danych
    this.patterns = {
      lifestyle: {
        formal: { 
          modules: ['mod1', 'mod4', 'mod2'], // Więcej drążków na garnitury
          colors: ['#F8F8FF', '#36454F'], // Klasyczne kolory
          handles: 'long' // Eleganckie uchwyty
        },
        casual: {
          modules: ['mod8', 'mod5', 'mod2'], // Więcej półek na casualowe ubrania
          colors: ['#D4A373', '#C4A373'], // Ciepłe kolory
          handles: 'knob'
        },
        sporty: {
          modules: ['mod11', 'mod4', 'mod8'], // Kombinacja szuflad i półek
          colors: ['#2F4F4F', '#F8F8FF'], // Dynamiczne kolory
          handles: 'edge'
        }
      },
      
      familySize: {
        1: { moduleCount: 2, distribution: 'equal' },
        2: { moduleCount: 3, distribution: 'equal' },
        3: { moduleCount: 4, distribution: 'equal' },
        4: { moduleCount: 5, distribution: 'left-half' }
      },
      
      roomType: {
        bedroom: { depth: 60, colors: ['warm'], lighting: 'cozy' },
        dressingRoom: { depth: 80, colors: ['neutral'], lighting: 'bright' },
        hallway: { depth: 35, colors: ['light'], lighting: 'functional' }
      },
      
      style: {
        modern: { 
          colors: ['#F8F8FF', '#36454F', '#2F4F4F'],
          handles: 'edge',
          blenda: 'none'
        },
        classic: {
          colors: ['#D4A373', '#C4A373', '#8B4513'],
          handles: 'long',
          blenda: 'both'
        },
        minimalist: {
          colors: ['#F8F8FF', '#F0F8FF'],
          handles: 'none',
          blenda: 'none'
        },
        scandinavian: {
          colors: ['#F5DEB3', '#F8F8FF', '#E6D5B8'],
          handles: 'knob',
          blenda: 'left'
        }
      }
    };
    
    // Machine Learning-inspired scoring system
    this.weights = {
      lifestyle: 0.3,
      familySize: 0.25,
      style: 0.2,
      roomType: 0.15,
      storageNeeds: 0.1
    };
  }
  
  // Główna funkcja generująca rekomendacje
  generateRecommendations(userProfile, currentConfig = {}) {
    const recommendations = {
      layout: this.recommendLayout(userProfile, currentConfig),
      colors: this.recommendColors(userProfile, currentConfig),
      modules: this.recommendModules(userProfile, currentConfig),
      accessories: this.recommendAccessories(userProfile),
      optimizations: this.findOptimizations(currentConfig),
      confidence: 0
    };
    
    recommendations.confidence = this.calculateConfidence(recommendations, userProfile);
    
    return recommendations;
  }
  
  // Rekomendacje układu i wymiarów
  recommendLayout(userProfile, currentConfig) {
    const baseRecommendations = {
      width: this.getOptimalWidth(userProfile),
      height: this.getOptimalHeight(userProfile),
      depth: this.getOptimalDepth(userProfile),
      moduleCount: this.getOptimalModuleCount(userProfile),
      distribution: this.getOptimalDistribution(userProfile)
    };
    
    return {
      ...baseRecommendations,
      reasoning: this.explainLayoutChoice(userProfile, baseRecommendations)
    };
  }
  
  getOptimalWidth(profile) {
    let width = 2200; // Base width
    
    if (profile.familySize > 2) width += 500;
    if (profile.roomType === 'dressingRoom') width += 800;
    if (profile.storageNeeds === 'high') width += 600;
    if (profile.roomSize === 'large') width += 400;
    
    return Math.min(4000, Math.max(800, width));
  }
  
  getOptimalHeight(profile) {
    if (profile.seasonalClothing === 'extensive') return 2750;
    if (profile.roomType === 'dressingRoom') return 2400;
    if (profile.familySize > 3) return 2400;
    return 2000;
  }
  
  getOptimalDepth(profile) {
    const depthMap = {
      hallway: 35,
      bedroom: 60,
      dressingRoom: 80
    };
    return (depthMap[profile.roomType] || 60) * 10; // Convert to mm
  }
  
  getOptimalModuleCount(profile) {
    const base = this.patterns.familySize[Math.min(profile.familySize, 4)]?.moduleCount || 3;
    if (profile.storageNeeds === 'high') return Math.min(base + 1, 6);
    if (profile.storageNeeds === 'low') return Math.max(base - 1, 2);
    return base;
  }
  
  getOptimalDistribution(profile) {
    if (profile.hasChildren) return 'right-half'; // Łatwiejszy dostęp dla dzieci
    if (profile.lifestyle === 'formal') return 'equal'; // Równomierne rozłożenie garniturów
    return 'equal';
  }
  
  // Rekomendacje kolorów
  recommendColors(userProfile, currentConfig) {
    const styleColors = this.patterns.style[userProfile.style]?.colors || [];
    const roomColors = this.getRoomAppropriateColors(userProfile.roomType);
    
    // AI scoring - kombinuj preferencje stylu z praktycznością pomieszczenia
    const scoredColors = ALL_COLORS.map(color => ({
      ...color,
      score: this.scoreColor(color, userProfile, styleColors, roomColors)
    }));
    
    const sortedColors = scoredColors.sort((a, b) => b.score - a.score);
    
    return {
      exterior: sortedColors.slice(0, 3),
      interior: this.getComplementaryInteriorColors(sortedColors[0]),
      reasoning: this.explainColorChoice(userProfile, sortedColors[0])
    };
  }
  
  scoreColor(color, profile, styleColors, roomColors) {
    let score = 0;
    
    // Style compatibility
    if (styleColors.includes(color.value)) score += 40;
    
    // Room type compatibility
    if (roomColors.includes(color.category)) score += 30;
    
    // Practical considerations
    if (profile.hasChildren && color.value !== '#FFFFFF') score += 20; // Dzieci = praktyczne kolory
    if (profile.roomType === 'hallway' && color.category === 'modern') score += 15;
    
    // Brand preference (można rozszerzyć o preferencje użytkownika)
    if (color.brand === 'EGGER') score += 10;
    
    return score;
  }
  
  getRoomAppropriateColors(roomType) {
    const roomColorMap = {
      bedroom: ['natural', 'modern'],
      dressingRoom: ['modern', 'natural'],
      hallway: ['modern']
    };
    return roomColorMap[roomType] || ['natural', 'modern'];
  }
  
  getComplementaryInteriorColors(exteriorColor) {
    // Inteligentny dobór koloru wnętrza do zewnętrznego
    const complementaryMap = {
      '#D4A373': '#F8F8FF', // Ciepły dąb -> biały
      '#36454F': '#F0F8FF', // Antracyt -> jasny
      '#F8F8FF': '#E6D5B8', // Biały -> ciepły accent
    };
    
    return complementaryMap[exteriorColor.value] || '#F8F8FF';
  }
  
  // Rekomendacje modułów
  recommendModules(userProfile, currentConfig) {
    const lifestyleModules = this.patterns.lifestyle[userProfile.lifestyle]?.modules || [];
    const needsBasedModules = this.getModulesForNeeds(userProfile);
    
    // AI kombinuje preferencje lifestyle z praktycznymi potrzebami
    const moduleScores = MODULE_TYPES.map(module => ({
      ...module,
      score: this.scoreModule(module, userProfile, lifestyleModules, needsBasedModules),
      reasoning: this.getModuleReasoning(module, userProfile)
    }));
    
    return moduleScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 recommendations
  }
  
  scoreModule(module, profile, lifestyleModules, needsBasedModules) {
    let score = 0;
    
    // Lifestyle compatibility
    if (lifestyleModules.includes(module.id)) score += 50;
    
    // Needs-based scoring
    if (needsBasedModules.includes(module.id)) score += 40;
    
    // Family size considerations
    if (profile.familySize > 2 && module.name.includes('szuflady')) score += 30;
    if (profile.hasChildren && module.name.includes('półki')) score += 25;
    
    // Work from home bonus
    if (profile.workFromHome && module.name.includes('Drążek')) score += 20;
    
    // Storage needs
    if (profile.storageNeeds === 'high' && module.name.includes('6')) score += 35;
    if (profile.storageNeeds === 'low' && module.name.includes('4')) score += 30;
    
    return score;
  }
  
  getModulesForNeeds(profile) {
    const needsMap = {
      high: ['mod10', 'mod14', 'mod6'], // Dużo półek i szuflad
      medium: ['mod8', 'mod4', 'mod2'], // Balans
      low: ['mod1', 'mod2', 'mod8'] // Podstawowe
    };
    return needsMap[profile.storageNeeds] || needsMap.medium;
  }
  
  getModuleReasoning(module, profile) {
    const reasons = [];
    
    if (module.name.includes('Drążek') && profile.lifestyle === 'formal') {
      reasons.push('Idealny do garniturów i koszul');
    }
    if (module.name.includes('szuflady') && profile.hasChildren) {
      reasons.push('Ułatwia organizację dziecięcych ubrań');
    }
    if (module.name.includes('półki') && profile.storageNeeds === 'high') {
      reasons.push('Maksymalizuje przestrzeń przechowywania');
    }
    
    return reasons;
  }
  
  // Rekomendacje akcesoriów
  recommendAccessories(userProfile) {
    const accessories = [];
    
    if (userProfile.style === 'modern') {
      accessories.push({
        name: 'Oświetlenie LED',
        reason: 'Podkreśli nowoczesny charakter',
        priority: 'high'
      });
    }
    
    if (userProfile.familySize > 2) {
      accessories.push({
        name: 'Organizery do szuflad',
        reason: 'Ułatwi organizację dla całej rodziny',
        priority: 'medium'
      });
    }
    
    if (userProfile.lifestyle === 'formal') {
      accessories.push({
        name: 'Wieszaki na krawaty',
        reason: 'Niezbędne do eleganckich strojów',
        priority: 'high'
      });
    }
    
    return accessories;
  }
  
  // Znajdź optymalizacje obecnej konfiguracji
  findOptimizations(currentConfig) {
    const optimizations = [];
    
    if (currentConfig.modules?.length > 0) {
      // Sprawdź balans typów modułów
      const drazkiCount = currentConfig.modules.filter(m => m.id.includes('mod1') || m.id.includes('mod2')).length;
      const szufladyCount = currentConfig.modules.filter(m => m.name?.includes('szuflady')).length;
      
      if (drazkiCount === 0) {
        optimizations.push({
          type: 'missing',
          message: 'Rozważ dodanie modułu z drążkiem na wiszące ubrania',
          impact: 'medium'
        });
      }
      
      if (szufladyCount === 0) {
        optimizations.push({
          type: 'missing',
          message: 'Szuflady ułatwiłyby organizację małych przedmiotów',
          impact: 'low'
        });
      }
    }
    
    // Sprawdź efektywność wykorzystania przestrzeni
    if (currentConfig.width && currentConfig.height) {
      const spaceEfficiency = this.calculateSpaceEfficiency(currentConfig);
      if (spaceEfficiency < 0.7) {
        optimizations.push({
          type: 'efficiency',
          message: 'Można lepiej wykorzystać dostępną przestrzeń',
          impact: 'high',
          suggestion: 'Zwiększ liczbę modułów lub zmień ich typ'
        });
      }
    }
    
    return optimizations;
  }
  
  calculateSpaceEfficiency(config) {
    // Prosta metryka efektywności - można rozbudować
    const totalVolume = config.width * config.height * config.depth;
    const usedVolume = (config.modules?.length || 0) * 50000; // Przybliżona objętość modułu
    return usedVolume / totalVolume;
  }
  
  // Oblicz pewność rekomendacji
  calculateConfidence(recommendations, userProfile) {
    let confidence = 0.5; // Base confidence
    
    // Im więcej informacji o użytkowniku, tym większa pewność
    const profileCompleteness = Object.values(userProfile).filter(v => v !== null && v !== '').length / 9;
    confidence += profileCompleteness * 0.3;
    
    // Spójność rekomendacji
    if (recommendations.layout && recommendations.colors && recommendations.modules) {
      confidence += 0.2;
    }
    
    return Math.min(0.95, confidence); // Maksymalnie 95% pewności
  }
  
  // Wyjaśnienia dla użytkownika
  explainLayoutChoice(profile, layout) {
    const reasons = [];
    
    if (profile.familySize > 2) {
      reasons.push(`Szerokość ${layout.width/10}cm jest optymalna dla rodziny ${profile.familySize} osób`);
    }
    if (profile.roomType === 'dressingRoom') {
      reasons.push(`Garderoba wymaga większej głębokości (${layout.depth/10}cm) dla wygody`);
    }
    if (layout.height > 2200) {
      reasons.push('Wysoka szafa maksymalizuje wykorzystanie przestrzeni');
    }
    
    return reasons;
  }
  
  explainColorChoice(profile, color) {
    const styleExplanation = {
      modern: 'Nowoczesny styl preferuje czyste, geometryczne kolory',
      classic: 'Klasyczny styl wymaga ciepłych, naturalnych odcieni',
      minimalist: 'Minimalizm stawia na neutralne, spokojne kolory',
      scandinavian: 'Styl skandynawski łączy jasność z naturalnymi materiałami'
    };
    
    return styleExplanation[profile.style] || 'Kolor dobrany do Twoich preferencji';
  }
}

// Questionnaire dla profilowania użytkownika
export const AIQuuestionnaire = {
  questions: [
    {
      id: 'lifestyle',
      question: 'Jak opisałbyś swój styl ubierania się?',
      type: 'radio',
      options: [
        { value: 'formal', label: 'Elegancki - garnitury, sukienki, stroje biznesowe' },
        { value: 'casual', label: 'Casualowy - jeansy, t-shirty, swetry' },
        { value: 'mixed', label: 'Mieszany - trochę eleganckiego, trochę casualowego' },
        { value: 'sporty', label: 'Sportowy - dresy, stroje do ćwiczeń, outdoor' }
      ]
    },
    {
      id: 'familySize',
      question: 'Dla ilu osób będzie ta szafa?',
      type: 'number',
      min: 1,
      max: 6
    },
    {
      id: 'roomType',
      question: 'Gdzie będzie stała szafa?',
      type: 'radio',
      options: [
        { value: 'bedroom', label: 'Sypialnia' },
        { value: 'dressingRoom', label: 'Garderoba' },
        { value: 'hallway', label: 'Przedpokój' }
      ]
    },
    {
      id: 'storageNeeds',
      question: 'Ile ubrań masz do przechowania?',
      type: 'radio',
      options: [
        { value: 'low', label: 'Niewiele - minimalistyczny zestaw' },
        { value: 'medium', label: 'Przeciętnie - standardowa ilość' },
        { value: 'high', label: 'Dużo - rozbudowana garderoba' }
      ]
    },
    {
      id: 'style',
      question: 'Jaki styl wnętrza preferujesz?',
      type: 'radio',
      options: [
        { value: 'modern', label: 'Nowoczesny' },
        { value: 'classic', label: 'Klasyczny' },
        { value: 'minimalist', label: 'Minimalistyczny' },
        { value: 'scandinavian', label: 'Skandynawski' }
      ]
    },
    {
      id: 'hasChildren',
      question: 'Czy w domu są dzieci?',
      type: 'boolean'
    },
    {
      id: 'workFromHome',
      question: 'Czy pracujesz zdalnie?',
      type: 'boolean'
    }
  ]
};

export default AIRecommendationEngine;