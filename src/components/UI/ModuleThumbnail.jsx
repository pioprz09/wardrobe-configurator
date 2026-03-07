import React from 'react';

// ─── SVG helpers ─────────────────────────────────────────────────
// viewBox 0 0 60 100 | inner: x[3..57] y[3..97] = 54×94px ≙ 2000mm
const IL = 3, IR = 57, IT = 3, IB = 97;
const IW = IR - IL;
const MX = (IL + IR) / 2;

const ft  = mm => IT + 94 * mm / 2000;   // mm from top  → SVG y
const fb  = mm => IB - 94 * mm / 2000;   // mm from floor→ SVG y (top of element)
const fh  = mm => 94 * mm / 2000;        // mm           → px height

const D200  = fh(200);   // ≈ 9.4 px
const D110  = fh(110);   // ≈ 5.2 px
const SEAT  = fb(450);   // bench seat top ≈ y 75.8

// ─── Primitives ──────────────────────────────────────────────────
const Rail = ({ y = ft(90) }) => (
  <>
    <line x1={IL+1} y1={y} x2={IR-1} y2={y} stroke="#7A6A5A" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx={IL+2} cy={y} r={1.5} fill="#7A6A5A"/>
    <circle cx={IR-2} cy={y} r={1.5} fill="#7A6A5A"/>
  </>
);

const Shelf = ({ y, x1=IL, x2=IR }) => (
  <rect x={x1} y={y} width={x2-x1} height={2} rx={0.5} fill="#C0B0A0"/>
);

const Drawer = ({ y, h=D200 }) => {
  const dh = Math.max(h - 1, 3);
  return (
    <g>
      <rect x={IL+1} y={y+0.5} width={IW-2} height={dh} rx={1}
        fill="#E5DDD6" stroke="#BDB0A4" strokeWidth="0.75"/>
      <line x1={MX-7} y1={y+dh/2+0.5} x2={MX+7} y2={y+dh/2+0.5}
        stroke="#A09080" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  );
};

const VDiv = ({ x, y1=IT, y2=IB }) => (
  <rect x={x-1} y={y1} width={2} height={y2-y1} rx={0.5} fill="#C0B0A0"/>
);

const Door = ({ y, h }) => (
  <g>
    <rect x={IL+1} y={y+0.5} width={IW-2} height={h-1} rx={1}
      fill="#EEEBE7" stroke="#C8BEB4" strokeWidth="0.75"/>
    <line x1={MX-5} y1={y+h*0.5} x2={MX+5} y2={y+h*0.5}
      stroke="#B0A090" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
);

const SeatPlank = ({ y }) => (
  <rect x={IL} y={y} width={IW} height={3} rx={0.5} fill="#B8A898"/>
);

