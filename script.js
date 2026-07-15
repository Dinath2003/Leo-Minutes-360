// Leo Minutes 360 Login Portal
// Interactive 3D Card Tilt + Specular Shimmer + Autonomous Blue Fire Particle Physics

document.addEventListener('DOMContentLoaded', () => {
  // Lucide initialization
  if (window.lucide) {
    lucide.createIcons();
  }

  // ── Element selectors ──────────────────────────────────────────────────────
  const loginCard = document.getElementById('login-card-3d');
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const loginError = document.getElementById('login-error');
  
  const roleDistrict = document.getElementById('role-district');
  const roleClub = document.getElementById('role-club');
  const passwordToggle = document.getElementById('passwordToggle');
  const capsLockWarning = document.getElementById('capsLockWarning');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  // ==========================================
  // 1. ROLE SELECTION TOGGLERS
  // ==========================================
  roleDistrict.addEventListener('click', () => {
    roleDistrict.classList.add('active');
    roleClub.classList.remove('active');
    emailInput.value = 'admin@leo.org';
    passInput.value = 'admin123';
    clearInputError(emailInput, emailError);
    clearInputError(passInput, passwordError);
    loginError.classList.remove('show');
  });

  roleClub.addEventListener('click', () => {
    roleClub.classList.add('active');
    roleDistrict.classList.remove('active');
    emailInput.value = '';
    passInput.value = '';
    clearInputError(emailInput, emailError);
    clearInputError(passInput, passwordError);
    loginError.classList.remove('show');
  });

  // ==========================================
  // 2. ACCESSIBLE PASSWORD EYE REVEAL
  // ==========================================
  passwordToggle.addEventListener('click', () => {
    const isPassword = passInput.getAttribute('type') === 'password';
    passInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    // Lucide converts <i> to <svg> tags, retaining original class names
    const closedIcon = passwordToggle.querySelector('.eye-closed');
    const openIcon = passwordToggle.querySelector('.eye-open');
    
    if (isPassword) {
      closedIcon.classList.add('hidden');
      openIcon.classList.remove('hidden');
      passwordToggle.setAttribute('aria-label', 'Hide password');
      passwordToggle.setAttribute('aria-pressed', 'true');
    } else {
      closedIcon.classList.remove('hidden');
      openIcon.classList.add('hidden');
      passwordToggle.setAttribute('aria-label', 'Show password');
      passwordToggle.setAttribute('aria-pressed', 'false');
    }
  });

  // ==========================================
  // 3. CAPS LOCK DETECTOR
  // ==========================================
  const checkCapsLock = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      capsLockWarning.classList.remove('hidden');
    } else {
      capsLockWarning.classList.add('hidden');
    }
  };

  passInput.addEventListener('keydown', checkCapsLock);
  passInput.addEventListener('keyup', checkCapsLock);
  passInput.addEventListener('focus', checkCapsLock);
  passInput.addEventListener('blur', () => capsLockWarning.classList.add('hidden'));

  // ==========================================
  // 4. CLIENTSIDE FORM VALIDATION
  // ==========================================
  const validateEmail = (showError = true) => {
    const value = emailInput.value.trim();
    if (!value) {
      if (showError) showInputError(emailInput, emailError, 'Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      if (showError) showInputError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }
    clearInputError(emailInput, emailError);
    return true;
  };

  const validatePassword = (showError = true) => {
    const value = passInput.value;
    if (!value) {
      if (showError) showInputError(passInput, passwordError, 'Password is required.');
      return false;
    }
    if (value.length < 8) {
      if (showError) showInputError(passInput, passwordError, 'Password must be at least 8 characters.');
      return false;
    }
    clearInputError(passInput, passwordError);
    return true;
  };

  const showInputError = (inputEl, errorEl, message) => {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    inputEl.classList.add('error');
    inputEl.setAttribute('aria-invalid', 'true');
  };

  const clearInputError = (inputEl, errorEl) => {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    inputEl.classList.remove('error');
    inputEl.removeAttribute('aria-invalid');
  };

  emailInput.addEventListener('blur', () => validateEmail(true));
  emailInput.addEventListener('input', () => validateEmail(false));
  passInput.addEventListener('blur', () => validatePassword(true));
  passInput.addEventListener('input', () => validatePassword(false));

  // ==========================================
  // 5. FORM SUBMISSION
  // ==========================================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.classList.remove('show');
    
    const isEmailValid = validateEmail(true);
    const isPasswordValid = validatePassword(true);
    
    if (!isEmailValid || !isPasswordValid) {
      triggerShake();
      if (!isEmailValid) emailInput.focus();
      else passInput.focus();
      return;
    }

    // Check mock credentials
    const isDistrict = roleDistrict.classList.contains('active');
    const email = emailInput.value.trim();
    const pass = passInput.value;

    setLoadingState(true);

    setTimeout(() => {
      setLoadingState(false);
      
      const success = isDistrict 
        ? (email === 'admin@leo.org' && pass === 'admin123')
        : (email !== '' && pass.length >= 8); // Club allows any valid email/pass

      if (success) {
        // Successful login notification
        const successBanner = document.createElement('div');
        successBanner.style.position = 'fixed';
        successBanner.style.top = '25px';
        successBanner.style.left = '50%';
        successBanner.style.transform = 'translateX(-50%) translateY(-25px)';
        successBanner.style.background = 'rgba(10, 141, 209, 0.95)';
        successBanner.style.backdropFilter = 'blur(12px)';
        successBanner.style.color = '#FFFFFF';
        successBanner.style.padding = '16px 28px';
        successBanner.style.borderRadius = '12px';
        successBanner.style.border = '1px solid rgba(215, 226, 241, 0.25)';
        successBanner.style.boxShadow = '0 12px 35px rgba(4, 96, 183, 0.45)';
        successBanner.style.fontFamily = 'var(--font-body)';
        successBanner.style.fontSize = '0.92rem';
        successBanner.style.fontWeight = '600';
        successBanner.style.zIndex = '9999';
        successBanner.style.opacity = '0';
        successBanner.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        successBanner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Welcome back! Redirecting to workspace...</span>
          </div>
        `;
        document.body.appendChild(successBanner);
        
        void successBanner.offsetWidth;
        successBanner.style.transform = 'translateX(-50%) translateY(0)';
        successBanner.style.opacity = '1';

        setTimeout(() => {
          successBanner.style.transform = 'translateX(-50%) translateY(-25px)';
          successBanner.style.opacity = '0';
          setTimeout(() => successBanner.remove(), 500);
        }, 3000);
      } else {
        triggerShake();
        loginError.textContent = 'Invalid credentials. Please verify details and try again.';
        loginError.classList.add('show');
      }
    }, 1800);
  });

  const triggerShake = () => {
    loginCard.classList.remove('shake');
    void loginCard.offsetWidth; // Force CSS reflow
    loginCard.classList.add('shake');
    setTimeout(() => loginCard.classList.remove('shake'), 400);
  };

  const setLoadingState = (isLoading) => {
    if (isLoading) {
      submitBtn.setAttribute('disabled', 'true');
      btnText.classList.add('hidden');
      btnLoader.classList.remove('hidden');
      submitBtn.style.cursor = 'not-allowed';
    } else {
      submitBtn.removeAttribute('disabled');
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      submitBtn.style.cursor = 'pointer';
    }
  };

  // ==========================================
  // 6. 3D SPRING-EASING TILT EFFECT
  // ==========================================
  const content = document.getElementById('login-content-3d');
  
  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;
  let rafId = null;
  let isHovering = false;

  content.style.perspective = '1000px';
  content.style.perspectiveOrigin = '50% 50%';

  function onMouseMove(e) {
    if (window.innerWidth <= 480) {
      isHovering = false;
      return;
    }
    const rect = loginCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    
    targetRY = dx * 13;   // tilt left-right (max 13 degrees)
    targetRX = -dy * 9;   // tilt up-down (max 9 degrees)
    isHovering = true;
  }

  function onMouseLeave() {
    targetRX = 0;
    targetRY = 0;
    isHovering = false;
  }

  function springLoop() {
    if (window.innerWidth > 480) {
      // Spring interpolation (stiffness = 0.08)
      currentRX += (targetRX - currentRX) * 0.08;
      currentRY += (targetRY - currentRY) * 0.08;
      
      const scale = isHovering ? 1.015 : 1.0;
      loginCard.style.transform = `perspective(1000px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(${scale})`;
      
      // Specular reflection shimmer adjustment
      const shimmer = loginCard.querySelector('.login-card-shimmer');
      if (shimmer) {
        const shiftX = -currentRY * 3;
        const shiftY = currentRX * 3;
        shimmer.style.background = `
          radial-gradient(
            ellipse 85% 65% at ${50 + shiftX}% ${50 + shiftY}%,
            rgba(215, 226, 241, 0.09) 0%,
            rgba(215, 226, 241, 0.03) 40%,
            transparent 70%
          )
        `;
      }
    }
    rafId = requestAnimationFrame(springLoop);
  }

  loginCard.addEventListener('mousemove', onMouseMove);
  loginCard.addEventListener('mouseleave', onMouseLeave);
  springLoop();

  // ==========================================
  // 7. BLUE FIRE BACKDROP PARTICLE SIMULATION
  // ==========================================
  initParticles();
});

function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animId;

  // Virtual wind state
  let targetWind = 0;
  let wind = 0;

  // Autonomous Gravity Point moving in lissajous figures
  const grav = {
    x: 0, y: 0,
    tx: 0, ty: 0,
    cx: 0, cy: 0,
    t: 0,
    strength: 0.014,
    orbitRX: 0,
    orbitRY: 0,
    cursorInfluence: 0.26
  };

  const rand = (min, max) => Math.random() * (max - min) + min;
  const randI = (min, max) => Math.floor(rand(min, max));

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    grav.orbitRX = canvas.width * 0.32;
    grav.orbitRY = canvas.height * 0.22;
    grav.cx = canvas.width / 2;
    grav.cy = canvas.height / 2;
    seed();
  }

  window.addEventListener('resize', resize);

  function onMouseMove(e) {
    targetWind = ((e.clientX / window.innerWidth) - 0.5) * 2.2;
    grav.cx = e.clientX;
    grav.cy = e.clientY;
  }

  function onMouseLeave() {
    targetWind = 0;
    grav.cx = canvas.width / 2;
    grav.cy = canvas.height / 2;
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseleave', onMouseLeave);

  let embers = [];
  let flames = [];
  let comets = [];

  function seed() {
    embers = Array.from({ length: 110 }, () => new Ember(true));
    flames = Array.from({ length: 40 }, () => new FlameBody(true));
    comets = Array.from({ length: 7 }, () => new Comet(true));
  }

  // Ember particles themed in sky-blue & ice-blue
  class Ember {
    constructor(init = false) { this.reset(init); }

    reset(init = false) {
      const W = canvas.width, H = canvas.height;
      this.baseX = rand(0, W);
      this.x = this.baseX;
      this.y = init ? rand(H * 0.2, H) : rand(H - 40, H);
      this.size = rand(1.2, 3.6);
      this.vy = rand(-1.2, -3.0);
      this.life = 0;
      this.maxLife = randI(160, 310);
      this.alpha = 1;
      this.phase = rand(0, Math.PI * 2);
      this.frequency = rand(0.01, 0.035);
    }

    update() {
      const H = canvas.height;
      this.life++;
      this.y += this.vy;
      this.phase += this.frequency;

      const sway = Math.sin(this.phase) * 11;
      const windPush = wind * (H - this.y) * 0.42;
      this.x = this.baseX + sway + windPush;

      // Pull toward lissajous center
      const dx = grav.x - this.x;
      const dy = grav.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pull = (grav.strength * 300) / Math.max(dist, 60);
      this.baseX += dx / dist * pull * 1.8;
      this.y += dy / dist * pull * 0.6;

      this.alpha = 1 - (this.life / this.maxLife);
      if (this.life >= this.maxLife || this.y < -10 ||
          this.x < -10 || this.x > canvas.width + 10) this.reset();
    }

    draw() {
      const t = this.life / this.maxLife;
      // Palette mapping: Frost (228), Chrome (227), Pewter (247)
      const hue = t < 0.35 ? 228 : t < 0.75 ? 227 : 247;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      // Low saturation (10%) to get silver sparks instead of blue sparks
      ctx.fillStyle = `hsla(${hue}, 10%, 80%, ${this.alpha * 0.95})`;
      ctx.fill();
    }
  }

  // Blur flame bodies
  class FlameBody {
    constructor(init = false) { this.reset(init); }

    reset(init = false) {
      const W = canvas.width, H = canvas.height;
      this.baseX = rand(0, W);
      this.x = this.baseX;
      this.y = init ? rand(H * 0.6, H) : rand(H - 60, H);
      this.r = rand(30, 80);
      this.vy = rand(-0.8, -2.2);
      this.life = 0;
      this.maxLife = randI(80, 150);
      this.alpha = rand(0.3, 0.6);
      this.phase = rand(0, Math.PI * 2);
      this.frequency = rand(0.01, 0.025);
    }

    update() {
      const H = canvas.height;
      this.life++;
      this.y += this.vy;
      this.phase += this.frequency;

      const sway = Math.sin(this.phase) * 16;
      const windPush = wind * (H - this.y) * 0.45;
      this.x = this.baseX + sway + windPush;

      const dx = grav.x - this.x;
      const dy = grav.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pull = (grav.strength * 200) / Math.max(dist, 80);
      this.baseX += dx / dist * pull * 1.2;
      this.y += dy / dist * pull * 0.4;

      const p = this.life / this.maxLife;
      this.currentR = this.r * (1 - p * 0.76);
      this.currentAlpha = this.alpha * (1 - p);

      if (this.life >= this.maxLife || this.y < H - H * 0.6 ||
          this.x < -this.r || this.x > canvas.width + this.r) this.reset();
    }

    draw() {
      const t = this.life / this.maxLife;
      const hue = t < 0.25 ? 228 : t < 0.60 ? 227 : 247;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentR);
      // Low saturation (12%, 8%) to draw frosted/silver flames
      g.addColorStop(0,    `hsla(${hue},      12%, 75%, ${this.currentAlpha * 0.55})`);
      g.addColorStop(0.35, `hsla(${hue},       8%, 45%, ${this.currentAlpha * 0.25})`);
      g.addColorStop(1,    `hsla(227,          5%, 15%, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentR, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  // Diagonal falling comets
  class Comet {
    constructor(init = false) { this.reset(init); }

    reset(init = false) {
      const W = canvas.width, H = canvas.height;
      this.x = rand(W * 0.05, W * 0.95);
      this.y = init ? rand(-H, 0) : rand(-120, -20);
      const angle = rand(-0.2, 0.2);
      const speed = rand(4, 9);
      this.vx = Math.sin(angle) * speed;
      this.vy = Math.cos(angle) * speed;
      this.tailLen = rand(100, 260);
      this.size = rand(1.4, 3.0);
      this.alpha = rand(0.5, 0.9);
      this.life = 0;
      this.maxLife = randI(60, 130);
      this.hue = rand(220, 235); // Frost to Chrome range
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      const H = canvas.height, W = canvas.width;
      if (this.y > H + this.tailLen || this.x < -this.tailLen || this.x > W + this.tailLen
          || this.life > this.maxLife) {
        this.reset(false);
      }
    }

    draw() {
      const lifeFrac = this.life / this.maxLife;
      const fadeIn = Math.min(this.life / 18, 1);
      const fadeOut = lifeFrac > 0.75 ? 1 - (lifeFrac - 0.75) / 0.25 : 1;
      const opacity = this.alpha * fadeIn * fadeOut;
      if (opacity <= 0.01) return;

      const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const nx = -this.vx / len;
      const ny = -this.vy / len;

      const tx = this.x + nx * this.tailLen;
      const ty = this.y + ny * this.tailLen;

      const grad = ctx.createLinearGradient(this.x, this.y, tx, ty);
      // Low saturation (10%, 8%) for silver comets
      grad.addColorStop(0,    `hsla(${this.hue},  10%, 92%, ${opacity})`);
      grad.addColorStop(0.05, `hsla(${this.hue},  10%, 75%, ${opacity * 0.85})`);
      grad.addColorStop(0.25, `hsla(${this.hue},   8%, 55%, ${opacity * 0.40})`);
      grad.addColorStop(0.6,  `hsla(${this.hue},   6%, 35%, ${opacity * 0.12})`);
      grad.addColorStop(1,    `hsla(${this.hue},   5%, 15%, 0)`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.size * 2;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = `hsla(${this.hue}, 12%, 80%, ${opacity * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsla(${this.hue}, 12%, 90%, ${opacity})`;
      const nGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
      nGrad.addColorStop(0,   `hsla(0, 0%, 100%, ${opacity})`);
      nGrad.addColorStop(0.4, `hsla(${this.hue}, 12%, 85%, ${opacity * 0.75})`);
      nGrad.addColorStop(1,   `hsla(${this.hue}, 10%, 55%, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = nGrad;
      ctx.fill();
      ctx.restore();
    }
  }

  // Dynamic autonomous orbital gravity point drawing
  function drawGravityOrb() {
    const pulse = 0.65 + Math.sin(Date.now() * 0.004) * 0.35;
    const r = 26 + Math.sin(Date.now() * 0.007) * 7;

    // Halo (Chrome - #9ea0a7, Carbon - #51565a)
    const outer = ctx.createRadialGradient(grav.x, grav.y, 0, grav.x, grav.y, r * 3.5);
    outer.addColorStop(0,   `rgba(158, 160, 167, ${0.18 * pulse})`);
    outer.addColorStop(0.5, `rgba(81, 86, 90, ${0.08 * pulse})`);
    outer.addColorStop(1,   `rgba(9, 13, 18, 0)`);
    ctx.beginPath();
    ctx.arc(grav.x, grav.y, r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = outer;
    ctx.fill();

    // Core (Frost -> Pewter -> Nickel)
    const core = ctx.createRadialGradient(grav.x, grav.y, 0, grav.x, grav.y, r);
    core.addColorStop(0,   `rgba(236, 239, 250, ${0.9 * pulse})`);
    core.addColorStop(0.3, `rgba(192, 191, 198, ${0.7 * pulse})`);
    core.addColorStop(0.7, `rgba(123, 125, 127, ${0.35 * pulse})`);
    core.addColorStop(1,   `rgba(81, 86, 90, 0)`);
    ctx.beginPath();
    ctx.arc(grav.x, grav.y, r, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(grav.x, grav.y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * pulse})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(236, 239, 250, 0.9)'; // Frost glow
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function updateGravityPoint() {
    const W = canvas.width, H = canvas.height;
    grav.t += 0.006;
    const orbitX = W / 2 + Math.cos(grav.t * 1.0) * grav.orbitRX;
    const orbitY = H / 2 + Math.sin(grav.t * 1.3) * grav.orbitRY;

    grav.tx = orbitX * (1 - grav.cursorInfluence) + grav.cx * grav.cursorInfluence;
    grav.ty = orbitY * (1 - grav.cursorInfluence) + grav.cy * grav.cursorInfluence;

    grav.x += (grav.tx - grav.x) * 0.04;
    grav.y += (grav.ty - grav.y) * 0.04;
  }

  // Draw deep dark body bg
  function drawBg() {
    const W = canvas.width, H = canvas.height;
    const g = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, Math.max(W, H));
    g.addColorStop(0, '#090d12'); // Abyss
    g.addColorStop(1, '#05070a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Ground fire glow
  function drawGroundGlow() {
    const W = canvas.width, H = canvas.height;
    const flicker = Math.sin(Date.now() * 0.006) * 0.05 + Math.cos(Date.now() * 0.013) * 0.03 + 0.95;
    const glowH = H * 0.22 * flicker;
    const g = ctx.createLinearGradient(0, H, 0, H - glowH);
    g.addColorStop(0,   `hsla(227, 8%, 25%, ${0.48 * flicker})`); // Chrome / Carbon ground glow
    g.addColorStop(0.4, `hsla(228, 15%, 60%, ${0.16 * flicker})`);
    g.addColorStop(1,   `rgba(0, 0, 0, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, H - glowH, W, glowH);
  }

  function render() {
    wind += (targetWind - wind) * 0.065;
    updateGravityPoint();
    drawBg();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    comets.forEach(c => { c.update(); c.draw(); });
    ctx.restore();

    drawGravityOrb();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    flames.forEach(f => { f.update(); f.draw(); });
    embers.forEach(e => { e.update(); e.draw(); });
    ctx.restore();

    drawGroundGlow();
    animId = requestAnimationFrame(render);
  }

  resize();
  render();
}
