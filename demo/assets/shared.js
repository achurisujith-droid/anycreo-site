/*
 * Shared behaviour for every sample page:
 * - remembers the chosen theme, font and size (per browser, best effort)
 * - the "Experiment" dock for switching them
 * - the Ctrl K palette
 * Loaded in <head> so the saved theme is applied before the page paints.
 */
(function () {
  const THEMES = [
    { id: 'harbor-v1', name: 'V1 Ocean', a: '#0a6894', b: '#f4f7fa' },
    { id: 'harbor-v2', name: 'V2 Deep', a: '#1e4f8f', b: '#f4f7fa' },
    { id: 'harbor-v3', name: 'V3 Sky', a: '#0874b9', b: '#f4f7fa' },
    { id: 'harbor-v4', name: 'V4 Slate', a: '#3d5a80', b: '#f4f7fa' },
    { id: 'harbor-night', name: 'Lagoon 2 dark', a: '#4cb8e0', b: '#0a1016' },
    { id: 'lagoon', name: 'Lagoon', a: '#0b7480', b: '#f4f7f9' },
    { id: 'iris', name: 'Iris', a: '#5a3ed6', b: '#f6f6fb' },
    { id: 'midnight', name: 'Midnight', a: '#6b96ff', b: '#0b0e14' },
    { id: 'mono', name: 'Mono', a: '#141414', b: '#65b20c' },
    { id: 'sunrise', name: 'Sunrise', a: '#c0266d', b: '#fbf7fb' }
  ];
  const FONTS = [
    { id: 'jakarta', name: 'Jakarta' },
    { id: 'geist', name: 'Geist' },
    { id: 'nunito', name: 'Nunito' },
    { id: 'outfit', name: 'Outfit' }
  ];
  const SIZES = [
    { id: 'compact', name: 'Compact' },
    { id: 'normal', name: 'Normal' },
    { id: 'large', name: 'Large' }
  ];
  const DEFAULTS = { theme: 'harbor-v1', font: 'jakarta', size: 'normal' };

  function read(key) {
    try { return localStorage.getItem('anycreo.' + key) || DEFAULTS[key]; } catch (e) { return DEFAULTS[key]; }
  }
  function write(key, value) {
    try { localStorage.setItem('anycreo.' + key, value); } catch (e) { /* private window: fine */ }
  }
  // The colour theme lives on data-look: an artifact host sets data-theme itself.
  const attr = (key) => 'data-' + (key === 'theme' ? 'look' : key);
  function apply(key, value) {
    document.documentElement.setAttribute(attr(key), value);
    write(key, value);
    if (key === 'theme') document.dispatchEvent(new CustomEvent('anycreo:look', { detail: value }));
    document.querySelectorAll('[data-pick="' + key + '"]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.value === value));
    });
  }
  ['theme', 'font', 'size'].forEach((k) => document.documentElement.setAttribute(attr(k), read(k)));

  const commands = [];
  const api = {
    icons() { if (window.lucide) window.lucide.createIcons(); },
    addCommands(list) { commands.push(...list); },
    openPalette: () => {},
    setLook(id) { apply('theme', id); },
    cycleTheme() {
      const i = THEMES.findIndex((t) => t.id === read('theme'));
      apply('theme', THEMES[(i + 1) % THEMES.length].id);
    }
  };
  window.anycreo = api;

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function buildDock() {
    const toggle = el('<button class="btn dock-toggle" aria-expanded="false" aria-controls="dock"><i data-lucide="palette"></i>Experiment</button>');
    const dock = el(`<section class="dock" id="dock" hidden aria-label="Try other looks">
      <div><h2>Colours</h2><div class="swatches">${THEMES.map((t) => `<button class="swatch" data-pick="theme" data-value="${t.id}" aria-pressed="false"><span class="s" style="background: linear-gradient(135deg, ${t.a} 0 55%, ${t.b} 55% 100%)"></span>${t.name}</button>`).join('')}</div></div>
      <div><h2>Font</h2><div class="seg">${FONTS.map((f) => `<button data-pick="font" data-value="${f.id}" aria-pressed="false">${f.name}</button>`).join('')}</div></div>
      <div><h2>Text size</h2><div class="seg">${SIZES.map((s) => `<button data-pick="size" data-value="${s.id}" aria-pressed="false">${s.name}</button>`).join('')}</div></div>
      <p class="tiny muted" style="margin:0">Your choice is remembered on every sample page.</p>
    </section>`);
    document.body.append(dock, toggle);
    toggle.addEventListener('click', () => {
      dock.hidden = !dock.hidden;
      toggle.setAttribute('aria-expanded', String(!dock.hidden));
    });
    dock.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (b) apply(b.dataset.pick, b.dataset.value);
    });
    ['theme', 'font', 'size'].forEach((k) => apply(k, read(k)));
  }

  function buildPalette() {
    const back = el(`<div class="palette-backdrop" hidden>
      <div class="palette" role="dialog" aria-label="Find or do anything">
        <div class="palette-search"><i data-lucide="search"></i><input aria-label="Search" placeholder="Type what you want to do…"><span class="kbd">Esc</span></div>
        <div class="palette-list" role="listbox"></div>
        <div class="palette-foot"><span>↑ ↓ to move</span><span>Enter to choose</span><span>Esc to close</span></div>
      </div></div>`);
    document.body.append(back);
    const input = back.querySelector('input');
    const list = back.querySelector('.palette-list');
    let shown = [];
    let active = 0;

    function render() {
      const q = input.value.trim().toLowerCase();
      shown = commands.filter((c) => !q || c.label.toLowerCase().includes(q));
      active = Math.min(active, Math.max(0, shown.length - 1));
      let html = '';
      let group = '';
      shown.forEach((c, i) => {
        if (c.group !== group) { group = c.group; html += `<div class="palette-group">${group}</div>`; }
        html += `<button class="palette-item" role="option" data-i="${i}" aria-selected="${i === active}"><i data-lucide="${c.icon || 'arrow-right'}"></i>${c.label}<span class="hint">${c.hint || ''}</span></button>`;
      });
      list.innerHTML = html || `<p class="muted" style="margin:1rem .75rem">Nothing matches. Press Enter to ask Anycreo instead.</p>`;
      api.icons();
    }
    function close() { back.hidden = true; }
    function run(i) { const c = shown[i]; if (!c) return; close(); c.run(); }
    api.openPalette = () => { back.hidden = false; input.value = ''; active = 0; render(); input.focus(); };

    input.addEventListener('input', () => { active = 0; render(); });
    list.addEventListener('click', (e) => { const b = e.target.closest('.palette-item'); if (b) run(Number(b.dataset.i)); });
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); back.hidden ? api.openPalette() : close(); return; }
      if (back.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, shown.length - 1); render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
      if (e.key === 'Enter') { e.preventDefault(); run(active); }
    });
    document.querySelectorAll('[data-open-palette]').forEach((b) => b.addEventListener('click', api.openPalette));
  }

  api.addCommands([
    { group: 'Go to', label: 'Your apps', icon: 'layout-grid', run: () => { location.href = 'home.html'; } },
    { group: 'Go to', label: 'Build workspace', icon: 'hammer', run: () => { location.href = 'workspace.html'; } },
    { group: 'Go to', label: 'Saved versions', icon: 'history', run: () => { location.href = 'versions.html'; } },
    { group: 'Go to', label: 'Back to anycreo.com', icon: 'arrow-left', run: () => { location.href = '../'; } }
  ]);

  document.addEventListener('DOMContentLoaded', () => {
    buildDock();
    buildPalette();
    api.icons();
  });
})();
