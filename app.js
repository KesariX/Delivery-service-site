/* ───────────────────────────────────────────────────────────────
   KesariX Delivery Club — shared page script
   Used by every city page (/surat, /vadodara, /bharuch, /ahmedabad).
   The city is read from the hidden #city input on each page, so the
   submission always lands in that city's sheet tab.
─────────────────────────────────────────────────────────────── */

/* ── Google Apps Script Web App endpoint (writes to the Google Sheet) ── */
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyXR5t0qtgyuTCWZEsSeKyJESOyzTx0Gan2LAbcBfRDRehq88GM1VIZ8IBDgcDo3kx5/exec';

/* ─────────────────────────────────────────────────────────────
   HERO PARTICLE NETWORK — monochrome clustered dots + links
─────────────────────────────────────────────────────────────── */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let w = 0, h = 0, particles = [], raf = 0, running = false;

  const isSmall = () => window.innerWidth < 640;
  const linkDist = () => (isSmall() ? 100 : 130);
  function count() {
    const cap = isSmall() ? 45 : 90;
    return Math.min(cap, Math.floor((w * h) / 13000));
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    if (!w || !h) return;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
    if (!running) draw();
  }

  function init() {
    particles = [];
    const n = count();
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
      });
    }
  }

  function draw() {
    const LD = linkDist();
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LD * LD) {
          const a = (1 - Math.sqrt(d2) / LD) * 0.28;
          ctx.strokeStyle = 'rgba(10,10,10,' + a + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(10,10,10,0.55)';
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() { draw(); raf = requestAnimationFrame(loop); }
  function start() { if (!running && !prefersReduced) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive: true });

  resize();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe(hero);
  } else {
    start();
  }

  if (prefersReduced) draw();
  else start();
})();

/* ─────────────────────────────────────────────────────────────
   FORM SUBMISSION → Google Sheet (routed to this city's tab)
─────────────────────────────────────────────────────────────── */
(function () {
  const form = document.getElementById('recruitForm');
  if (!form) return;

  const successMsg = document.getElementById('successMsg');
  const submitBtn  = document.getElementById('submitBtn');
  const btnLabel   = document.getElementById('btnLabel');
  const formError  = document.getElementById('formError');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    formError.style.display = 'none';

    if (!form.checkValidity()) {
      Array.from(form.elements).forEach(el => {
        if (!el.validity.valid) {
          el.style.borderColor = '#0a0a0a';
          el.style.boxShadow = 'inset 0 0 0 1px #0a0a0a';
          el.addEventListener('input', () => { el.style.borderColor = ''; el.style.boxShadow = ''; }, { once: true });
        }
      });
      return;
    }

    const data = {
      timestamp: new Date().toLocaleString('en-IN'),
      name:    document.getElementById('name').value.trim(),
      age:     document.getElementById('age').value,
      contact: document.getElementById('contact').value.trim(),
      city:    document.getElementById('city').value,   // hidden field, hard-set per page
      hub:     document.getElementById('hub').value,
    };

    submitBtn.disabled = true;
    btnLabel.textContent = 'Submitting…';

    try {
      if (SHEET_ENDPOINT && !SHEET_ENDPOINT.startsWith('PASTE_')) {
        await fetch(SHEET_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors', // Apps Script web apps don't send CORS headers
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
      } else {
        console.log('[DEMO MODE] Application captured:', data);
      }
      form.style.display = 'none';
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error('Submission failed:', err);
      formError.style.display = 'block';
      submitBtn.disabled = false;
      btnLabel.textContent = 'Submit Application';
    }
  });

  // Phone number — digits only, max 10
  const contactInput = document.getElementById('contact');
  if (contactInput) {
    contactInput.addEventListener('input', () => {
      let val = contactInput.value.replace(/\D/g, '');
      if (val.length > 10) val = val.slice(0, 10);
      contactInput.value = val;
    });
  }
})();
