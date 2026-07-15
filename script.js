// Leo Minutes 360 Login Portal
// Interactive 3D Card Tilt + Specular Shimmer + Autonomous Green Fire Particle Physics (from Leo LMS)

function initializeApp() {
  // Lucide initialization
  if (window.lucide) {
    lucide.createIcons();
  }

  // ==========================================
  // 1. 3D CARD TILT & SPECULAR SHIMMER
  // ==========================================
  const card = document.querySelector('.login-content');
  const cardShimmer = document.createElement('div');
  cardShimmer.className = 'card-shimmer';
  card.appendChild(cardShimmer);

  let bounds;
  let rafId;
  let mouseX = 0;
  let mouseY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let isHovering = false;

  function onMouseEnter() {
    isHovering = true;
    bounds = card.getBoundingClientRect();
  }

  function onMouseLeave() {
    isHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
    cardShimmer.style.opacity = 0;
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const relX = mouseX - bounds.left;
    const relY = mouseY - bounds.top;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    targetRotateX = ((relY - centerY) / centerY) * -12; // 12 deg tilt
    targetRotateY = ((relX - centerX) / centerX) * 12;

    const angle = Math.atan2(relY - centerY, relX - centerX) * (180 / Math.PI) - 90;
    const intensity = Math.max(0, 1 - (Math.abs(relX - centerX) + Math.abs(relY - centerY)) / (centerX + centerY));
    
    cardShimmer.style.opacity = 0.5 + intensity * 0.5;
    cardShimmer.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)`;
  }

  function springLoop() {
    if (isHovering) {
      currentRotateX += (targetRotateX - currentRotateX) * 0.15;
      currentRotateY += (targetRotateY - currentRotateY) * 0.15;
    } else {
      currentRotateX += (targetRotateX - currentRotateX) * 0.1;
      currentRotateY += (targetRotateY - currentRotateY) * 0.1;
    }

    card.style.transform = `perspective(1200px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translateZ(0)`;
    rafId = requestAnimationFrame(springLoop);
  }

  card.addEventListener('mouseenter', onMouseEnter);
  card.addEventListener('mouseleave', onMouseLeave);
  card.addEventListener('mousemove', onMouseMove);
  
  springLoop();

  // ==========================================
  // 2. GREEN OCEAN FIRE BACKDROP (from Leo LMS)
  // ==========================================
  initParticles();
}

function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animFrame;

  // Mouse wind tracking
  let targetWind = 0;
  let wind = 0;

  // Resize handler
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse listeners for interactive wind
  window.addEventListener('mousemove', (e) => {
    targetWind = ((e.clientX / W) - 0.5) * 2.5;
  });
  window.addEventListener('mouseleave', () => {
    targetWind = 0;
  });

  const rand = (min, max) => Math.random() * (max - min) + min;
  const randI = (min, max) => Math.floor(rand(min, max));

  // 1. Ember/Spark Particle
  class Ember {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.baseX = rand(0, W);
      this.x = this.baseX;
      this.y = init ? rand(H * 0.2, H) : rand(H - 40, H);
      this.size = rand(1.2, 3.8);
      this.vy = rand(-1.2, -3.2);
      this.life = 0;
      this.maxLife = randI(150, 320);
      this.alpha = 1;
      this.phase = rand(0, Math.PI * 2);
      this.frequency = rand(0.01, 0.035);
    }

    update() {
      this.life++;
      this.y += this.vy;
      this.phase += this.frequency;
      
      const sway = Math.sin(this.phase) * 12;
      const windPush = wind * (H - this.y) * 0.45;
      this.x = this.baseX + sway + windPush;

      this.alpha = 1 - (this.life / this.maxLife);

      if (this.life >= this.maxLife || this.y < -10 || this.x < -10 || this.x > W + 10) {
        this.reset();
      }
    }

    draw() {
      const ageRatio = this.life / this.maxLife;
      // Caribbean Green (155) to Mint (166) to Basil (175)
      let hue = ageRatio < 0.35 ? 155 : (ageRatio < 0.75 ? 166 : 175);
      let sat = ageRatio < 0.75 ? 100 : 80;
      let light = ageRatio < 0.35 ? 65 : (ageRatio < 0.75 ? 55 : 35);
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${this.alpha})`;
      ctx.fill();
    }
  }

  // 2. Flame Body Particle
  class FlameBody {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.baseX = rand(0, W);
      this.x = this.baseX;
      this.y = init ? rand(H * 0.6, H) : rand(H - 60, H);
      this.r = rand(30, 85);
      this.vy = rand(-1.0, -2.5);
      this.life = 0;
      this.maxLife = randI(80, 160);
      this.alpha = rand(0.35, 0.65);
      this.phase = rand(0, Math.PI * 2);
      this.frequency = rand(0.01, 0.025);
    }

    update() {
      this.life++;
      this.y += this.vy;
      this.phase += this.frequency;

      const sway = Math.sin(this.phase) * 18;
      const windPush = wind * (H - this.y) * 0.5;
      this.x = this.baseX + sway + windPush;

      const progress = this.life / this.maxLife;
      this.currentR = this.r * (1 - progress * 0.78);
      this.currentAlpha = this.alpha * (1 - progress);

      if (this.life >= this.maxLife || this.y < H - H * 0.6 || this.x < -this.r || this.x > W + this.r) {
        this.reset();
      }
    }

    draw() {
      const ageRatio = this.life / this.maxLife;
      let hue = ageRatio < 0.25 ? 155 : (ageRatio < 0.60 ? 166 : 175);
      let sat = ageRatio < 0.60 ? 100 : 80;
      let light = ageRatio < 0.25 ? 60 : (ageRatio < 0.60 ? 45 : 25);

      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentR);
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${this.currentAlpha * 0.55})`);
      grad.addColorStop(0.35, `hsla(${hue - 10}, ${sat - 10}%, ${light - 10}%, ${this.currentAlpha * 0.25})`);
      grad.addColorStop(1, `hsla(175, 80%, 15%, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Particle Counts
  const EMBER_COUNT = 120;
  const FLAME_COUNT = 45;

  const embers = Array.from({ length: EMBER_COUNT }, () => new Ember());
  const flames = Array.from({ length: FLAME_COUNT }, () => new FlameBody());

  function drawFirePitBackground() {
    const grad = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, Math.max(W, H));
    // Match the new theme or use LMS colors
    grad.addColorStop(0, '#011211'); // Deep fire pit green-black
    grad.addColorStop(1, '#021B1A'); // Rich black
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGroundGlow() {
    const flicker = Math.sin(Date.now() * 0.006) * 0.05 + Math.cos(Date.now() * 0.013) * 0.03 + 0.95;
    const baseGlowH = H * 0.22 * flicker;
    
    const grad = ctx.createLinearGradient(0, H, 0, H - baseGlowH);
    grad.addColorStop(0, `rgba(11, 69, 58, ${0.48 * flicker})`); // Basil
    grad.addColorStop(0.4, `rgba(0, 223, 129, ${0.16 * flicker})`); // Caribbean green
    grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, H - baseGlowH, W, baseGlowH);
  }

  function render() {
    wind += (targetWind - wind) * 0.065;
    drawFirePitBackground();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    flames.forEach(f => { f.update(); f.draw(); });
    embers.forEach(e => { e.update(); e.draw(); });
    
    ctx.restore();
    drawGroundGlow();

    animFrame = requestAnimationFrame(render);
  }

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
