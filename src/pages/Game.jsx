import React, { useState, useEffect, useCallback, useRef } from 'react';
import MainMenu from './MainMenu';
import Shop from './Shop';
import Settings from './Settings';
import DailyRewards from './DailyRewards';
import LevelSelection from './LevelSelection';
import PirateGame from '../components/game/PirateGame';
import { getLevel } from '../lib/levels';
import { loadStore, saveStore, loadProgress, saveProgress, getUnlockedLevel } from '../lib/store';
import { audio } from '../lib/audio';

export default function Game() {
  const [screen, setScreen] = useState('menu');
  const [storeData, setStoreData] = useState(loadStore);
  const [progress, setProgress] = useState(loadProgress);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levelResult, setLevelResult] = useState(null); // { won, stars }
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const el = rootRef.current || document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) req.call(el).catch(() => {});
      // En celular, de paso intenta fijar la orientación horizontal si el navegador lo permite
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) exit.call(document).catch(() => {});
    }
  }

  // Nivel hasta el que se puede jugar (100 si el modo prueba esta activo)
  const unlockedLevel = getUnlockedLevel(storeData, progress);

  function startLevel(n) {
    audio.init();
    const lvl = getLevel(n);
    setCurrentLevel(lvl);
    setLevelResult(null);
    setScreen('game');
  }

  function handlePlay() {
    // Continua en el siguiente nivel disponible del progreso real
    startLevel(progress.unlockedLevel || 1);
  }

  function handleSelectLevel(n) {
    startLevel(n);
  }

  function handleLevelComplete(stars) {
    const n = currentLevel.n;
    const coinsEarned = 20 + stars * 15 + (currentLevel?.boss ? 80 : 0);
    const vipBonus = storeData.vipPass ? Math.floor(coinsEarned * 0.2) : 0;
    const total = coinsEarned + vipBonus;

    // Progreso real (independiente del modo prueba, asi no se pierde nada al apagarlo)
    const newLevelNum = n + 1;
    const prevStars = progress.stars?.[n] || 0;
    const newProgress = {
      ...progress,
      unlockedLevel: Math.max(progress.unlockedLevel || 1, newLevelNum),
      stars: { ...(progress.stars || {}), [n]: Math.max(prevStars, stars) },
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    const missions = storeData.missions || {};
    const updatedMissions = {
      ...missions,
      levels: (missions.levels || 0) + 1,
      stars: (missions.stars || 0) + stars,
    };

    const nextStore = {
      ...storeData,
      coins: (storeData.coins || 0) + total,
      missions: updatedMissions,
      currentLevel: newLevelNum,
      failStreak: 0, // Ganó: se resetea la racha de intentos fallidos
    };
    setStoreData(nextStore);
    saveStore(nextStore);

    setLevelResult({ won: true, stars, coinsEarned: total, vipBonus, newLevel: newLevelNum });
  }

  function handleLevelFail() {
    const nextStore = { ...storeData, failStreak: (storeData.failStreak || 0) + 1 };
    setStoreData(nextStore);
    saveStore(nextStore);
    setLevelResult({ won: false, stars: 0 });
  }

  function handleRetry() {
    const lvl = getLevel(currentLevel.n);
    setCurrentLevel(lvl);
    setLevelResult(null);
  }

  function handleNextLevel() {
    const nextNum = Math.min(currentLevel.n + 1, unlockedLevel);
    startLevel(nextNum);
  }

  // Envuelve setStoreData para persistir tambien
  const updateStore = useCallback((next) => {
    setStoreData(next);
    saveStore(next);
  }, []);

  const bgStyle = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #0c1a33 0%, #020617 60%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflowX: 'hidden',
  };

  return (
    <div ref={rootRef} className="game-root" style={bgStyle}>
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        style={{
          position: 'fixed', bottom: 10, right: 10, zIndex: 50,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#e2e8f0', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(6px)', opacity: 0.7,
        }}>
        {isFullscreen ? '⤡' : '⤢'}
      </button>
      {screen === 'menu' && (
        <MainMenu
          onPlay={handlePlay}
          onShop={() => setScreen('shop')}
          onSettings={() => setScreen('settings')}
          onDailyReward={() => setScreen('daily')}
          onLevels={() => setScreen('levels')}
          storeData={storeData}
          level={progress.unlockedLevel || 1}
        />
      )}

      {screen === 'levels' && (
        <LevelSelection
          storeData={storeData}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'shop' && (
        <Shop
          storeData={storeData}
          setStoreData={updateStore}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'settings' && (
        <Settings
          storeData={storeData}
          setStoreData={updateStore}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'daily' && (
        <DailyRewards
          storeData={storeData}
          setStoreData={updateStore}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'game' && currentLevel && !levelResult && (
        <div className="w-full flex flex-col items-center gap-3 max-w-[900px] mx-auto">
          <PirateGame
            key={currentLevel.n}
            levelDef={currentLevel}
            onLevelComplete={handleLevelComplete}
            onLevelFail={handleLevelFail}
            storeData={storeData}
            failStreak={storeData.failStreak || 0}
          />
          {/* In-game back button */}
          <button onClick={() => { audio.stopMusic(); setScreen('menu'); }}
            className="text-sm px-4 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: 'rgba(15,23,42,0.7)', color: '#475569', border: '1px solid rgba(255,255,255,0.06)' }}>
            ← Menú
          </button>
        </div>
      )}

      {screen === 'game' && levelResult && (
        <LevelResultScreen
          result={levelResult}
          level={currentLevel}
          canGoNext={currentLevel.n < 100}
          onRetry={handleRetry}
          onMenu={() => { audio.stopMusic(); setScreen('menu'); }}
          onNext={levelResult.won ? handleNextLevel : null}
        />
      )}
    </div>
  );
}

// ---- LEVEL RESULT SCREEN ----
function LevelResultScreen({ result, level, onRetry, onMenu, onNext, canGoNext }) {
  const { won, stars, coinsEarned, vipBonus, newLevel } = result;

  useEffect(() => {
    if (won) audio.playMusic('win');
    else audio.playMusic('battle');
  }, [won]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 py-10 px-4" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Result banner */}
      <div className="w-full rounded-3xl p-8 text-center"
        style={{
          background: won ? 'rgba(5,46,22,0.95)' : 'rgba(69,10,10,0.95)',
          border: `3px solid ${won ? '#22c55e' : '#ef4444'}`,
          boxShadow: `0 0 50px ${won ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
        <div className="text-6xl mb-3">{won ? '🏆' : '💀'}</div>
        <h2 className="font-black text-3xl mb-2"
          style={{ color: won ? '#4ade80' : '#f87171', textShadow: `0 0 20px ${won ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'}` }}>
          {won
            ? level?.boss ? '¡JEFE DERROTADO!' : '¡VICTORIA!'
            : level?.boss ? 'EL JEFE TE VENCIÓ' : '¡HUNDIDO!'}
        </h2>

        {level && (
          <div className="text-sm mb-4" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {level.act} — Nivel {level.n}
            {level.boss && <span className="ml-2">{level.boss.name}</span>}
          </div>
        )}

        {won && (
          <>
            {/* Stars */}
            <div className="text-4xl mb-4">
              {Array.from({length:3},(_,i)=>i<stars?'⭐':'☆').join('')}
            </div>
            {/* Coins earned */}
            <div className="flex flex-col gap-1 items-center">
              <div className="px-4 py-2 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid #d97706' }}>
                <span className="font-black text-xl" style={{ color: '#fbbf24' }}>
                  +{coinsEarned} 🪙
                </span>
                {vipBonus > 0 && (
                  <span className="ml-2 text-sm" style={{ color: '#c084fc' }}>
                    (incl. +{vipBonus} VIP)
                  </span>
                )}
              </div>
              {newLevel > 1 && (
                <div className="text-sm" style={{ color: '#64748b' }}>
                  Nivel desbloqueado: {newLevel} 🔓
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="w-full flex flex-col gap-3">
        {won && onNext && canGoNext && (
          <button onClick={onNext}
            className="w-full py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',
              color: '#1a0a00',
              boxShadow: '0 0 30px rgba(245,158,11,0.5)',
              border: '2px solid #fde68a',
            }}>
            ⚓ SIGUIENTE NIVEL →
          </button>
        )}
        <div className="flex gap-3">
          <button onClick={onRetry}
            className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(15,23,42,0.9)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            🔁 REINTENTAR
          </button>
          <button onClick={onMenu}
            className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(15,23,42,0.9)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
            🏠 MENÚ
          </button>
        </div>
      </div>
    </div>
  );
}
