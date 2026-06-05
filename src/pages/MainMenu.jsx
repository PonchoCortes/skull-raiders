import React, { useEffect, useRef } from 'react';
import { audio } from '../lib/audio';

const SKULL_SKINS = ['default','mariachi','ninja','viking','robot','luchador'];

function drawMenuSkull(ctx, x, y, t, skinId, action) {
  ctx.save();
  ctx.translate(x, y);

  // action: 'dance' | 'fight' | 'celebrate' | 'fall'
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

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 26, 16, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Body
  const accent = { default:'#ef4444', mariachi:'#16a34a', ninja:'#1e293b', viking:'#1d4ed8', robot:'#06b6d4', luchador:'#9333ea' };
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.roundRect(-11, 2, 22, 20, 4); ctx.fill();
  ctx.fillStyle = accent[skinId] || '#ef4444';
  ctx.fillRect(-9, 4, 18, 5);

  // Legs
  const legW = Math.sin(t * 0.009) * 0.3;
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.save(); ctx.translate(-5, 22); ctx.rotate(legW);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-3, 14); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(5, 22); ctx.rotate(-legW);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(3, 14); ctx.stroke(); ctx.restore();

  // Arms
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
  ctx.save(); ctx.translate(-11, 7); ctx.rotate(armL);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-13, 11); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(11, 7); ctx.rotate(armR);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(13, 11); ctx.stroke(); ctx.restore();

  // Skull head
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

  // Eyes based on action
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

  // Skin accessory
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

  ctx.restore(); // head
  ctx.restore(); // body
}

const MINIONS = [
  { x: 80,  y: 340, skin: 'mariachi',  action: 'dance',     vx: 0.4 },
  { x: 180, y: 360, skin: 'default',   action: 'celebrate', vx: -0.3 },
  { x: 290, y: 345, skin: 'ninja',     action: 'fight',     vx: 0.5 },
  { x: 620, y: 350, skin: 'viking',    action: 'fight',     vx: -0.4 },
  { x: 730, y: 340, skin: 'robot',     action: 'dance',     vx: 0.3 },
  { x: 840, y: 355, skin: 'luchador',  action: 'celebrate', vx: -0.5 },
  { x: 460, y: 330, skin: 'default',   action: 'fall',      vx: 0.2 },
];

const CANNONBALLS = [];

