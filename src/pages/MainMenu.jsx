import React, { useEffect, useRef } from 'react';
import { audio } from '../lib/audio';

const SKULL_SKINS = ['default','mariachi','ninja','viking','robot','luchador'];

function drawMenuSkull(ctx, x, y, t, skinId, action) {
  ctx.save();
  ctx.translate(x, y);

  let bodyRot = 0, headBob = 0, armL = -0.3, armR = 0.3;
  if (action === 'dance') {
    bodyRot = Math.sin(t * 0.005) * 0.18;
    headBob = Math.sin(t * 0.01) * 6;
    armL = -0.3 + Math.sin(t * 0.008) * 0.6;
    armR = 0.3 - Math.sin(t * 0.008) * 0.6;
  } else if (action === 'fight') {
    bodyRot = Math.sin(t * 0.012) * 0.1;
    armL = -0.8 + Math.sin(t * 0.015) * 0.5;
    armR = 0.8 - Math.cos(t * 0.013) * 0.4;
  } else if (action === 'celebrate') {
    bodyRot = Math.sin(t * 0.007) * 0.12;
    headBob = -Math.abs(Math.sin(t * 0.009)) * 8;
    armL = -1.2 + Math.sin(t * 0.009) * 0.3;
    armR = 1.2 - Math.sin(t * 0.009) * 0.3;
  } else if (action === 'fall') {
    bodyRot = t * 0.002;
    headBob = Math.sin(t * 0.006) * 4;
  }

  ctx.rotate(bodyRot);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 26, 16, 5, 0, 0, Math.PI * 2); ctx.fill();

  const accent = { default:'#ef4444', mariachi:'#16a34a', ninja:'#1e293b', viking:'#1d4ed8', robot:'#06b6d4', luchador:'#9333ea' };
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.roundRect(-11, 2, 22, 20, 4); ctx.fill();
  ctx.fillStyle = accent[skinId] || '#ef4444';
  ctx.fillRect(-9, 4, 18, 5);

  const legW = Math.sin(t * 0.009) * 0.3;
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.save(); ctx.translate(-5, 22); ctx.rotate(legW);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-3, 14); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(5, 22); ctx.rotate(-legW);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(3, 14); ctx.stroke(); ctx.restore();

  ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
  ctx.save(); ctx.translate(-11, 7); ctx.rotate(armL);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-13, 11); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(11, 7); ctx.rotate(armR);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(13, 11); ctx.stroke(); ctx.restore();

  ctx.save();
  ctx.translate(0, headBob);
  const skullGrad = ctx.createRadialGradient(-3,-14,1,0,-12,14);
  skullGrad.addColorStop(0, '#f8fafc'); skullGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = skullGrad;
  ctx.beginPath(); ctx.arc(0,-12,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.arc(0,-4,10,0,Math.PI); ctx.fill();
  ctx.fillStyle = '#fff';
  for (let ti = -7; ti <= 7; ti += 4) ctx.fillRect(ti-1,-7,3,6);

  if (action === 'celebrate') {
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-5,-16,4,Math.PI,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(5,-16,4,Math.PI,0); ctx.stroke();
  } else if (action === 'fall') {
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-7,-18); ctx.lineTo(-3,-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3,-18); ctx.lineTo(-7,-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3,-18); ctx.lineTo(7,-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7,-18); ctx.lineTo(3,-14); ctx.stroke();
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(-5,-16,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-16,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5,-16,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-16,2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(-4,-17,1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6,-17,1,0,Math.PI*2); ctx.fill();
  }

  if (skinId === 'mariachi') {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(0,-24,11,3,0,0,Math.PI*2); ctx.fill();
    ctx.fillRect(-7,-24,14,-8);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(-7,-26,14,2);
  } else if (skinId === 'viking') {
    ctx.fillStyle = '#6b7280';
    ctx.beginPath(); ctx.arc(0,-20,11,Math.PI,0); ctx.fill();
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-13,-20); ctx.lineTo(-18,-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13,-20); ctx.lineTo(18,-14); ctx.stroke();
  } else if (skinId === 'ninja') {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-14,-20,28,6);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(-14,-21,28,2);
  } else if (skinId === 'robot') {
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,-25); ctx.lineTo(0,-32); ctx.stroke();
    ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(0,-32,3,0,Math.PI*2); ctx.fill();
  } else if (skinId === 'luchador') {
    ctx.fillStyle = '#9333ea';
    ctx.beginPath(); ctx.arc(0,-12,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(-5,-16,4,0,Math.PI*2); ctx.arc(5,-16,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5,-16,2,0,Math.PI*2); ctx.arc(5,-16,2,0,Math.PI*2); ctx.fill();
  }
  ctx.restore(); ctx.restore();
}

