import React, { useEffect, useRef } from 'react';
import { audio } from '../lib/audio';
import { getDisplayCoins } from '../lib/store';

// ---- SPRITE DE CALAVERA (animación por frames, estilo spritesheet) ----
// En vez de mover brazos/piernas con curvas continuas (se ve como gelatina),
// usamos posiciones fijas por "frame" que se van turnando, igual que un
// spritesheet clásico de 2D. Se ve más marcado y "de videojuego".

const WALK_FRAMES = [
  { legL: -0.35, legR: 0.35, armL: 0.35, armR: -0.35, bob: 0 },
  { legL: -0.12, legR: 0.12, armL: 0.12, armR: -0.12, bob: -3 },
  { legL: 0.35, legR: -0.35, armL: -0.35, armR: 0.35, bob: 0 },
  { legL: 0.12, legR: -0.12, armL: -0.12, armR: 0.12, bob: -3 },
];

const DANCE_FRAMES = [
  { legL: -0.2, legR: 0.1, armL: -1.1, armR: 0.3, bob: -2 },
  { legL: 0.05, legR: -0.05, armL: -0.4, armR: 1.0, bob: -6 },
  { legL: 0.2, legR: -0.1, armL: 0.3, armR: -1.1, bob: -2 },
  { legL: -0.05, legR: 0.05, armL: 1.0, armR: -0.4, bob: -6 },
];

const FIGHT_FRAMES = [
  { legL: -0.15, legR: 0.15, armL: -1.4, armR: 0.5, bob: 0 },
  { legL: -0.05, legR: 0.05, armL: -0.3, armR: -0.9, bob: -1 },
  { legL: -0.15, legR: 0.15, armL: -1.4, armR: 0.5, bob: 0 },
  { legL: -0.05, legR: 0.05, armL: 1.3, armR: -0.4, bob: -1 },
];

const CELEBRATE_FRAMES = [
  { legL: -0.1, legR: 0.25, armL: -1.3, armR: 1.3, bob: -8 },
  { legL: 0.1, legR: -0.1, armL: -1.5, armR: 1.5, bob: 0 },
  { legL: 0.25, legR: -0.1, armL: -1.3, armR: 1.3, bob: -8 },
  { legL: -0.1, legR: 0.1, armL: -1.5, armR: 1.5, bob: 0 },
];

const ACCENT = { default:'#ef4444', mariachi:'#16a34a', ninja:'#1e293b', viking:'#1d4ed8', robot:'#06b6d4', luchador:'#9333ea' };

