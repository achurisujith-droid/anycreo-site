// Anycreo site: hero preview, billing toggle, scroll reveal. No dependencies.
(() => {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero preview: walks through the app's four real steps.
  const scenes = [...document.querySelectorAll('.scene')];
  const tabs = [...document.querySelectorAll('.window__steps button')];
  let current = 0;
  let timer = null;

  const show = (i) => {
    current = (i + scenes.length) % scenes.length;
    scenes.forEach((s, n) => s.classList.toggle('is-active', n === current));
    tabs.forEach((t, n) => t.setAttribute('aria-selected', String(n === current)));
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => {
    if (reduce || timer) return;
    timer = setInterval(() => show(current + 1), 3800);
  };

  tabs.forEach((t) => t.addEventListener('click', () => { stop(); show(Number(t.dataset.go)); }));

  const preview = document.querySelector('.preview');
  if (preview && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()), { threshold: 0.3 }).observe(preview);
  } else {
    play();
  }

  // Billing toggle.
  const periodButtons = [...document.querySelectorAll('.toggle button')];
  const setPeriod = (period) => {
    periodButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.period === period)));
    document.querySelectorAll('.price[data-month]').forEach((p) => {
      const amt = p.querySelector('.amt');
      amt.textContent = p.dataset[period];
      p.querySelector('.per').textContent = period === 'year' ? '/ year' : '/ month';
      amt.classList.remove('is-swapping');
      void amt.offsetWidth;
      amt.classList.add('is-swapping');
    });
    document.querySelectorAll('[data-swap]').forEach((el) => {
      const [amount, ...rest] = el.dataset[period].split(' in ');
      el.innerHTML = el.classList.contains('price__alt') ? el.dataset[period]
        : `<strong>${amount} in ${rest.join(' in ').replace(/ (every month|for the year)$/, '')}</strong> ${el.dataset[period].match(/(every month|for the year)$/)[0]}`;
    });
  };
  periodButtons.forEach((b) => b.addEventListener('click', () => setPeriod(b.dataset.period)));

  // Components and modules: tabs + category filter.
  const libTabs = [...document.querySelectorAll('.library__tabs [role="tab"]')];
  libTabs.forEach((tab) => tab.addEventListener('click', () => {
    libTabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }));
  const filters = [...document.querySelectorAll('.filters button')];
  filters.forEach((f) => f.addEventListener('click', () => {
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b === f)));
    document.querySelectorAll('.comp').forEach((c) => {
      c.hidden = f.dataset.filter !== 'All' && c.dataset.cat !== f.dataset.filter;
    });
  }));

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
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  }

  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