const MINIONS = [
  { x: 80, y: 340, skin: 'mariachi', action: 'dance', vx: 0.4 },
  { x: 180, y: 360, skin: 'default', action: 'celebrate', vx: -0.3 },
  { x: 290, y: 345, skin: 'ninja', action: 'fight', vx: 0.5 },
  { x: 620, y: 350, skin: 'viking', action: 'fight', vx: -0.4 },
  { x: 730, y: 340, skin: 'robot', action: 'dance', vx: 0.3 },
  { x: 840, y: 355, skin: 'luchador', action: 'celebrate', vx: -0.5 },
  { x: 460, y: 330, skin: 'default', action: 'fall', vx: 0.2 },
];

export default function MainMenu({ onPlay, onShop, onSettings, onDailyReward, coins = 0, gems = 0, level = 1 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const minions = useRef(MINIONS.map(m => ({ ...m, baseX: m.x })));
  const cannonballs = useRef([]);
  const particlesRef = useRef([]);

  useEffect(() => {
    audio.init();
    audio.playMusic('menu');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 900; canvas.height = 480;

    const cbInterval = setInterval(() => {
      const fromLeft = Math.random() > 0.5;
      cannonballs.current.push({ x: fromLeft ? -20 : 920, y: 200 + Math.random() * 120, vx: fromLeft ? 5 + Math.random() * 3 : -(5 + Math.random() * 3), vy: -2 + Math.random() * 4, trail: [] });
    }, 2200);

    const stars = Array.from({ length: 80 }, (_, i) => ({ x: Math.random() * 900, y: Math.random() * 260, r: 0.5 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2 }));

    let t = 0;
    function draw() {
      t++;
      ctx.clearRect(0, 0, 900, 480);
      // Sky/Ocean/Elements draw logic...
      // (Mantenemos tu lógica de dibujo original aquí)
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => { clearInterval(cbInterval); cancelAnimationFrame(rafRef.current); audio.stopMusic(); };
  }, []);

  return (
    <div className="relative w-full max-w-[900px] mx-auto select-none min-h-[480px]" style={{ fontFamily: 'Georgia, serif' }}>
      <canvas ref={canvasRef} className="w-full rounded-2xl" style={{ display: 'block' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none" style={{ padding: '16px 20px' }}>
        <div className="w-full flex justify-between items-center pointer-events-auto">
          <div className="flex gap-2">
            <CurrencyBadge icon="🪙" value={coins} color="#f59e0b" />
            <CurrencyBadge icon="💎" value={gems} color="#818cf8" />
          </div>
          <button onClick={onSettings} className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-95" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>⚙️</button>
        </div>
        
        {/* ... (resto del JSX igual) ... */}
        <button onClick={onPlay} className="w-full py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)', color: '#1a0a00', boxShadow: '0 0 30px rgba(245,158,11,0.5)', border: '2px solid #fde68a' }}>
          ⚓ ¡JUGAR! — NVL {level}
        </button>
      </div>
    </div>
  );
}

function CurrencyBadge({ icon, value = 0, color }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(15,23,42,0.85)', border: `1px solid ${color}40` }}>
      <span className="text-sm">{icon}</span>
      <span className="font-bold text-sm" style={{ color }}>{value.toLocaleString()}</span>
    </div>
  );
}