import React from 'react';

export default function GameHUD({ turno, skullsAliados, skullsEnemigos, totalSkulls, gameOver, won, level, wind, act, coins }) {
  const maxSkulls = totalSkulls || 4;

  return (
    <div className="relative w-full mb-2 select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-xl mb-1"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Player side */}
        <div className="flex flex-col items-start gap-0.5 min-w-[90px]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: turno === 'jugador' ? '#38bdf8' : '#475569' }}>
              {turno === 'jugador' ? '▶ TÚ' : '  TÚ'}
            </span>
            {turno === 'jugador' && !gameOver && (
              <span className="text-[10px] text-cyan-400 animate-pulse">APUNTA</span>
            )}
          </div>
          <SkullBar count={skullsAliados} max={maxSkulls} color="#38bdf8" />
        </div>

        {/* Center info */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black text-amber-400" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
            NVL {level}
          </span>
          <span className="text-[9px] text-slate-500 text-center leading-none">{act}</span>
          {wind !== 0 && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="text-[9px]" style={{ color: wind > 0 ? '#f59e0b' : '#38bdf8' }}>
                {wind > 0 ? '→' : '←'} VIENTO
              </span>
            </div>
          )}
        </div>

        {/* Enemy side */}
        <div className="flex flex-col items-end gap-0.5 min-w-[90px]">
          <div className="flex items-center gap-1.5 justify-end">
            {turno === 'cpu' && !gameOver && (
              <span className="text-[10px] text-red-400 animate-pulse">DISPARA</span>
            )}
            <span className="text-xs font-bold" style={{ color: turno === 'cpu' ? '#f87171' : '#475569' }}>
              {turno === 'cpu' ? 'ENEMIGO ◀' : 'ENEMIGO'}
            </span>
          </div>
          <SkullBar count={skullsEnemigos} max={maxSkulls} color="#f87171" reverse />
        </div>
      </div>

      {/* Game Over overlay message */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="px-6 py-2 rounded-2xl text-center"
            style={{
              background: won ? 'rgba(0,40,0,0.9)' : 'rgba(40,0,0,0.9)',
              border: `2px solid ${won ? '#22c55e' : '#ef4444'}`,
              boxShadow: `0 0 30px ${won ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            }}>
            <div className="text-xl font-black" style={{ color: won ? '#4ade80' : '#f87171', fontFamily: 'Georgia, serif' }}>
              {won ? '⚓ ¡VICTORIA!' : '☠️ ¡HUNDIDO!'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkullBar({ count, max, color, reverse }) {
  const skulls = Array.from({ length: max }, (_, i) => i < count);
  if (reverse) skulls.reverse();
  return (
    <div className={`flex gap-0.5 ${reverse ? 'flex-row-reverse' : 'flex-row'}`}>
      {skulls.map((alive, i) => (
        <span key={i} className="text-sm transition-all duration-300"
          style={{ opacity: alive ? 1 : 0.2, filter: alive ? `drop-shadow(0 0 4px ${color})` : 'none' }}>
          💀
        </span>
      ))}
    </div>
  );
}
