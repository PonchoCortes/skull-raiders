import React, { useState } from 'react';
import { saveStore } from '../lib/store';
import { audio } from '../lib/audio';

export default function Settings({ storeData, setStoreData, onBack }) {
  const [sfx, setSfx] = useState(storeData.sfxVolume ?? 1);
  const [music, setMusic] = useState(storeData.musicVolume ?? 1);
  const [showCredits, setShowCredits] = useState(false);
  const [showReset, setShowReset] = useState(false);

  function saveSetting(field, value) {
    const next = { ...storeData, [field]: value };
    setStoreData(next);
    saveStore(next);
  }

  function handleSfx(v) {
    setSfx(v);
    audio.setSfxVolume(v);
    saveSetting('sfxVolume', v);
    audio.playSFX('coin');
  }

  function handleMusic(v) {
    setMusic(v);
    audio.setMusicVolume(v);
    saveSetting('musicVolume', v);
  }

  function resetProgress() {
    localStorage.clear();
    window.location.reload();
  }

  function toggleDebug() {
    const next = { ...storeData, debugMode: !storeData.debugMode };
    setStoreData(next);
    saveStore(next);
    audio.playSFX(next.debugMode ? 'levelup' : 'coin');
  }

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-4 px-4" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          ←
        </button>
        <h2 className="font-black text-2xl" style={{ color: '#94a3b8' }}>⚙️ AJUSTES</h2>
      </div>

      {/* Audio section */}
      <Section title="🔊 AUDIO">
        <SliderRow
          label="Efectos de sonido"
          icon="🔫"
          value={sfx}
          onChange={handleSfx}
        />
        <SliderRow
          label="Música"
          icon="🎵"
          value={music}
          onChange={handleMusic}
        />
        <div className="flex gap-3 mt-2">
          <QuickBtn label={sfx > 0 ? '🔊 SFX ON' : '🔇 SFX OFF'}
            active={sfx > 0}
            onClick={() => handleSfx(sfx > 0 ? 0 : 0.7)} />
          <QuickBtn label={music > 0 ? '🎵 Música ON' : '🎵 Música OFF'}
            active={music > 0}
            onClick={() => handleMusic(music > 0 ? 0 : 0.4)} />
        </div>
      </Section>

      {/* Cuenta */}
      <Section title="🏴‍☠️ CUENTA">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Nivel actual" value={storeData.currentLevel || 1} icon="🎯" />
          <StatBox label="Monedas totales" value={(storeData.coins || 0).toLocaleString()} icon="🪙" />
          <StatBox label="Gemas" value={storeData.gems || 0} icon="💎" />
          <StatBox label="Racha diaria" value={`${storeData.dailyStreak || 0} días`} icon="🔥" />
        </div>
      </Section>

      {/* Modo prueba */}
      <Section title="🐛 MODO PRUEBA">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="font-bold text-sm" style={{ color: storeData.debugMode ? '#4ade80' : '#f8fafc' }}>
              100 niveles desbloqueados + monedas infinitas
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              Útil para probar el juego. Apágalo antes de publicar para que tus jugadores progresen normalmente.
            </div>
          </div>
          <button onClick={toggleDebug}
            className="w-14 h-8 rounded-full relative transition-all flex-shrink-0"
            style={{ background: storeData.debugMode ? '#16a34a' : 'rgba(51,65,85,0.8)' }}>
            <span className="absolute top-1 w-6 h-6 rounded-full bg-white transition-all"
              style={{ left: storeData.debugMode ? '26px' : '4px' }} />
          </button>
        </div>
      </Section>

      {/* VIP Pass */}
      {!storeData.vipPass && (
        <Section title="👑 VIP PASS">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid #7c3aed' }}>
            <div className="font-bold mb-2" style={{ color: '#c084fc' }}>Pirate Pass VIP — $20 MXN (pago único)</div>
            <ul className="text-sm space-y-1" style={{ color: '#94a3b8' }}>
              <li>✅ Elimina todos los anuncios</li>
              <li>✅ +20% de monedas por nivel</li>
              <li>✅ Skin exclusiva VIP</li>
              <li>✅ Nombre en dorado</li>
              <li>✅ Cofre diario mejorado</li>
            </ul>
            <button className="mt-3 w-full py-2 rounded-xl font-black"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' }}>
              💎 COMPRAR VIP
            </button>
          </div>
        </Section>
      )}

      {/* Danger zone */}
      <Section title="⚠️ ZONA PELIGROSA">
        {!showReset ? (
          <button onClick={() => setShowReset(true)}
            className="w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(127,29,29,0.3)', color: '#f87171', border: '1px solid #991b1b' }}>
            🗑️ Reiniciar progreso
          </button>
        ) : (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid #dc2626' }}>
            <p className="text-sm mb-3" style={{ color: '#fca5a5' }}>
              ¿Seguro? Se borrará todo el progreso, monedas, skins y niveles. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={resetProgress}
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{ background: '#dc2626', color: '#fff' }}>
                ☠️ SÍ, BORRAR TODO
              </button>
              <button onClick={() => setShowReset(false)}
                className="flex-1 py-2 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(51,65,85,0.8)', color: '#94a3b8' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Credits */}
      <button onClick={() => setShowCredits(!showCredits)}
        className="text-center text-sm py-2"
        style={{ color: 'rgba(100,116,139,0.6)' }}>
        🏴‍☠️ Skull Raiders v2.0 — Créditos {showCredits ? '▲' : '▼'}
      </button>
      {showCredits && (
        <div className="rounded-xl p-4 text-sm text-center"
          style={{ background: 'rgba(15,23,42,0.7)', color: '#64748b', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="mb-1" style={{ color: '#94a3b8' }}>Skull Raiders: Cannon Chaos</p>
          <p>Motor: React + Matter.js</p>
          <p>Audio: Web Audio API procedural</p>
          <p>Física ragdoll: Matter.js</p>
          <p className="mt-2" style={{ color: '#475569' }}>Sin derechos de autor — Música y SFX 100% procedural</p>
          <p style={{ color: '#334155' }}>Todos los assets son generados en código</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="font-bold text-xs tracking-widest" style={{ color: '#475569' }}>{title}</div>
      {children}
    </div>
  );
}

function SliderRow({ label, icon, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center">{icon}</span>
      <div className="flex-1">
        <div className="text-sm mb-1 font-medium" style={{ color: '#94a3b8' }}>{label}</div>
        <input type="range" min="0" max="1" step="0.05" value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f59e0b ${value*100}%, rgba(255,255,255,0.1) ${value*100}%)`,
            outline: 'none',
          }} />
      </div>
      <span className="text-sm font-mono w-10 text-right" style={{ color: '#64748b' }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function QuickBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
      style={{
        background: active ? 'rgba(21,128,61,0.25)' : 'rgba(30,41,59,0.6)',
        color: active ? '#4ade80' : '#64748b',
        border: `1px solid ${active ? '#16a34a' : 'rgba(255,255,255,0.07)'}`,
      }}>
      {label}
    </button>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="rounded-xl p-3 text-center"
      style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-black text-lg" style={{ color: '#f8fafc' }}>{value}</div>
      <div className="text-xs" style={{ color: '#64748b' }}>{label}</div>
    </div>
  );
}