function drawMenuSkull(ctx, x, y, frame, flip, skinId, action) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);

  const { legL, legR, armL, armR, bob } = frame;

  // Sombra (se achica un poco cuando el sprite "salta" en el bob)
  const shadowScale = 1 - Math.min(Math.abs(bob) / 20, 0.35);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 26, 15 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(0, bob);

  // Piernas (grosor tipo pixel-sprite, sin curvas)
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 5; ctx.lineCap = 'square';
  ctx.save(); ctx.translate(-5, 20); ctx.rotate(legL);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 13); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(5, 20); ctx.rotate(legR);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 13); ctx.stroke(); ctx.restore();

  // Torso
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.roundRect(-11, 2, 22, 20, 4); ctx.fill();
  ctx.fillStyle = ACCENT[skinId] || '#ef4444';
  ctx.fillRect(-9, 4, 18, 5);

  // Brazos
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 4; ctx.lineCap = 'square';
  ctx.save(); ctx.translate(-11, 7); ctx.rotate(armL);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 13); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(11, 7); ctx.rotate(armR);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 13); ctx.stroke(); ctx.restore();

  // Cabeza (calavera)
  const skullGrad = ctx.createRadialGradient(-3, -14, 1, 0, -12, 14);
  skullGrad.addColorStop(0, '#f8fafc'); skullGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = skullGrad;
  ctx.beginPath(); ctx.arc(0, -12, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.arc(0, -4, 10, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#fff';
  for (let ti = -7; ti <= 7; ti += 4) ctx.fillRect(ti - 1, -7, 3, 6);

  if (action === 'celebrate') {
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-5, -16, 4, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(5, -16, 4, Math.PI, 0); ctx.stroke();
  } else if (action === 'fall') {
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-7, -18); ctx.lineTo(-3, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, -18); ctx.lineTo(-7, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -18); ctx.lineTo(7, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -18); ctx.lineTo(3, -14); ctx.stroke();
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(-5, -16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5, -16, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -16, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(-4, -17, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -17, 1, 0, Math.PI * 2); ctx.fill();
  }

  if (skinId === 'mariachi') {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(0, -24, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-7, -24, 14, -8);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(-7, -26, 14, 2);
  } else if (skinId === 'viking') {
    ctx.fillStyle = '#6b7280';
    ctx.beginPath(); ctx.arc(0, -20, 11, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-13, -20); ctx.lineTo(-18, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13, -20); ctx.lineTo(18, -14); ctx.stroke();
  } else if (skinId === 'ninja') {
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-14, -20, 28, 6);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(-14, -21, 28, 2);
  } else if (skinId === 'robot') {
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(0, -32); ctx.stroke();
    ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(0, -32, 3, 0, Math.PI * 2); ctx.fill();
  } else if (skinId === 'luchador') {
    ctx.fillStyle = '#9333ea';
    ctx.beginPath(); ctx.arc(0, -12, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(-5, -16, 4, 0, Math.PI * 2); ctx.arc(5, -16, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5, -16, 2, 0, Math.PI * 2); ctx.arc(5, -16, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawShipSilhouette(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(10,10,20,0.55)';
  ctx.beginPath();
  ctx.moveTo(-70, 0);
  ctx.lineTo(-55, 22);
  ctx.lineTo(55, 22);
  ctx.lineTo(70, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-4, -60, 8, 62);
  ctx.beginPath();
  ctx.moveTo(-2, -58);
  ctx.lineTo(-2, -20);
  ctx.lineTo(-42, -14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -50);
  ctx.lineTo(4, -18);
  ctx.lineTo(36, -12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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

export default function MainMenu({ onPlay, onShop, onSettings, onDailyReward, onLevels, storeData = {}, level = 1 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const minions = useRef(MINIONS.map(m => ({ ...m, baseX: m.x, walkPhase: Math.random() * 4 })));
  const cannonballs = useRef([]);
  const particlesRef = useRef([]);
  const minionFxRef = useRef([]);

  const coins = getDisplayCoins(storeData);
  const gems = storeData.gems || 0;
  const debugMode = !!storeData.debugMode;

  useEffect(() => {
    audio.init();
    audio.playMusic('menu');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 900; canvas.height = 480;

    const cbInterval = setInterval(() => {
      const fromLeft = Math.random() > 0.5;
      cannonballs.current.push({
        x: fromLeft ? -20 : 920,
        y: 170 + Math.random() * 110,
        vx: fromLeft ? 5 + Math.random() * 3 : -(5 + Math.random() * 3),
        vy: -2 + Math.random() * 3,
        trail: [],
      });
    }, 2200);

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * 900, y: Math.random() * 230,
      r: 0.5 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2,
    }));
    const clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * 900, y: 30 + Math.random() * 70,
      s: 0.6 + Math.random() * 0.9, speed: 0.12 + Math.random() * 0.18,
    }));

    let t = 0;
    function draw() {
      t++;
      ctx.clearRect(0, 0, 900, 480);

      // ---- CIELO ----
      const sky = ctx.createLinearGradient(0, 0, 0, 300);
      sky.addColorStop(0, '#1a0a2e');
      sky.addColorStop(0.55, '#7b2d8b');
      sky.addColorStop(1, '#f97316');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 900, 300);

      // Estrellas parpadeantes
      stars.forEach(s => {
        const alpha = 0.25 + Math.abs(Math.sin(t * 0.02 + s.phase)) * 0.55;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });

      // Luna
      ctx.save();
      ctx.shadowColor = 'rgba(254,243,199,0.6)';
      ctx.shadowBlur = 25;
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath(); ctx.arc(770, 65, 26, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Nubes con parallax
      clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -110) c.x = 1010;
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 50 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
        ctx.ellipse(c.x + 32 * c.s, c.y + 5 * c.s, 34 * c.s, 13 * c.s, 0, 0, Math.PI * 2);
        ctx.ellipse(c.x - 30 * c.s, c.y + 4 * c.s, 30 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // ---- OCÉANO ----
      const ocean = ctx.createLinearGradient(0, 290, 0, 480);
      ocean.addColorStop(0, '#c2410c');
      ocean.addColorStop(0.18, '#0369a1');
      ocean.addColorStop(1, '#020617');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 290, 900, 190);

      // Olas
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 2;
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        for (let x = 0; x <= 900; x += 18) {
          const y = 310 + w * 34 + Math.sin(x * 0.02 + t * 0.035 + w * 1.4) * 6;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Barcos lejanos
      drawShipSilhouette(ctx, 150 + Math.sin(t * 0.003) * 20, 300, 0.55);
      drawShipSilhouette(ctx, 700 + Math.cos(t * 0.0025) * 25, 296, 0.42);

      // Plataforma/cubierta donde bailan los minions
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 320, 900, 160);

      // Minions: sprite por frames (caminata real), volteo de dirección y efectos por acción
      minions.current.forEach(m => {
        const moving = m.action !== 'fall';
        if (moving) {
          m.x += m.vx;
          if (m.x < m.baseX - 55 || m.x > m.baseX + 55) m.vx *= -1;
          // La velocidad del ciclo de piernas depende de qué tan rápido camina
          m.walkPhase += Math.abs(m.vx) * 0.22;
        } else {
          m.walkPhase += 0.05; // idle lento para el mareado
        }

        const flip = m.vx < 0;
        const frameSet = m.action === 'dance' ? DANCE_FRAMES
          : m.action === 'fight' ? FIGHT_FRAMES
          : m.action === 'celebrate' ? CELEBRATE_FRAMES
          : WALK_FRAMES;
        const frameIdx = Math.floor(m.walkPhase) % frameSet.length;
        const frame = frameSet[frameIdx];

        if (m.action === 'fall') {
          // Calavera mareada tirada, gira lento en el piso + estrellitas orbitando
          ctx.save();
          ctx.translate(m.x, m.y + 14);
          ctx.rotate(Math.PI / 2 + Math.sin(t * 0.02) * 0.05);
          drawMenuSkull(ctx, 0, 0, WALK_FRAMES[0], false, m.skin, 'fall');
          ctx.restore();
          for (let i = 0; i < 3; i++) {
            const ang = t * 0.05 + (i * Math.PI * 2) / 3;
            ctx.fillStyle = '#fde68a';
            ctx.font = '10px sans-serif';
            ctx.fillText('✨', m.x + Math.cos(ang) * 16 - 5, m.y - 20 + Math.sin(ang) * 6);
          }
        } else {
          drawMenuSkull(ctx, m.x, m.y, frame, flip, m.skin, m.action);

          // Polvito al caminar (cuando el pie toca el piso, frames 0 y 2)
          if (moving && (frameIdx === 0 || frameIdx === 2) && Math.random() < 0.5) {
            minionFxRef.current.push({ type: 'dust', x: m.x, y: m.y + 24, vx: -m.vx * 0.3, vy: -0.3, life: 14 });
          }
          // Notitas musicales al bailar
          if (m.action === 'dance' && t % 14 === 0) {
            minionFxRef.current.push({ type: 'note', x: m.x + (Math.random() - 0.5) * 10, y: m.y - 30, vx: (Math.random() - 0.5) * 0.4, vy: -0.6, life: 40 });
          }
          // Estrellitas de impacto al pelear
          if (m.action === 'fight' && frameIdx === 1 && Math.random() < 0.4) {
            minionFxRef.current.push({ type: 'hit', x: m.x + (flip ? -14 : 14), y: m.y - 4, vx: 0, vy: 0, life: 10 });
          }
          // Chispas al festejar
          if (m.action === 'celebrate' && frameIdx === 1 && Math.random() < 0.6) {
            minionFxRef.current.push({ type: 'spark', x: m.x + (Math.random() - 0.5) * 20, y: m.y - 34, vx: (Math.random() - 0.5) * 1.2, vy: -1 - Math.random(), life: 22 });
          }
        }
      });

      // Dibuja y actualiza efectos de los minions
      minionFxRef.current = minionFxRef.current.filter(fx => {
        fx.x += fx.vx; fx.y += fx.vy; fx.life--;
        const a = Math.max(fx.life, 0) / (fx.type === 'note' ? 40 : fx.type === 'spark' ? 22 : fx.type === 'dust' ? 14 : 10);
        if (fx.type === 'dust') {
          ctx.fillStyle = `rgba(226,232,240,${a * 0.5})`;
          ctx.beginPath(); ctx.arc(fx.x, fx.y, 2.5 * a, 0, Math.PI * 2); ctx.fill();
        } else if (fx.type === 'note') {
          ctx.fillStyle = `rgba(251,191,36,${a})`;
          ctx.font = '12px sans-serif';
          ctx.fillText('♪', fx.x, fx.y);
        } else if (fx.type === 'hit') {
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('✦', fx.x, fx.y);
        } else if (fx.type === 'spark') {
          ctx.fillStyle = `rgba(253,230,138,${a})`;
          ctx.beginPath(); ctx.arc(fx.x, fx.y, 1.8 * a, 0, Math.PI * 2); ctx.fill();
        }
        return fx.life > 0;
      });

      // Cañonazos con estela + partículas al salir de pantalla
      cannonballs.current = cannonballs.current.filter(cb => {
        cb.trail.push({ x: cb.x, y: cb.y });
        if (cb.trail.length > 8) cb.trail.shift();
        cb.x += cb.vx; cb.y += cb.vy; cb.vy += 0.08;

        cb.trail.forEach((p, i) => {
          const a = (i / cb.trail.length) * 0.5;
          ctx.fillStyle = `rgba(255,190,90,${a})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 3 * (i / cb.trail.length), 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(cb.x, cb.y, 6, 0, Math.PI * 2); ctx.fill();

        const alive = cb.x > -40 && cb.x < 940 && cb.y < 500;
        if (!alive) {
          for (let i = 0; i < 7; i++) {
            particlesRef.current.push({
              x: cb.x, y: Math.min(cb.y, 470),
              vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 1,
              life: 20,
            });
          }
        }
        return alive;
      });

      // Partículas de impacto
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life--;
        ctx.fillStyle = `rgba(245,158,11,${Math.max(p.life, 0) / 20})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        return p.life > 0;
      });

      // Viñeta
      const vg = ctx.createRadialGradient(450, 240, 140, 450, 240, 520);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 900, 480);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => { clearInterval(cbInterval); cancelAnimationFrame(rafRef.current); audio.stopMusic(); };
  }, []);

  return (
    <div className="relative w-full max-w-[900px] mx-auto select-none" style={{ fontFamily: 'Georgia, serif', aspectRatio: '900/480' }}>
      <canvas ref={canvasRef} className="w-full h-full rounded-2xl" style={{ display: 'block', aspectRatio: '900/480' }} />

      <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none" style={{ padding: '16px 20px' }}>
        {/* Top bar */}
        <div className="w-full flex justify-between items-center pointer-events-auto">
          <div className="flex gap-2">
            <CurrencyBadge icon="🪙" value={coins} color="#f59e0b" infinite={debugMode} />
            <CurrencyBadge icon="💎" value={gems} color="#818cf8" />
          </div>
          <div className="flex items-center gap-2">
            {debugMode && (
              <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full animate-pulse"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid #16a34a' }}>
                🐛 MODO PRUEBA
              </span>
            )}
            <button onClick={onSettings}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-95"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
              ⚙️
            </button>
          </div>
        </div>

        {/* Título */}
        <div className="flex flex-col items-center pointer-events-none" style={{ marginTop: '-6px' }}>
          <h1 className="font-black tracking-wide text-center"
            style={{
              fontSize: 'clamp(28px, 6vw, 46px)',
              color: '#fde68a',
              textShadow: '0 0 18px rgba(251,191,36,0.7), 0 0 40px rgba(239,68,68,0.35), 3px 3px 0 rgba(0,0,0,0.6)',
              lineHeight: 1,
            }}>
            💀 SKULL RAIDERS ⚓
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-bold" style={{ color: 'rgba(226,232,240,0.75)', letterSpacing: '0.08em' }}>
            CANNON CHAOS — 100 NIVELES DE CAOS PIRATA
          </p>
        </div>

        {/* Botones */}
        <div className="w-full flex flex-col gap-2 pointer-events-auto">
          <div className="w-full grid grid-cols-3 gap-2">
            <MenuChip icon="🗺️" label="Niveles" onClick={onLevels} />
            <MenuChip icon="🛒" label="Tienda" onClick={onShop} />
            <MenuChip icon="🎁" label="Diario" onClick={onDailyReward} />
          </div>
          <button onClick={onPlay}
            className="w-full py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',
              color: '#1a0a00',
              boxShadow: '0 0 30px rgba(245,158,11,0.5)',
              border: '2px solid #fde68a',
            }}>
            ⚓ ¡JUGAR! — NVL {level}
          </button>
        </div>
      </div>
    </div>
  );
}

function CurrencyBadge({ icon, value = 0, color, infinite }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(15,23,42,0.85)', border: `1px solid ${color}40` }}>
      <span className="text-sm">{icon}</span>
      <span className="font-bold text-sm" style={{ color }}>{infinite ? '∞' : value.toLocaleString()}</span>
    </div>
  );
}

function MenuChip({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95"
      style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}>
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