export default function MainMenu({ onPlay, onShop, onSettings, onDailyReward, coins, gems, level }) {
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

    // Spawn cannonballs periodically
    const cbInterval = setInterval(() => {
      const fromLeft = Math.random() > 0.5;
      cannonballs.current.push({
        x: fromLeft ? -20 : 920,
        y: 200 + Math.random() * 120,
        vx: fromLeft ? 5 + Math.random() * 3 : -(5 + Math.random() * 3),
        vy: -2 + Math.random() * 4,
        trail: [],
      });
    }, 2200);

    // Stars
    const stars = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * 900, y: Math.random() * 260,
      r: 0.5 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function draw() {
      t++;
      ctx.clearRect(0, 0, 900, 480);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.5, '#0c1a33');
      skyGrad.addColorStop(1, '#1e3a5f');
      ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, 900, 320);

      // Moon
      const moonGlow = ctx.createRadialGradient(720, 60, 0, 720, 60, 80);
      moonGlow.addColorStop(0, 'rgba(240,249,255,0.15)');
      moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = moonGlow; ctx.fillRect(640, 0, 160, 140);
      ctx.fillStyle = '#f0f9ff'; ctx.beginPath(); ctx.arc(720, 60, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0c1a33'; ctx.beginPath(); ctx.arc(730, 54, 20, 0, Math.PI * 2); ctx.fill();

      // Stars
      stars.forEach(s => {
        const flicker = 0.4 + Math.sin(t * 0.02 + s.phase) * 0.35;
        ctx.globalAlpha = flicker;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Distant mountains silhouette
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 310);
      const mtnPoints = [0,310, 60,240, 130,280, 200,210, 280,260, 360,195, 430,250, 520,185, 600,240, 680,200, 760,255, 840,210, 900,250, 900,310];
      for (let i = 0; i < mtnPoints.length; i += 2) ctx.lineTo(mtnPoints[i], mtnPoints[i+1]);
      ctx.closePath(); ctx.fill();

      // Ocean
      const oceanGrad = ctx.createLinearGradient(0, 310, 0, 480);
      oceanGrad.addColorStop(0, '#1e3a8a');
      oceanGrad.addColorStop(0.4, '#1d4ed8');
      oceanGrad.addColorStop(1, '#1e40af');
      ctx.fillStyle = oceanGrad; ctx.fillRect(0, 310, 900, 170);

      // Ocean waves
      for (let row = 0; row < 4; row++) {
        const wy = 320 + row * 28;
        ctx.strokeStyle = `rgba(147,210,255,${0.12 - row * 0.02})`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 900; x += 4) {
          ctx.lineTo(x, wy + Math.sin((x + t * 1.2 + row * 40) * 0.022) * (5 - row));
        }
        ctx.stroke();
      }

      // Moon reflection
      const reflGrad = ctx.createLinearGradient(680, 310, 760, 480);
      reflGrad.addColorStop(0, 'rgba(200,235,255,0.08)');
      reflGrad.addColorStop(1, 'rgba(200,235,255,0.02)');
      ctx.fillStyle = reflGrad;
      ctx.beginPath(); ctx.moveTo(700,310); ctx.lineTo(740,480); ctx.lineTo(760,480); ctx.lineTo(740,310); ctx.closePath(); ctx.fill();

      // Cannonballs
      cannonballs.current = cannonballs.current.filter(cb => cb.x > -60 && cb.x < 960);
      cannonballs.current.forEach(cb => {
        cb.vy += 0.12;
        cb.x += cb.vx; cb.y += cb.vy;
        cb.trail.push({ x: cb.x, y: cb.y });
        if (cb.trail.length > 12) cb.trail.shift();
        // Trail
        cb.trail.forEach((pt, i) => {
          const alpha = (i / cb.trail.length) * 0.35;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 4 * (i / cb.trail.length), 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 12; ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#1f2937';
        ctx.beginPath(); ctx.arc(cb.x, cb.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Ships
      drawMenuShip(ctx, 90, 355, false, t);
      drawMenuShip(ctx, 810, 355, true, t);

      // Skull minions
      minions.current.forEach((m, i) => {
        m.x += Math.sin(t * 0.003 + i) * 0.6;
        m.y = m.y + Math.sin(t * 0.005 + i * 2) * 0.3;
        drawMenuSkull(ctx, m.x, m.y, t, m.skin, m.action);
      });

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.02;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      clearInterval(cbInterval);
      cancelAnimationFrame(rafRef.current);
      audio.stopMusic();
    };
  }, []);

  function spawnParticles(x, y) {
    for (let i = 0; i < 18; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5,
        r: 2 + Math.random() * 4,
        color: ['#f59e0b','#fbbf24','#f97316','#ef4444','#22c55e'][Math.floor(Math.random()*5)],
        life: 1,
      });
    }
  }

  return (
    <div className="relative w-full max-w-[900px] mx-auto select-none" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Canvas background */}
      <canvas ref={canvasRef} className="w-full rounded-2xl" style={{ display: 'block' }} />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none" style={{ padding: '16px 20px' }}>

        {/* Top bar */}
        <div className="w-full flex justify-between items-center pointer-events-auto">
          <div className="flex gap-2">
            <CurrencyBadge icon="🪙" value={coins} color="#f59e0b" />
            <CurrencyBadge icon="💎" value={gems} color="#818cf8" />
          </div>
          <button onClick={onSettings}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-95"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
            ⚙️
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-center" style={{ textShadow: '0 0 40px rgba(245,158,11,0.6), 0 2px 8px rgba(0,0,0,0.9)' }}>
            <div className="font-black" style={{ fontSize: 'clamp(28px,7vw,56px)', color: '#f59e0b', letterSpacing: '0.04em', lineHeight: 1 }}>
              💀 SKULL RAIDERS
            </div>
            <div className="font-bold" style={{ fontSize: 'clamp(11px,2.5vw,18px)', color: '#94a3b8', letterSpacing: '0.2em' }}>
              CANNON CHAOS
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs pointer-events-auto">
          {/* Play */}
          <button
            onClick={e => { spawnParticles(e.clientX, e.clientY); audio.init(); audio.playSFX('levelup'); onPlay(); }}
            className="w-full py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',
              color: '#1a0a00', boxShadow: '0 0 30px rgba(245,158,11,0.5), 0 4px 16px rgba(0,0,0,0.5)',
              border: '2px solid #fde68a', letterSpacing: '0.05em',
            }}>
            ⚓ ¡JUGAR! — NVL {level}
          </button>

          <div className="flex gap-3 w-full">
            {/* Shop */}
            <button onClick={onShop}
              className="flex-1 py-3 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(15,23,42,0.85)', color: '#f59e0b', border: '2px solid #d97706', boxShadow: '0 0 12px rgba(245,158,11,0.2)' }}>
              🛒 TIENDA
            </button>
            {/* Daily */}
            <button onClick={onDailyReward}
              className="flex-1 py-3 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(15,23,42,0.85)', color: '#4ade80', border: '2px solid #16a34a', boxShadow: '0 0 12px rgba(34,197,94,0.2)' }}>
              🎁 DIARIO
            </button>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="text-center pointer-events-none"
          style={{ color: 'rgba(148,163,184,0.5)', fontSize: '11px', letterSpacing: '0.1em' }}>
          🏴‍☠️ SKULL RAIDERS v2.0
        </div>
      </div>
    </div>
  );
}

function CurrencyBadge({ icon, value, color }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full"
      style={{ background: 'rgba(15,23,42,0.85)', border: `1px solid ${color}40` }}>
      <span className="text-sm">{icon}</span>
      <span className="font-bold text-sm" style={{ color }}>{value.toLocaleString()}</span>
    </div>
  );
}

function drawMenuShip(ctx, cx, cy, flip, t) {
  ctx.save();
  ctx.translate(cx, cy + Math.sin(t * 0.003 + cx * 0.01) * 5);
  if (flip) ctx.scale(-1, 1);

  // Hull
  ctx.fillStyle = flip ? '#0f172a' : '#5c3010';
  ctx.beginPath();
  ctx.moveTo(-60, 8); ctx.quadraticCurveTo(0, 40, 60, 8);
  ctx.lineTo(42, -16); ctx.lineTo(-42, -16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = flip ? '#334155' : '#451a03'; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = flip ? '#1e293b' : '#9b6b3f';
  ctx.fillRect(-42, -16, 84, 12);

  ctx.fillStyle = flip ? '#080c14' : '#2a1608';
  ctx.fillRect(-3, -74, 6, 60);

  ctx.fillStyle = flip ? '#1e293b' : '#f8f4e8';
  ctx.beginPath(); ctx.moveTo(2,-70); ctx.lineTo(38,-48); ctx.lineTo(2,-24); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.moveTo(-2,-78); ctx.lineTo(18,-72); ctx.lineTo(-2,-67); ctx.closePath(); ctx.fill();
  ctx.font = '7px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff'; ctx.fillText('☠', 8, -72);

  ctx.restore();
}
