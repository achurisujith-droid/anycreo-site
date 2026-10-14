// Anycreo site: hero build sequence, mobile menu, billing toggle, scroll reveal. No dependencies.
(() => {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero video: still for reduced motion, and paused while off screen.
  const video = document.querySelector('.stage__video');
  if (video) {
    if (reduce) {
      video.removeAttribute('autoplay');
      video.pause();
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.2 }).observe(video);
    }
  }

  // Mobile menu.
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    const set = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  // Billing toggle.
  const periodButtons = [...document.querySelectorAll('.toggle button')];
  const setPeriod = (period) => {
    periodButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.period === period)));
    document.querySelectorAll('.price[data-month]').forEach((p) => {
      const amt = p.querySelector('.amt');
      amt.textContent = p.dataset[period];
      amt.classList.remove('is-swapping');
      void amt.offsetWidth;
      amt.classList.add('is-swapping');
    });
    document.querySelectorAll('[data-year-only]').forEach((el) => { el.hidden = period !== 'year'; });
    document.querySelectorAll('[data-swap]').forEach((el) => { el.textContent = el.dataset[period]; });
  };
  periodButtons.forEach((b) => b.addEventListener('click', () => setPeriod(b.dataset.period)));

  // Scroll reveal.
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      io.observe(el);
    });
  }

  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