// ─── Module content ──────────────────────────────────────────────
const getContent = id => {
  switch (id) {

    // ── WIESZAK ────────────────────────────────────────────────
    case 'mod1':   // Drążek
      return <Rail/>;

    case 'mod2': { // 2× drążek — dwa poziomy krótkich ubrań
      const mid = (IT + IB) / 2;
      return <><Rail y={ft(90)}/><Shelf y={mid}/><Rail y={mid + fh(90)}/></>;
    }

    case 'mod3':   // Drążek + półka 320mm od dołu
      return <><Rail/><Shelf y={fb(320)}/></>;

    case 'mod4':   // Drążek + 2 półki od dołu
      return <><Rail/><Shelf y={fb(450)}/><Shelf y={fb(225)}/></>;

    case 'mod5':   // Drążek + 3 półki od dołu
      return <><Rail/><Shelf y={fb(570)}/><Shelf y={fb(380)}/><Shelf y={fb(190)}/></>;

    // ── DRĄŻEK + SZUFLADY ──────────────────────────────────────
    case 'mod6':   // Drążek + 1 sz. 200
      return <><Rail/><Drawer y={fb(200)} h={D200}/></>;

    case 'mod7':   // Drążek + 2 sz. 200
      return <><Rail/><Drawer y={fb(400)} h={D200}/><Drawer y={fb(200)} h={D200}/></>;

    case 'mod8':   // Drążek + 3 sz. 200
      return <><Rail/>
        <Drawer y={fb(600)} h={D200}/><Drawer y={fb(400)} h={D200}/><Drawer y={fb(200)} h={D200}/>
      </>;

    case 'mod9':   // Drążek + 2 sz. 110
      return <><Rail/><Drawer y={fb(220)} h={D110}/><Drawer y={fb(110)} h={D110}/></>;

    case 'mod10':  // Drążek + 3 sz. 110
      return <><Rail/>
        <Drawer y={fb(330)} h={D110}/><Drawer y={fb(220)} h={D110}/><Drawer y={fb(110)} h={D110}/>
      </>;

    case 'mod11':  // Drążek + 4 sz. 110
      return <><Rail/>
        <Drawer y={fb(440)} h={D110}/><Drawer y={fb(330)} h={D110}/>
        <Drawer y={fb(220)} h={D110}/><Drawer y={fb(110)} h={D110}/>
      </>;

    case 'mod12':  // Drążek + 5 sz. 110
      return <><Rail/>
        <Drawer y={fb(550)} h={D110}/><Drawer y={fb(440)} h={D110}/><Drawer y={fb(330)} h={D110}/>
        <Drawer y={fb(220)} h={D110}/><Drawer y={fb(110)} h={D110}/>
      </>;

    // ── TYLKO PÓŁKI ────────────────────────────────────────────
    case 'mod13':  // 3 półki
      return <><Shelf y={ft(500)}/><Shelf y={ft(1000)}/><Shelf y={ft(1500)}/></>;

    case 'mod22':  // 4 półki
      return <><Shelf y={ft(400)}/><Shelf y={ft(800)}/><Shelf y={ft(1200)}/><Shelf y={ft(1600)}/></>;

    case 'mod20':  // 5 półek
      return <><Shelf y={ft(333)}/><Shelf y={ft(667)}/><Shelf y={ft(1000)}/><Shelf y={ft(1333)}/><Shelf y={ft(1667)}/></>;

    case 'mod21':  // 6 półek
      return <><Shelf y={ft(286)}/><Shelf y={ft(571)}/><Shelf y={ft(857)}/>
               <Shelf y={ft(1143)}/><Shelf y={ft(1429)}/><Shelf y={ft(1714)}/></>;

    // ── DRĄŻEK + PÓŁKI + SZUFLADY ──────────────────────────────
    case 'mod14':  // Drążek + półka 320 + 2 sz. powyżej półki
      return <><Rail/>
        <Drawer y={fb(720)} h={D200}/><Drawer y={fb(520)} h={D200}/>
        <Shelf y={fb(320)}/>
      </>;

    case 'mod15':  // 1 sz. 200 + 4 półki
      return <>
        <Shelf y={ft(380)}/><Shelf y={ft(760)}/><Shelf y={ft(1140)}/>
        <Shelf y={fb(200)-3}/>
        <Drawer y={fb(200)} h={D200}/>
      </>;

    case 'mod16':  // 2 sz. 200 + 4 półki
      return <>
        <Shelf y={ft(350)}/><Shelf y={ft(700)}/><Shelf y={ft(1050)}/>
        <Shelf y={fb(400)-3}/>
        <Drawer y={fb(400)} h={D200}/><Drawer y={fb(200)} h={D200}/>
      </>;

    case 'mod17':  // 3 sz. 200 + 3 półki
      return <>
        <Shelf y={ft(466)}/><Shelf y={ft(933)}/>
        <Shelf y={fb(600)-3}/>
        <Drawer y={fb(600)} h={D200}/><Drawer y={fb(400)} h={D200}/><Drawer y={fb(200)} h={D200}/>
      </>;

    case 'mod18':  // 6 sz. 110 + 3 półki
      return <>
        <Shelf y={ft(466)}/><Shelf y={ft(933)}/>
        <Shelf y={fb(660)-3}/>
        <Drawer y={fb(660)} h={D110}/><Drawer y={fb(550)} h={D110}/><Drawer y={fb(440)} h={D110}/>
        <Drawer y={fb(330)} h={D110}/><Drawer y={fb(220)} h={D110}/><Drawer y={fb(110)} h={D110}/>
      </>;

    case 'mod19':  // 5 sz. 110 + 3 półki
      return <>
        <Shelf y={ft(500)}/><Shelf y={ft(1000)}/>
        <Shelf y={fb(550)-3}/>
        <Drawer y={fb(550)} h={D110}/><Drawer y={fb(440)} h={D110}/><Drawer y={fb(330)} h={D110}/>
        <Drawer y={fb(220)} h={D110}/><Drawer y={fb(110)} h={D110}/>
      </>;

    // ── PRZEGRODY ──────────────────────────────────────────────
    case 'mod23': { // Pionowa przegroda lewa ~38% + 4 półki po prawej
      const dvX = IL + IW * 0.38;
      return <>
        <VDiv x={dvX}/>
        {[400, 800, 1200, 1600].map(mm => <Shelf key={mm} y={ft(mm)} x1={dvX+1} x2={IR}/>)}
      </>;
    }

    case 'mod24': { // Pozioma półka 300mm od góry + pionowa przegroda poniżej
      const shY = ft(300);
      return <><Shelf y={shY}/><VDiv x={MX} y1={shY+2} y2={IB}/></>;
    }

    // ── REGAŁY (dashed border) ─────────────────────────────────
    case 'mod25':  // Regał 4 półki wąski
      return <>{[400,800,1200,1600].map(mm => <Shelf key={mm} y={ft(mm)}/>)}</>;

    case 'mod26':  // Regał mix wąski: półka 320 + sz. + półka + 3 półki
      return <>
        {[350,700,1000].map(mm => <Shelf key={mm} y={ft(mm)}/>)}
        <Shelf y={fb(540)-3}/>
        <Drawer y={fb(540)} h={D200}/>
        <Shelf y={fb(320)}/>
      </>;

    case 'mod29':  // Szafka: drzwi dolne 800mm + 2 półki
      return <>
        <Shelf y={ft(600)}/><Shelf y={ft(1100)}/>
        <Door y={fb(800)} h={fh(800)}/>
      </>;

    // ── SIEDZISKO / ŁAWKA ──────────────────────────────────────
    case 'mod30L':
    case 'mod30P': // Ławka krawędziowa: rail + siedzisko + 1 szuflada w ławce
      return <>
        <Rail/>
        <SeatPlank y={SEAT}/>
        <Drawer y={SEAT+4} h={fh(380)}/>
      </>;

    case 'mod31':  // Ławka 2 szuflady
      return <>
        <Rail/>
        <SeatPlank y={SEAT}/>
        <Drawer y={SEAT+4}               h={fh(185)}/>
        <Drawer y={SEAT+4+fh(185)+2}     h={fh(185)}/>
      </>;

    case 'mod32':  // Ławka 1 szuflada
      return <>
        <Rail/>
        <SeatPlank y={SEAT}/>
        <Drawer y={SEAT + (IB-SEAT-fh(200))/2} h={fh(200)}/>
      </>;

    default:
      return <Rail/>;
  }
};

const OPEN_IDS = new Set(['mod25','mod26']);

const ModuleThumbnail = ({ type, isActive, onClick }) => (
  <div
    className={`thumbnail-card ${isActive ? 'active' : ''}`}
    onClick={() => onClick(type.id)}
    role="button"
    tabIndex={0}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(type.id); }}}
  >
    <svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', display: 'block' }}>
      {/* Carcass border — dashed for open (regal) modules */}
      <rect x={1.5} y={1.5} width={57} height={97} rx={2} fill="none"
        stroke={OPEN_IDS.has(type.id) ? '#C0B8B0' : '#D0C8C0'} strokeWidth={1.5}
        strokeDasharray={OPEN_IDS.has(type.id) ? '4 2' : undefined}/>
      {getContent(type.id)}
    </svg>
    <span>{type.name}</span>
  </div>
);

export default ModuleThumbnail;