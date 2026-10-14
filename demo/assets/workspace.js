/*
 * Build workspace sample. Everything here is dummy data played back on a
 * timeline, so the look and the pacing can be judged before any real wiring.
 */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icons = () => window.anycreo.icons();
  const main = $('#main');
  const ws = $('#ws');

  /* ---------- panels ---------- */

  function setNav(open) { ws.classList.toggle('no-nav', !open); $('#toggle-nav').setAttribute('aria-pressed', String(open)); }
  function setSide(open) { ws.classList.toggle('no-side', !open); $('#toggle-side').setAttribute('aria-pressed', String(open)); }
  // Two halves from the start. The side menu is a third column, so it starts closed.
  setNav(false);
  setSide(window.innerWidth > 900);

  const resizer = document.createElement('div');
  resizer.className = 'resizer';
  resizer.setAttribute('role', 'separator');
  resizer.setAttribute('aria-orientation', 'vertical');
  resizer.setAttribute('aria-label', 'Resize the conversation and the preview');
  resizer.tabIndex = 0;
  resizer.title = 'Drag to resize · double-click to split evenly';
  const setSideWidth = (w) => {
    w = Math.min(Math.max(w, 320), window.innerWidth * 0.7);
    ws.style.setProperty('--side-w', w + 'px');
    try { localStorage.setItem('anycreo.sideWidth', String(Math.round(w))); } catch (e) { /* fine */ }
  };
  try { const saved = Number(localStorage.getItem('anycreo.sideWidth')); if (saved) ws.style.setProperty('--side-w', Math.min(saved, window.innerWidth * 0.7) + 'px'); } catch (e) { /* fine */ }
  resizer.addEventListener('dblclick', () => {
    ws.style.removeProperty('--side-w');
    try { localStorage.removeItem('anycreo.sideWidth'); } catch (e) { /* fine */ }
  });
  resizer.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const now = document.querySelector('.side').getBoundingClientRect().width;
    setSideWidth(now + (e.key === 'ArrowLeft' ? 40 : -40));
  });
  document.querySelector('.side').prepend(resizer);
  resizer.addEventListener('pointerdown', (e) => {
    resizer.setPointerCapture(e.pointerId);
    resizer.classList.add('dragging'); ws.classList.add('resizing');
  });
  resizer.addEventListener('pointermove', (e) => {
    if (!resizer.classList.contains('dragging')) return;
    setSideWidth(window.innerWidth - e.clientX);
  });
  resizer.addEventListener('pointerup', () => { resizer.classList.remove('dragging'); ws.classList.remove('resizing'); });
  $('#toggle-nav').addEventListener('click', () => setNav(ws.classList.contains('no-nav')));
  $('#toggle-side').addEventListener('click', () => setSide(ws.classList.contains('no-side')));
  $('#close-side').addEventListener('click', () => setSide(false));

  function showTab(name) {
    setSide(true);
    $$('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== name; });
  }
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

  window.anycreo.addCommands([
    { group: 'This app', label: 'Show the preview', icon: 'monitor', run: () => showTab('preview') },
    { group: 'This app', label: 'Show the plan', icon: 'list-checks', run: () => showTab('plan') },
    { group: 'This app', label: 'Show saved versions', icon: 'history', run: () => showTab('versions') },
    { group: 'This app', label: 'Hide or show the side menu', icon: 'panel-left', run: () => setNav(ws.classList.contains('no-nav')) },
    { group: 'This app', label: 'Hide or show the preview panel', icon: 'panel-right', run: () => setSide(ws.classList.contains('no-side')) },
    { group: 'This app', label: 'Pause or continue the helpers', icon: 'pause', run: () => togglePause() },
    { group: 'This app', label: 'Point at something in my app', icon: 'mouse-pointer-click', run: () => { showTab('preview'); setPointing(true); } }
  ]);

  /* ---------- preview ---------- */

  const cal = $('#cal');
  for (let n = 1; n <= 21; n++) {
    const s = document.createElement('span');
    s.textContent = n;
    if ([3, 4, 9, 10, 11, 16, 18].includes(n)) s.className = 'open';
    if (n === 11) s.className = 'pick';
    cal.append(s);
  }
  $('#device').addEventListener('click', () => {
    const phone = $('#frame').classList.toggle('phone');
    $('#device').setAttribute('aria-pressed', String(phone));
  });
  function setPointing(on) {
    $('#site').classList.toggle('pointing', on);
    $('#point').classList.toggle('on', on);
    $('#point-hint').textContent = on ? 'Now click the part of your app you want to change.' : 'Click "Point at something", then click any part of your app and say what to change.';
  }
  $('#point').addEventListener('click', () => setPointing(!$('#site').classList.contains('pointing')));
  $('#site').addEventListener('click', (e) => {
    if (!$('#site').classList.contains('pointing')) return;
    const t = e.target.closest('[data-point]');
    if (!t) return;
    setPointing(false);
    const msg = $('#msg');
    msg.value = 'Change ' + t.dataset.point + ': ';
    msg.focus();
    msg.setSelectionRange(msg.value.length, msg.value.length);
  });

  /* ---------- the plan ---------- */

  const STEPS = [
    { label: 'Write the plan from your idea' },
    { label: 'Set up the home page', doing: 'Making the home page', done: 'Made the home page', sub: 'Welcome headline and top bar · 1 min', changes: ['Added a top bar with your shop name', 'Added a welcome headline'], tech: ['app/page.tsx              new', 'components/Header.tsx     new'], reveal: 2 },
    { label: 'Add your prices', doing: 'Adding your prices', done: 'Added your prices', sub: 'Bath, full groom and nails · 40 s', changes: ['Added three price cards', 'Your app now remembers your prices'], tech: ['components/Prices.tsx     new', 'prisma/schema.prisma      +12 lines'], reveal: 3 },
    { label: 'Make the booking page', doing: 'Making the booking page', done: 'Made the booking page', sub: 'Groomer picker, calendar and times · 2 min', changes: ['Customers can choose a groomer', 'The calendar only shows open times', 'Connected it to your list of groomers'], tech: ['app/book/page.tsx         new', 'components/Calendar.tsx   new', 'lib/slots.ts              new'], reveal: 4, save: 'Booking page added' },
    { label: 'Test a full booking' },
    { label: 'Add groomer hours', doing: 'Adding groomer hours', done: 'Added groomer hours', sub: 'Each groomer has their own days · 1 min', changes: ['You can set hours for each groomer', 'Customers only see times when someone is in'], tech: ['app/admin/hours/page.tsx  new', 'prisma/schema.prisma      +9 lines'], reveal: 6 },
    { label: 'Send confirmation emails', doing: 'Setting up confirmation emails', done: 'Set up confirmation emails', sub: 'Sent the moment someone books · 1 min', changes: ['Customers get an email with their time', 'You get a copy of every booking'], tech: ['emails/Confirmation.tsx   new', 'lib/email.ts              new'], reveal: 7, save: 'Bookings + emails' },
    { label: 'Add customer sign-in', doing: 'Adding customer sign-in', done: 'Added customer sign-in', sub: 'Customers can see and change their bookings · 2 min', changes: ['Added a sign-in page', 'Customers can see their upcoming grooms'], tech: ['app/sign-in/page.tsx      new', 'lib/auth.ts               new'], reveal: 8 },
    { label: 'Apply your colours everywhere', who: 'designer', doing: 'Applying your colours to every page', done: 'Applied your colours everywhere', sub: 'Warm brown and cream, from your logo · 30 s', changes: ['Every page now uses your brand colours', 'Buttons and links match'], tech: ['app/globals.css           edited', 'tailwind.config.ts        edited'], brand: true },
    { label: 'Final check before sharing' }
  ];

  const HELPERS = {
    planner: { initial: 'P', role: 'Planner', cls: 'av-planner' },
    builder: { initial: 'B', role: 'Builder', cls: 'av-builder' },
    designer: { initial: 'D', role: 'Designer', cls: 'av-designer' },
    checker: { initial: 'C', role: 'Checker', cls: 'av-checker' },
    fixer: { initial: 'F', role: 'Fixer', cls: 'av-fixer' }
  };

  /* ---------- state + rendering ---------- */

  let S;
  function fresh() {
    return { pct: 0, stage: -1, warn: false, done: new Set(), now: -1, planShown: false, team: [], versions: [{ num: 1, name: 'Fresh start', when: 'Yesterday, 5:21 pm' }] };
  }

  const C = 2 * Math.PI * 34;
  $('#ring-fill').style.strokeDasharray = String(C);

  function renderProgress() {
    $('#ring-fill').style.strokeDashoffset = String(C * (1 - S.pct / 100));
    $('#ring').className = 'ring' + (S.warn ? ' is-warn' : S.stage === 3 ? ' is-ok' : '');
    $('#pct').textContent = S.pct + '%';
    $('#pct').setAttribute('aria-label', S.pct + ' percent done');
    $$('#stages li').forEach((li, i) => {
      li.className = (i < S.stage || S.stage === 3) ? 'done' : i === S.stage ? 'now' + (S.warn ? ' warn' : '') : '';
    });
  }
  function headline(h, sub) { $('#headline').textContent = h; $('#sub').textContent = sub; }
  function buildingSub() {
    const n = S.done.size;
    return n + ' of 10 steps done · about ' + Math.max(1, (10 - n) * 3) + ' minutes left';
  }

  /*
   * The progress card shrinks once the conversation outgrows the screen, and
   * stays shrunk. Tying it to the scroll position made a loop: shrinking the
   * card shortened the page, which un-shrank it (51 flips in 16 s at 4x).
   * The thread only grows during a build, so a one-way switch cannot loop.
   */
  let teamPinned = false;
  function maybeCompact() {
    const prog = $('#progress');
    if (teamPinned || prog.classList.contains('compact')) return;
    if (main.scrollHeight - main.clientHeight > 260) prog.classList.add('compact');
  }

  function team(list) { S.team = list; renderTeam(); }
  // Rows are keyed by helper, so only a helper who just joined fades in.
  // Rebuilding every row on every update re-ran the fade each time.
  function renderTeam() {
    const working = S.team.filter((h) => h.state === 'working').length;
    $('#team-label').textContent = working ? 'Working now · ' + working + (working === 1 ? ' helper' : ' helpers') : S.stage === 3 ? 'Your team finished' : 'Your team';
    const list = $('#team');
    const rows = S.team.map((h) => {
      const H = HELPERS[h.who];
      let li = list.querySelector('li[data-who="' + h.who + '"]');
      if (!li) {
        li = document.createElement('li');
        li.dataset.who = h.who;
        li.className = 'appear';
        // Drop the fade once it has played, so moving the row cannot replay it.
        li.addEventListener('animationend', () => li.classList.remove('appear'), { once: true });
        li.innerHTML = `<span class="avatar ${H.cls}">${H.initial}</span><span class="who"><strong>${H.role}</strong> <span data-doing></span></span><span class="state" data-state></span>`;
      }
      // Touch only what changed, so the pulse and the fade never restart.
      const doing = '· ' + h.doing;
      const d = li.querySelector('[data-doing]');
      if (d.textContent !== doing) d.textContent = doing;
      const cls = 'state ' + (h.state === 'working' && h.who === 'fixer' ? 'fixing' : h.state);
      const s = li.querySelector('[data-state]');
      if (s.dataset.was !== h.state) {
        s.dataset.was = h.state;
        s.className = cls;
        s.innerHTML = h.state === 'done' ? '<i data-lucide="check"></i>Done' : h.state === 'working' ? '<span class="dot pulse"></span>Working' : '<span class="dot"></span>Waiting';
      }
      return li;
    });
    // Same rows in the new order; rows for helpers who left are dropped.
    rows.forEach((li, i) => { if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null); });
    while (list.children.length > rows.length) list.lastElementChild.remove();
    icons();
  }

  function renderPlan() {
    if (!S.planShown) { $('#plan').innerHTML = ''; $('#plan-summary').textContent = 'The plan appears here once it\'s written.'; return; }
    $('#plan-summary').textContent = S.done.size + ' of 10 steps done. Your helpers work through these in order and check each one.';
    $('#plan').innerHTML = STEPS.map((s, i) => {
      const done = S.done.has(i);
      const now = !done && i === S.now;
      return `<li class="${done ? 'done' : now ? 'now' + (S.warn ? ' warn' : '') : ''}"><span class="mark">${done ? '✓' : i + 1}</span>${s.label}</li>`;
    }).join('');
  }

  function renderVersions() {
    $('#versions').innerHTML = S.versions.map((v, i) => `<li><span class="ver-num">${v.num}</span><span style="flex:1;min-width:0"><strong>${esc(v.name)}</strong><br><span class="tiny muted">${v.when}</span></span>${i === 0 ? '<span class="chip chip-ok">Current</span>' : '<button class="btn btn-sm">Go back</button>'}</li>`).join('');
    $('#nav-versions').textContent = S.versions.length;
  }

  const EMPTY_START = '<p><strong>Your app shows here.</strong><br>Describe it on the left, and you\'ll watch it take shape on this side.</p>';
  function sketch(pages) {
    $('#site-empty').innerHTML = '<p><strong>Sketching your pages</strong><br>These fill in as each one is built.</p><div class="sketch">' +
      pages.map((p) => '<div>' + p + '<i style="width:70%"></i><i style="width:45%"></i></div>').join('') + '</div>';
  }

  function reveal(step) {
    $('#site-empty').hidden = true;
    $$('#site [data-step="' + step + '"]').forEach((n) => {
      n.classList.add('shown', 'fresh');
      setTimeout(() => n.classList.remove('fresh'), 1700);
    });
  }

  function complete(i) {
    S.done.add(i);
    S.pct = S.done.size * 10;
    renderProgress();
    renderPlan();
  }

  /* ---------- the conversation ---------- */

  function add(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    node.classList.add('appear');
    $('#thread').append(node);
    maybeCompact();
    icons();
    main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
    return node;
  }
  const you = (text) => add(`<div class="you">${esc(text)}</div>`);
  const reply = (text) => add(`<div><div class="speaker"><span class="brand-mark" style="width:1.25rem;height:1.25rem;font-size:.7rem;border-radius:6px">a</span>Anycreo</div><p class="reply" style="margin-top:.875rem">${text}</p></div>`);

  function stepCard(icon, tone, title, sub, changes, tech) {
    const node = add(`<div class="event">
      <button class="event-head" aria-expanded="false"><span class="event-icon ${tone}"><i data-lucide="${icon}"></i></span>
      <span class="event-title"><strong>${title}</strong><span>${sub}</span></span><span class="event-more">What changed</span></button>
      <div class="event-body" hidden><ul>${changes.map((c) => `<li>${c}</li>`).join('')}</ul>
      ${tech ? `<div class="tech"><button class="btn btn-ghost btn-sm" data-tech style="padding:0;height:auto;color:var(--muted)">Show the technical details</button><pre hidden>${tech.join('\n')}</pre></div>` : ''}</div></div>`);
    const head = node.querySelector('.event-head');
    head.addEventListener('click', () => {
      const body = node.querySelector('.event-body');
      body.hidden = !body.hidden;
      head.setAttribute('aria-expanded', String(!body.hidden));
      node.querySelector('.event-more').textContent = body.hidden ? 'What changed' : 'Hide';
    });
    const tb = node.querySelector('[data-tech]');
    if (tb) tb.addEventListener('click', () => { const p = node.querySelector('pre'); p.hidden = !p.hidden; tb.textContent = p.hidden ? 'Show the technical details' : 'Hide the technical details'; });
  }

  function save(name) {
    const num = S.versions[0].num + 1;
    const when = 'Today, ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    S.versions.unshift({ num, name, when });
    renderVersions();
    const chip = $('#saved-chip');
    chip.querySelector('span').textContent = 'Saved · Version ' + num;
    chip.classList.remove('save-flash'); void chip.offsetWidth; chip.classList.add('save-flash');
    const node = add(`<div class="event saved"><div class="event-head"><span class="event-icon save"><i data-lucide="bookmark"></i></span>
      <span class="event-title"><strong>Saved as Version ${num} · “${esc(name)}”</strong><span>You can come back to this point any time.</span></span>
      <button class="btn btn-sm" data-open-versions>Versions</button></div></div>`);
    node.querySelector('[data-open-versions]').addEventListener('click', () => showTab('versions'));
  }

  let liveTimer = null;
  function live(text) {
    clearLive();
    const started = Date.now();
    $('#live').innerHTML = `<div class="thinking appear"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span>${text}</span><span class="tiny" id="live-t"></span></div>`;
    liveTimer = setInterval(() => {
      const s = Math.round((Date.now() - started) / 1000 * speed);
      const t = $('#live-t');
      if (t) t.textContent = s >= 2 ? '· ' + s + 's' : '';
    }, 500);
    main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
  }
  function clearLive() { clearInterval(liveTimer); $('#live').innerHTML = ''; }

  /* ---------- the timeline ---------- */

  let gen = 0, paused = false, speed = 1, running = false, finished = false, skipTo = null;

  async function wait(ms) {
    const my = gen;
    let left = ms;
    while (left > 0) {
      await new Promise((r) => setTimeout(r, 50));
      if (my !== gen) throw new Error('stopped');
      if (!paused) left -= 50 * (skipTo ? 40 : speed);
    }
  }
  function mark(name) { if (skipTo === name) skipTo = null; }

  async function buildStep(i) {
    const st = STEPS[i];
    const who = st.who || 'builder';
    S.now = i; renderPlan();
    headline('Building your app', buildingSub());
    team([
      { who: 'builder', doing: who === 'builder' ? st.doing : 'Waiting for the colours', state: who === 'builder' ? 'working' : 'waiting' },
      { who: 'designer', doing: who === 'designer' ? st.doing : 'Tidying spacing and fonts', state: 'working' },
      { who: 'checker', doing: 'Will check this step when it lands', state: 'waiting' }
    ]);
    live(HELPERS[who].role + ' is ' + st.doing.charAt(0).toLowerCase() + st.doing.slice(1));
    await wait(2600);
    clearLive();
    complete(i);
    if (st.reveal) reveal(st.reveal);
    if (st.brand) { $('#site').classList.add('branded'); }
    stepCard('check', 'ok', st.done, st.sub, st.changes, st.tech);
    headline('Building your app', buildingSub());
    if (st.save) { await wait(700); save(st.save); }
    await wait(1000);
  }

  async function script(firstMessage) {
    $('#hello').hidden = true;
    $('#progress').hidden = false;
    $('#pause-helpers').hidden = false;
    you(firstMessage);
    await wait(700);

    S.stage = 0; renderProgress();
    headline('Planning your app', 'Turning your idea into a step-by-step plan · about 2 minutes');
    team([{ who: 'planner', doing: 'Reading your idea', state: 'working' }]);
    live('Planner is reading your idea');
    await wait(2400);
    clearLive();
    reply('Love it. I\'ll write a plan first, so you can see every step before anything is built. You can change the plan at any time.');
    team([{ who: 'planner', doing: 'Writing the plan', state: 'working' }]);
    live('Planner is writing the plan');
    await wait(2600);
    clearLive();
    S.planShown = true; S.now = 1;
    complete(0);
    sketch(['Home page', 'Prices', 'Booking', 'Groomer hours', 'Confirmation email', 'Sign-in']);
    stepCard('list-checks', 'plan', 'Wrote the plan', '10 steps · see it in the Plan tab', ['A booking page with a calendar', 'Hours for each groomer', 'Confirmation emails', 'Customer sign-in', 'Your colours on every page'], null);
    await wait(700);
    save('Plan agreed');
    await wait(1200);

    S.stage = 1; renderProgress();
    reply('Starting the build. You\'ll see each part appear in the preview on the right as it lands.');
    for (const i of [1, 2, 3]) await buildStep(i);

    // Step 5: the check that finds a problem.
    S.now = 4; renderPlan();
    headline('Checking your booking page', buildingSub());
    team([
      { who: 'checker', doing: 'Trying a booking like a customer would', state: 'working' },
      { who: 'designer', doing: 'Polishing the booking page', state: 'working' },
      { who: 'builder', doing: 'Waiting for the check', state: 'waiting' }
    ]);
    live('Checker is trying a booking like a customer would');
    await wait(2600);
    clearLive();
    mark('problem');
    S.warn = true; renderProgress(); renderPlan();
    $('#month').textContent = 'September';
    $('#month').classList.add('wrong');
    headline('Found a problem, fixing it', 'This is a normal part of building. Nothing you need to do.');
    add(`<div class="event problem"><div class="event-head"><span class="event-icon warn"><i data-lucide="search-check"></i></span>
      <span class="event-title"><strong>Found a problem: the calendar opened on last month</strong><span>Customers would have seen September instead of October. The Fixer is on it, and your saved version is safe.</span></span></div></div>`);
    team([
      { who: 'checker', doing: 'Found the problem', state: 'done' },
      { who: 'fixer', doing: 'Fixing the calendar', state: 'working' },
      { who: 'builder', doing: 'Paused until the fix is in', state: 'waiting' }
    ]);
    live('Fixer is fixing the calendar');
    await wait(3600);
    clearLive();
    S.warn = false;
    $('#month').textContent = 'October';
    $('#month').classList.remove('wrong');
    complete(4);
    add(`<div class="event fixed"><div class="event-head"><span class="event-icon ok"><i data-lucide="check"></i></span>
      <span class="event-title"><strong>Fixed: the calendar opens on this month</strong><span>Tried 3 more bookings to be sure. All worked.</span></span></div></div>`);
    headline('Building your app', buildingSub());
    await wait(700);
    save('Booking page works');
    await wait(1000);

    for (const i of [5, 6, 7, 8]) await buildStep(i);

    // Final check.
    S.stage = 2; S.now = 9; renderProgress(); renderPlan();
    headline('Checking everything', 'Trying your whole app the way a customer would');
    team([
      { who: 'checker', doing: 'Booking, emails and sign-in, start to finish', state: 'working' },
      { who: 'builder', doing: 'Done building', state: 'done' },
      { who: 'designer', doing: 'Checking it looks right on phones', state: 'working' }
    ]);
    live('Checker is testing your whole app');
    await wait(3000);
    clearLive();
    complete(9);
    mark('end');
    S.stage = 3; renderProgress();
    save('Ready to share');
    headline('Your app is ready to try', 'All 10 steps done and checked · Saved as Version ' + S.versions[0].num);
    team([
      { who: 'builder', doing: 'Built 4 pages and the emails', state: 'done' },
      { who: 'checker', doing: 'Tested 12 bookings, all worked', state: 'done' },
      { who: 'fixer', doing: 'Fixed 1 problem along the way', state: 'done' }
    ]);
    const ready = add(`<div class="event ready"><span style="font-size:1.0625rem"><strong>Your booking app is ready to try.</strong> Every step was checked, and a full booking works from start to finish.</span>
      <div class="actions"><button class="btn btn-primary" data-try><i data-lucide="play"></i>Try it myself</button><button class="btn"><i data-lucide="share-2"></i>Share with a friend</button></div></div>`);
    ready.querySelector('[data-try]').addEventListener('click', () => showTab('preview'));
    $('#pause-helpers').hidden = true;
    finished = true; running = false;
    setPlayLabel();
  }

  /* ---------- controls ---------- */

  function setPlayLabel() {
    const b = $('#demo-play');
    const label = finished ? 'Play again' : !running ? 'Play build' : paused ? 'Continue' : 'Pause';
    const icon = running && !paused ? 'pause' : 'play';
    b.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
    $('#pause-helpers').innerHTML = paused ? '<i data-lucide="play"></i>Continue' : '<i data-lucide="pause"></i>Pause';
    icons();
  }

  function reset() {
    gen++;
    clearLive();
    S = fresh();
    paused = false; running = false; finished = false;
    $('#thread').innerHTML = '';
    $('#team').innerHTML = '';
    teamPinned = false;
    $('#progress').classList.remove('compact', 'collapsed');
    $('#team-toggle').textContent = 'Hide';
    $('#hello').hidden = false;
    $('#progress').hidden = true;
    $('#pause-helpers').hidden = true;
    $('#site-empty').hidden = false;
    $('#site-empty').innerHTML = EMPTY_START;
    $('#site').classList.remove('branded');
    $$('#site [data-step]').forEach((n) => n.classList.remove('shown', 'fresh'));
    $('#month').textContent = 'October'; $('#month').classList.remove('wrong');
    $('#saved-chip span').textContent = 'All work saved';
    $('#msg').value = 'Build a booking app for my dog grooming shop. Customers pick a groomer and a time, then get a confirmation email.';
    renderProgress(); renderTeam(); renderPlan(); renderVersions();
    setPlayLabel();
  }

  function start(text) {
    if (finished) reset();
    running = true; paused = false;
    $('#msg').value = '';
    setPlayLabel();
    script(text).catch(() => { /* restarted */ });
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    setPlayLabel();
  }

  $('#demo-play').addEventListener('click', () => {
    if (!running) start($('#msg').value.trim() || 'Build a booking app for my dog grooming shop.');
    else togglePause();
  });
  $('#pause-helpers').addEventListener('click', togglePause);
  $('#demo-restart').addEventListener('click', reset);
  $('#demo-speed').addEventListener('click', () => {
    speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
    $('#demo-speed').textContent = speed + '×';
  });
  function jump(name) { reset(); skipTo = name; start('Build a booking app for my dog grooming shop. Customers pick a groomer and a time, then get a confirmation email.'); }
  $('#demo-problem').addEventListener('click', () => jump('problem'));
  $('#demo-done').addEventListener('click', () => jump('end'));
  $('#team-toggle').addEventListener('click', () => {
    // The founder's choice wins over the automatic shrink from here on.
    teamPinned = true;
    $('#progress').classList.remove('compact');
    const c = $('#progress').classList.toggle('collapsed');
    $('#team-toggle').textContent = c ? 'Show' : 'Hide';
    $('#team-toggle').setAttribute('aria-expanded', String(!c));
  });

  $('#composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('#msg').value.trim();
    if (!text) return;
    if (!running && !finished) { start(text); return; }
    $('#msg').value = '';
    you(text);
    setTimeout(() => reply(finished
      ? 'Got it. (This is a sample, so nothing more gets built here. Press Play again to watch the build once more.)'
      : 'Got it. I\'ll add that to the plan once the current step is done.'), 600);
  });
  $('#msg').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#composer').requestSubmit(); }
  });

  reset();
})();
