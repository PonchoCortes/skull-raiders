// lib/store.js — Skull Raiders Economy

const STORE_KEY = 'skull_raiders_store_v2';
const PROGRESS_KEY = 'skull_raiders_progress_v2';

export const DEFAULT_STORE = {
  coins: 0,
  gems: 0,
  noAds: false,
  vipPass: false,
  shipSkin: 'classic',
  cannonSkin: 'iron',
  trailColor: 'orange',
  skullSkin: 'default',
  sfxVolume: 1,
  musicVolume: 1,
  dailyStreak: 0,
  lastDaily: null,
  // Modo prueba: desbloquea los 100 niveles y da monedas "infinitas" para
  // poder revisar todo el juego sin tener que jugarlo de principio a fin.
  // Se puede apagar en Ajustes antes de publicar la versión final.
  debugMode: true,
};

export const DEBUG_COINS = 999999;
export const DEBUG_UNLOCKED_LEVEL = 100;

// Devuelve las monedas "visibles" (infinitas si el modo prueba está activo)
export function getDisplayCoins(storeData) {
  return storeData?.debugMode ? DEBUG_COINS : (storeData?.coins || 0);
}

// Devuelve hasta qué nivel puede jugar el usuario (100 si el modo prueba está activo)
export function getUnlockedLevel(storeData, progress) {
  if (storeData?.debugMode) return DEBUG_UNLOCKED_LEVEL;
  return progress?.unlockedLevel || 1;
}

export function loadStore() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) return { ...DEFAULT_STORE, ...JSON.parse(s) };
  } catch {}
  return { ...DEFAULT_STORE };
}

export function saveStore(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {}
}

export function loadProgress() {
  try {
    const s = localStorage.getItem(PROGRESS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { unlockedLevel: 1, stars: {}, missions: {} };
}

export function saveProgress(data) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(data)); } catch {}
}

// ---- ITEMS CATALOG ----

export const SHIP_SKINS = [
  { id: 'classic',    name: 'Galeón Pirata',     price: 0,   emoji: '⛵', desc: 'El legendario barco original', color: '#7b4b2a' },
  { id: 'golden',     name: 'Galeón Dorado',     price: 200, emoji: '🚢', desc: 'Destella en el horizonte',    color: '#d97706' },
  { id: 'obsidian',   name: 'Barco Obsidiana',   price: 350, emoji: '🖤', desc: 'Oscuro como la muerte',       color: '#1e293b' },
  { id: 'ghost',      name: 'Barco Fantasma',    price: 500, emoji: '👻', desc: 'Navega entre dos mundos',     color: '#7c3aed' },
  { id: 'mariachi',   name: 'Barco Mariachi',    price: 400, emoji: '🎺', desc: '¡Arriba Jalisco!',            color: '#dc2626' },
  { id: 'steampunk',  name: 'Vaporizador',       price: 600, emoji: '⚙️', desc: 'Vapor y caos mecánico',      color: '#92400e' },
  { id: 'infernal',   name: 'Barco Infernal',    price: 800, emoji: '🔥', desc: 'Envuelto en llamas eternas',  color: '#7f1d1d' },
  { id: 'duck',       name: 'Pato Gigante',      price: 999, emoji: '🦆', desc: 'Para los valientes de verdad', color: '#fbbf24' },
];

export const CANNON_SKINS = [
  { id: 'iron',    name: 'Cañón de Hierro',   price: 0,   emoji: '💣', desc: 'Confiable y poderoso' },
  { id: 'golden',  name: 'Cañón Dorado',      price: 150, emoji: '✨', desc: 'Dispara con elegancia' },
  { id: 'dragon',  name: 'Cañón Dragón',      price: 300, emoji: '🐉', desc: 'Escupe fuego de dragón' },
  { id: 'crystal', name: 'Cañón Cristal',     price: 450, emoji: '💎', desc: 'Balas de energía pura' },
  { id: 'skull',   name: 'Cañón Calavera',    price: 600, emoji: '💀', desc: 'El más aterrador de todos' },
];

export const TRAIL_COLORS = [
  { id: 'orange',  name: 'Fuego',     price: 0,   color: '#f59e0b', emoji: '🔥' },
  { id: 'cyan',    name: 'Hielo',     price: 100, color: '#06b6d4', emoji: '❄️' },
  { id: 'pink',    name: 'Neón Rosa', price: 100, color: '#ec4899', emoji: '🌸' },
  { id: 'green',   name: 'Tóxico',   price: 150, color: '#22c55e', emoji: '☠️' },
  { id: 'rainbow', name: 'Arcoíris', price: 300, color: 'rainbow', emoji: '🌈' },
];

export const SKULL_SKINS = [
  { id: 'default',  name: 'Calavera Clásica', price: 0,   emoji: '💀', desc: 'El minion original' },
  { id: 'mariachi', name: 'Calavera Mariachi', price: 200, emoji: '🎺', desc: '¡No hay quien pueda!' },
  { id: 'ninja',    name: 'Calavera Ninja',    price: 250, emoji: '🥷', desc: 'Silencioso y mortal' },
  { id: 'viking',   name: 'Calavera Vikinga',  price: 300, emoji: '⛏️', desc: 'VALHALLA o muerte' },
  { id: 'robot',    name: 'Calavera Robot',    price: 400, emoji: '🤖', desc: 'Calculado y frío' },
  { id: 'luchador', name: 'Luchador',          price: 350, emoji: '🤼', desc: 'Rey del ring pirata' },
];

// DAILY MISSIONS
export const DAILY_MISSIONS = [
  { id: 'hundir5', text: 'Hunde 5 enemigos', reward: 30, key: 'hundir', target: 5 },
  { id: 'headshot3', text: 'Logra 3 impactos directos', reward: 25, key: 'headshot', target: 3 },
  { id: 'level3', text: 'Completa 3 niveles', reward: 20, key: 'levels', target: 3 },
  { id: 'stars5', text: 'Gana 5 estrellas', reward: 35, key: 'stars', target: 5 },
  { id: 'portal3', text: 'Usa 3 portales', reward: 30, key: 'portals', target: 3 },
];
