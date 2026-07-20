const { Engine, Runner, Bodies, Body, World } = Matter;
import hu from "./translations/hu.js";
import en from "./translations/en.js";

const translations = { hu, en };

const section = document.getElementById('physics-section');

const MOBILE_BREAKPOINT = 900;

let W = 0;
let H = 0;

export const blockDefs = [];

if (section) {
  W = section.offsetWidth;
  H = section.offsetHeight;

  blockDefs.push(
    { cls:'block-uxui',     key:'uxui',      rot:0,     x:W*0.15, y:H*0.35, vertical:false },
    { cls:'block-arculat',  key:'branding',  rot:0,     x:W*0.30, y:H*0.25, vertical:false },
    { cls:'block-web',      key:'webdev',    rot:-0.1,  x:W*0.50, y:H*0.35, vertical:false },
    { cls:'block-logo',     key:'logo',      rot:0,     x:W*0.65, y:H*0.20, vertical:false },
    { cls:'block-drotviaz', key:'wireframe', rot:0.35,  x:W*0.80, y:H*0.25, vertical:true  },
  );

  // Mobil nézetben (900px alatt) nem fut fizika, csak stackelt layout
  let isMobileMode = window.innerWidth < MOBILE_BREAKPOINT;

  let engine, world, runner, floor, wallL, wallR, ceiling;

  if (!isMobileMode) {
    engine = Engine.create({
      gravity: { x: 0, y: 1.2 },
      positionIterations: 20,
      velocityIterations: 16,
      constraintIterations: 4
    });
    world = engine.world;
    runner = Runner.create();
    Runner.run(runner, engine);

    const wOpt = { isStatic: true, restitution: 0.3, friction: 0.5 };
    floor   = Bodies.rectangle(W/2,  H+25,  W*4, 50,  wOpt);
    wallL   = Bodies.rectangle(-25,  H/2,   50,  H*4, wOpt);
    wallR   = Bodies.rectangle(W+25, H/2,   50,  H*4, wOpt);
    ceiling = Bodies.rectangle(W/2,  -25,   W*4, 50,  wOpt);
    World.add(world, [floor, wallL, wallR, ceiling]);
  }

  const blocks = [];

  const measureContainer = document.createElement('div');
  measureContainer.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;container-type:inline-size;width:' + W + 'px';
  document.body.appendChild(measureContainer);

  const currentLang = localStorage.getItem("lang") || "hu";

  blockDefs.forEach((def) => {
    const el = document.createElement('div');
    el.className = `block ${def.cls}`;
    if (def.vertical) el.style.writingMode = 'vertical-rl';
    el.textContent = translations[currentLang][def.key];
    measureContainer.appendChild(el);
    def._el = el;
  });

  // Egyszerű, egymás alá stackelt elrendezés mobil nézethez (fizika nélkül)
  function layoutMobileStack() {
    section.style.position = 'relative';
    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.alignItems = 'center';
    section.style.justifyContent = 'flex-start';
    section.style.gap = '14px';

    blockDefs.forEach((def) => {
      const el = def._el;
      section.appendChild(el);
      el.style.position = 'static';
      el.style.left = 'auto';
      el.style.top = 'auto';
      el.style.maxWidth = '90vw';
      el.style.transform = def.vertical ? 'rotate(180deg)' : 'none';
      el.style.zIndex = '';
    });
  }

  async function initPhysics() {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));

    W = section.offsetWidth;
    H = section.offsetHeight;

    if (isMobileMode) {
      document.body.removeChild(measureContainer);
      layoutMobileStack();
      return;
    }

    blockDefs.forEach((def, i) => {
      const rect = def._el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      section.appendChild(def._el);
      def._el.style.left = `${def.x - w/2}px`;
      def._el.style.top  = `${def.y - h/2}px`;

      const body = Bodies.rectangle(def.x, def.y, w, h, {
        restitution: 0.05,
        friction: 0.8,
        frictionAir: 0.055,
        frictionStatic: 1.2,
        density: 0.035,
        slop: 0.01,
        angle: def.rot,
        label: `block_${i}`
      });

      Body.setAngularVelocity(body, (Math.random()-0.5)*0.15);
      World.add(world, body);

      blocks.push({ body, el: def._el, w, h, isDrotviaz: def.vertical });
    });

    document.body.removeChild(measureContainer);
    startPhysics();
  }

  let zeroGravity = false;
  let zeroGravityTimer = null;
  let clickTracker = { block: null, count: 0, lastTime: 0 };
  let drag = null;

  function getPos(e) {
    const r = section.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function localToWorld(angle, cx, cy, lx, ly) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return { x: cx + c*lx - s*ly, y: cy + s*lx + c*ly };
  }

  function worldToLocal(angle, cx, cy, wx, wy) {
    const c = Math.cos(-angle), s = Math.sin(-angle);
    const dx = wx - cx, dy = wy - cy;
    return { x: c*dx - s*dy, y: s*dx + c*dy };
  }

  function hitTest(mx, my) {
    for (let i = blocks.length-1; i >= 0; i--) {
      const b = blocks[i];
      const loc = worldToLocal(b.body.angle, b.body.position.x, b.body.position.y, mx, my);
      if (Math.abs(loc.x) <= b.w/2 && Math.abs(loc.y) <= b.h/2) return b;
    }
    return null;
  }

  function onDown(e) {
    if (isMobileMode || window.innerWidth < 1000) return;
    const pos = getPos(e);
    const hit = hitTest(pos.x, pos.y);
    if (!hit) return;
    e.preventDefault();

    registerClick(hit);

    const body = hit.body;
    const grabLocal = worldToLocal(body.angle, body.position.x, body.position.y, pos.x, pos.y);

    hit._origFrictionAir = body.frictionAir;
    Body.set(body, 'frictionAir', 0.95);

    drag = {
      block: hit,
      grabLocal,
      angle: body.angle,
      angVel: 0,
      mouse: pos,
      prevMouse: pos,
      history: [{ pos, t: performance.now() }]
    };

    hit.el.style.zIndex = 20;
  }

  function onMove(e) {
    if (!drag) return;
    e.preventDefault();

    const pos = getPos(e);
    const { block, grabLocal } = drag;
    const body = block.body;

    const mdx = pos.x - drag.mouse.x;
    const mdy = pos.y - drag.mouse.y;

    const grabW = localToWorld(drag.angle, body.position.x, body.position.y, grabLocal.x, grabLocal.y);
    const rx = grabW.x - body.position.x;
    const ry = grabW.y - body.position.y;
    const rLen = Math.sqrt(rx*rx + ry*ry) || 1;

    const tang = (mdx * (-ry) + mdy * rx) / (rLen * rLen);

    const halfDiag = Math.sqrt((block.w/2)**2 + (block.h/2)**2);
    const edgeFactor = Math.min(rLen / (halfDiag * 0.5), 1);
    const edgeWeight = edgeFactor * edgeFactor;

    const TORQUE_SCALE = 5.0;
    drag.angVel += tang * TORQUE_SCALE * edgeWeight;
    drag.angVel *= 0.75;
    drag.angVel = Math.max(-10, Math.min(10, drag.angVel));
    drag.angle += drag.angVel * 0.016;

    const c = Math.cos(drag.angle), s = Math.sin(drag.angle);
    const targetCx = pos.x - (c * grabLocal.x - s * grabLocal.y);
    const targetCy = pos.y - (s * grabLocal.x + c * grabLocal.y);

    const MAX_STEP = 12;
    const stepX = targetCx - body.position.x;
    const stepY = targetCy - body.position.y;
    const stepLen = Math.sqrt(stepX*stepX + stepY*stepY);
    const sc = stepLen > MAX_STEP ? MAX_STEP / stepLen : 1;
    const newCx = body.position.x + stepX * sc;
    const newCy = body.position.y + stepY * sc;

    Body.setPosition(body, { x: newCx, y: newCy });
    Body.setAngle(body, drag.angle);
    Body.setVelocity(body, { x: stepX * sc * 0.3, y: stepY * sc * 0.3 });

    drag.prevMouse = drag.mouse;
    drag.mouse = pos;

    const now = performance.now();
    drag.history.push({ pos, t: now });
    if (drag.history.length > 6) drag.history.shift();
  }

  function onUp() {
    if (!drag) return;
    const body = drag.block.body;
    Body.set(body, 'frictionAir', drag.block._origFrictionAir || 0.055);
    Body.setVelocity(body, { x: 0, y: 0 });
    Body.setAngularVelocity(body, 0);
    drag.block.el.style.zIndex = 5;
    drag = null;
  }

  if (!isMobileMode) {
    section.addEventListener('mousedown',  onDown, { passive: false });
    section.addEventListener('mousemove',  onMove, { passive: false });
    window.addEventListener ('mouseup',    onUp);
    section.addEventListener('touchstart', onDown, { passive: false });
    section.addEventListener('touchmove',  onMove, { passive: false });
    window.addEventListener ('touchend',   onUp);
  }

  let floatTime = 0;

  function captureRestPositions() {
    blocks.forEach(b => {
      b.restX = b.body.position.x;
      b.restY = b.body.position.y;
      b.restAngle = b.body.angle;
      b.floatPhase = Math.random() * Math.PI * 2;
    });
  }

  function sync() {
    blocks.forEach(({ body, el, w, h, isDrotviaz, restX, restY, restAngle, floatPhase }) => {
      let x = body.position.x;
      let y = body.position.y;
      let a = body.angle;

      if (zeroGravity && restX !== undefined) {
        const t = floatTime;
        const px = floatPhase || 0;
        const ox = Math.sin(t * 0.6 + px) * 18 + Math.sin(t * 0.37 + px * 1.3) * 8;
        const oy = Math.sin(t * 0.5 + px * 1.7) * 22 + Math.sin(t * 0.29 + px * 0.8) * 10;
        const oa = Math.sin(t * 0.4 + px * 2.1) * 0.06;
        x = restX + ox;
        y = restY + oy;
        a = restAngle + oa;
        Body.setPosition(body, { x, y });
        Body.setAngle(body, a);
        Body.setVelocity(body, { x: 0, y: 0 });
      }

      el.style.left = `${x - w/2}px`;
      el.style.top  = `${y - h/2}px`;
      el.style.transform = isDrotviaz
        ? `rotate(${a}rad) rotate(180deg)`
        : `rotate(${a}rad)`;
    });
    floatTime += 0.016;
    requestAnimationFrame(sync);
  }

  function triggerZeroGravity() {
    zeroGravity = true;
    engine.gravity.y = 0;

    const hint = section.querySelector('.hint-text');
    const origHint = hint.textContent;
    hint.textContent = '🚀 ZERO GRAVITY!';
    hint.style.color = '#FF495C';

    blocks.forEach(({ body }) => {
      Body.setVelocity(body, {
        x: (Math.random()-0.5) * 4,
        y: -(Math.random() * 5 + 3)
      });
      Body.setAngularVelocity(body, (Math.random()-0.5) * 2);
    });

    setTimeout(captureRestPositions, 800);

    clearTimeout(zeroGravityTimer);
    zeroGravityTimer = setTimeout(() => {
      zeroGravity = false;
      engine.gravity.y = 1.2;
      hint.textContent = origHint;
      hint.style.color = '';
    }, 4000);
  }

  function registerClick(hit) {
    if (!hit) return;
    const now = performance.now();
    if (clickTracker.block === hit && now - (clickTracker.lastTime||0) < 500) {
      clickTracker.count++;
    } else {
      clickTracker.block = hit;
      clickTracker.count = 1;
    }
    clickTracker.lastTime = now;
    if (clickTracker.count >= 3) {
      clickTracker.count = 0;
      triggerZeroGravity();
    }
  }

  window.addEventListener('resize', () => {
    const nowMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (nowMobile !== isMobileMode) {
      // Áttörtük a mobil/desktop töréspontot - tiszta állapotból induljunk újra
      location.reload();
      return;
    }
    if (isMobileMode) return;

    W = section.offsetWidth;
    H = section.offsetHeight;
    Body.setPosition(floor,   { x: W/2,  y: H+25 });
    Body.setPosition(wallR,   { x: W+25, y: H/2  });
    Body.setPosition(ceiling, { x: W/2,  y: -25  });
  });

  function startPhysics() {
    sync();
  }

  initPhysics();
}