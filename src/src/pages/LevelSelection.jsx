import React from 'react';
import { getUnlockedLevel } from '../lib/store';

export default function LevelSelection({ storeData, progress, onSelectLevel, onBack }) {
  const levels = Array.from({ length: 100 }, (_, i) => i + 1);
  const unlockedLevel = getUnlockedLevel(storeData, progress);
  const debug = !!storeData?.debugMode;
  const stars = progress?.stars || {};

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-4 px-4 pb-6" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          ←
        </button>
        <h2 className="font-black text-2xl" style={{ color: '#f59e0b', textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
          🗺️ SELECCIÓN DE NIVEL
        </h2>
        {debug && (
          <span className="ml-auto text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid #16a34a' }}>
            🐛 MODO PRUEBA — TODO DESBLOQUEADO
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 w-full">
        {levels.map((lvl) => {
          const unlocked = debug || lvl <= unlockedLevel;
          const isBoss = lvl % 10 === 0;
          const starCount = stars[lvl] || 0;
          const isNext = !debug && lvl === unlockedLevel;
          return (
            <button
              key={lvl}
              onClick={() => unlocked && onSelectLevel(lvl)}
              disabled={!unlocked}
              className="aspect-square rounded-lg flex flex-col items-center justify-center font-bold transition-all"
              style={{
                background: isBoss && unlocked
                  ? 'linear-gradient(135deg,#7f1d1d,#450a0a)'
                  : unlocked ? '#1e293b' : 'rgba(15,23,42,0.5)',
                border: `2px solid ${isNext ? '#fbbf24' : isBoss && unlocked ? '#ef4444' : unlocked ? '#334155' : 'rgba(255,255,255,0.05)'}`,
                color: unlocked ? '#fff' : '#334155',
                boxShadow: isNext ? '0 0 14px rgba(251,191,36,0.5)' : 'none',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.6,
              }}
              onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {unlocked ? (
                <>
                  <span style={{ fontSize: '13px' }}>{isBoss ? '💀' : lvl}</span>
                  {starCount > 0 && (
                    <span style={{ fontSize: '8px', color: '#fbbf24' }}>{'⭐'.repeat(starCount)}</span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: '13px' }}>🔒</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px] mt-1" style={{ color: '#64748b' }}>
        <span>💀 = Nivel jefe</span>
        <span>⭐ = Estrellas ganadas</span>
        <span>🔒 = Bloqueado</span>
      </div>
    </div>
  );
}
