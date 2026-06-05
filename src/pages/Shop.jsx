import React, { useState } from 'react';
import { SHIP_SKINS, CANNON_SKINS, TRAIL_COLORS, SKULL_SKINS, saveStore } from '../lib/store';
import { audio } from '../lib/audio';

const TABS = [
  { id: 'ships',   label: '⛵ Barcos' },
  { id: 'cannons', label: '💣 Cañones' },
  { id: 'trails',  label: '✨ Estelas' },
  { id: 'skulls',  label: '💀 Skins' },
];

export default function Shop({ storeData, setStoreData, onBack }) {
  const [tab, setTab] = useState('ships');
  const [msg, setMsg] = useState(null);

  function flash(text, ok) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2000);
  }

  function buy(itemId, price, field) {
    if (storeData[field] === itemId) { flash('¡Ya equipado!', false); return; }
    const owned = Array.isArray(storeData[`owned_${field}`]) ? storeData[`owned_${field}`] : [];
    if (owned.includes(itemId)) {
      // Just equip
      const next = { ...storeData, [field]: itemId };
      setStoreData(next); saveStore(next);
      audio.playSFX('buy');
      flash('¡Equipado! 🏴‍☠️', true);
      return;
    }
    if (price === 0 || storeData.coins >= price) {
      const next = {
        ...storeData,
        coins: storeData.coins - price,
        [field]: itemId,
        [`owned_${field}`]: [...owned, itemId],
      };
      setStoreData(next); saveStore(next);
      audio.playSFX('buy');
      flash('¡Comprado y equipado! 🎉', true);
    } else {
      audio.playSFX('hit');
      flash(`¡Faltan ${price - storeData.coins} monedas! 🪙`, false);
    }
  }

  function isOwned(itemId, field) {
    if (itemId === (SHIP_SKINS[0]?.id) && field === 'shipSkin') return true;
    if (itemId === (CANNON_SKINS[0]?.id) && field === 'cannonSkin') return true;
    if (itemId === (TRAIL_COLORS[0]?.id) && field === 'trailColor') return true;
    if (itemId === (SKULL_SKINS[0]?.id) && field === 'skullSkin') return true;
    const owned = storeData[`owned_${field}`] || [];
    return owned.includes(itemId);
  }

  const items = {
    ships:   { list: SHIP_SKINS,   field: 'shipSkin',   equip: storeData.shipSkin },
    cannons: { list: CANNON_SKINS, field: 'cannonSkin', equip: storeData.cannonSkin },
    trails:  { list: TRAIL_COLORS, field: 'trailColor', equip: storeData.trailColor },
    skulls:  { list: SKULL_SKINS,  field: 'skullSkin',  equip: storeData.skullSkin },
  };
  const { list, field, equip } = items[tab];

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-3" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-2">
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          ←
        </button>
        <h2 className="font-black text-2xl" style={{ color: '#f59e0b', textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
          🛒 TIENDA PIRATA
        </h2>
        <div className="ml-auto flex gap-2">
          <CurrencyBadge icon="🪙" value={storeData.coins} color="#f59e0b" />
          <CurrencyBadge icon="💎" value={storeData.gems} color="#818cf8" />
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div className="mx-2 py-2 px-4 rounded-xl text-center font-bold text-sm"
          style={{ background: msg.ok ? 'rgba(21,128,61,0.85)' : 'rgba(153,27,27,0.85)', color: msg.ok ? '#4ade80' : '#f87171', border: `1px solid ${msg.ok ? '#16a34a' : '#991b1b'}` }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 px-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: tab === t.id ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'rgba(15,23,42,0.85)',
              color: tab === t.id ? '#1a0a00' : '#94a3b8',
              border: `1px solid ${tab === t.id ? '#fde68a' : 'rgba(255,255,255,0.1)'}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3 px-2 pb-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
        {list.map(item => {
          const equipped = equip === item.id;
          const owned = isOwned(item.id, field);
          return (
            <div key={item.id}
              className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: equipped ? 'rgba(30,60,10,0.9)' : 'rgba(15,23,42,0.9)',
                border: `2px solid ${equipped ? '#22c55e' : owned ? '#d97706' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: equipped ? '0 0 20px rgba(34,197,94,0.25)' : 'none',
              }}>
              {/* Emoji / preview */}
              <div className="text-center text-4xl">{item.emoji}</div>
              {/* Name */}
              <div className="font-bold text-center" style={{ color: equipped ? '#4ade80' : '#f8fafc', fontSize: '13px' }}>
                {item.name}
              </div>
              {/* Desc */}
              <div className="text-center" style={{ color: '#64748b', fontSize: '11px' }}>{item.desc}</div>
              {/* Color swatch for trails */}
              {item.color && item.color !== 'rainbow' && (
                <div className="mx-auto w-8 h-3 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              )}
              {item.color === 'rainbow' && (
                <div className="mx-auto w-8 h-3 rounded-full" style={{ background: 'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7)' }} />
              )}
              {/* Button */}
              <button
                onClick={() => buy(item.id, item.price, field)}
                className="mt-1 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95"
                style={{
                  background: equipped
                    ? '#15803d'
                    : owned
                      ? 'rgba(217,119,6,0.3)'
                      : item.price === 0
                        ? 'rgba(37,99,235,0.7)'
                        : 'linear-gradient(135deg,#92400e,#d97706)',
                  color: equipped ? '#4ade80' : owned ? '#fbbf24' : '#fff',
                  border: `1px solid ${equipped ? '#16a34a' : owned ? '#d97706' : 'transparent'}`,
                }}>
                {equipped ? '✅ EQUIPADO' : owned ? '⚡ EQUIPAR' : item.price === 0 ? 'GRATIS' : `🪙 ${item.price}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* VIP Pass promo */}
      {!storeData.vipPass && (
        <div className="mx-2 mb-4 p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.3),rgba(30,27,75,0.9))', border: '2px solid #7c3aed' }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">👑</div>
            <div className="flex-1">
              <div className="font-black" style={{ color: '#c084fc', fontSize: '15px' }}>PIRATE PASS VIP</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>Sin anuncios · +20% monedas · Skin exclusiva · Nombre dorado</div>
            </div>
            <button className="px-4 py-2 rounded-xl font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' }}>
              $20 MXN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CurrencyBadge({ icon, value, color }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full"
      style={{ background: 'rgba(15,23,42,0.85)', border: `1px solid ${color}40` }}>
      <span className="text-sm">{icon}</span>
      <span className="font-bold text-sm" style={{ color }}>{value?.toLocaleString()}</span>
    </div>
  );
}
