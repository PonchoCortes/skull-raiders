import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import GameHUD from './GameHUD';
import { audio } from '../../lib/audio';

const MAPA_W = 1600, MAPA_H = 600;
const CANVAS_W = 900, CANVAS_H = 560;

const SKY_PALETTES = {
  day:   { top:'#1a6bbf', mid:'#3a9ad9', bot:'#87ceeb', oceanTop:'#1e8aff', starAlpha:0 },
  dusk:  { top:'#1a0a2e', mid:'#7b2d8b', bot:'#f97316', oceanTop:'#c2410c', starAlpha:0.3 },
  night: { top:'#020617', mid:'#0c1a33', bot:'#1e3a5f', oceanTop:'#1e40af', starAlpha:0.8 },
  storm: { top:'#111827', mid:'#1f2937', bot:'#374151', oceanTop:'#0369a1', starAlpha:0.1 },
};

// ---- SKULL MINION DRAWING ----
function drawSkullMinion(ctx, x, y, angle, vx, vy, hp, maxHp, skinId, t, alive) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const dead = hp <= 0;
  const hurt = hp < maxHp;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyColor = dead ? '#374151' : (hurt ? '#7f1d1d' : '#1e293b');
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(-10, 2, 20, 18, 3);
  ctx.fill();

  const skinAccent = getSkinAccent(skinId);
  ctx.fillStyle = skinAccent;
  ctx.fillRect(-8, 4, 16, 4);

  const legWobble = Math.sin(t * 0.01 + x * 0.05) * (dead ? 0.4 : 0.15);
  ctx.strokeStyle = dead ? '#374151' : '#475569';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  
  ctx.save();
  ctx.translate(-5, 20);
  ctx.rotate(legWobble);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-3, 14); ctx.stroke();
  ctx.restore();
  
  ctx.save();
  ctx.translate(5, 20);
  ctx.rotate(-legWobble);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(3, 14); ctx.stroke();
  ctx.restore();

  const armWobble = Math.sin(t * 0.008 + y * 0.05) * (dead ? 0.6 : 0.2);
  ctx.strokeStyle = dead ? '#374151' : '#475569';
  ctx.lineWidth = 4;
  
  ctx.save();
  ctx.translate(-10, 6);
  ctx.rotate(-0.3 + armWobble);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-12, 10); ctx.stroke();
  ctx.restore();
  
  ctx.save();
  ctx.translate(10, 6);
  ctx.rotate(0.3 - armWobble);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(12, 10); ctx.stroke();
  ctx.restore();

  ctx.save();
  const headBob = dead ? 0.3 : Math.sin(t * 0.005 + x * 0.03) * 0.05;
  ctx.rotate(headBob);

  const skullGrad = ctx.createRadialGradient(-3, -5, 1, 0, -5, 13);
  skullGrad.addColorStop(0, dead ? '#6b7280' : '#f8fafc');
  skullGrad.addColorStop(1, dead ? '#374151' : '#cbd5e1');
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(0, -10, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = dead ? '#4b5563' : '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, -2, 9, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = dead ? '#6b7280' : '#fff';
  for (let ti = -6; ti <= 6; ti += 4) {
    ctx.fillRect(ti - 1, -4, 3, 5);
  }

  const eyeColor = dead ? '#ef4444' : (hurt ? '#fbbf24' : '#1e293b');
  const eyeGlow = dead ? 'rgba(239,68,68,0.8)' : 'none';

  ctx.shadowBlur = dead ? 8 : 0;
  ctx.shadowColor = eyeGlow;

  ctx.fillStyle = dead ? '#ef4444' : '#e2e8f0';
  ctx.beginPath(); ctx.ellipse(-5, -13, 4, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, -13, 4, 4, 0, 0, Math.PI * 2); ctx.fill();

  if (dead) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(-7,-15); ctx.lineTo(-3,-11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3,-15); ctx.lineTo(-7,-11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3,-15); ctx.lineTo(7,-11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7,-15); ctx.lineTo(3,-11); ctx.stroke();
  } else {
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5, -13, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -13, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(-4, -14, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -14, 1, 0, Math.PI * 2); ctx.fill();
  }

  ctx.shadowBlur = 0;

  drawSkinAccessory(ctx, skinId, t, dead);

  ctx.restore(); 

  if (!dead && hp < maxHp) {
    const bw = 28;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-bw/2, -32, bw, 5);
    ctx.fillStyle = hp > maxHp * 0.5 ? '#22c55e' : '#ef4444';
    ctx.fillRect(-bw/2, -32, bw * (hp/maxHp), 5);
  }

  ctx.restore();
}

function getSkinAccent(skinId) {
  const accents = {
    default: '#ef4444',
    mariachi: '#16a34a',
    ninja: '#1e293b',
    viking: '#1d4ed8',
    robot: '#06b6d4',
    luchador: '#9333ea',
  };
  return accents[skinId] || '#ef4444';
}

