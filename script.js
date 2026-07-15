// Leo Minutes 360 Login Portal
// 3D Card Tilt + White Fire + White Falling Comets

function initializeApp() {
  if (window.lucide) lucide.createIcons();

  // ==========================================
  // 1. 3D CARD TILT & SPECULAR SHIMMER
  // ==========================================
  const card = document.querySelector('.login-content');
  const cardShimmer = document.createElement('div');
  cardShimmer.className = 'card-shimmer';
  card.appendChild(cardShimmer);

  let bounds;
  let targetRotateX = 0, targetRotateY = 0;
  let currentRotateX = 0, currentRotateY = 0;
  let isHovering = false;

  card.addEventListener('mouseenter', () => {
    isHovering = true;
    bounds = card.getBoundingClientRect();
  });
  card.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
    cardShimmer.style.opacity = 0;
  });
  card.addEventListener('mousemove', (e) => {
    const relX = e.clientX - bounds.left;
    const relY = e.clientY - bounds.top;
    const cx = bounds.width / 2, cy = bounds.height / 2;
    targetRotateX = ((relY - cy) / cy) * -10;
    targetRotateY = ((relX - cx) / cx) * 10;
    const angle = Math.atan2(relY - cy, relX - cx) * (180 / Math.PI) - 90;
    const intensity = Math.max(0, 1 - (Math.abs(relX - cx) + Math.abs(relY - cy)) / (cx + cy));
    cardShimmer.style.opacity = 0.4 + intensity * 0.5;
    cardShimmer.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 100%)`;
  });

  (function springLoop() {
    const factor = isHovering ? 0.15 : 0.1;
    currentRotateX += (targetRotateX - currentRotateX) * factor;
    currentRotateY += (targetRotateY - currentRotateY) * factor;
    card.style.transform = `perspective(1200px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translateZ(0)`;
    requestAnimationFrame(springLoop);
  })();

  // ==========================================
  // 2. WHITE FIRE + FALLING COMETS
  // ==========================================
  initParticles();
}

function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animFrame;

  // Wind state (mouse-driven)
  let targetWind = 0, wind = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    seed();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    targetWind = ((e.clientX / W) - 0.5) * 2.2;
  });
  window.addEventListener('mouseleave', () => { targetWind = 0; });

  const rand  = (a, b) => Math.random() * (b - a) + a;
  const randI = (a, b) => Math.floor(rand(a, b));

  // ---- Ember (rising spark) ----
  class Ember {
    constructor(init) { this.reset(init); }
    reset(init = false) {
      this.baseX = rand(0, W);
      this.x     = this.baseX;
      this.y     = init ? rand(H * 0.25, H) : rand(H - 30, H + 10);
      this.size  = rand(1.0, 3.0);
      this.vy    = rand(-1.0, -3.5);
      this.life  = 0;
      this.maxLife = randI(130, 300);
      this.phase = rand(0, Math.PI * 2);
      this.freq  = rand(0.01, 0.038);
    }
    update() {
      this.life++;
      this.y += this.vy;
      this.phase += this.freq;
      const sway = Math.sin(this.phase) * 10;
      const push = wind * (H - this.y) * 0.4;
      this.x = this.baseX + sway + push;
      if (this.life >= this.maxLife || this.y < -10 || this.x < -10 || this.x > W + 10) this.reset();
    }
    draw() {
      const p = this.life / this.maxLife;
      // White-hot core → silver → near-transparent grey
      const light = p < 0.3 ? 98 : (p < 0.7 ? 85 : 65);
      const alpha = (1 - p) * (p < 0.1 ? p * 10 : 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (1 - p * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(0, 0%, ${light}%, ${alpha})`;
      ctx.fill();
    }
  }

  // ---- FlameBody (large radial glow) ----
  class FlameBody {
    constructor(init) { this.reset(init); }
    reset(init = false) {
      this.baseX   = rand(0, W);
      this.x       = this.baseX;
      this.y       = init ? rand(H * 0.55, H) : rand(H - 50, H + 20);
      this.r       = rand(35, 110);
      this.vy      = rand(-0.8, -2.8);
      this.life    = 0;
      this.maxLife = randI(70, 170);
      this.alpha   = rand(0.28, 0.55);
      this.phase   = rand(0, Math.PI * 2);
      this.freq    = rand(0.01, 0.025);
    }
    update() {
      this.life++;
      this.y += this.vy;
      this.phase += this.freq;
      const sway = Math.sin(this.phase) * 20;
      const push = wind * (H - this.y) * 0.5;
      this.x = this.baseX + sway + push;
      const p = this.life / this.maxLife;
      this.curR = this.r * (1 - p * 0.82);
      this.curA = this.alpha * Math.pow(1 - p, 1.4);
      if (this.life >= this.maxLife || this.y < H - H * 0.65 || this.x < -this.r || this.x > W + this.r) this.reset();
    }
    draw() {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.curR);
      g.addColorStop(0,    `rgba(255, 255, 255, ${this.curA * 0.75})`);
      g.addColorStop(0.25, `rgba(230, 232, 235, ${this.curA * 0.40})`);
      g.addColorStop(0.6,  `rgba(180, 182, 188, ${this.curA * 0.15})`);
      g.addColorStop(1,    `rgba(20,  20,  25,  0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.curR, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  // ---- Comet (falling streak from top) ----
  class Comet {
    constructor(init) { this.reset(init); }
    reset(init = false) {
      this.x    = rand(0, W);
      this.y    = init ? rand(-200, 0) : rand(-80, -10);
      this.len  = rand(60, 160);
      this.spd  = rand(6, 18);
      this.ang  = rand(Math.PI * 0.35, Math.PI * 0.65); // mostly downward
      this.vx   = Math.cos(this.ang) * this.spd * rand(-0.3, 0.3);
      this.vy   = Math.sin(this.ang) * this.spd;
      this.size = rand(0.8, 2.0);
      this.life = 0;
      this.maxLife = randI(50, 130);
      this.alpha = rand(0.55, 0.95);
    }
    update() {
      this.life++;
      this.x += this.vx;
      this.y += this.vy;
      if (this.life >= this.maxLife || this.y > H + 50 || this.x < -50 || this.x > W + 50) this.reset();
    }
    draw() {
      const p = this.life / this.maxLife;
      const a = this.alpha * (1 - p);
      // tail: from transparent → bright white tip
      const tailX = this.x - Math.cos(this.ang) * this.len;
      const tailY = this.y - Math.sin(this.ang) * this.len;
      const g = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      g.addColorStop(0, `rgba(255, 255, 255, 0)`);
      g.addColorStop(0.6, `rgba(220, 230, 240, ${a * 0.35})`);
      g.addColorStop(1,   `rgba(255, 255, 255, ${a})`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = g;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();
      // bright tip glow
      const tipG = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
      tipG.addColorStop(0, `rgba(255, 255, 255, ${a * 0.9})`);
      tipG.addColorStop(1, `rgba(255, 255, 255, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = tipG;
      ctx.fill();
    }
  }

  let embers = [], flames = [], comets = [];

  function seed() {
    embers = Array.from({ length: 130 }, (_, i) => new Ember(i < 130));
    flames = Array.from({ length: 55  }, (_, i) => new FlameBody(i < 55));
    comets = Array.from({ length: 12  }, (_, i) => new Comet(i < 12));
  }

  // Dark charcoal-midnight background — white particles pop against it
  function drawBg() {
    const g = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, Math.max(W, H));
    g.addColorStop(0, '#0d0f14');
    g.addColorStop(1, '#060709');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Flickering white ground glow at base of fire
  function drawGroundGlow() {
    const flicker = Math.sin(Date.now() * 0.006) * 0.06 + Math.cos(Date.now() * 0.013) * 0.04 + 0.94;
    const glowH = H * 0.20 * flicker;
    const g = ctx.createLinearGradient(0, H, 0, H - glowH);
    g.addColorStop(0,   `rgba(255, 255, 255, ${0.10 * flicker})`);
    g.addColorStop(0.4, `rgba(200, 205, 215, ${0.04 * flicker})`);
    g.addColorStop(1,   `rgba(0, 0, 0, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, H - glowH, W, glowH);
  }

  function render() {
    wind += (targetWind - wind) * 0.065;
    drawBg();

    // Comets fall behind fire (drawn first)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    comets.forEach(c => { c.update(); c.draw(); });
    ctx.restore();

    // White fire (lighter blending for additive brightness)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    flames.forEach(f => { f.update(); f.draw(); });
    embers.forEach(e => { e.update(); e.draw(); });
    ctx.restore();

    drawGroundGlow();
    animFrame = requestAnimationFrame(render);
  }

  resize(); // also calls seed()
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
