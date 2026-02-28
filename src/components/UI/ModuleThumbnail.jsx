import React from 'react';

const ModuleThumbnail = ({ type, isActive, onClick }) => {
  const rail = <line x1="10" y1="20" x2="90" y2="20" stroke="#888" strokeWidth="3" />;
  const shelf = (y) => <rect x="10" y={y} width="80" height="3" fill="#DDD" />;
  const drawer = (y, h = 15) => (
    <rect x="15" y={y} width="70" height={h} fill="#DDD" stroke="#AAA" strokeWidth="1" />
  );

  const getModuleContent = (moduleId) => {
    switch (moduleId) {
      case 'mod1': return rail;
      case 'mod2': return <>{rail}{shelf(120)}</>;
      case 'mod3': return <>{rail}{shelf(100)}{shelf(120)}</>;
      case 'mod4': return <>{rail}{drawer(120)}{drawer(100)}</>;
      case 'mod5': return <>{rail}{drawer(120)}{drawer(100)}{drawer(80)}</>;
      case 'mod6': return <>{rail}{drawer(120)}{drawer(100)}{drawer(80)}{drawer(60)}</>;
      case 'mod7': return <>{rail}{shelf(80)}{drawer(120)}{drawer(100)}</>;
      case 'mod8': return <>{shelf(30)}{shelf(60)}{shelf(90)}{shelf(120)}</>;
      case 'mod9': return <>{shelf(30)}{shelf(55)}{shelf(80)}{shelf(105)}{shelf(130)}</>;
      case 'mod10': return <>{shelf(25)}{shelf(45)}{shelf(65)}{shelf(85)}{shelf(105)}{shelf(125)}</>;
      case 'mod11': return <>{drawer(120)}{drawer(100)}{shelf(80)}{shelf(60)}{shelf(40)}{shelf(20)}</>;
      case 'mod12': return <>{shelf(120)}{drawer(100)}{drawer(80)}{shelf(60)}{shelf(40)}{shelf(20)}</>;
      case 'mod13': return <>{rail}<line x1="10" y1="80" x2="90" y2="80" stroke="#888" strokeWidth="3" /></>;
      case 'mod14': return <>{drawer(120)}{drawer(103)}{drawer(86)}{drawer(69)}{drawer(52)}{drawer(35)}{shelf(20)}{shelf(5)}</>;
      case 'mod15': return <>{rail}{shelf(60)}{drawer(120, 25)}{drawer(90)}{drawer(70)}</>;
      case 'mod16': return <>{rail}{shelf(100)}{drawer(120, 25)}</>;
      case 'mod17': return <>{rail}{shelf(80)}{drawer(120, 25)}{drawer(90, 25)}</>;
      case 'mod18': return <><rect x="48.5" y="40" width="3" height="100" fill="#DDD" />{shelf(37)}</>;
      case 'mod19': return <>{rail}{shelf(80)}{drawer(120)}{drawer(100)}</>;
      default: return <>{rail}{shelf(120)}</>;
    }
  };

  return (
    <div
      className={`thumbnail-card ${isActive ? 'active' : ''}`}
      onClick={() => onClick(type.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(type.id);
        }
      }}
    >
      <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
        {getModuleContent(type.id)}
      </svg>

      {/* Tylko nazwa — bez ceny */}
      <span>{type.name}</span>
    </div>
  );
};

export default ModuleThumbnail;
