// Apex Legal Group — Interactive Script
(() => {
  'use strict';

  // ---------- Preloader ----------
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader')?.classList.add('done');
      document.body.classList.add('intro-done');
    }, 2400);
  });

  // ---------- Theme toggle ----------
  const themeBtn = document.getElementById('themeToggle');
  const setTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('apex-theme', t);
    if (themeBtn) themeBtn.innerHTML = t === 'light' ? moonIcon() : sunIcon();
  };
  const sunIcon = () => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moonIcon = () => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  setTheme(localStorage.getItem('apex-theme') || 'dark');
  themeBtn?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // ---------- Header scroll ----------
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('backTop')?.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Hamburger menu ----------
  const burger = document.getElementById('hamburger');
  const overlay = document.getElementById('menuOverlay');
  const toggleMenu = (force) => {
    const open = force ?? !overlay.classList.contains('open');
    overlay.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open);
  };
  burger?.addEventListener('click', () => toggleMenu());
  overlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

  // ---------- Custom cursor ----------
  if (window.matchMedia('(pointer: fine)').matches) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let rx = 0, ry = 0, x = 0, y = 0;
    document.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; if (dot) { dot.style.top = y + 'px'; dot.style.left = x + 'px'; } });
    const animate = () => { rx += (x - rx) * .15; ry += (y - ry) * .15; if (ring) { ring.style.top = ry + 'px'; ring.style.left = rx + 'px'; } requestAnimationFrame(animate); };
    animate();
    document.querySelectorAll('a, button, .gallery-item, .card').forEach(el => {
      el.addEventListener('mouseenter', () => ring?.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring?.classList.remove('hover'));
    });
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  // ---------- Counter ----------
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1800; const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

  // ---------- Parallax ----------
  const parallaxEls = document.querySelectorAll('.parallax-bg');
  let ticking = false;
  const updateParallax = () => {
    parallaxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.speed || '0.3');
      const offset = (window.innerHeight - r.top) * speed * 0.2;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();

  // ---------- FAQ ----------
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q?.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
      q.setAttribute('aria-expanded', open);
    });
  });

  // ---------- Back to top ----------
  document.getElementById('backTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---------- Contact form ----------
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const fields = form.querySelectorAll('[data-validate]');
    fields.forEach(f => {
      const wrap = f.closest('.field');
      let ok = true;
      const v = f.value.trim();
      const type = f.dataset.validate;
      if (!v) ok = false;
      else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
      else if (type === 'phone' && !/^[\d\s+()-]{7,}$/.test(v)) ok = false;
      else if (type === 'min' && v.length < 10) ok = false;
      wrap?.classList.toggle('error', !ok);
      if (!ok) valid = false;
    });
    if (valid) {
      const msg = document.getElementById('formMsg');
      if (msg) { msg.classList.add('show'); msg.textContent = 'Thank you. A member of our team will respond within one business day.'; }
      form.reset();
      setTimeout(() => msg?.classList.remove('show'), 6000);
    }
  });
  form?.querySelectorAll('[data-validate]').forEach(f => f.addEventListener('input', () => f.closest('.field')?.classList.remove('error')));

  // ---------- Newsletter ----------
  const news = document.getElementById('newsletterForm');
  news?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = news.querySelector('input');
    const msg = news.parentElement.querySelector('.news-msg');
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      msg.textContent = 'Subscribed. Check your inbox for confirmation.';
      msg.style.color = 'var(--accent)';
      input.value = '';
    } else {
      msg.textContent = 'Please enter a valid email address.';
      msg.style.color = '#e08080';
    }
  });

  // ---------- Lightbox ----------
  const lb = document.getElementById('lightbox');
  const lbImg = lb?.querySelector('img');
  const items = [...document.querySelectorAll('.gallery-item')];
  let idx = 0;
  const show = (i) => {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].dataset.full || items[idx].querySelector('img').src;
    lb.classList.add('open');
  };
  items.forEach((it, i) => it.addEventListener('click', () => show(i)));
  lb?.querySelector('.lightbox-close')?.addEventListener('click', () => lb.classList.remove('open'));
  lb?.querySelector('.prev')?.addEventListener('click', () => show(idx - 1));
  lb?.querySelector('.next')?.addEventListener('click', () => show(idx + 1));
  document.addEventListener('keydown', (e) => {
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') lb.classList.remove('open');
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // ---------- Particle canvas hero ----------
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles, mouse = { x: -9999, y: -9999 };
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    const init = () => {
      const count = Math.min(90, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        r: (Math.random() * 1.4 + 0.4) * devicePixelRatio,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--sand').trim() || '#DFD0B8';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 120 * devicePixelRatio) {
          p.x += dx / d * 0.6; p.y += dy / d * 0.6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
      });
      // Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 130 * devicePixelRatio) {
            ctx.beginPath();
            ctx.strokeStyle = accent;
            ctx.globalAlpha = 1 - d / (130 * devicePixelRatio);
            ctx.lineWidth = 0.5 * devicePixelRatio;
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * devicePixelRatio;
      mouse.y = (e.clientY - r.top) * devicePixelRatio;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  }
})();
