document.addEventListener('DOMContentLoaded', function() {


  // Only homepage fades nav; everywhere else shows immediately
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  if (isHome) {
    document.body.classList.remove('no-nav-anim');
  } else {
    document.body.classList.add('no-nav-anim');
  }

  // Mark homepage for spacing logic on other pages
  const isHomeForSpacing = location.pathname === '/' || location.pathname === '/index.html';
  if (isHomeForSpacing) {
    document.body.classList.add('home');
  } else {
    document.body.classList.remove('home');
  }


  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Books page: compute and render finished date and days to complete
  const bookCards = document.querySelectorAll('.book-card');
  if (bookCards.length > 0) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const fmt = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    bookCards.forEach((card) => {
      const startStr = card.getAttribute('data-start');
      const finishStr = card.getAttribute('data-finish');
      if (!startStr || !finishStr) return;
      const start = new Date(startStr);
      const finish = new Date(finishStr);
      if (isNaN(start.getTime()) || isNaN(finish.getTime())) return;
      const days = Math.max(1, Math.round((finish - start) / MS_PER_DAY));
      const finishEl = card.querySelector('.js-finished');
      const daysEl = card.querySelector('.js-days');
      if (finishEl) finishEl.textContent = fmt.format(finish);
      if (daysEl) daysEl.textContent = `${days} day${days === 1 ? '' : 's'}`;
    });
  }

  // Enhanced hero: typed roles
  const typedEl = document.getElementById('typed-roles');
  if (typedEl) {
    const roles = [
      'Software Developer',
      'Full‑stack Engineer',
      'ML tinkerer',
      'UI/UX enthusiast'
    ];
    startTypewriter(typedEl, roles, 70, 1100);
  }

  function startTypewriter(el, words, typingMs = 70, pauseMs = 1100) {
    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function tick() {
      const word = words[wordIdx];
      if (!deleting) {
        charIdx = Math.min(charIdx + 1, word.length);
      } else {
        charIdx = Math.max(charIdx - 1, 0);
      }
      el.textContent = word.slice(0, charIdx);

      if (!deleting && charIdx === word.length) {
        deleting = true;
        setTimeout(tick, pauseMs);
        return;
      }
      if (deleting && charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
      setTimeout(tick, deleting ? Math.max(typingMs * 0.5, 30) : typingMs);
    }
    tick();
  }

  // Enhanced hero: particles and parallax (respects reduced motion)
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('hero-canvas');
  const isSmall = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  if (canvas && !prefersReduced && !isSmall) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0, height = 0;
    let raf;

    function particleColor() {
      return 'rgba(15,23,42,0.12)';
    }

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      const target = Math.min(90, Math.floor(width / 20));
      if (particles.length === 0) {
        for (let i = 0; i < target; i++) particles.push(makeParticle());
      } else if (particles.length < target) {
        for (let i = particles.length; i < target; i++) particles.push(makeParticle());
      } else if (particles.length > target) {
        particles.length = target;
      }
    }

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        a: Math.random() * 0.6 + 0.2
      };
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = particleColor();
      for (let p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = width + 5; if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5; if (p.y > height + 5) p.y = -5;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(step);

    // Observe class changes to body to refresh color
    const mo = new MutationObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // Parallax for portrait
  const hero = document.getElementById('hero');
  const ring = document.querySelector('.portrait-ring');
  if (hero && ring && !prefersReduced) {
    let rafId = 0;
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        ring.style.transform = `translate3d(${nx * 12}px, ${ny * 12}px, 0) rotate(${nx * 2}deg)`;
      });
    });
    hero.addEventListener('mouseleave', () => { ring.style.transform = ''; });
  }

  // Floating glass nav follows cursor subtly
  const siteNav = document.querySelector('.site-nav');
  const navInner = document.querySelector('.nav-inner');
  const navLinks = document.querySelector('.nav-links');
  if (siteNav && navInner) {
    let rafId = 0;
    let tx = 0, ty = 0;
    let mx = 0.5, my = 0.5;
    const smallNav = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;

    function apply() {
      navInner.style.setProperty('--tx', `${tx.toFixed(2)}px`);
      navInner.style.setProperty('--ty', `${ty.toFixed(2)}px`);
      navInner.style.setProperty('--mx', `${mx * 100}%`);
      navInner.style.setProperty('--my', `${my * 100}%`);
    }

    if (!smallNav) window.addEventListener('mousemove', (e) => {
      const rect = siteNav.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
      mx = Math.max(0, Math.min(1, nx));
      my = Math.max(0, Math.min(1, ny));
      const dx = (nx - 0.5) * 10;
      const dy = (ny - 0.5) * 4;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        tx = dx;
        ty = dy;
        apply();
      });
    });

    window.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
      tx = 0; ty = 0; mx = 0.5; my = 0.5; apply();
    }, { capture: false });
  }

});

