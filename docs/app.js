/* =====================================================
   TikDownloaderCOL — app.js
   - Particle system
   - Animate on scroll (AOS)
   - Live version.json fetch + auto-download
   ===================================================== */

'use strict';

// ── 0. Store download URL globally ──
let APK_DOWNLOAD_URL = '';

// ── 1. Fetch version.json and update UI ──────────────
async function loadVersion() {
  try {
    const res = await fetch('./version.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const v = data.version || '1.1.0';
    APK_DOWNLOAD_URL = data.downloadUrl || '';

    // Update version labels
    document.querySelectorAll('[id$="version"], [id^="badge-version"]').forEach(el => {
      if (el.id === 'badge-version') el.textContent = 'v' + v;
      if (el.id === 'dl-version-sub') el.textContent = 'v' + v + ' · Android';
      if (el.id === 'footer-version') el.textContent = 'v' + v;
    });

    // Individual IDs
    const badges = ['badge-version', 'dl-version-sub', 'footer-version'];
    const texts  = ['v' + v, 'v' + v + ' · Android', 'v' + v];
    badges.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = texts[i];
    });

    // Changelog
    const list = document.getElementById('changelog-list');
    const box  = document.getElementById('changelog-box');
    if (list && data.changelog && data.changelog.length > 0) {
      list.innerHTML = data.changelog.map(c => `<li>${c}</li>`).join('');
    } else if (box) {
      box.style.display = 'none';
    }

  } catch (e) {
    console.warn('[Version] Could not load version.json:', e.message);
  }
}

// ── 2. Trigger download (auto-download) ──────────────
function triggerDownload() {
  if (!APK_DOWNLOAD_URL || APK_DOWNLOAD_URL.includes('TU_USUARIO')) {
    alert('⚠️ La URL de descarga no está configurada. Edita docs/version.json con la URL correcta de tu APK en GitHub Releases.');
    return;
  }

  // Create hidden anchor and click it for auto-download
  const a = document.createElement('a');
  a.href = APK_DOWNLOAD_URL;
  a.setAttribute('download', '');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Also navigate as fallback (some browsers block createElem download)
  setTimeout(() => {
    window.location.href = APK_DOWNLOAD_URL;
  }, 500);
}

// ── 3. Particle System ────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 80;
  const COLORS = ['rgba(0,240,255,', 'rgba(112,0,255,', 'rgba(255,0,85,', 'rgba(0,255,170,'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = randBetween(0, W);
      this.y = initial ? randBetween(0, H) : H + 10;
      this.r = randBetween(.5, 2.5);
      this.vy = randBetween(.1, .5);
      this.vx = randBetween(-.2, .2);
      this.alpha = randBetween(.1, .6);
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.y -= this.vy;
      this.x += this.vx;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Draw connections
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(0,240,255,' + (.08 * (1 - dist/120)) + ')';
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── 4. Animate on Scroll (AOS) ────────────────────────
(function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const delays   = {};
  elements.forEach(el => {
    const delay = el.getAttribute('data-aos-delay') || '0';
    delays.set ? null : (delays[el] = parseInt(delay));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-aos-delay') || '0');
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
})();

// ── 5. 3D Phone mouse parallax ────────────────────────
(function initPhoneParallax() {
  const phone = document.getElementById('phone3d');
  if (!phone) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const rx = ((e.clientY - cy) / cy) * 8;   // max 8deg tilt
    const ry = ((e.clientX - cx) / cx) * -12; // max 12deg tilt
    phone.style.transform = `rotateX(${rx}deg) rotateY(${ry + -15}deg)`;
  });
})();

// ── 6. Init ───────────────────────────────────────────
loadVersion();
