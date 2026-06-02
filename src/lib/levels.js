// lib/levels.js — Skull Raiders: 100 Niveles con Actos

export function getLevel(n) {
  const t = (n - 1) / 99;
  const isBoss = n % 10 === 0;

  const times = ['day','day','dusk','night','storm','night','dusk','day','night','storm'];
  const timeOfDay = isBoss ? 'storm' : times[Math.floor((n-1)/10) % 10];

  let targets = Math.min(3 + Math.floor(n / 12), 8);
  const cpuAccuracy = Math.min(0.30 + t * 0.67, 0.96);
  const gravityOptions = [1.1, 0.8, 1.4, 1.0, 1.6, 0.7];
  const gravity = gravityOptions[n % gravityOptions.length];
  const windPatterns = [0,0,0.3,-0.3,0.6,-0.6,0.2,-0.2,0,0.8];
  const windX = windPatterns[Math.floor((n-1)/10) % 10];

  let boss = null;
  if (isBoss) {
    const bossCatalog = {
      10:  { type:'KRAKEN',    name:'🦑 KRAKEN ANCESTRAL' },
      20:  { type:'GHOST',     name:'👻 EL HOLANDÉS ERRANTE' },
      30:  { type:'LEVIATHAN', name:'🐉 LEVIATÁN DEL ABISMO' },
      40:  { type:'FORTRESS',  name:'💀 FORTALEZA CALAVERA' },
      50:  { type:'KRAKEN',    name:'🔥 ESCILA DE MAGMA' },
      60:  { type:'GHOST',     name:'🏴‍☠️ EL ARCA MALDITA' },
      70:  { type:'LEVIATHAN', name:'⚡ JÖRMUNDGANDER' },
      80:  { type:'FORTRESS',  name:'🏰 BASTIÓN DE OBSIDIANA' },
      90:  { type:'KRAKEN',    name:'🔱 CTHULHU REY DEL CAOS' },
      100: { type:'FORTRESS',  name:'👑 SEÑOR DEL FIN DEL MUNDO' },
    };
    boss = bossCatalog[n];
    targets = 5;
  }

  // Actos para flavor text en HUD
  const acts = [
    'Acto I: Mares Tranquilos',
    'Acto II: La Gran Tormenta',
    'Acto III: Fortalezas del Abismo',
    'Acto IV: Aguas Malditas',
    'Acto V: Volcanes del Caos',
    'Acto VI: Imperio Pirata',
    'Acto VII: Mar del Kraken',
    'Acto VIII: Piratas del Cielo',
    'Acto IX: Dimensión del Caos',
    'Acto X: La Campaña Final',
  ];
  const act = acts[Math.floor((n-1)/10)];

  const portals = buildPortals(n, t, isBoss);
  const mountains = isBoss ? [] : buildMountains(n, t);
  const skullCount = isBoss ? 5 : Math.min(2 + Math.floor(n/15), 6);

  return { n, timeOfDay, targets, cpuAccuracy, gravity, windX, portals, mountains, boss, act, skullCount };
}

function buildPortals(n, t, isStorm) {
  const portals = [];
  if (n <= 2) return [];
  const sm = isStorm ? 1.4 : 1.0;

  portals.push({
    mult: n < 15 ? 2 : n < 45 ? 3 : 5,
    speed: (1.4 + t * 2.5) * sm,
    y: 240, range: 160 + n * 1.1,
    color: isStorm ? '#22d3ee' : '#0284c7',
    glowColor: isStorm ? '#e0f2fe' : '#38bdf8',
  });

  if (n >= 10) {
    portals.push({
      mult: n < 30 ? 4 : n < 60 ? 5 : 8,
      speed: -(1.8 + t * 2.0) * sm,
      y: 340, range: 130 + n * 0.8,
      color: isStorm ? '#a855f7' : '#7c3aed',
      glowColor: isStorm ? '#f5d0fe' : '#c084fc',
    });
  }

  if (n >= 30) {
    portals.push({
      mult: 3,
      speed: (2.0 + t * 1.5) * sm,
      y: 160, range: 100 + n * 0.6,
      color: '#f59e0b',
      glowColor: '#fde68a',
    });
  }

  return portals;
}

function buildMountains(n, t) {
  const mountains = [];
  const count = n < 5 ? 0 : n < 20 ? 1 : n < 50 ? 2 : 3;
  const positions = [550, 800, 1050];
  for (let i = 0; i < count; i++) {
    const w = 120 + Math.random() * 80;
    const h = 100 + t * 160 + Math.random() * 60;
    const hp = Math.max(1, Math.floor(n / 20) + 1);
    mountains.push({ x: positions[i] + (Math.random()-0.5)*60, w, h, hp, maxHp: hp });
  }
  return mountains;
}