function drawSkinAccessory(ctx, skinId, t, dead) {
  const wobble = dead ? 0.2 : 0;
  ctx.save();
  ctx.rotate(wobble);

  if (skinId === 'mariachi') {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(0, -22, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.moveTo(-6,-22); ctx.lineTo(6,-22); ctx.lineTo(4,-30); ctx.lineTo(-4,-30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(-6, -24, 12, 2);
  } else if (skinId === 'viking') {
    ctx.fillStyle = '#6b7280';
    ctx.beginPath(); ctx.arc(0, -18, 10, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-12,-18); ctx.lineTo(-16,-12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12,-18); ctx.lineTo(16,-12); ctx.stroke();
  } else if (skinId === 'ninja') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-13, -17, 26, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-13, -18, 26, 2);
  } else if (skinId === 'robot') {
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(0,-30); ctx.stroke();
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath(); ctx.arc(0,-30, 3, 0, Math.PI*2); ctx.fill();
  } else if (skinId === 'luchador') {
    ctx.fillStyle = '#9333ea';
    ctx.beginPath(); ctx.arc(0,-10,13,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(-5,-13,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-13,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-5,-13,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-13,2,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

// ---- FUNCIÓN DE DIBUJO DE BARCO ----
// Mapa de imágenes por skin de barco. Los skins que todavía no tienen arte
// propio caen de vuelta al barco clásico, así nada se rompe si falta un PNG.
const SHIP_IMAGES = {
  classic:  { player: '/images/ship_player.png',          enemy: '/images/ship_enemy.png' },
  obsidian: { player: '/images/ship_player_obsidian.png',  enemy: '/images/ship_enemy_obsidian.png' },
};
function getShipImagePaths(skinId) {
  return SHIP_IMAGES[skinId] || SHIP_IMAGES.classic;
}

function drawShip(ctx, x, y, enemy, skinId, t, playerImg, enemyImg) {
  ctx.save();
  const bob = Math.sin(t * 0.003 + x * 0.01) * 4;
  ctx.translate(x, y + bob);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); 
  ctx.ellipse(0, 60, 170, 25, 0, 0, Math.PI * 2); 
  ctx.fill();

  const img = enemy ? enemyImg : playerImg;
  
  if (img && img.complete && img.naturalWidth > 0) {
    const renderW = 450; 
    const renderH = 450; 

    ctx.drawImage(
      img, 
      -renderW / 2, 
      // Sube 3 píxeles (de +160 a +157)
      -renderH + 157, 
      renderW, 
      renderH
    );
  } else {
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText("Cargando...", 0, 0);
  }

  ctx.restore();
}

function drawCannon(ctx, px, py, angle, skinId) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(angle);
  const colors = {
    iron:    ['#6b7280','#1f2937'],
    golden:  ['#d97706','#92400e'],
    dragon:  ['#991b1b','#7f1d1d'],
    crystal: ['#0ea5e9','#0c4a6e'],
    skull:   ['#374151','#111827'],
  };
  const [cc1, cc2] = colors[skinId] || colors.iron;
  const bg = ctx.createLinearGradient(0,-7,0,7);
  bg.addColorStop(0, cc1); bg.addColorStop(1, cc2);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(2,-8,50,16,4); ctx.fill();
  ctx.strokeStyle='#111'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#1f2937';
  ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#4b5563';
  ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// ---- BOSS DRAWING ----
function drawBoss(ctx, bx, by, type, t) {
  ctx.save(); ctx.translate(bx, by);
  if (type === 'KRAKEN') {
    ctx.shadowBlur=20; ctx.shadowColor='#ec4899';
    for (let i=0;i<5;i++) {
      ctx.save();
      const ox=-130+(i*65), wave=Math.sin(t*0.004+i*2)*25;
      ctx.translate(ox,40);
      const g=ctx.createLinearGradient(0,-180,0,0);
      g.addColorStop(0,'#db2777'); g.addColorStop(0.5,'#4c1d95'); g.addColorStop(1,'#1e1b4b');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.moveTo(-25,0);
      ctx.quadraticCurveTo(-15+wave,-90,-5+wave,-160);
      ctx.quadraticCurveTo(0+wave,-180,5+wave,-160);
      ctx.quadraticCurveTo(15+wave,-90,25,0); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#fbcfe8';
      for(let j=0;j<5;j++){ctx.beginPath();ctx.arc(-10+wave*(j/5),-30-(j*28),5-(j*0.6),0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
  } else if (type === 'GHOST') {
    ctx.globalAlpha=0.5; ctx.shadowBlur=25; ctx.shadowColor='#10b981';
    const bob=Math.sin(t*0.003)*12;
    ctx.translate(0,bob-20);
    ctx.fillStyle='#064e3b';
    ctx.beginPath(); ctx.moveTo(-110,15); ctx.quadraticCurveTo(0,70,110,15);
    ctx.lineTo(80,-35); ctx.lineTo(-80,-35); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#34d399'; ctx.lineWidth=3; ctx.stroke();
    ctx.globalAlpha=0.5; ctx.fillStyle='#14532d';
    for(let m=-50;m<=50;m+=50){
      ctx.fillRect(m-4,-130,8,100);
      ctx.beginPath(); ctx.moveTo(m,-120); ctx.lineTo(m+55,-80); ctx.lineTo(m,-45); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  } else if (type === 'LEVIATHAN') {
    ctx.shadowBlur=20; ctx.shadowColor='#3b82f6';
    for(let s=0;s<6;s++){
      const sx=-150+(s*55), sy=Math.sin(t*0.004+s*1.5)*45-25;
      const g=ctx.createLinearGradient(sx-25,0,sx+25,0);
      g.addColorStop(0,'#1d4ed8'); g.addColorStop(0.5,'#1e40af'); g.addColorStop(1,'#172554');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(sx,sy,s===5?32:25-(s*1.5),0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#60a5fa';
      ctx.beginPath(); ctx.moveTo(sx,sy-20); ctx.lineTo(sx-10,sy-45); ctx.lineTo(sx+10,sy-20); ctx.fill();
    }
  } else if (type === 'FORTRESS') {
    ctx.shadowBlur=15; ctx.shadowColor='#4b5563';
    ctx.fillStyle='#1f2937'; ctx.fillRect(-120,-180,240,240);
    ctx.strokeStyle='#6b7280'; ctx.lineWidth=4; ctx.strokeRect(-120,-180,240,240);
    ctx.fillStyle='#111827';
    for(let b=-120;b<120;b+=60){ ctx.fillRect(b+10,-210,40,30); ctx.strokeRect(b+10,-210,40,30); }
    ctx.fillStyle='#030712'; ctx.shadowBlur=25; ctx.shadowColor='#ef4444';
    ctx.fillRect(-55,-120,35,25); ctx.fillRect(20,-120,35,25);
    ctx.fillStyle='#ef4444';
    ctx.beginPath(); ctx.arc(-37,-107,6,0,Math.PI*2); ctx.arc(37,-107,6,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  }
  ctx.restore();
}

export default function PirateGame({ levelDef, onLevelComplete, onLevelFail, storeData }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(null);

  const imgPlayerRef = useRef(new Image());
  const imgEnemyRef = useRef(new Image());

  const skullSkin = storeData?.skullSkin || 'default';
  const shipSkin = storeData?.shipSkin || 'classic';
  const cannonSkin = storeData?.cannonSkin || 'iron';
  const trailColor = storeData?.trailColor || 'orange';

  const totalSkulls = 3; 

  const [hudState, setHudState] = useState({
    turno: 'jugador',
    skullsAliados: totalSkulls,
    skullsEnemigos: totalSkulls,
    totalSkulls,
    gameOver: false, won: false,
    level: levelDef.n, wind: levelDef.windX,
    act: levelDef.act,
  });

  useEffect(() => {
    const paths = getShipImagePaths(shipSkin);
    imgPlayerRef.current.src = paths.player;
    imgEnemyRef.current.src = paths.enemy;
  }, [shipSkin]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;

    if (levelDef.boss) audio.playMusic('boss');
    else audio.playMusic('battle');

    const { Engine, Bodies, Composite, Body, Events } = Matter;
    const engine = Engine.create({ gravity: { x: levelDef.windX * 0.3, y: levelDef.gravity } });
    const world = engine.world;

    const cxBase = 1470, yBarcoEnemigo = MAPA_H - 100;
    const playerStartX = 250, playerStartY = MAPA_H - 100;
    const palette = SKY_PALETTES[levelDef.timeOfDay] || SKY_PALETTES.night;

    const agua = Bodies.rectangle(MAPA_W/2, MAPA_H-8, MAPA_W+300, 16, { isStatic:true, label:'agua' });
    const wallL = Bodies.rectangle(-60, MAPA_H/2, 120, MAPA_H*4, { isStatic:true, label:'wall' });
    const wallR = Bodies.rectangle(MAPA_W+60, MAPA_H/2, 120, MAPA_H*4, { isStatic:true, label:'wall' });
    Composite.add(world, [agua, wallL, wallR]);

    // --- MONTAÑAS: Suben 3 píxeles (de MAPA_H-200 a MAPA_H-203) ---
    const mountainBodies = [];
    levelDef.mountains.forEach((m,i) => {
      const verts = [{x:-m.w/2,y:0},{x:m.w/2,y:0},{x:m.w/3,y:-m.h*0.6},{x:0,y:-m.h},{x:-m.w/3,y:-m.h*0.6}];
      const body = Bodies.fromVertices(m.x, MAPA_H-203, verts, { isStatic:true, label:`mountain_${i}`, friction:0.8, restitution:0.1 });
      body.mountainData = {...m, idx:i}; body.hp = m.hp; body.maxHp = m.maxHp;
      mountainBodies.push(body); Composite.add(world, body);
    });

    const portalBodies = [];
    levelDef.portals.forEach((p,i) => {
      const pb = Bodies.rectangle(MAPA_W/2, p.y, 110, 28, { isStatic:true, isSensor:true, label:`portal_${i}` });
      pb.portalData = {...p, idx:i}; pb.velX = p.speed;
      pb.limIzq = MAPA_W/2 - p.range; pb.limDer = MAPA_W/2 + p.range;
      portalBodies.push(pb); Composite.add(world, pb);
    });

    // ---- SKULL MINIONS (AJUSTADOS) ----
    const isBossLevel = !!levelDef.boss;
    const skullsAliados = [];
    const skullsEnemigos = [];

    function createSkullBody(x, y, label) {
      return Bodies.circle(x, y, 14, { isStatic:false, isSensor:true, label, frictionAir:0.1, restitution:0.4 });
    }

    // Monos 3 píxeles hacia atrás (-X) y 6 píxeles hacia arriba (-Y)
    const playerDeckPositions = [
      { x: -53, y: -21 }, // Atrás
      { x: 12,  y: 14 },  // Centro
      { x: 77,  y: -1 }   // Adelante
    ];

    for (let i = 0; i < totalSkulls; i++) {
      const pPos = playerDeckPositions[i % 3];
      const ax = playerStartX + pPos.x + (Math.random()-0.5)*5;
      const ay = playerStartY + pPos.y;
      
      const bA = createSkullBody(ax, ay, 'skull_aliado');
      const hpA = 2 + Math.floor(levelDef.n / 25);
      skullsAliados.push({ body: bA, hp: hpA, maxHp: hpA, angle: 0, dead: false, vx: 0, vy: 0, baseX: ax, baseY: ay });
      Composite.add(world, bA);

      // Como el barco enemigo está en espejo, se recorren hacia atrás (+X) para él automáticamente
      let ex = cxBase - pPos.x + (Math.random()-0.5)*5;
      let ey = yBarcoEnemigo + pPos.y;

      if (isBossLevel) {
        if (levelDef.boss.type === 'KRAKEN') { ex = cxBase-150+(i*65); ey = MAPA_H-180-(i%2===0?60:120); }
        else if (levelDef.boss.type === 'GHOST') { ex = cxBase-80+(i*30); ey = MAPA_H-200-i*40; }
        else if (levelDef.boss.type === 'LEVIATHAN') { ex = cxBase-160+(i*55); ey = MAPA_H-150-Math.sin(i)*90; }
        else if (levelDef.boss.type === 'FORTRESS') { ex = cxBase-40+(i%2===0?-60:40); ey = MAPA_H-160-(i*50); }
      }
      const bE = createSkullBody(ex, ey, 'skull_enemigo');
      const hpE = 2 + Math.floor(levelDef.n / 25);
      skullsEnemigos.push({ body: bE, hp: hpE, maxHp: hpE, angle: 0, dead: false, vx: 0, vy: 0, baseX: ex, baseY: ey });
      Composite.add(world, bE);
    }

    const G = {
      camX:0, camY:0, camTargetX:0, camTargetY:0,
      camZoom:1, camTargetZoom:1, shake:0,
      turno:'jugador', balaEnElAire:false,
      angJ:-Math.PI/5, angC:Math.PI+Math.PI/5,
      mouseDown:false, miraPos:{x:400,y:200},
      fx:[], cuerposPorBorrar:[],
      tiempoDisparoCpu:0, gameOver:false, won:false,
      camState:'idle', lingerTimer:0,
      projTrailPoints:[],
      lightningTimer:60,
      lightning: false,
      t: 0,
      shipPos: { x: playerStartX, y: playerStartY },
      cpuShipPos: { x: cxBase, y: yBarcoEnemigo },
      keys: {},
      isDraggingShip: false,
    };
    gameRef.current = G;

    const pivJ = { x: G.shipPos.x + 130, y: G.shipPos.y - 40 };
    const pivC = { x: G.cpuShipPos.x - 130, y: G.cpuShipPos.y - 40 };

    function addFX(x, y, type, extra={}) { G.fx.push({x,y,type,life:1,...extra}); }

    function countAliveJ() { return skullsAliados.filter(s=>!s.dead).length; }
    function countAliveE() { return skullsEnemigos.filter(s=>!s.dead).length; }

    function dispararJugador() {
      if (G.turno!=='jugador'||G.balaEnElAire||G.gameOver) return;
      const b = Bodies.circle(pivJ.x, pivJ.y, 11, { label:'proyectil_jugador', density:0.05, restitution:0.35, frictionAir:0.005 });
      b.bando='jugador'; Composite.add(world, b);
      const dx=G.miraPos.x-pivJ.x, dy=G.miraPos.y-pivJ.y;
      Body.setVelocity(b, {x:dx*0.062, y:dy*0.062});
      G.shake=10; audio.playSFX('shoot');
      addFX(pivJ.x, pivJ.y, 'flash');
      G.turno='cpu'; G.camState='following'; G.projTrailPoints=[];
      setHudState(s=>({...s,turno:'cpu'}));
    }

    function dispararCompu() {
      if (countAliveJ()<=0||countAliveE()<=0||G.gameOver) return;
      const alive = skullsAliados.filter(s=>!s.dead);
      if (alive.length===0) return;
      const objetivo = alive[Math.floor(Math.random()*alive.length)];
      const targetX=objetivo.body.position.x, targetY=objetivo.body.position.y;
      const distX=pivC.x-targetX;
      let baseVx=-(11.5+distX/86);
      let baseVy=-12.5-(distX/115)+((pivC.y-targetY)*0.04);
      const compensarViento=levelDef.windX*0.3*26;
      baseVx-=compensarViento;
      const mtnBodies=Composite.allBodies(world).filter(b=>b.label.startsWith('mountain_'));
      let maxMtnH=0; mtnBodies.forEach(m=>{if(m.mountainData&&m.mountainData.h>maxMtnH)maxMtnH=m.mountainData.h;});
      if(maxMtnH>0){baseVy-=maxMtnH*0.038;baseVx*=0.92;}
      const acc=levelDef.cpuAccuracy||0.5;
      let scatter=(1-acc)*8;
      if(levelDef.n>=15)scatter*=0.25;
      const b=Bodies.circle(pivC.x,pivC.y,11,{label:'proyectil_compu',density:0.05,frictionAir:0.005});
      b.bando='compu'; Composite.add(world,b);
      Body.setVelocity(b,{x:baseVx+(Math.random()-0.5)*scatter,y:baseVy+(Math.random()-0.5)*scatter});
      G.shake=10; audio.playSFX('shoot');
      addFX(pivC.x,pivC.y,'flash'); G.camState='following'; G.projTrailPoints=[];
    }

    function hitSkull(skullObj, bala, force=1) {
      if (skullObj.dead) return;
      skullObj.hp--;
      audio.playSFX('skull_hit');
      addFX(skullObj.body.position.x, skullObj.body.position.y, 'skull_impact', { color: bala.bando==='jugador'?'#f59e0b':'#ef4444' });

      const vx = bala.velocity?.x || 0;
      const vy = bala.velocity?.y || 0;
      const mag = Math.sqrt(vx*vx+vy*vy)||1;
      Body.setVelocity(skullObj.body, { x: (vx/mag)*12*force, y: (vy/mag)*8*force - 5 });
      Body.setAngularVelocity(skullObj.body, (Math.random()-0.5)*0.4);

      if (skullObj.hp <= 0) {
        skullObj.dead = true;
        audio.playSFX('explode');
        addFX(skullObj.body.position.x, skullObj.body.position.y, 'skull_death');
        Body.setVelocity(skullObj.body, { x: (vx/mag)*20, y: -15 });
        Body.setAngularVelocity(skullObj.body, (Math.random()-0.5)*1.2);
      }
    }

    Events.on(engine, 'collisionStart', ev => {
      ev.pairs.forEach(p => {
        const A=p.bodyA, B=p.bodyB;
        const bala=(A.label.includes('proyectil')||A.label==='clon')?A:((B.label.includes('proyectil')||B.label==='clon')?B:null);
        if (!bala) return;

        if (A.label.startsWith('portal_')||B.label.startsWith('portal_')) {
          const portal=A.label.startsWith('portal_')?A:B;
          if(!bala.yaMultiplicado){
            bala.yaMultiplicado=true;
            const pd=portal.portalData;
            addFX(bala.position.x,bala.position.y,'portal_burst',{color:pd.glowColor});
            for(let i=0;i<pd.mult;i++){
              const clon=Bodies.circle(bala.position.x+(Math.random()-0.5)*14,bala.position.y+(Math.random()-0.5)*14,10,{density:0.08,label:'clon',frictionAir:0.005});
              clon.bando=bala.bando; clon.yaMultiplicado=true;
              Composite.add(world,clon);
              Body.setVelocity(clon,{x:bala.velocity.x+(Math.random()-0.5)*5,y:bala.velocity.y+(Math.random()-0.5)*3});
            }
            if(!G.cuerposPorBorrar.includes(bala))G.cuerposPorBorrar.push(bala);
          }
          return;
        }

        if (A.label.startsWith('mountain_')||B.label.startsWith('mountain_')) {
          const mtn=A.label.startsWith('mountain_')?A:B;
          mtn.hp=(mtn.hp||1)-1;
          audio.playSFX('hit');
          addFX(bala.position.x,bala.position.y,'rock_hit');
          if(mtn.hp<=0){audio.playSFX('explode');addFX(mtn.position.x,mtn.position.y,'mountain_destroy');if(!G.cuerposPorBorrar.includes(mtn))G.cuerposPorBorrar.push(mtn);}
          if(!G.cuerposPorBorrar.includes(bala))G.cuerposPorBorrar.push(bala);
          return;
        }

        if (A.label==='agua'||B.label==='agua') {
          audio.playSFX('splash');
          // CAMBIO: Splash del agua sube 3 píxeles (de MAPA_H-180 a MAPA_H-183)
          addFX(bala.position.x,MAPA_H-183,'splash');
          if(!G.cuerposPorBorrar.includes(bala))G.cuerposPorBorrar.push(bala);
        }

        if (A.label==='skull_aliado'||B.label==='skull_aliado') {
          const skullBody=A.label==='skull_aliado'?A:B;
          if(bala.bando==='compu') {
            const skullObj=skullsAliados.find(s=>s.body===skullBody);
            if(skullObj&&!skullObj.dead){
              hitSkull(skullObj, bala);
              if(!G.cuerposPorBorrar.includes(bala))G.cuerposPorBorrar.push(bala);
              setHudState(s=>({...s, skullsAliados:countAliveJ()}));
              checkGameOver();
            }
          }
        }
        if (A.label==='skull_enemigo'||B.label==='skull_enemigo') {
          const skullBody=A.label==='skull_enemigo'?A:B;
          if(bala.bando==='jugador') {
            const skullObj=skullsEnemigos.find(s=>s.body===skullBody);
            if(skullObj&&!skullObj.dead){
              hitSkull(skullObj, bala);
              if(!G.cuerposPorBorrar.includes(bala))G.cuerposPorBorrar.push(bala);
              setHudState(s=>({...s, skullsEnemigos:countAliveE()}));
              checkGameOver();
            }
          }
        }
      });
    });

    function checkGameOver() {
      if(G.gameOver) return;
      if(countAliveE()<=0){
        G.gameOver=true; G.won=true;
        audio.playSFX('levelup');
        const pct=countAliveJ()/totalSkulls;
        const stars=pct>0.7?3:pct>0.3?2:1;
        setTimeout(()=>onLevelComplete(stars),2800);
        setHudState(s=>({...s,gameOver:true,won:true}));
      } else if(countAliveJ()<=0){
        G.gameOver=true; G.won=false;
        setTimeout(()=>onLevelFail(),2500);
        setHudState(s=>({...s,gameOver:true,won:false}));
      }
    }

    function getWorldPos(e) {
      const rect=canvas.getBoundingClientRect();
      let cx,cy;
      if(e.touches&&e.touches.length>0){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}
      else{cx=e.clientX;cy=e.clientY;}
      const scaleX=CANVAS_W/rect.width, scaleY=CANVAS_H/rect.height;
      const screenX=(cx-rect.left)*scaleX, screenY=(cy-rect.top)*scaleY;
      return {x:screenX/G.camZoom+G.camX, y:screenY/G.camZoom+G.camY};
    }

    function onDown(e) {
      audio.init();
      if(G.turno!=='jugador'||G.balaEnElAire||G.gameOver) return;
      const pos = getWorldPos(e);
      
      const shipHitbox = {
        x: G.shipPos.x - 180,
        y: G.shipPos.y - 120, 
        w: 360,
        h: 260
      };

      if (pos.x >= shipHitbox.x && pos.x <= shipHitbox.x + shipHitbox.w &&
          pos.y >= shipHitbox.y && pos.y <= shipHitbox.y + shipHitbox.h) {
        G.isDraggingShip = true;
      } else {
        G.mouseDown = true;
        G.miraPos = pos;
        G.camState = 'aiming';
      }
    }

    function onMove(e) {
      const pos = getWorldPos(e);

      if (G.isDraggingShip) {
        let newX = Math.max(220, Math.min(pos.x, MAPA_W / 2 - 150));
        let newY = Math.max(MAPA_H - 260, Math.min(pos.y, MAPA_H - 60));
        
        let moveX = newX - G.shipPos.x;
        let moveY = newY - G.shipPos.y;
        
        G.shipPos.x = newX;
        G.shipPos.y = newY;
        
        skullsAliados.forEach(skull => {
          skull.baseX += moveX;
          skull.baseY += moveY;
        });
        
        pivJ.x = G.shipPos.x + 130;
        pivJ.y = G.shipPos.y - 40;
        return;
      }

      if(!G.mouseDown) return;
      G.miraPos = pos;
      const ang = Math.atan2(G.miraPos.y-pivJ.y, G.miraPos.x-pivJ.x);
      G.angJ = Math.max(-Math.PI/2, Math.min(0, ang));
    }

    function onUp() {
      if (G.isDraggingShip) {
        G.isDraggingShip = false;
        return;
      }
      if(G.mouseDown){
        G.mouseDown = false;
        dispararJugador();
      }
    }

    const handleKeyDown = (e) => { G.keys[e.key] = true; };
    const handleKeyUp = (e) => { G.keys[e.key] = false; };

    canvas.addEventListener('mousedown',onDown);
    canvas.addEventListener('mousemove',onMove);
    canvas.addEventListener('mouseup',onUp);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();onDown(e);},{passive:false});
    canvas.addEventListener('touchmove',e=>{e.preventDefault();onMove(e);},{passive:false});
    canvas.addEventListener('touchend',onUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function drawSky(t2) {
      const pal=palette;
      const grad=ctx.createLinearGradient(0,0,0,MAPA_H-140);
      grad.addColorStop(0,pal.top); grad.addColorStop(0.5,pal.mid); grad.addColorStop(1,pal.bot);
      ctx.fillStyle=grad; ctx.fillRect(0,0,MAPA_W,MAPA_H-140);
      if(levelDef.timeOfDay==='storm'||levelDef.boss){
        G.lightningTimer--;
        if(G.lightningTimer<=0){G.lightning=true;G.lightningTimer=100+Math.random()*160;setTimeout(()=>{G.lightning=false;},80);}
        if(G.lightning){
          ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(0,0,MAPA_W,MAPA_H);
          const lx=300+Math.random()*1000;
          ctx.strokeStyle='rgba(210,240,255,0.95)'; ctx.lineWidth=3; ctx.shadowBlur=25; ctx.shadowColor='#22d3ee';
          ctx.beginPath(); ctx.moveTo(lx,0); let cy2=0;
          for(let i=0;i<8;i++){const nx=lx+(Math.random()-0.5)*70;cy2+=35+Math.random()*35;ctx.lineTo(nx,cy2);}
          ctx.stroke(); ctx.shadowBlur=0;
        }
      }
      if(pal.starAlpha>0){
        for(let i=0;i<90;i++){
          const sx=(i*137.5+50)%MAPA_W, sy=(i*97.3+20)%(MAPA_H-220);
          const flicker=0.4+Math.sin(t2*0.002+i)*0.3;
          ctx.globalAlpha=flicker*pal.starAlpha; ctx.fillStyle='#fff';
          ctx.beginPath(); ctx.arc(sx,sy,1+(i%3)*0.5,0,Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha=1;
      }
      if(levelDef.timeOfDay==='day'&&!levelDef.boss){
        const g2=ctx.createRadialGradient(MAPA_W*0.7,70,0,MAPA_W*0.7,70,80);
        g2.addColorStop(0,'rgba(255,255,180,1)'); g2.addColorStop(0.4,'rgba(255,220,80,0.7)'); g2.addColorStop(1,'rgba(255,180,0,0)');
        ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(MAPA_W*0.7,70,80,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff9c4'; ctx.beginPath(); ctx.arc(MAPA_W*0.7,70,28,0,Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle='rgba(240,249,255,0.1)'; ctx.beginPath(); ctx.arc(MAPA_W/2,75,55,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#f0f9ff'; ctx.beginPath(); ctx.arc(MAPA_W/2,75,22,0,Math.PI*2); ctx.fill();
      }
    }

    function drawOcean(t2) {
      // --- CAMBIO: Mar sube 3 píxeles (MAPA_H-200 a MAPA_H-203) ---
      const grad=ctx.createLinearGradient(0,MAPA_H-203,0,MAPA_H);
      grad.addColorStop(0,palette.oceanTop); grad.addColorStop(0.5,'#0b5ab5'); grad.addColorStop(1,'#072447');
      ctx.fillStyle=grad; ctx.fillRect(0,MAPA_H-203,MAPA_W,203);
      const waveAlpha=(levelDef.timeOfDay==='storm'||levelDef.boss)?0.35:0.15;
      ctx.strokeStyle=`rgba(255,255,255,${waveAlpha})`; ctx.lineWidth=1;
      // Olas también suben 3 píxeles
      for(let y=MAPA_H-191;y<MAPA_H;y+=18){
        ctx.beginPath();
        for(let x=0;x<MAPA_W;x+=6){const wAmp=(levelDef.timeOfDay==='storm'||levelDef.boss)?9:4;const w=Math.sin((x+t2*0.15)*0.022+y*0.07)*wAmp;ctx.lineTo(x,y+w);}
        ctx.stroke();
      }
    }

    function drawMountains() {
      Composite.allBodies(world).forEach(b=>{
        if(!b.label.startsWith('mountain_'))return;
        const md=b.mountainData, hpRatio=b.hp/b.maxHp, pos=b.position;
        ctx.save(); ctx.translate(pos.x,pos.y);
        const grad=ctx.createLinearGradient(0,-md.h,0,0);
        const stoneColor=levelDef.timeOfDay==='night'?'#1e293b':levelDef.timeOfDay==='storm'?'#374151':'#6b7280';
        grad.addColorStop(0,'#f8fafc'); grad.addColorStop(0.3,stoneColor); grad.addColorStop(1,'#374151');
        ctx.fillStyle=grad;
        ctx.beginPath(); ctx.moveTo(-md.w/2,0); ctx.lineTo(-md.w/3,-md.h*0.5); ctx.lineTo(0,-md.h); ctx.lineTo(md.w/3,-md.h*0.5); ctx.lineTo(md.w/2,0); ctx.closePath(); ctx.fill();
        if(hpRatio<1){
          ctx.strokeStyle='rgba(255,100,0,0.6)'; ctx.lineWidth=1.5;
          const cracks=Math.floor((1-hpRatio)*5)+1;
          for(let c=0;c<cracks;c++){ctx.beginPath();ctx.moveTo((c-cracks/2)*18,-md.h*0.3);ctx.lineTo((c-cracks/2)*18+10,-md.h*0.6);ctx.stroke();}
          const bw=40;
          ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(-bw/2,-md.h-14,bw,6);
          ctx.fillStyle=hpRatio>0.5?'#22c55e':'#ef4444'; ctx.fillRect(-bw/2,-md.h-14,bw*hpRatio,6);
        }
        ctx.restore();
      });
    }

    function drawPortals(t2) {
      portalBodies.forEach((pb,idx)=>{
        if(!Composite.allBodies(world).includes(pb))return;
        const pd=pb.portalData, px=pb.position.x, py=pb.position.y;
        const pulse=1+Math.sin(t2*0.006+idx)*0.07;
        ctx.save(); ctx.translate(px,py); ctx.scale(pulse,pulse);
        ctx.shadowBlur=20; ctx.shadowColor=pd.glowColor;
        ctx.fillStyle=pd.color+'30'; ctx.strokeStyle=pd.color; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.roundRect(-55,-14,110,28,8); ctx.fill(); ctx.stroke();
        ctx.shadowBlur=0;
        ctx.font='bold 16px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.strokeStyle='#000'; ctx.lineWidth=3; ctx.strokeText(`×${pd.mult}`,0,0);
        ctx.fillStyle=pd.glowColor; ctx.fillText(`×${pd.mult}`,0,0);
        ctx.restore();
      });
    }

    function drawSkullMinions(t2) {
      [...skullsAliados, ...skullsEnemigos].forEach(skull => {
        const pos = skull.body.position;
        
        if (!skull.dead) {
          const bobX = Math.sin(t2 * 0.003 + skull.baseX * 0.01) * 2;
          const bobY = Math.sin(t2 * 0.003 + skull.baseY * 0.01) * 4;
          Body.setPosition(skull.body, { x: skull.baseX + bobX, y: skull.baseY + bobY });
          Body.setVelocity(skull.body, { x: 0, y: 0 });
        } else {
          if (pos.y > MAPA_H + 100 || pos.x < -200 || pos.x > MAPA_W + 200) {
            if (Composite.allBodies(world).includes(skull.body)) {
              Composite.remove(world, skull.body);
            }
            return; 
          }
        }

        const angle = skull.dead ? skull.body.angle : 0;
        drawSkullMinion(
          ctx, pos.x, pos.y, angle,
          skull.body.velocity.x, skull.body.velocity.y,
          skull.hp, skull.maxHp, skullSkin, t2, !skull.dead
        );
      });
    }

    function drawProjectiles(t2) {
      Composite.allBodies(world).forEach(b => {
        if(b.label!=='proyectil_jugador'&&b.label!=='proyectil_compu'&&b.label!=='clon')return;
        ctx.save(); ctx.translate(b.position.x,b.position.y);
        let col;
        if (trailColor === 'rainbow') {
          col = `hsl(${(t2*2)%360},100%,60%)`;
        } else {
          const colors = { orange:'#f59e0b', cyan:'#06b6d4', pink:'#ec4899', green:'#22c55e' };
          col = b.bando==='jugador' ? (colors[trailColor]||'#f59e0b') : '#ef4444';
        }
        ctx.shadowBlur=18; ctx.shadowColor=col;
        ctx.fillStyle=col;
        ctx.beginPath(); ctx.arc(0,0,b.circleRadius,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.arc(-b.circleRadius*0.3,-b.circleRadius*0.3,b.circleRadius*0.38,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });
    }

    function drawTrajectoryGuide() {
      if(!G.mouseDown||G.balaEnElAire||G.isDraggingShip)return;
      const fxv=(G.miraPos.x-pivJ.x)*0.062, fyv=(G.miraPos.y-pivJ.y)*0.062;
      for(let i=1;i<28;i++){
        const tt=i*2.5;
        const px=pivJ.x+fxv*tt+0.5*levelDef.windX*0.3*tt*tt;
        const py=pivJ.y+fyv*tt+0.5*levelDef.gravity*tt*tt;
        const alpha=Math.max(0.05,0.75-i*0.027);
        ctx.globalAlpha=alpha; ctx.fillStyle='#fff';
        ctx.beginPath(); ctx.arc(px,py,Math.max(1,3.5-i*0.1),0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    function drawFX() {
      G.fx.forEach(f => {
        ctx.save(); ctx.globalAlpha=f.life;
        if(f.type==='flash'){
          const r=35*(1.3-f.life);
          const grad=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);
          grad.addColorStop(0,'rgba(255,220,60,0.95)'); grad.addColorStop(0.5,'rgba(255,120,0,0.5)'); grad.addColorStop(1,'rgba(255,60,0,0)');
          ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(f.x,f.y,r,0,Math.PI*2); ctx.fill();
        }
        if(f.type==='splash'){
          ctx.strokeStyle='rgba(150,220,255,0.85)'; ctx.lineWidth=2;
          for(let i=0;i<10;i++){const angle=(i/10)*Math.PI*2+f.life,dist=28*(1-f.life);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(angle)*dist,f.y-Math.abs(Math.sin(angle))*dist*1.8);ctx.stroke();}
        }
        if(f.type==='skull_impact'){
          const col=f.color||'#f59e0b';
          const r=30*(1-f.life);
          ctx.strokeStyle=col; ctx.lineWidth=2;
          ctx.beginPath(); ctx.arc(f.x,f.y,r,0,Math.PI*2); ctx.stroke();
          for(let i=0;i<6;i++){
            const a=(i/6)*Math.PI*2, d=r*0.8;
            ctx.fillStyle=col; ctx.font='12px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText('★', f.x+Math.cos(a)*d, f.y+Math.sin(a)*d);
          }
        }
        if(f.type==='skull_death'){
          const r=55*(1-f.life);
          ctx.strokeStyle='rgba(255,180,50,0.9)'; ctx.lineWidth=3;
          ctx.beginPath(); ctx.arc(f.x,f.y,r,0,Math.PI*2); ctx.stroke();
          for(let i=0;i<10;i++){
            const a=(i/10)*Math.PI*2, d=r*0.7;
            ctx.font=`${12*f.life}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText('💀',f.x+Math.cos(a)*d,f.y+Math.sin(a)*d);
          }
          ctx.fillStyle=`rgba(80,80,80,${f.life*0.5})`;
          ctx.beginPath(); ctx.arc(f.x,f.y-r*0.3,r*0.6,0,Math.PI*2); ctx.fill();
        }
        if(f.type==='rock_hit'){
          ctx.fillStyle='rgba(160,130,100,0.8)';
          for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+f.life*2,d=18*(1-f.life);ctx.beginPath();ctx.arc(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,4,0,Math.PI*2);ctx.fill();}
        }
        if(f.type==='mountain_destroy'){
          for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2,d=60*(1-f.life),sz=8*f.life;ctx.fillStyle=`rgba(120,100,80,${f.life*0.8})`;ctx.fillRect(f.x+Math.cos(a)*d-sz/2,f.y+Math.sin(a)*d-sz/2,sz,sz);}
          ctx.strokeStyle=`rgba(255,120,0,${f.life})`; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(f.x,f.y,50*(1-f.life),0,Math.PI*2); ctx.stroke();
        }
        if(f.type==='portal_burst'){
          const col=f.color||'#38bdf8';
          for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2+f.life,d=35*(1-f.life);ctx.fillStyle=col+Math.floor(f.life*255).toString(16).padStart(2,'0');ctx.beginPath();ctx.arc(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,4,0,Math.PI*2);ctx.fill();}
        }
        ctx.restore();
      });
    }

    function drawGameOver() {
      if(!G.gameOver)return;
      ctx.fillStyle=G.won?'rgba(0,20,0,0.7)':'rgba(20,0,0,0.7)';
      ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='bold 54px Georgia, serif';
      ctx.fillStyle=G.won?'#fbbf24':'#f87171';
      ctx.shadowBlur=30; ctx.shadowColor=G.won?'#f59e0b':'#ef4444';
      let msg=G.won?(levelDef.boss?'🏆 ¡JEFE DERROTADO!':'⚓ ¡VICTORIA!'):(levelDef.boss?'☠️ CAÍSTE ANTE EL JEFE':'☠️ ¡HUNDIDO!');
      ctx.fillText(msg,CANVAS_W/2,CANVAS_H/2-30);
      ctx.shadowBlur=0;
      if(G.won){
        const alive=countAliveJ(), pct=alive/totalSkulls;
        const stars=pct>0.7?3:pct>0.3?2:1;
        ctx.font='36px Arial';
        ctx.fillStyle='#fbbf24';
        ctx.fillText('★'.repeat(stars)+'☆'.repeat(3-stars),CANVAS_W/2,CANVAS_H/2+20);
      }
      ctx.font='15px Arial'; ctx.fillStyle='rgba(255,255,255,0.45)';
      ctx.fillText('Continuando...',CANVAS_W/2,CANVAS_H/2+70);
    }

    function drawWindIndicator() {
      if(Math.abs(levelDef.windX)<0.1)return;
      const wx=CANVAS_W-90, wy=18;
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(wx-5,wy-14,85,28,6); ctx.fill();
      ctx.fillStyle='#94a3b8'; ctx.font='11px Arial'; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText('VIENTO',wx,wy-5);
      ctx.fillStyle=levelDef.windX>0?'#f59e0b':'#38bdf8';
      ctx.fillText(levelDef.windX>0?'→→':' ←←',wx,wy+7);
      ctx.restore();
    }

    function updateCamera() {
      const bodies=Composite.allBodies(world);
      const projs=bodies.filter(b=>b.label==='proyectil_jugador'||b.label==='proyectil_compu'||b.label==='clon');
      G.balaEnElAire=projs.length>0;
      switch(G.camState){
        case 'idle': G.camTargetX=G.turno==='jugador'?0:MAPA_W-CANVAS_W; G.camTargetY=0; G.camTargetZoom=1; break;
        case 'aiming': G.camTargetX=Math.max(0,pivJ.x-220); G.camTargetY=0; G.camTargetZoom=0.92; break;
        case 'following': {
          if(projs.length>0){
            let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
            projs.forEach(p=>{minX=Math.min(minX,p.position.x);maxX=Math.max(maxX,p.position.x);minY=Math.min(minY,p.position.y);maxY=Math.max(maxY,p.position.y);});
            const cX=(minX+maxX)/2, cY=(minY+maxY)/2;
            const spread=Math.max(maxX-minX,maxY-minY);
            const zoom=spread>200?Math.max(0.5,1-spread/1100):0.72;
            G.camTargetZoom=zoom;
            const vW=CANVAS_W/zoom, vH=CANVAS_H/zoom;
            G.camTargetX=cX-vW/2; G.camTargetY=cY-vH/2;
            G.camTargetY=Math.max(-120,Math.min(G.camTargetY,MAPA_H-vH+60));
            if(G.projTrailPoints.length<400)projs.forEach(p=>G.projTrailPoints.push({x:p.position.x,y:p.position.y,age:1}));
          } else { G.camState='linger'; G.lingerTimer=80; }
          break;
        }
        case 'linger': G.lingerTimer--; if(G.lingerTimer<=0){G.camState='returning';if(G.turno==='cpu'&&!G.gameOver)G.tiempoDisparoCpu=performance.now()+1200;} break;
        case 'returning':
          G.camTargetX=G.turno==='jugador'?0:MAPA_W-CANVAS_W; G.camTargetY=0; G.camTargetZoom=1; G.projTrailPoints=[];
          if(Math.abs(G.camX-G.camTargetX)<5&&Math.abs(G.camZoom-1)<0.02)G.camState='idle';
          break;
      }
      const vW2=CANVAS_W/G.camZoom;
      G.camTargetX=Math.max(0,Math.min(G.camTargetX,MAPA_W-vW2));
      const ls=G.camState==='following'?0.09:0.045;
      G.camX+=(G.camTargetX-G.camX)*ls;
      G.camY+=(G.camTargetY-G.camY)*ls;
      G.camZoom+=(G.camTargetZoom-G.camZoom)*0.07;
      G.shake*=0.84;
    }

    function physicsUpdate(t2) {
      if (G.turno === 'jugador' && !G.gameOver && !G.isDraggingShip) {
        let dx = 0, dy = 0;
        const speed = 7;
        if (G.keys['ArrowLeft'] || G.keys['a'] || G.keys['A']) dx -= speed;
        if (G.keys['ArrowRight'] || G.keys['d'] || G.keys['D']) dx += speed;
        if (G.keys['ArrowUp'] || G.keys['w'] || G.keys['W']) dy -= speed;
        if (G.keys['ArrowDown'] || G.keys['s'] || G.keys['S']) dy += speed;

        if (dx !== 0 || dy !== 0) {
          let newX = Math.max(220, Math.min(G.shipPos.x + dx, MAPA_W / 2 - 150));
          let newY = Math.max(MAPA_H - 260, Math.min(G.shipPos.y + dy, MAPA_H - 60));
          
          let moveX = newX - G.shipPos.x;
          let moveY = newY - G.shipPos.y;
          
          G.shipPos.x = newX;
          G.shipPos.y = newY;
          
          skullsAliados.forEach(skull => {
            skull.baseX += moveX;
            skull.baseY += moveY;
          });
          
          pivJ.x = G.shipPos.x + 130;
          pivJ.y = G.shipPos.y - 40;
        }
      }

      if (!G.gameOver) {
        let targetX = (MAPA_W - 250) + Math.sin(t2 * 0.0004) * 250; 
        let targetY = (MAPA_H - 180) + Math.cos(t2 * 0.0006) * 80;   

        targetX = Math.max(MAPA_W / 2 + 150, Math.min(targetX, MAPA_W - 220));
        targetY = Math.max(MAPA_H - 260, Math.min(targetY, MAPA_H - 60));

        let moveX = targetX - G.cpuShipPos.x;
        let moveY = targetY - G.cpuShipPos.y;

        G.cpuShipPos.x += moveX * 0.02;
        G.cpuShipPos.y += moveY * 0.02;

        skullsEnemigos.forEach(skull => {
          skull.baseX += moveX * 0.02;
          skull.baseY += moveY * 0.02;
        });

        pivC.x = G.cpuShipPos.x - 130;
        pivC.y = G.cpuShipPos.y - 40;
      }

      G.cuerposPorBorrar.forEach(c=>{if(Composite.allBodies(world).includes(c))Composite.remove(world,c);});
      G.cuerposPorBorrar=[];
      portalBodies.forEach((pb,idx)=>{
        if(!Composite.allBodies(world).includes(pb))return;
        const pd=pb.portalData, freq=Math.abs(pd.speed)*0.0007;
        const angle2=t2*freq+(idx*3.5);
        Body.setPosition(pb,{x:MAPA_W/2+pd.range*Math.sin(angle2),y:pd.y+75*Math.sin(2*angle2)});
      });
      if(G.turno==='cpu') G.angC=Math.PI+Math.PI/5+Math.sin(t2*0.003)*0.08;
      if(G.turno==='cpu'&&!G.balaEnElAire&&G.camState==='returning'&&!G.gameOver){
        if(G.tiempoDisparoCpu>0&&performance.now()>G.tiempoDisparoCpu){
          dispararCompu(); G.turno='jugador'; G.tiempoDisparoCpu=0;
          setHudState(s=>({...s,turno:'jugador'}));
        }
      }
      Composite.allBodies(world).forEach(c=>{
        if(c.label==='proyectil_jugador'||c.label==='proyectil_compu'||c.label==='clon'){
          if(c.position.y>MAPA_H+60||c.position.x<-150||c.position.x>MAPA_W+150||c.position.y<-1500){
            if(!G.cuerposPorBorrar.includes(c)){G.cuerposPorBorrar.push(c);addFX(c.position.x,MAPA_H-183,'splash');}
          }
        }
      });
      G.fx=G.fx.filter(f=>{f.life-=0.022;return f.life>0;});
      G.projTrailPoints.forEach(p=>p.age-=0.007);
      G.projTrailPoints=G.projTrailPoints.filter(p=>p.age>0);
    }

    let lastTime=0;
    function gameLoop(timestamp) {
      const dt=Math.min(timestamp-lastTime,33);
      lastTime=timestamp;
      G.t=timestamp;
      Engine.update(engine,dt);
      physicsUpdate(timestamp);
      updateCamera();
      ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
      ctx.save();
      const sx=(Math.random()-0.5)*G.shake, sy=(Math.random()-0.5)*G.shake;
      ctx.translate(sx,sy);
      ctx.scale(G.camZoom,G.camZoom);
      ctx.translate(-G.camX,-G.camY);

      drawSky(timestamp);
      drawOcean(timestamp);
      drawMountains();

      if(G.projTrailPoints.length>1){
        ctx.strokeStyle='rgba(255,200,100,0.25)'; ctx.lineWidth=2; ctx.beginPath();
        G.projTrailPoints.forEach((pt,i)=>{ctx.globalAlpha=pt.age*0.3;if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);});
        ctx.stroke(); ctx.globalAlpha=1;
      }

      drawShip(ctx, G.shipPos.x, G.shipPos.y, false, shipSkin, timestamp, imgPlayerRef.current, imgEnemyRef.current);
      
      if(levelDef.boss){
        drawBoss(ctx, G.cpuShipPos.x, G.cpuShipPos.y, levelDef.boss.type, timestamp);
        ctx.save(); ctx.font='bold 22px Georgia,serif'; ctx.fillStyle='#ef4444';
        ctx.textAlign='center'; ctx.shadowBlur=10; ctx.shadowColor='#000';
        ctx.fillText(levelDef.boss.name, G.cpuShipPos.x, G.cpuShipPos.y-185); ctx.restore();
      } else {
        drawShip(ctx, G.cpuShipPos.x, G.cpuShipPos.y, true, shipSkin, timestamp, imgPlayerRef.current, imgEnemyRef.current);
      }

      const bob1=Math.sin(timestamp*0.003+G.shipPos.x*0.01)*4;
      const bob2=Math.sin(timestamp*0.003+G.cpuShipPos.x*0.01)*4;
      drawCannon(ctx, pivJ.x, pivJ.y+bob1, G.angJ, cannonSkin);
      if(!levelDef.boss||levelDef.boss.type!=='FORTRESS')
        drawCannon(ctx, pivC.x, pivC.y+bob2, G.angC, 'iron');

      drawPortals(timestamp);
      drawSkullMinions(timestamp);
      drawTrajectoryGuide();
      drawProjectiles(timestamp);
      drawFX();

      ctx.restore();
      drawWindIndicator();
      drawGameOver();
      rafRef.current=requestAnimationFrame(gameLoop);
    }

    rafRef.current=requestAnimationFrame(gameLoop);

    return () => {
      audio.stopMusic();
      cancelAnimationFrame(rafRef.current);
      Engine.clear(engine);
      canvas.removeEventListener('mousedown',onDown);
      canvas.removeEventListener('mousemove',onMove);
      canvas.removeEventListener('mouseup',onUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [levelDef.n]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] mx-auto">
      <GameHUD {...hudState} />
      <canvas ref={canvasRef} className="w-full rounded-2xl"
        style={{ touchAction:'none', aspectRatio:`${CANVAS_W}/${CANVAS_H}` }} />
    </div>
  );
}