import React, { useState, useEffect, useCallback } from 'react';
import MainMenu from './MainMenu';
import Shop from './Shop';
import Settings from './Settings';
import DailyRewards from './DailyRewards';
import PirateGame from '../components/game/PirateGame';
import { getLevel } from '../lib/levels';
import { loadStore, saveStore, loadProgress, saveProgress } from '../lib/store';
import { audio } from '../lib/audio';

export default function Game() {
  const [screen, setScreen] = useState('menu');
  const [storeData, setStoreData] = useState(loadStore);
  const [progress, setProgress] = useState(loadProgress);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levelResult, setLevelResult] = useState(null); // { won, stars }
  const [coins, setCoins] = useState(0); // coins earned in level

  const currentLevelNum = progress.unlockedLevel || 1;

  function handlePlay() {
    audio.init();
    const lvl = getLevel(currentLevelNum);
    setCurrentLevel(lvl);
    setLevelResult(null);
    setCoins(0);
    setScreen('game');
  }

  function handleLevelComplete(stars) {
    const coinsEarned = 20 + stars * 15 + (currentLevel?.boss ? 80 : 0);
    const vipBonus = storeData.vipPass ? Math.floor(coinsEarned * 0.2) : 0;
    const total = coinsEarned + vipBonus;

    setCoins(total);

    // Update progress
    const newLevelNum = currentLevelNum + 1;
    const prevStars = progress.stars?.[currentLevelNum] || 0;
    const newProgress = {
      ...progress,
      unlockedLevel: Math.max(progress.unlockedLevel || 1, newLevelNum),
      stars: { ...(progress.stars || {}), [currentLevelNum]: Math.max(prevStars, stars) },
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    // Update missions
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
    };
    setStoreData(nextStore);
    saveStore(nextStore);

    setLevelResult({ won: true, stars, coinsEarned: total, vipBonus, newLevel: newLevelNum });
  }

  function handleLevelFail() {
    setLevelResult({ won: false, stars: 0 });
  }

  function handleRetry() {
    const lvl = getLevel(currentLevelNum);
    setCurrentLevel(lvl);
    setLevelResult(null);
    setCoins(0);
  }

  function handleNextLevel() {
    const nextNum = progress.unlockedLevel || 1;
    const lvl = getLevel(nextNum);
    setCurrentLevel(lvl);
    setLevelResult(null);
    setCoins(0);
  }

  // Wrap setStoreData to also persist
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
    padding: '12px 8px',
    overflowX: 'hidden',
  };

  return (
    <div style={bgStyle}>
      {screen === 'menu' && (
        <MainMenu
          onPlay={handlePlay}
          onShop={() => setScreen('shop')}
          onSettings={() => setScreen('settings')}
          onDailyReward={() => setScreen('daily')}
          coins={storeData.coins || 0}
          gems={storeData.gems || 0}
          level={currentLevelNum}
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
          onRetry={handleRetry}
          onMenu={() => { audio.stopMusic(); setScreen('menu'); }}
          onNext={levelResult.won ? handleNextLevel : null}
        />
      )}
    </div>
  );
}

// ---- LEVEL RESULT SCREEN ----
function LevelResultScreen({ result, level, onRetry, onMenu, onNext }) {
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
        {won && onNext && (
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
