import React, { useState } from 'react';
import { saveStore, DAILY_MISSIONS } from '../lib/store';
import { audio } from '../lib/audio';

const DAILY_REWARDS = [
  { day: 1, coins: 30,  gems: 0, label: '🪙 30' },
  { day: 2, coins: 50,  gems: 0, label: '🪙 50' },
  { day: 3, coins: 80,  gems: 1, label: '🪙 80 + 💎1' },
  { day: 4, coins: 100, gems: 0, label: '🪙 100' },
  { day: 5, coins: 150, gems: 2, label: '🪙 150 + 💎2' },
  { day: 6, coins: 200, gems: 0, label: '🪙 200' },
  { day: 7, coins: 500, gems: 5, label: '🎁 GRAN COFRE' },
];

function canClaimDaily(lastDaily) {
  if (!lastDaily) return true;
  const last = new Date(lastDaily);
  const now = new Date();
  return now.toDateString() !== last.toDateString();
}

export default function DailyRewards({ storeData, setStoreData, onBack }) {
  const [claimed, setClaimed] = useState(false);
  const [claimAnim, setClaimAnim] = useState(false);
  const canClaim = canClaimDaily(storeData.lastDaily);
  const streak = storeData.dailyStreak || 0;
  const dayIndex = Math.min(streak % 7, 6);
  const reward = DAILY_REWARDS[dayIndex];
  const missions = storeData.missions || {};

  function claimDaily() {
    if (!canClaim || claimed) return;
    audio.init();
    audio.playSFX('levelup');
    setClaimAnim(true);
    const newStreak = streak + 1;
    const next = {
      ...storeData,
      coins: (storeData.coins || 0) + reward.coins,
      gems: (storeData.gems || 0) + reward.gems,
      dailyStreak: newStreak,
      lastDaily: new Date().toISOString(),
    };
    setStoreData(next);
    saveStore(next);
    setClaimed(true);
    setTimeout(() => setClaimAnim(false), 1200);
  }

  function claimMission(m) {
    const progress = missions[m.key] || 0;
    const done = missions[`${m.id}_claimed`];
    if (done || progress < m.target) return;
    audio.playSFX('coin');
    const next = {
      ...storeData,
      coins: (storeData.coins || 0) + m.reward,
      missions: { ...missions, [`${m.id}_claimed`]: true },
    };
    setStoreData(next);
    saveStore(next);
  }

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-4 px-4 pb-6" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          ←
        </button>
        <h2 className="font-black text-2xl" style={{ color: '#4ade80' }}>🎁 RECOMPENSAS</h2>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ background: 'rgba(234,88,12,0.2)', border: '1px solid #ea580c' }}>
          <span className="text-orange-400 text-sm font-bold">🔥 Racha: {streak} días</span>
        </div>
      </div>

      {/* Daily reward calendar */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="font-bold text-xs tracking-widest mb-3" style={{ color: '#475569' }}>RECOMPENSA DIARIA</div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {DAILY_REWARDS.map((r, i) => {
            const isPast = i < dayIndex;
            const isCurrent = i === dayIndex;
            const isFuture = i > dayIndex;
            return (
              <div key={r.day}
                className="flex flex-col items-center gap-1 rounded-xl p-2"
                style={{
                  background: isCurrent ? 'rgba(21,128,61,0.25)' : isPast ? 'rgba(30,41,59,0.4)' : 'rgba(15,23,42,0.5)',
                  border: `2px solid ${isCurrent ? '#22c55e' : isPast ? '#16a34a50' : 'rgba(255,255,255,0.06)'}`,
                  opacity: isFuture ? 0.5 : 1,
                }}>
                <div className="text-[10px] font-bold" style={{ color: isCurrent ? '#4ade80' : '#475569' }}>DÍA {r.day}</div>
                <div className="text-xl">{r.day === 7 ? '🎁' : i < dayIndex ? '✅' : '🪙'}</div>
                <div className="text-[9px] text-center" style={{ color: '#64748b' }}>{r.label}</div>
              </div>
            );
          })}
        </div>

        {/* Claim button */}
        <button
          onClick={claimDaily}
          disabled={!canClaim || claimed}
          className="w-full py-4 rounded-2xl font-black text-lg transition-all"
          style={{
            background: (canClaim && !claimed)
              ? 'linear-gradient(135deg,#15803d,#22c55e)'
              : 'rgba(30,41,59,0.6)',
            color: (canClaim && !claimed) ? '#fff' : '#475569',
            boxShadow: (canClaim && !claimed) ? '0 0 25px rgba(34,197,94,0.4)' : 'none',
            transform: claimAnim ? 'scale(1.05)' : 'scale(1)',
            cursor: (!canClaim || claimed) ? 'not-allowed' : 'pointer',
          }}>
          {claimed
            ? `✅ ¡Reclamado! +${reward.coins}🪙`
            : canClaim
              ? `🎁 RECLAMAR DÍA ${dayIndex + 1} — +${reward.coins}🪙${reward.gems > 0 ? ` +${reward.gems}💎` : ''}`
              : '⏳ Vuelve mañana'}
        </button>

        {claimAnim && (
          <div className="text-center mt-3 font-black text-2xl" style={{ color: '#fbbf24' }}>
            🎉 +{reward.coins} MONEDAS!
          </div>
        )}
      </div>

      {/* Missions */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="font-bold text-xs tracking-widest mb-3" style={{ color: '#475569' }}>MISIONES DIARIAS</div>
        <div className="flex flex-col gap-3">
          {DAILY_MISSIONS.map(m => {
            const progress = missions[m.key] || 0;
            const pct = Math.min(1, progress / m.target);
            const isClaimed = missions[`${m.id}_claimed`];
            const isReady = pct >= 1 && !isClaimed;
            return (
              <div key={m.id} className="rounded-xl p-3"
                style={{ background: 'rgba(30,41,59,0.5)', border: `1px solid ${isReady ? '#d97706' : isClaimed ? '#16a34a30' : 'rgba(255,255,255,0.05)'}` }}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: isClaimed ? '#4ade80' : '#f8fafc' }}>{m.text}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct * 100}%`, background: isClaimed ? '#16a34a' : isReady ? '#f59e0b' : '#0b5ab5' }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: '#64748b' }}>{Math.min(progress, m.target)}/{m.target}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => claimMission(m)}
                    disabled={!isReady}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isClaimed ? '#16a34a20' : isReady ? 'linear-gradient(135deg,#92400e,#d97706)' : 'rgba(30,41,59,0.4)',
                      color: isClaimed ? '#4ade80' : isReady ? '#fff' : '#475569',
                      cursor: isReady ? 'pointer' : 'not-allowed',
                    }}>
                    {isClaimed ? '✅' : isReady ? `+${m.reward}🪙` : `🪙${m.reward}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="text-center text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>
        💡 Completa misiones jugando niveles normales. El progreso se guarda automáticamente.
      </div>
    </div>
  );
}
