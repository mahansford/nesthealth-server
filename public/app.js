// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 M Hansford. See LICENSE.
/* NestHealth – vanilla JS single-page app (iOS 26 style) */
'use strict';

// ============ Icons ============
const ICONS = {
  back: '<path d="M15 4l-8 8 8 8"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  thermo: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/><path d="M11.5 17.5v-6"/>',
  pill: '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M8.6 8.6l6.8 6.8"/>',
  note: '<path d="M20 4H4v13h4v3.5l4.5-3.5H20z"/><path d="M8 9h8M8 12.5h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.7 0 4.5 1.8 4.5 4.8"/>',
  home: '<path d="M3.5 10.5L12 3.5l8.5 7"/><path d="M5.5 9v11h13V9"/><path d="M10 20v-5.5h4V20"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  bell: '<path d="M18 16V11a6 6 0 0 0-12 0v5l-2 2h16z"/><path d="M10 21h4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  camera: '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  phone: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

// ============ Utils ============
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('fh.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('fh.' + k, JSON.stringify(v)); } catch {} },
};
const HOUR = 36e5, DAY = 864e5;
const COLORS = ['#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#30B0C7', '#007AFF', '#5856D6', '#AF52DE', '#A2845E', '#8E8E93'];
const METHODS = [['ear', 'Ear'], ['mouth', 'Mouth'], ['armpit', 'Armpit'], ['forehead', 'Forehead']];
const WEBHOOK_FORMATS = [['json', 'JSON'], ['ntfy', 'ntfy'], ['discord', 'Discord'], ['slack', 'Slack']];

const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
function fmtDay(ms) {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(ms)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return new Date(ms).toLocaleDateString([], { weekday: 'long' });
  return new Date(ms).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}
const fmtWhen = (ms) => { const d = fmtDay(ms); return (d === 'Today' ? '' : d + ', ') + fmtTime(ms); };
function fmtAgo(ms) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60 ? (m % 60) + 'm ' : ''}ago`;
  return fmtWhen(ms);
}
function fmtIn(ms) {
  const m = Math.ceil((ms - Date.now()) / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${m % 60 ? ' ' + (m % 60) + 'm' : ''}`;
}
const toLocalInput = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromLocalInput = (s) => (s ? new Date(s).getTime() : Date.now());
function ageText(dob) {
  const m = Dosing.ageMonths(dob);
  if (m == null || m < 0) return '';
  if (m < 24) return `${m} month${m === 1 ? '' : 's'}`;
  return `${Math.floor(m / 12)} years`;
}

// AGPL section 13: people using this web app must be able to get its source code.
// If you run a modified version for others, point this at your own source.
const SOURCE_URL = 'https://github.com/mahansford/nesthealth-server';
const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

// ============ Temperature ============
const unit = () => S.settings.unit || 'C';
const toDisp = (c) => (unit() === 'F' ? c * 9 / 5 + 32 : c);
const fromDisp = (v) => (unit() === 'F' ? (v - 32) * 5 / 9 : v);
const fmtNum = (c) => toDisp(c).toFixed(1);
const fmtTemp = (c) => `${fmtNum(c)}°${unit()}`;
function level(c) {
  if (c < 35.5) return { label: 'Low', c: 'var(--teal)' };
  if (c < 37.5) return { label: 'Normal', c: 'var(--green)' };
  if (c < 38) return { label: 'Raised', c: 'var(--yellow)', ink: 'var(--yellow-ink)', fg: 'rgba(0,0,0,.75)' };
  if (c < 39) return { label: 'Fever', c: 'var(--orange)' };
  return { label: 'High fever', c: 'var(--red)' };
}
const lvlPill = (c) => { const l = level(c); return `<span class="lvl" style="--c:${l.c};--fg:${l.fg || '#fff'}">${l.label}</span>`; };
const ink = (c) => { const l = level(c); return l.ink || l.c; }; // readable text colour

// ============ State & API ============
const S = {
  people: [], parents: [], medicines: [], settings: { notify: {} }, webhooks: [], devices: [], vapidPublicKey: '',
  entries: [], days: 30, chartRange: store.get('chartRange', 24), loaded: false,
  me: store.get('me', null), pushEndpoint: null, unlockedUntil: 0,
  user: null, // signed-in account
  personDoses: [], // each child's usual dose per medicine, entered by the parent
};

async function api(method, url, body) {
  const headers = { 'X-Requested-With': 'fetch' };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch('/api/' + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.startsWith('auth/')) { signedOut(); throw new Error('Please sign in'); }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function applyState(st) {
  for (const k of ['people', 'parents', 'medicines', 'personDoses', 'settings', 'webhooks', 'devices', 'vapidPublicKey']) if (k in st) S[k] = st[k];
  if (st.me) { S.user = st.me; if (st.me.parent_id) S.me = st.me.parent_id; }
  return st;
}
async function loadAll() {
  const [st, entries] = await Promise.all([api('GET', 'state'), api('GET', 'entries?days=' + S.days)]);
  applyState(st);
  S.entries = entries;
  S.loaded = true;
}
const person = (id) => S.people.find((p) => p.id === id);
const parent = (id) => S.parents.find((p) => p.id === id);
const me = () => parent(S.me);
const entriesFor = (pid) => S.entries.filter((e) => e.person_id === pid).sort((a, b) => b.at - a.at);
function upsertEntry(e) { const i = S.entries.findIndex((x) => x.id === e.id); if (i >= 0) S.entries[i] = e; else S.entries.push(e); }

// ============ Medicine timing ============
const entryMedKey = (e) => (e.medicine_id ? 'id:' + e.medicine_id : 'n:' + (e.medicine_name || '').toLowerCase());
const medKey = (m) => (m.id ? 'id:' + m.id : 'n:' + (m.name || '').toLowerCase());
function medStatus(pid, med, excludeId) {
  const key = medKey(med);
  const doses = S.entries.filter((e) => e.person_id === pid && e.type === 'med' && e.id !== excludeId && entryMedKey(e) === key);
  return Dosing.doseStatus(doses, Dosing.rulesFor(med, person(pid)));
}
const hasRules = (med, p) => { const r = Dosing.rulesFor(med, p); return !!(r.interval || r.max); };
function recentMeds(pid) {
  const seen = new Map();
  for (const e of entriesFor(pid)) {
    if (e.type !== 'med' || e.at < Date.now() - DAY) continue;
    const k = entryMedKey(e);
    if (seen.has(k)) continue;
    const med = S.medicines.find((m) => m.id === e.medicine_id) || { name: e.medicine_name };
    seen.set(k, { name: med.name, med, st: medStatus(pid, med) });
  }
  return [...seen.values()];
}
function medChip(pid, { name, med, st }) {
  if (!hasRules(med, person(pid))) return `<span class="chip" style="--c:var(--indigo)">${icon('pill')}${esc(name)} · ${fmtTime(st.last.at)}</span>`;
  if (st.ready) return `<span class="chip" style="--c:var(--green)">${icon('check')}${esc(name)} · can give now</span>`;
  return `<span class="chip" style="--c:var(--orange)">${icon('clock')}${esc(name)} · next ${fmtTime(st.nextAt)}</span>`;
}
// A child's usual dose of each medicine (entered by the parent from the label)
const savedDose = (pid, mid) => S.personDoses.find((d) => d.person_id === pid && d.medicine_id === mid)?.dose;
function quickDoses(p) {
  return S.personDoses.filter((d) => d.person_id === p.id)
    .map((d) => ({ m: S.medicines.find((x) => x.id === d.medicine_id), dose: d.dose })).filter((x) => x.m);
}

// ============ Router ============
const TABS = [['#/', 'Family', 'home'], ['#/log', 'Log', 'list'], ['#/settings', 'Settings', 'gear']];
const tabOf = (h) => (h.startsWith('#/log') ? '#/log' : h.startsWith('#/settings') ? '#/settings' : '#/');
const routeDepth = (h) => (h.startsWith('#/person/') || /^#\/settings\/.+/.test(h) ? 1 : 0);
const scrollMemo = {};
let currentHash = null, lastDepth = 0;

function render(animate = false) {
  const hash = location.hash || '#/';
  const app = $('#app');
  let view;
  const m = hash.match(/^#\/person\/(\d+)/);
  if (!S.loaded) view = { html: '' };
  else if (hash.startsWith('#/settings') && settingsLocked()) view = viewLocked();
  else if (m && person(+m[1])) view = viewPerson(+m[1]);
  else if (hash === '#/log') view = viewLog();
  else if (hash === '#/settings/parents') view = viewParents();
  else if (hash === '#/settings/notifications') view = viewNotifications();
  else if (hash === '#/settings/account') view = viewAccount();
  else if (hash === '#/settings/accounts') view = viewAccounts();
  else if (hash.startsWith('#/settings')) view = viewSettings();
  else view = viewHome();

  const depth = routeDepth(hash);
  const changed = hash !== currentHash;
  if (changed && currentHash) scrollMemo[currentHash] = window.scrollY;
  app.innerHTML = view.html;
  const page = $('.page', app);
  if (animate && changed && page && currentHash) {
    const sameTab = tabOf(hash) === tabOf(currentHash);
    page.classList.add(!sameTab ? 'fade' : depth >= lastDepth ? 'push' : 'pop');
  }
  if (changed) window.scrollTo(0, depth < lastDepth || tabOf(hash) !== tabOf(currentHash || '') ? scrollMemo[hash] || 0 : 0);
  lastDepth = depth;
  currentHash = hash;
  $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === tabOf(hash)));
  view.onMount && view.onMount(app);
  bindCommon(app);
  updateNav();
}
function updateNav() { const nav = $('.nav'); if (nav) nav.classList.toggle('compact', window.scrollY > 30); }
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('hashchange', () => { openSheets.forEach((close) => close()); render(true); });
const go = (h) => { location.hash = h; };

function navBar({ title, left = '', right = '' }) {
  return `<header class="nav"><div class="nav-inner"><div class="nav-left">${left}</div><div class="nav-title">${esc(title)}</div><div class="nav-right">${right}</div></div></header>`;
}
const backBtn = (to, label) => `<button class="gbtn icon back glass" data-go="${to}" aria-label="Back to ${esc(label)}">${icon('back')}</button>`;
function avatar(p, cls = '') {
  if (!p) return '';
  const inner = p.photo ? `<img src="/photos/${esc(p.photo)}" alt="">` : p.emoji ? esc(p.emoji) : esc(p.name.trim()[0]?.toUpperCase() || '?');
  return `<div class="avatar ${!p.photo && p.emoji ? 'emoji' : ''} ${cls}" style="--c:${esc(p.color)}">${inner}</div>`;
}

function bindCommon(root) {
  $$('[data-go]', root).forEach((b) => { if (!b._b) { b._b = 1; b.addEventListener('click', () => go(b.dataset.go)); } });
  $$('[data-add]', root).forEach((b) => { if (!b._b) { b._b = 1; b.addEventListener('click', (ev) => { ev.stopPropagation(); ({ temp: tempSheet, med: medSheet, note: noteSheet })[b.dataset.add](+b.dataset.pid); }); } });
  $$('[data-entry]', root).forEach((b) => { if (!b._b) { b._b = 1; b.addEventListener('click', () => { const e = S.entries.find((x) => x.id === +b.dataset.entry); if (e) ({ temp: tempSheet, med: medSheet, note: noteSheet })[e.type](e.person_id, e); }); } });
}

// ============ Home ============
function viewHome() {
  const cards = S.people.map((p) => {
    const es = entriesFor(p.id);
    const lastT = es.find((e) => e.type === 'temp');
    const meds = recentMeds(p.id);
    const tempHtml = lastT
      ? `<div><div class="temp-big" style="color:${ink(lastT.temp_c)}"><span class="v">${fmtNum(lastT.temp_c)}</span><span class="u">°${unit()}</span></div><div class="temp-when">${fmtAgo(lastT.at)}</div></div>`
      : `<div class="temp-when">No readings</div>`;
    const meta = [ageText(p.dob), lastT && lastT.at > Date.now() - DAY ? level(lastT.temp_c).label : ''].filter(Boolean).join(' · ');
    return `
      <div class="person-card">
        <button class="person-card-top" data-go="#/person/${p.id}">
          ${avatar(p)}
          <div class="row-main"><div class="person-name">${esc(p.name)}</div><div class="person-meta">${esc(meta) || '&nbsp;'}</div></div>
          ${tempHtml}
        </button>
        ${meds.length ? `<div class="chips">${meds.map((x) => medChip(p.id, x)).join('')}</div>` : ''}
        <div class="card-actions">
          <button data-add="temp" data-pid="${p.id}">${icon('thermo')}Temperature</button>
          <button data-add="med" data-pid="${p.id}">${icon('pill')}Medicine</button>
        </div>
      </div>`;
  }).join('');

  const empty = `
    <div class="empty">
      <div class="big-ic">${icon('people')}</div>
      <h2>Add your family</h2>
      <p>Add each person you want to track temperatures and medicines for.</p>
      <button class="btn-primary" data-new-person>${icon('plus')}Add Person</button>
      <button class="btn-plain" data-demo style="margin-top:8px">Try it with sample data</button>
    </div>`;

  const m = me();
  const right = S.user
    ? `<button class="gbtn icon glass" data-go="#/settings/account" aria-label="Your account">${m ? avatar(m, 'sm') : icon('person')}</button>`
    : S.parents.length ? `<button class="gbtn icon glass" data-who aria-label="Who's using this phone">${m ? avatar(m, 'sm') : icon('person')}</button>` : '';
  return {
    html: `
      ${navBar({ title: 'Family', right })}
      <main class="page">
        <h1 class="large-title">Family</h1>
        ${S.people.length ? cards : empty}
        ${S.people.length ? `<p class="disclaimer">Doses and timings are the ones you've entered. Always follow the label on your medicine or ask a pharmacist.</p>` : ''}
      </main>`,
    onMount(root) {
      $('[data-new-person]', root)?.addEventListener('click', () => profileSheet('people'));
      $('[data-who]', root)?.addEventListener('click', () => whoSheet());
      $('[data-demo]', root)?.addEventListener('click', async () => {
        try { applyState(await api('POST', 'demo')); await loadAll(); S.me = null; render(); toast('Sample family added'); maybeAskWho(); } catch (e) { toast(e.message, true); }
      });
    },
  };
}

// ============ History rows ============
function histRow(e, withPerson = false) {
  let tile, title, sub = [];
  if (e.type === 'temp') {
    tile = `<div class="icon-tile" style="background:${level(e.temp_c).c}">${icon('thermo')}</div>`;
    title = `<b style="font-weight:600">${fmtTemp(e.temp_c)}</b> ${lvlPill(e.temp_c)}`;
    sub.push(METHODS.find((m) => m[0] === e.method)?.[1]);
  } else if (e.type === 'med') {
    tile = `<div class="icon-tile" style="background:var(--indigo)">${icon('pill')}</div>`;
    title = `${esc(e.medicine_name)}${e.dose ? ` <span style="color:var(--label-2)">${esc(e.dose)}</span>` : ''}`;
  } else {
    tile = `<div class="icon-tile" style="background:var(--gray)">${icon('note')}</div>`;
    title = esc(e.note);
  }
  if (e.type !== 'note' && e.note) sub.push(e.note);
  if (e.by_name) sub.push('by ' + e.by_name);
  const p = person(e.person_id);
  if (withPerson && p) { sub.unshift(p.name); tile = `<div style="position:relative">${tile}<div style="position:absolute;right:-7px;bottom:-7px;border-radius:50%;box-shadow:0 0 0 2px var(--card)">${avatar(p, 'sm')}</div></div>`; }
  sub = sub.filter(Boolean).map(esc).join(' · ');
  return `<button class="row has-icon" data-entry="${e.id}">${tile}
    <div class="row-main"><div class="row-title">${title}</div>${sub ? `<div class="row-sub">${sub}</div>` : ''}</div>
    <div class="row-value">${fmtTime(e.at)}</div></button>`;
}
function historyGroups(list, withPerson) {
  const groups = [];
  for (const e of list) {
    const d = fmtDay(e.at);
    if (!groups.length || groups[groups.length - 1].d !== d) groups.push({ d, items: [] });
    groups[groups.length - 1].items.push(e);
  }
  return groups.map((g) => `<div class="section"><div class="section-header">${g.d}</div><div class="group">${g.items.map((e) => histRow(e, withPerson)).join('')}</div></div>`).join('');
}
const olderBtn = () => (S.days < 3650 ? `<div style="text-align:center"><button class="btn-plain" data-older>Show older records</button></div>` : '');
function bindOlder(root) {
  $('[data-older]', root)?.addEventListener('click', async () => { S.days = 3650; S.entries = await api('GET', 'entries?days=' + S.days); render(); });
}

// ============ Log (all family) ============
function viewLog() {
  const list = [...S.entries].sort((a, b) => b.at - a.at);
  return {
    html: `${navBar({ title: 'Log' })}
      <main class="page">
        <h1 class="large-title">Log</h1>
        ${list.length ? historyGroups(list, true) : `<div class="empty"><div class="big-ic">${icon('list')}</div><h2>Nothing logged yet</h2><p>Temperatures, medicines and notes for the whole family will appear here.</p></div>`}
        ${list.length ? olderBtn() : ''}
      </main>`,
    onMount: bindOlder,
  };
}

// ============ Person detail ============
function viewPerson(pid) {
  const p = person(pid);
  const es = entriesFor(pid);
  const temps = es.filter((e) => e.type === 'temp');
  const lastT = temps[0];
  const peak = temps.filter((e) => e.at > Date.now() - DAY).reduce((m, e) => (!m || e.temp_c > m.temp_c ? e : m), null);
  const qd = quickDoses(p);
  const qdIds = new Set(qd.map((x) => x.m.id));
  const meds = recentMeds(pid).filter((x) => !qdIds.has(x.med.id));

  const stat = (label, ic, t, sub) => `
    <div class="stat"><div class="stat-label">${icon(ic)}${label}</div>
    ${t ? `<div class="stat-value" style="color:${ink(t.temp_c)}">${fmtNum(t.temp_c)}<small>°${unit()}</small></div><div class="stat-sub">${sub}</div>`
        : `<div class="stat-value" style="color:var(--label-3)">–</div><div class="stat-sub">&nbsp;</div>`}</div>`;

  const doseRows = qd.map(({ m, dose }) => {
    const st = medStatus(pid, m);
    const r = Dosing.rulesFor(m);
    let sub = [r.interval ? `every ${r.interval}h` : '', r.max ? `max ${r.max} in 24h` : ''].filter(Boolean).join(' · ') || 'No timing set';
    if (st.last) sub = `Last ${fmtWhen(st.last.at)}${st.last.by_name ? ' by ' + esc(st.last.by_name) : ''}${r.max ? ` · ${st.count24}/${r.max} in 24h` : ''}`;
    const btn = st.ready
      ? `<button class="give-btn" data-give="${m.id}">Give ${esc(dose)}</button>`
      : `<button class="give-btn wait" data-give="${m.id}">${fmtTime(st.nextAt)}</button>`;
    return `<div class="dose-row" data-edit-dose="${m.id}"><div class="icon-tile" style="background:var(--pink)">${icon('pill')}</div>
      <div class="row-main"><div class="row-title" style="font-weight:600">${esc(m.name)}</div><div class="row-sub wrap">${sub}</div>${!st.ready ? `<div class="row-sub status-wait">Next dose in ${fmtIn(st.nextAt)}</div>` : ''}</div>${btn}</div>`;
  }).join('');

  const medRows = meds.map(({ name, med, st }) => {
    let sub = `Last ${fmtWhen(st.last.at)}${st.last.dose ? ' · ' + esc(st.last.dose) : ''}`;
    let value = '';
    if (hasRules(med, p)) {
      value = st.ready ? `<span class="status-ok">Can give now</span>` : `<span class="status-wait">${fmtTime(st.nextAt)}</span>`;
      if (!st.ready) sub += ` · in ${fmtIn(st.nextAt)}`;
    }
    return `<div class="row has-icon"><div class="icon-tile" style="background:var(--indigo)">${icon('pill')}</div>
      <div class="row-main"><div class="row-title">${esc(name)}</div><div class="row-sub wrap">${sub}</div></div><div class="row-value">${value}</div></div>`;
  }).join('');

  return {
    html: `
      ${navBar({ title: p.name, left: backBtn('#/', 'Family'), right: `<button class="gbtn glass" data-edit-person>Edit</button>` })}
      <main class="page">
        <div class="profile">
          ${avatar(p, 'lg')}
          <h1>${esc(p.name)}</h1>
          <div class="person-meta">${esc([ageText(p.dob), p.weight_kg ? p.weight_kg + ' kg' : ''].filter(Boolean).join(' · ')) || '&nbsp;'}</div>
        </div>
        <div class="quick-actions">
          <button class="qa" data-add="temp" data-pid="${pid}" style="--c:var(--orange)"><div class="qa-ic">${icon('thermo')}</div>Temperature</button>
          <button class="qa" data-add="med" data-pid="${pid}" style="--c:var(--indigo)"><div class="qa-ic">${icon('pill')}</div>Medicine</button>
          <button class="qa" data-add="note" data-pid="${pid}" style="--c:var(--gray)"><div class="qa-ic">${icon('note')}</div>Note</button>
        </div>

        <div class="section"><div class="section-header big">Quick Dose</div><div class="group">${doseRows}
          <button class="row action" data-add-dose>${icon('plus')}${qd.length ? 'Add Another' : `Save ${esc(p.name)}'s usual dose`}</button></div>
          <div class="section-footer">${qd.length ? 'Tap a medicine to change or remove its dose.' : `Save the dose from your medicine's label once, then give it with one tap.`} Always check it matches the label or your pharmacist's advice.</div></div>

        <div class="stat-grid">
          ${stat('Latest', 'thermo', lastT, lastT ? fmtAgo(lastT.at) : '')}
          ${stat('Highest 24h', 'arrowUp', peak, peak ? fmtWhen(peak.at) : '')}
        </div>
        <div class="chart-card" style="--c:${esc(p.color)}">
          <div class="segmented" data-range>
            ${[[24, '24H'], [72, '3D'], [168, '7D'], [720, '30D']].map(([h, l]) => `<button data-h="${h}" class="${S.chartRange === h ? 'on' : ''}">${l}</button>`).join('')}
          </div>
          <div class="chart" id="chart"></div>
        </div>

        ${meds.length ? `<div class="section"><div class="section-header big">Other Medicines</div><div class="group">${medRows}</div></div>` : ''}

        <div class="section" style="margin-bottom:10px"><div class="section-header big">History</div>
          ${es.length ? '' : `<div class="group"><div class="row"><div class="row-main" style="color:var(--label-2)">Nothing logged yet. Tap Temperature or Medicine above to start.</div></div></div>`}</div>
        ${historyGroups(es)}
        ${es.length ? olderBtn() : ''}
      </main>`,
    onMount(root) {
      $$('[data-edit-person]', root).forEach((b) => b.addEventListener('click', () => profileSheet('people', p)));
      $$('[data-give]', root).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); quickGive(p, S.medicines.find((m) => m.id === +b.dataset.give)); }));
      $$('[data-edit-dose]', root).forEach((b) => b.addEventListener('click', () => usualDoseSheet(p, S.medicines.find((m) => m.id === +b.dataset.editDose))));
      $('[data-add-dose]', root)?.addEventListener('click', () => usualDoseSheet(p));
      $$('[data-range] button', root).forEach((b) => b.addEventListener('click', () => {
        S.chartRange = +b.dataset.h; store.set('chartRange', S.chartRange);
        $$('[data-range] button', root).forEach((x) => x.classList.toggle('on', x === b));
        drawChart($('#chart', root), pid);
      }));
      bindOlder(root);
      drawChart($('#chart', root), pid);
    },
  };
}

async function quickGive(p, m) {
  const dose = savedDose(p.id, m.id);
  if (!dose) return medSheet(p.id, null, m.id);
  if (!(await confirmTooSoon(p, m))) return;
  const i = await alertDialog({
    title: `Give ${p.name} ${dose} of ${m.name}?`,
    message: 'This is the usual dose you saved. Check it still matches the label on your bottle.',
    buttons: [{ label: 'Cancel' }, { label: 'Give', role: 'primary' }],
  });
  if (i !== 1) return;
  await saveEntry(null, { person_id: p.id, type: 'med', at: Date.now(), medicine_id: m.id, medicine_name: m.name, dose, by_parent_id: S.me });
}

/** Save or change a child's usual dose of a medicine (copied by the parent from the label). */
function usualDoseSheet(p, med) {
  const saved = med ? savedDose(p.id, med.id) : '';
  const options = S.medicines.filter((m) => m.id === med?.id || !savedDose(p.id, m.id));
  openSheet({
    title: med ? 'Usual Dose' : 'Save a Usual Dose',
    done: 'Save',
    body: `${personHeader(p, 'Quick Dose')}
      <div class="section"><div class="group">
        <div class="row"><div class="row-main">Medicine</div><select class="field" name="med" style="flex:none" ${med ? 'disabled' : ''}>
          ${options.map((m) => `<option value="${m.id}" ${m.id === med?.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
        <div class="row"><div class="row-main">Dose</div><input class="field right" name="dose" placeholder="e.g. 5 ml" autocomplete="off" value="${esc(saved || '')}" style="max-width:160px"></div>
      </div><div class="section-footer">Copy this from the label on ${esc(p.name)}'s medicine, or ask your pharmacist. Check it again as they grow. Timings are set for each medicine in Settings.</div></div>
      ${med ? `<div class="section"><div class="group"><button class="row destructive" data-remove>Remove from Quick Dose</button></div></div>` : ''}`,
    onMount(sh, close) {
      const dose = $('[name=dose]', sh), done = $('[data-done]', sh);
      const paint = () => { done.disabled = !dose.value.trim() || !options.length; };
      dose.addEventListener('input', paint); paint();
      setTimeout(() => dose.focus(), 450);
      $('[data-remove]', sh)?.addEventListener('click', async () => {
        applyState(await api('PUT', `people/${p.id}/doses`, { medicine_id: med.id, dose: '' })); close(); render();
      });
    },
    async onDone(sh) {
      applyState(await api('PUT', `people/${p.id}/doses`, { medicine_id: +$('[name=med]', sh).value, dose: $('[name=dose]', sh).value }));
      render(); toast('Saved');
    },
  });
}
async function confirmTooSoon(p, med, at = Date.now(), excludeId) {
  if (at < Date.now() - 5 * 60000) return true;
  const st = medStatus(p.id, med, excludeId);
  if (st.ready) return true;
  const rules = Dosing.rulesFor(med);
  const why = st.reason === 'max'
    ? `${p.name} has had ${st.count24} dose${st.count24 === 1 ? '' : 's'} of ${med.name} in the last 24 hours (max ${rules.max}).`
    : `The last dose was at ${fmtTime(st.last.at)}${st.last.by_name ? ' by ' + st.last.by_name : ''}. ${med.name} should be at least ${rules.interval} hours apart.`;
  const i = await alertDialog({
    title: 'Too soon for another dose',
    message: `${why} The next dose can be given from ${fmtTime(st.nextAt)}.`,
    buttons: [{ label: 'Log Anyway', role: 'destructive' }, { label: 'Cancel', role: 'primary' }],
  });
  return i === 0;
}

// ============ Chart ============
function drawChart(el, pid) {
  const hours = S.chartRange, now = Date.now(), x0 = now - hours * HOUR;
  const es = entriesFor(pid);
  const temps = es.filter((e) => e.type === 'temp' && e.at >= x0).sort((a, b) => a.at - b.at);
  const meds = es.filter((e) => e.type === 'med' && e.at >= x0);
  if (!temps.length && !meds.length) { el.innerHTML = `<div class="chart-empty">No readings in this period</div>`; return; }
  const W = Math.max(el.clientWidth, 260), H = 190, padL = 30, padR = 8, padT = 8, padB = 22;
  const vals = temps.map((t) => toDisp(t.temp_c));
  const stepY = unit() === 'F' ? 2 : 1;
  let yMin = Math.floor(Math.min(toDisp(36), ...vals) / stepY) * stepY, yMax = Math.ceil(Math.max(toDisp(39), ...vals) / stepY) * stepY;
  if (yMax - yMin < stepY * 2) yMax = yMin + stepY * 2;
  const X = (t) => padL + ((t - x0) / (now - x0)) * (W - padL - padR);
  const Y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB);
  let svg = '';
  const fy = Y(toDisp(38));
  if (fy > padT) svg += `<rect class="fever-band" x="${padL}" y="${padT}" width="${W - padL - padR}" height="${Math.max(0, fy - padT)}"/><line class="fever-line" x1="${padL}" x2="${W - padR}" y1="${fy}" y2="${fy}"/>`;
  for (let v = yMin; v <= yMax + 1e-9; v += stepY) {
    const y = Y(v);
    svg += `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/><text class="axis-label" x="${padL - 6}" y="${y + 3.5}" text-anchor="end">${v}°</text>`;
  }
  const ticks = [];
  if (hours <= 24) {
    const t = new Date(x0); t.setMinutes(0, 0, 0); t.setHours(Math.ceil((t.getHours() + 1) / 6) * 6);
    for (let ms = t.getTime(); ms <= now; ms += 6 * HOUR) ticks.push([ms, fmtTime(ms)]);
  } else {
    let i = 0;
    for (let ms = startOfDay(x0) + DAY; ms <= now; ms += DAY, i++) {
      if (i % (hours <= 168 ? 1 : 5) === 0) ticks.push([ms, new Date(ms).toLocaleDateString([], hours <= 168 ? { weekday: 'short' } : { day: 'numeric', month: 'short' })]);
    }
  }
  for (const [ms, label] of ticks) {
    const x = X(ms);
    svg += `<line class="grid-line" x1="${x}" x2="${x}" y1="${padT}" y2="${H - padB}" opacity=".5"/><text class="axis-label" x="${x}" y="${H - 6}" text-anchor="middle">${label}</text>`;
  }
  for (const m of meds) {
    const x = X(m.at);
    svg += `<line class="med-mark" x1="${x}" x2="${x}" y1="${padT}" y2="${H - padB}"/><circle class="med-dot" cx="${x}" cy="${H - padB}" r="3.5"><title>${esc(m.medicine_name)} ${fmtTime(m.at)}</title></circle>`;
  }
  if (temps.length) {
    const pts = temps.map((t) => [X(t.at), Y(toDisp(t.temp_c))]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
    if (pts.length > 1) svg += `<path class="area" d="${d}L${pts[pts.length - 1][0]},${H - padB}L${pts[0][0]},${H - padB}Z"/><path class="line" d="${d}"/>`;
    const r = temps.length > 40 ? 2.5 : 4;
    temps.forEach((t, i) => { svg += `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="${r}" fill="${level(t.temp_c).c}" stroke="var(--card)" stroke-width="1.5"><title>${fmtTemp(t.temp_c)} ${fmtWhen(t.at)}</title></circle>`; });
  }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}">${svg}</svg>
    <div class="chart-legend"><span><i style="background:var(--red);opacity:.4"></i>Fever ≥ ${fmtTemp(38).replace('.0', '')}</span>${meds.length ? `<span><i style="background:var(--indigo)"></i>Medicine</span>` : ''}</div>`;
}

// ============ Settings ============
function settingsLocked() { return S.settings.hasPin && Date.now() > S.unlockedUntil; }
function viewLocked() {
  return {
    html: `${navBar({ title: 'Settings' })}<main class="page"><h1 class="large-title">Settings</h1>
      <div class="empty"><div class="big-ic">${icon('lock')}</div><h2>Settings are locked</h2><p>Enter the parent passcode to change settings.</p>
      <button class="btn-primary" data-unlock>Enter Passcode</button></div></main>`,
    onMount(root) {
      const ask = () => passcodeSheet({ title: 'Enter Passcode', onEnter: async (pin) => {
        const r = await api('POST', 'pin/verify', { pin });
        if (r.ok) { S.unlockedUntil = Date.now() + 10 * 60e3; setTimeout(render, 50); }
        return r.ok;
      } });
      $('[data-unlock]', root).addEventListener('click', ask);
      if (!$('.passcode')) setTimeout(ask, 250);
    },
  };
}

function viewSettings() {
  const people = S.people.map((p) => `
    <button class="row has-avatar" data-person="${p.id}">${avatar(p)}<div class="row-main"><div class="row-title">${esc(p.name)}</div>${p.dob ? `<div class="row-sub">${esc(ageText(p.dob))}</div>` : ''}</div>${icon('chev', 'chev')}</button>`).join('');
  const meds = S.medicines.map((m) => {
    const rules = [m.min_interval_h ? `every ${m.min_interval_h}h` : '', m.max_per_24h ? `max ${m.max_per_24h}/day` : ''].filter(Boolean).join(', ');
    return `<button class="row has-icon" data-med="${m.id}"><div class="icon-tile" style="background:var(--indigo)">${icon('pill')}</div>
      <div class="row-main"><div class="row-title">${esc(m.name)}</div><div class="row-sub">${esc([m.default_dose, rules].filter(Boolean).join(' · ') || 'No timing rules')}</div></div>${icon('chev', 'chev')}</button>`;
  }).join('');
  const channels = [S.devices.length ? `${S.devices.length} device${S.devices.length === 1 ? '' : 's'}` : '', S.webhooks.length ? `${S.webhooks.length} webhook${S.webhooks.length === 1 ? '' : 's'}` : ''].filter(Boolean).join(', ') || 'Off';
  const m = me();

  return {
    html: `
      ${navBar({ title: 'Settings' })}
      <main class="page">
        <h1 class="large-title">Settings</h1>
        ${S.user ? `<div class="section"><div class="section-header">Account</div><div class="group">
          <button class="row has-avatar" data-go="#/settings/account">${m ? avatar(m) : `<div class="avatar" style="--c:var(--gray)">${icon('person')}</div>`}
            <div class="row-main"><div class="row-title">${esc(S.user.name)}</div><div class="row-sub">${esc(S.user.email)}</div></div>${icon('chev', 'chev')}</button>
          ${S.user.is_admin ? `<button class="row has-icon" data-go="#/settings/accounts"><div class="icon-tile" style="background:var(--blue)">${icon('people')}</div>
            <div class="row-main"><div class="row-title">Family Accounts</div><div class="row-sub">Who can sign in</div></div>${icon('chev', 'chev')}</button>` : ''}
        </div></div>` : ''}
        <div class="section"><div class="section-header">Parents</div><div class="group">
          <button class="row has-avatar" data-go="#/settings/parents">
            ${m ? avatar(m) : `<div class="avatar" style="--c:var(--gray)">${icon('person')}</div>`}
            <div class="row-main"><div class="row-title">Parents &amp; Carers</div><div class="row-sub">${m ? `This iPhone: ${esc(m.name)}` : S.parents.length ? `${S.parents.map((x) => esc(x.name)).join(', ')}` : 'Record who gave each dose'}</div></div>${icon('chev', 'chev')}</button>
          <button class="row has-icon" data-go="#/settings/notifications"><div class="icon-tile" style="background:var(--red)">${icon('bell')}</div>
            <div class="row-main"><div class="row-title">Notifications</div><div class="row-sub">${channels}</div></div>${icon('chev', 'chev')}</button>
          <button class="row has-icon" data-pin><div class="icon-tile" style="background:var(--gray)">${icon('lock')}</div>
            <div class="row-main"><div class="row-title">Settings Passcode</div></div><div class="row-value">${S.settings.hasPin ? 'On' : 'Off'}</div>${icon('chev', 'chev')}</button>
        </div><div class="section-footer">A passcode stops little fingers from changing settings. Logging stays open to everyone.</div></div>

        <div class="section"><div class="section-header">Family</div>
          <div class="group">${people}<button class="row action" data-new-person>${icon('plus')}Add Person</button></div></div>

        <div class="section"><div class="section-header">Medicines</div>
          <div class="group">${meds}<button class="row action" data-new-med>${icon('plus')}Add Medicine</button></div>
          <div class="section-footer">Set the minimum time between doses and the maximum in 24 hours from each medicine's label, so the app can show when the next dose is allowed.</div></div>

        <div class="section"><div class="section-header">Temperature</div>
          <div class="group"><div class="row"><div class="row-main">Units</div>
            <div class="segmented" data-unit style="width:130px">${['C', 'F'].map((u) => `<button data-u="${u}" class="${unit() === u ? 'on' : ''}">°${u}</button>`).join('')}</div>
          </div></div></div>

        <div class="section"><div class="section-header">Data</div>
          <div class="group"><a class="row has-icon" href="/api/export.csv" download>
            <div class="icon-tile" style="background:var(--green)">${icon('download')}</div><div class="row-main">Export all records (CSV)</div>${icon('chev', 'chev')}</a>
          </div>
          <div class="section-footer">Records are stored on your home server and shared by everyone who uses this app.</div></div>
        <p class="disclaimer">NestHealth is a logbook, not medical advice. If you're worried about someone's temperature or symptoms, contact your GP or call NHS 111.<br><br>
          <a href="/privacy.html" target="_blank" rel="noopener">Privacy Policy</a> · <a href="/support.html" target="_blank" rel="noopener">Support</a> · <a href="${SOURCE_URL}" target="_blank" rel="noopener">Source code</a> (AGPL)</p>
      </main>`,
    onMount(root) {
      $$('[data-person]', root).forEach((b) => b.addEventListener('click', () => profileSheet('people', person(+b.dataset.person))));
      $$('[data-med]', root).forEach((b) => b.addEventListener('click', () => medicineSheet(S.medicines.find((x) => x.id === +b.dataset.med))));
      $('[data-new-person]', root).addEventListener('click', () => profileSheet('people'));
      $('[data-new-med]', root).addEventListener('click', () => medicineSheet());
      $('[data-pin]', root).addEventListener('click', pinSettings);
      $$('[data-unit] button', root).forEach((b) => b.addEventListener('click', async () => { applyState(await api('PUT', 'settings', { unit: b.dataset.u })); render(); }));
    },
  };
}

// ============ Parents page ============
function viewParents() {
  const rows = S.parents.map((p) => `
    <button class="row has-avatar" data-parent="${p.id}">${avatar(p)}<div class="row-main"><div class="row-title">${esc(p.name)}</div>${p.id === S.me ? '<div class="row-sub">This iPhone</div>' : ''}</div>${icon('chev', 'chev')}</button>`).join('');
  const who = S.parents.map((p) => `<button class="row" data-me="${p.id}"><div class="row-main">${esc(p.name)}</div>${p.id === S.me ? icon('check', 'check') : ''}</button>`).join('');
  return {
    html: `
      ${navBar({ title: 'Parents & Carers', left: backBtn('#/settings', 'Settings') })}
      <main class="page">
        <h1 class="large-title">Parents</h1>
        <div class="section"><div class="group">${rows}<button class="row action" data-new-parent>${icon('plus')}Add Parent or Carer</button></div>
          <div class="section-footer">Each dose and reading shows who logged it, so everyone knows what's been given.</div></div>
        ${S.parents.length && !S.user ? `<div class="section"><div class="section-header">Who uses this iPhone?</div><div class="group">${who}
          <button class="row" data-me="0"><div class="row-main" style="color:var(--label-2)">Not set</div>${!me() ? icon('check', 'check') : ''}</button></div>
          <div class="section-footer">Entries from this iPhone are labelled with this name. You won't be notified about your own entries.</div></div>` : ''}
      </main>`,
    onMount(root) {
      $$('[data-parent]', root).forEach((b) => b.addEventListener('click', () => profileSheet('parents', parent(+b.dataset.parent))));
      $('[data-new-parent]', root).addEventListener('click', () => profileSheet('parents'));
      $$('[data-me]', root).forEach((b) => b.addEventListener('click', () => setMe(+b.dataset.me || null)));
    },
  };
}
async function setMe(id) {
  S.me = id; store.set('me', id);
  if (S.pushEndpoint) await enablePush(true).catch(() => {}); // re-link this device's notifications
  render();
}
let askedWho = false;
function maybeAskWho() {
  if (S.user) return; // signed-in accounts already know who they are
  if (askedWho || !S.parents.length || me() || store.get('whoSkipped', false)) return;
  askedWho = true;
  whoSheet(true);
}
function whoSheet(firstRun = false) {
  openSheet({
    title: "Who's using this iPhone?",
    done: null,
    body: `<div class="section"><div class="group">${S.parents.map((p) => `<button class="row has-avatar" data-pick="${p.id}">${avatar(p)}<div class="row-main">${esc(p.name)}</div>${p.id === S.me ? icon('check', 'check') : ''}</button>`).join('')}</div>
      <div class="section-footer">Doses and readings you log will show your name.${firstRun ? ' You can change this later in Settings.' : ''}</div></div>`,
    onMount(sh, close) {
      $$('[data-pick]', sh).forEach((b) => b.addEventListener('click', () => { setMe(+b.dataset.pick); close(); }));
    },
    onCancel() { if (firstRun) store.set('whoSkipped', true); },
  });
}

// ============ Notifications page ============
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
function pushHelp() {
  const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!window.isSecureContext) return 'Push notifications need the app to be opened over HTTPS. See the README for easy options (Tailscale, Caddy or a Cloudflare Tunnel). Webhooks work without it.';
  if (iOS && !isStandalone) return 'On iPhone, first add NestHealth to your Home Screen (Share → Add to Home Screen), then open it from there to turn on notifications.';
  if (!pushSupported()) return 'This browser does not support push notifications.';
  return '';
}
function viewNotifications() {
  const n = S.settings.notify || {};
  const help = pushHelp();
  const sw = (key, label, sub) => `<div class="row"><div class="row-main"><div class="row-title">${label}</div>${sub ? `<div class="row-sub wrap">${sub}</div>` : ''}</div>
    <label class="switch"><input type="checkbox" data-n="${key}" ${n[key] ? 'checked' : ''}><span></span></label></div>`;
  const devices = S.devices.map((d) => `<button class="row has-icon" data-device="${d.id}"><div class="icon-tile" style="background:var(--blue)">${icon('phone')}</div>
    <div class="row-main"><div class="row-title">${esc(d.device || 'Device')}${d.endpoint === S.pushEndpoint ? ' (this one)' : ''}</div><div class="row-sub">${esc(parent(d.parent_id)?.name || 'No parent set')}${d.last_status && d.last_status >= 400 ? ' · last send failed' : ''}</div></div></button>`).join('');
  const hooks = S.webhooks.map((h) => `<button class="row has-icon" data-hook="${h.id}"><div class="icon-tile" style="background:${h.enabled ? 'var(--purple)' : 'var(--gray)'}">${icon('link')}</div>
    <div class="row-main"><div class="row-title">${esc(h.name)}</div><div class="row-sub">${esc(WEBHOOK_FORMATS.find((f) => f[0] === h.format)?.[1] || h.format)} · ${h.enabled ? (h.last_status == null ? 'Not sent yet' : h.last_status >= 200 && h.last_status < 300 ? 'Working' : 'Last send failed') : 'Off'}</div></div>${icon('chev', 'chev')}</button>`).join('');
  const thr = toDisp(n.feverC || 38);
  const devName = /iPad/.test(navigator.userAgent) ? 'iPad' : /iPhone/.test(navigator.userAgent) ? 'iPhone' : 'Device';

  return {
    html: `
      ${navBar({ title: 'Notifications', left: backBtn('#/settings', 'Settings') })}
      <main class="page">
        <h1 class="large-title">Notifications</h1>
        <div class="section"><div class="section-header">This ${devName}</div><div class="group">
          <div class="row"><div class="row-main">Push Notifications</div>
            <label class="switch"><input type="checkbox" data-push ${S.pushEndpoint ? 'checked' : ''} ${help ? 'disabled' : ''}><span></span></label></div>
        </div>${help ? `<div class="section-footer">${help}</div>` : ''}</div>

        <div class="section"><div class="section-header">Notify About</div><div class="group">
          ${sw('doseDue', 'Medicine can be given again', 'When the minimum time since the last dose has passed')}
          ${sw('doseGiven', 'Medicine given', 'When another parent logs a dose')}
          ${sw('fever', 'Fever logged', 'When another parent logs a high temperature')}
          <div class="row"><div class="row-main">Fever from</div><span class="stepper-val">${thr.toFixed(1)}°</span>
            <div class="stepper"><button data-thr="-1" aria-label="Lower">−</button><button data-thr="1" aria-label="Higher">+</button></div></div>
          <div class="row"><div class="row-main">Remind to recheck temperature</div>
            <select class="field" data-check style="flex:none">${[[0, 'Off'], [1, 'After 1 hour'], [2, 'After 2 hours'], [4, 'After 4 hours']].map(([v, l]) => `<option value="${v}" ${+n.checkH === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        </div><div class="section-footer">These settings apply to every device and webhook.</div></div>

        ${devices ? `<div class="section"><div class="section-header">Devices</div><div class="group">${devices}</div></div>` : ''}

        <div class="section"><div class="section-header">Webhooks</div><div class="group">${hooks}
          <button class="row action" data-new-hook>${icon('plus')}Add Webhook</button></div>
          <div class="section-footer">Send alerts to Home Assistant, ntfy, Discord, Slack, Node-RED and similar. JSON format sends event, title, message, person, time and data.</div></div>

        <div class="section"><div class="group"><button class="row action" data-test style="justify-content:center">Send Test Notification</button></div></div>
      </main>`,
    onMount(root) {
      const save = async (patch) => { applyState(await api('PUT', 'settings', { notify: { ...S.settings.notify, ...patch } })); render(); };
      $$('[data-n]', root).forEach((i) => i.addEventListener('change', () => save({ [i.dataset.n]: i.checked })));
      $$('[data-thr]', root).forEach((b) => b.addEventListener('click', () => {
        const step = unit() === 'F' ? 5 / 9 : 0.5; // 1°F or 0.5°C
        save({ feverC: Math.round(((n.feverC || 38) + step * +b.dataset.thr) * 100) / 100 });
      }));
      $('[data-check]', root).addEventListener('change', (e) => save({ checkH: +e.target.value }));
      $('[data-push]', root).addEventListener('change', async (e) => {
        try { if (e.target.checked) { await enablePush(); toast('Notifications on'); } else { await disablePush(); toast('Notifications off'); } }
        catch (err) { toast(err.message, true); }
        render();
      });
      $$('[data-device]', root).forEach((b) => b.addEventListener('click', async () => {
        const i = await alertDialog({ title: 'Remove this device?', message: 'It will stop receiving notifications.', buttons: [{ label: 'Cancel' }, { label: 'Remove', role: 'destructive' }] });
        if (i === 1) { applyState(await api('POST', 'push/unsubscribe', { id: +b.dataset.device })); render(); }
      }));
      $$('[data-hook]', root).forEach((b) => b.addEventListener('click', () => webhookSheet(S.webhooks.find((h) => h.id === +b.dataset.hook))));
      $('[data-new-hook]', root).addEventListener('click', () => webhookSheet());
      $('[data-test]', root).addEventListener('click', async () => {
        const { results } = await api('POST', 'notify/test', { endpoint: S.pushEndpoint || null });
        if (!results.length) return toast('Turn on push notifications for this device first', true);
        const bad = results.filter((r) => r.error || r.status >= 300).length;
        toast(bad ? `${bad} of ${results.length} failed` : `Sent to ${results.length}`, !!bad);
        await loadAll(); render();
      });
    },
  };
}

// Web Push
const b64ToBytes = (s) => { const b = atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };
function deviceName() {
  const ua = navigator.userAgent;
  const kind = /iPad/.test(ua) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows PC' : 'Browser';
  return me() ? `${me().name}'s ${kind}` : kind;
}
async function enablePush(silent = false) {
  const reg = await navigator.serviceWorker.ready;
  if (!silent && (await Notification.requestPermission()) !== 'granted') throw new Error('Notifications were not allowed');
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(S.vapidPublicKey) });
  applyState(await api('POST', 'push/subscribe', { subscription: sub.toJSON(), parent_id: S.me, device: deviceName() }));
  S.pushEndpoint = sub.endpoint;
}
async function disablePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) { applyState(await api('POST', 'push/unsubscribe', { endpoint: sub.endpoint })); await sub.unsubscribe(); }
  S.pushEndpoint = null;
}
async function checkPush() {
  if (!pushSupported() || !window.isSecureContext) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    S.pushEndpoint = sub && S.devices.some((d) => d.endpoint === sub.endpoint) ? sub.endpoint : null;
  } catch {}
}

// ============ Passcode ============
function passcodeSheet({ title, subtitle = '', onEnter, onCancel }) {
  let pin = '';
  return openSheet({
    title: '', done: null,
    body: `<div class="passcode"><h2>${esc(title)}</h2>${subtitle ? `<div class="inline-note" style="margin-top:-12px">${esc(subtitle)}</div>` : ''}
      <div class="pin-dots">${'<i></i>'.repeat(4)}</div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-d="${d}">${d}</button>`).join('')}<button class="blank" disabled></button><button data-d="0">0</button><button class="txt" data-del>Delete</button></div></div>`,
    onMount(sh, close) {
      const dots = $('.pin-dots', sh);
      const paint = () => $$('i', dots).forEach((d, i) => d.classList.toggle('on', i < pin.length));
      const press = async (d) => {
        if (pin.length >= 4) return;
        pin += d; paint();
        if (pin.length === 4) {
          const ok = await onEnter(pin).catch(() => false);
          if (ok) close();
          else { dots.classList.add('shake'); setTimeout(() => { dots.classList.remove('shake'); pin = ''; paint(); }, 420); }
        }
      };
      $$('[data-d]', sh).forEach((b) => b.addEventListener('click', () => press(b.dataset.d)));
      $('[data-del]', sh).addEventListener('click', () => { pin = pin.slice(0, -1); paint(); });
      const onKey = (e) => { if (/^\d$/.test(e.key)) press(e.key); if (e.key === 'Backspace') { pin = pin.slice(0, -1); paint(); } };
      document.addEventListener('keydown', onKey);
      sh._cleanup = () => document.removeEventListener('keydown', onKey);
    },
    onCancel() { if (onCancel) onCancel(); else if (settingsLocked() && location.hash.startsWith('#/settings')) go('#/'); },
  });
}
const askPin = (title, subtitle) => new Promise((resolve) => {
  passcodeSheet({ title, subtitle, onEnter: async (pin) => { resolve(pin); return true; }, onCancel: () => resolve(null) });
});
async function pinSettings() {
  if (!S.settings.hasPin) {
    const a = await askPin('Set a Passcode', 'Needed to open Settings');
    if (!a) return;
    const b = await askPin('Confirm Passcode');
    if (!b) return;
    if (a !== b) return toast("Passcodes didn't match", true);
    applyState(await api('PUT', 'pin', { pin: a, current: '' }));
    S.unlockedUntil = Date.now() + 10 * 60e3;
    render(); return toast('Passcode on');
  }
  const i = await alertDialog({ title: 'Settings Passcode', buttons: [{ label: 'Change Passcode' }, { label: 'Turn Passcode Off', role: 'destructive' }, { label: 'Cancel', role: 'primary' }] });
  if (i === 2) return;
  const cur = await askPin('Enter Current Passcode');
  if (!cur) return;
  try {
    if (i === 1) { applyState(await api('PUT', 'pin', { pin: '', current: cur })); toast('Passcode off'); }
    else {
      const a = await askPin('New Passcode'); if (!a) return;
      const b = await askPin('Confirm Passcode'); if (!b) return;
      if (a !== b) return toast("Passcodes didn't match", true);
      applyState(await api('PUT', 'pin', { pin: a, current: cur })); toast('Passcode changed');
    }
  } catch (e) { toast(e.message, true); }
  render();
}

// ============ Overlays: sheet, alert, toast ============
const openSheets = new Set();
function openSheet({ title, done = 'Add', body, onMount, onDone, onCancel, full = false, cancellable = true }) {
  const root = $('#overlay-root');
  const bd = document.createElement('div'); bd.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet' + (full ? ' full' : '');
  sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
  sh.innerHTML = `<div class="sheet-bar">${cancellable ? `<button class="gbtn icon" data-cancel aria-label="Cancel">${icon('x')}</button>` : '<span></span>'}<div class="sheet-title">${esc(title)}</div>
    ${done ? `<button class="gbtn icon tint done" data-done aria-label="${esc(done)}">${icon('check')}</button>` : '<span></span>'}</div><div class="sheet-body">${body}</div>`;
  root.append(bd, sh);
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => requestAnimationFrame(() => { bd.classList.add('show'); sh.classList.add('show'); }));

  let closed = false;
  const close = (cancelled = false) => {
    if (closed) return; closed = true;
    openSheets.delete(close);
    sh._cleanup && sh._cleanup();
    if (cancelled === true && onCancel) onCancel();
    sh.style.transform = ''; sh.classList.remove('show', 'dragging'); bd.classList.remove('show');
    setTimeout(() => { bd.remove(); sh.remove(); if (!$('.sheet', root)) document.body.classList.remove('sheet-open'); }, 420);
  };
  openSheets.add(close);
  if (cancellable) {
    bd.addEventListener('click', () => close(true));
    $('[data-cancel]', sh).addEventListener('click', () => close(true));
  }
  const doneBtn = $('[data-done]', sh);
  doneBtn?.addEventListener('click', async () => {
    doneBtn.disabled = true;
    try { if ((await onDone(sh, close)) !== false) close(); else doneBtn.disabled = false; }
    catch (e) { toast(e.message, true); doneBtn.disabled = false; }
  });
  // swipe the grabber bar down to dismiss
  const bar = $('.sheet-bar', sh);
  let y0 = null, dy = 0;
  bar.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; sh.classList.add('dragging'); bar.setPointerCapture(e.pointerId); });
  bar.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 == null) return; y0 = null; sh.classList.remove('dragging'); if (dy > 120) close(true); else sh.style.transform = ''; };
  bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);

  onMount && onMount(sh, close);
  return close;
}

function alertDialog({ title, message = '', buttons = [{ label: 'OK', role: 'primary' }] }) {
  return new Promise((resolve) => {
    const bd = document.createElement('div'); bd.className = 'alert-backdrop';
    bd.innerHTML = `<div class="alert" role="alertdialog"><div class="alert-body"><div class="alert-title">${esc(title)}</div>${message ? `<div class="alert-msg">${esc(message)}</div>` : ''}</div>
      <div class="alert-btns ${buttons.length > 2 ? 'stack' : ''}">${buttons.map((b, i) => `<button data-i="${i}" class="${b.role || ''}">${esc(b.label)}</button>`).join('')}</div></div>`;
    document.body.append(bd);
    requestAnimationFrame(() => bd.classList.add('show'));
    $$('button', bd).forEach((b) => b.addEventListener('click', () => { bd.classList.remove('show'); setTimeout(() => bd.remove(), 200); resolve(+b.dataset.i); }));
  });
}

let toastTimer;
function toast(msg, error = false) {
  $('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast glass' + (error ? ' error' : '');
  t.innerHTML = `${icon(error ? 'alert' : 'check')}${esc(msg)}`;
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2000);
}

// Shared form bits
const timeRow = (ms) => `<div class="row"><div class="row-main">Time</div><input class="field" type="datetime-local" name="at" value="${toLocalInput(ms)}"></div>`;
const noteRow = (v, ph = 'Notes (optional)') => `<div class="row"><textarea class="field" name="note" rows="2" placeholder="${ph}">${esc(v || '')}</textarea></div>`;
function byRow(existing) {
  if (!S.parents.length) return '';
  const sel = existing ? existing.by_parent_id : S.me;
  return `<div class="row"><div class="row-main">Logged by</div><select class="field" name="by" style="flex:none">
    <option value="">–</option>${S.parents.map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>`;
}
const byVal = (sh) => { const s = $('[name=by]', sh); return s ? (+s.value || null) : null; };
const deleteSection = (label = 'Delete Entry') => `<div class="section"><div class="group"><button class="row destructive" data-delete>${label}</button></div></div>`;
function bindDelete(sh, close, { title, message, label = 'Delete', action }) {
  $('[data-delete]', sh)?.addEventListener('click', async () => {
    const i = await alertDialog({ title, message, buttons: [{ label: 'Cancel' }, { label, role: 'destructive' }] });
    if (i !== 1) return;
    try { await action(); close(); render(); toast('Deleted'); } catch (e) { toast(e.message, true); }
  });
}
async function saveEntry(existing, data) {
  const e = existing ? await api('PUT', 'entries/' + existing.id, data) : await api('POST', 'entries', data);
  upsertEntry(e);
  render();
  toast(existing ? 'Updated' : 'Saved');
}
async function deleteEntry(e) { await api('DELETE', 'entries/' + e.id); S.entries = S.entries.filter((x) => x.id !== e.id); }
const personHeader = (p, sub) => `<div class="section"><div class="group"><div class="row">${avatar(p)}<div class="row-main"><div class="row-title" style="font-weight:600">${esc(p.name)}</div><div class="row-sub">${sub}</div></div></div></div></div>`;

// ============ Temperature sheet ============
function tempSheet(pid, existing) {
  const p = person(pid);
  const last = entriesFor(pid).find((e) => e.type === 'temp');
  let c = existing?.temp_c ?? last?.temp_c ?? 37.0;
  let method = existing?.method ?? store.get('method', 'ear');
  const isF = unit() === 'F';
  const [minD, maxD] = isF ? [95, 107] : [35, 42];
  openSheet({
    title: existing ? 'Edit Temperature' : 'Temperature',
    done: existing ? 'Save' : 'Add',
    body: `
      <div class="section"><div class="group">
        <div class="row">${avatar(p)}<div class="row-main"><div class="row-title" style="font-weight:600">${esc(p.name)}</div><div class="row-sub">${last && !existing ? `Last: ${fmtTemp(last.temp_c)}, ${fmtAgo(last.at)}` : 'Temperature'}</div></div></div>
        <div class="temp-dial">
          <button class="round-btn" data-step="-1" aria-label="Decrease">${icon('minus')}</button>
          <div class="temp-readout">
            <div class="num-wrap"><input class="temp-input" name="temp" inputmode="decimal" enterkeyhint="done" autocomplete="off" aria-label="Temperature"><span class="unit">°${unit()}</span></div>
            <div data-lvl></div>
          </div>
          <button class="round-btn" data-step="1" aria-label="Increase">${icon('plus')}</button>
        </div>
        <div class="slider-wrap">
          <input type="range" class="slider" min="${minD}" max="${maxD}" step="0.1" aria-label="Temperature slider">
          <div class="slider-scale">${(isF ? [95, 98, 101, 104, 107] : [35, 36, 37, 38, 39, 40, 41, 42]).map((v) => `<span>${v}°</span>`).join('')}</div>
        </div>
      </div></div>
      <div class="section"><div class="segmented" data-method>${METHODS.map(([k, l]) => `<button data-m="${k}" class="${method === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="section"><div class="group">${timeRow(existing?.at ?? Date.now())}${byRow(existing)}${noteRow(existing?.note, 'Notes, e.g. shivering, after bath')}</div></div>
      ${existing ? deleteSection() : ''}`,
    onMount(sh, close) {
      const input = $('[name=temp]', sh), slider = $('.slider', sh), lvlEl = $('[data-lvl]', sh), readout = $('.temp-readout', sh);
      const paint = (skipInput) => {
        const d = Math.round(toDisp(c) * 10) / 10;
        if (!skipInput) input.value = d.toFixed(1);
        slider.value = d;
        readout.style.setProperty('--c', ink(c));
        lvlEl.innerHTML = lvlPill(c);
      };
      const setDisp = (d) => { c = fromDisp(Math.min(maxD, Math.max(minD, Math.round(d * 10) / 10))); paint(); };
      paint();
      input.addEventListener('focus', () => input.select());
      input.addEventListener('input', () => { const v = parseFloat(input.value.replace(',', '.')); if (!Number.isNaN(v) && v >= minD && v <= maxD) { c = fromDisp(v); paint(true); } });
      input.addEventListener('blur', () => paint());
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
      slider.addEventListener('input', () => setDisp(+slider.value));
      $$('[data-step]', sh).forEach((b) => {
        let t1, t2;
        const stepOnce = () => setDisp(Math.round(toDisp(c) * 10) / 10 + 0.1 * +b.dataset.step);
        const stop = () => { clearTimeout(t1); clearInterval(t2); };
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); stepOnce(); t1 = setTimeout(() => { t2 = setInterval(stepOnce, 70); }, 400); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, stop));
      });
      $$('[data-method] button', sh).forEach((b) => b.addEventListener('click', () => {
        method = b.dataset.m; store.set('method', method);
        $$('[data-method] button', sh).forEach((x) => x.classList.toggle('on', x === b));
      }));
      bindDelete(sh, close, { title: 'Delete this reading?', action: () => deleteEntry(existing) });
    },
    async onDone(sh) {
      const v = parseFloat($('[name=temp]', sh).value.replace(',', '.'));
      if (!Number.isNaN(v)) c = fromDisp(v);
      await saveEntry(existing, { person_id: pid, type: 'temp', temp_c: Math.round(c * 100) / 100, method, at: fromLocalInput($('[name=at]', sh).value), note: $('[name=note]', sh).value, by_parent_id: byVal(sh) });
    },
  });
}

// ============ Medicine sheet ============
function medSheet(pid, existing, preselect) {
  const p = person(pid);
  const lastDoseOf = (med) => entriesFor(pid).find((e) => e.type === 'med' && entryMedKey(e) === medKey(med) && e.id !== existing?.id);
  let sel = preselect || (existing ? (existing.medicine_id && S.medicines.some((m) => m.id === existing.medicine_id) ? existing.medicine_id : 'other') : null);
  const list = S.medicines;
  const medRow = (m) => {
    const st = medStatus(pid, m, existing?.id);
    const usual = savedDose(pid, m.id);
    let sub = usual ? `Usual dose <b style="color:var(--label);font-weight:600">${esc(usual)}</b>` : '';
    if (st.last) sub = [sub, `Last ${fmtWhen(st.last.at)}`].filter(Boolean).join(' · ');
    if (!st.ready) sub += ` · <span class="status-wait">next from ${fmtTime(st.nextAt)}</span>`;
    else if (st.last && hasRules(m, p)) sub += ` · <span class="status-ok">can give now</span>`;
    if (!sub) sub = esc([m.default_dose, m.min_interval_h ? `every ${m.min_interval_h}h` : ''].filter(Boolean).join(' · ')) || '&nbsp;';
    return `<button class="row has-icon" data-pick="${m.id}"><div class="icon-tile" style="background:${usual ? 'var(--pink)' : 'var(--indigo)'}">${icon('pill')}</div>
      <div class="row-main"><div class="row-title">${esc(m.name)}</div><div class="row-sub wrap">${sub}</div></div><span class="ck">${icon('check', 'check')}</span></button>`;
  };
  openSheet({
    title: existing ? 'Edit Medicine' : 'Medicine',
    done: existing ? 'Save' : 'Add',
    body: `
      ${personHeader(p, existing ? 'Medicine' : 'Which medicine?')}
      <div class="section"><div class="group">
        ${list.map(medRow).join('')}
        <button class="row has-icon" data-pick="other"><div class="icon-tile" style="background:var(--gray)">${icon('plus')}</div><div class="row-main"><div class="row-title">Other</div></div><span class="ck">${icon('check', 'check')}</span></button>
        <div class="row" data-other-row><input class="field" name="other" placeholder="Medicine name" autocomplete="off" value="${existing && sel === 'other' ? esc(existing.medicine_name) : ''}"></div>
      </div></div>
      <div class="section"><div class="group">
        <div class="row"><div class="row-main">Dose</div><input class="field right" name="dose" placeholder="e.g. 5 ml" autocomplete="off" value="${esc(existing?.dose || '')}"></div>
        <div class="row" data-remember-row><div class="row-main"><div class="row-title">Save as ${esc(p.name)}'s usual dose</div><div class="row-sub">Adds it to Quick Dose</div></div>
          <label class="switch"><input type="checkbox" name="remember"><span></span></label></div>
        ${timeRow(existing?.at ?? Date.now())}
        ${byRow(existing)}
        ${noteRow(existing?.note)}
      </div></div>
      ${existing ? deleteSection() : ''}`,
    onMount(sh, close) {
      const done = $('[data-done]', sh), dose = $('[name=dose]', sh), other = $('[name=other]', sh), remember = $('[name=remember]', sh);
      const paint = () => {
        $$('[data-pick]', sh).forEach((b) => { $('.ck', b).style.visibility = String(sel) === b.dataset.pick ? 'visible' : 'hidden'; });
        $('[data-other-row]', sh).classList.toggle('hidden', sel !== 'other');
        done.disabled = !sel || (sel === 'other' && !other.value.trim());
        // Offer to remember the dose for Quick Dose when this child doesn't have one saved yet.
        const show = !existing && typeof sel === 'number' && !savedDose(pid, sel);
        $('[data-remember-row]', sh).classList.toggle('hidden', !show);
        if (!show) remember.checked = false;
      };
      const pick = (id, init) => {
        sel = id;
        if (sel === 'other') { if (!init) setTimeout(() => other.focus(), 50); }
        else if (!(existing && init)) {
          const m = S.medicines.find((x) => x.id === sel);
          dose.value = savedDose(pid, m.id) || lastDoseOf(m)?.dose || m.default_dose || '';
        }
        paint();
      };
      $$('[data-pick]', sh).forEach((b) => b.addEventListener('click', () => pick(b.dataset.pick === 'other' ? 'other' : +b.dataset.pick)));
      other.addEventListener('input', paint);
      if (sel && sel !== 'other') pick(sel, true); else paint();
      bindDelete(sh, close, { title: 'Delete this dose?', action: () => deleteEntry(existing) });
    },
    async onDone(sh) {
      const at = fromLocalInput($('[name=at]', sh).value);
      const med = sel === 'other' ? null : S.medicines.find((m) => m.id === sel);
      if (med && !(await confirmTooSoon(p, med, at, existing?.id))) return false;
      const d = $('[name=dose]', sh).value.trim();
      if (med && d && $('[name=remember]', sh).checked) applyState(await api('PUT', `people/${pid}/doses`, { medicine_id: med.id, dose: d }));
      await saveEntry(existing, {
        person_id: pid, type: 'med', at, medicine_id: med?.id ?? null, medicine_name: med ? med.name : $('[name=other]', sh).value,
        dose: $('[name=dose]', sh).value, note: $('[name=note]', sh).value, by_parent_id: byVal(sh),
      });
    },
  });
}

// ============ Note sheet ============
function noteSheet(pid, existing) {
  const p = person(pid);
  openSheet({
    title: existing ? 'Edit Note' : 'Note',
    done: existing ? 'Save' : 'Add',
    body: `${personHeader(p, 'Symptoms, drinks, sleep…')}
      <div class="section"><div class="group">${noteRow(existing?.note, 'e.g. Rash on chest, drank 200 ml, vomited once')}${timeRow(existing?.at ?? Date.now())}${byRow(existing)}</div></div>
      ${existing ? deleteSection() : ''}`,
    onMount(sh, close) {
      const ta = $('[name=note]', sh), done = $('[data-done]', sh);
      const paint = () => { done.disabled = !ta.value.trim(); };
      ta.addEventListener('input', paint); paint();
      if (!existing) setTimeout(() => ta.focus(), 450);
      bindDelete(sh, close, { title: 'Delete this note?', action: () => deleteEntry(existing) });
    },
    async onDone(sh) {
      await saveEntry(existing, { person_id: pid, type: 'note', note: $('[name=note]', sh).value, at: fromLocalInput($('[name=at]', sh).value), by_parent_id: byVal(sh) });
    },
  });
}

// ============ Photo helper ============
function pickPhoto() {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return resolve(null);
      const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => {
        const size = 360, s = Math.min(img.naturalWidth, img.naturalHeight);
        const cv = document.createElement('canvas'); cv.width = cv.height = size;
        cv.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => { toast("Couldn't read that image", true); resolve(null); };
      img.src = url;
    };
    inp.click();
  });
}

// ============ Person / parent edit sheet ============
function profileSheet(kind, existing) {
  const isChild = kind === 'people';
  const list = isChild ? S.people : S.parents;
  let color = existing?.color || COLORS[(list.length + (isChild ? 0 : 6)) % COLORS.length];
  let photo = existing?.photo ? `/photos/${existing.photo}` : null, photoChanged = false;
  openSheet({
    title: existing ? `Edit ${isChild ? 'Person' : 'Parent'}` : `New ${isChild ? 'Person' : 'Parent'}`,
    done: existing ? 'Save' : 'Add',
    body: `
      <div class="profile" style="padding-top:4px;padding-bottom:22px"><div data-preview></div>
        <div class="photo-actions"><button class="pill-btn" data-photo>${icon('camera')}<span data-photo-label></span></button><button class="pill-btn danger" data-rm-photo>Remove</button></div></div>
      <div class="section"><div class="group">
        <div class="row"><input class="field" name="name" placeholder="${isChild ? 'Name' : 'Name, e.g. Mum'}" autocomplete="off" value="${esc(existing?.name || '')}"></div>
        <div class="row"><div class="row-main">Emoji</div><input class="field right" name="emoji" placeholder="Optional" maxlength="4" autocomplete="off" value="${esc(existing?.emoji || '')}" style="max-width:120px"></div>
      </div><div class="section-footer">The emoji is shown when there's no photo.</div></div>
      <div class="section"><div class="section-header">Colour</div><div class="group">
        <div class="swatches">${COLORS.map((c) => `<button class="swatch" data-c="${c}" style="--c:${c}" aria-label="Colour ${c}"></button>`).join('')}</div>
      </div></div>
      ${isChild ? `<div class="section"><div class="group">
        <div class="row"><div class="row-main">Date of birth</div><input class="field" type="date" name="dob" value="${esc(existing?.dob || '')}"></div>
        <div class="row"><div class="row-main">Weight (kg)</div><input class="field right" name="weight" inputmode="decimal" placeholder="Optional" value="${existing?.weight_kg ?? ''}" style="max-width:120px"></div>
      </div><div class="section-footer">Optional. Handy when checking a medicine label or speaking to a pharmacist or doctor.</div></div>` : ''}
      ${existing ? deleteSection(`Delete ${isChild ? 'Person' : 'Parent'}`) : ''}`,
    onMount(sh, close) {
      const name = $('[name=name]', sh), emoji = $('[name=emoji]', sh), done = $('[data-done]', sh);
      const paint = () => {
        $('[data-preview]', sh).innerHTML = avatar({ name: name.value || '?', emoji: emoji.value.trim(), color }, 'lg');
        if (photo) $('[data-preview] .avatar', sh).insertAdjacentHTML('beforeend', `<img src="${esc(photo)}" alt="">`);
        $('[data-photo-label]', sh).textContent = photo ? 'Change Photo' : 'Add Photo';
        $('[data-rm-photo]', sh).classList.toggle('hidden', !photo);
        done.disabled = !name.value.trim();
        $$('.swatch', sh).forEach((s) => s.classList.toggle('on', s.dataset.c === color));
      };
      [name, emoji].forEach((i) => i.addEventListener('input', paint));
      $$('.swatch', sh).forEach((s) => s.addEventListener('click', () => { color = s.dataset.c; paint(); }));
      $('[data-photo]', sh).addEventListener('click', async () => { const d = await pickPhoto(); if (d) { photo = d; photoChanged = true; paint(); } });
      $('[data-rm-photo]', sh).addEventListener('click', () => { photo = null; photoChanged = true; paint(); });
      paint();
      if (!existing) setTimeout(() => name.focus(), 450);
      bindDelete(sh, close, {
        title: `Delete ${existing?.name}?`,
        message: isChild ? 'All of their temperature and medicine records will be permanently deleted.' : 'Past records keep their name.',
        action: async () => {
          applyState(await api('DELETE', `${kind}/${existing.id}`));
          if (isChild) { S.entries = S.entries.filter((e) => e.person_id !== existing.id); if (location.hash.startsWith('#/person/')) go('#/'); }
          else if (S.me === existing.id) setMe(null);
        },
      });
    },
    async onDone(sh) {
      const body = { name: $('[name=name]', sh).value, emoji: $('[name=emoji]', sh).value.trim(), color };
      if (isChild) Object.assign(body, { dob: $('[name=dob]', sh).value || null, weight_kg: $('[name=weight]', sh).value.replace(',', '.') });
      const r = applyState(existing ? await api('PUT', `${kind}/${existing.id}`, body) : await api('POST', kind, body));
      if (photoChanged) applyState(photo ? await api('POST', `${kind}/${r.id}/photo`, { data: photo }) : await api('DELETE', `${kind}/${r.id}/photo`));
      if (!isChild && !existing && !me()) { S.me = r.id; store.set('me', r.id); }
      render();
    },
  });
}

// ============ Medicine edit sheet ============
function medicineSheet(existing) {
  let interval = existing?.min_interval_h ?? 4, maxd = existing?.max_per_24h ?? 4;
  openSheet({
    title: existing ? 'Edit Medicine' : 'New Medicine',
    done: existing ? 'Save' : 'Add',
    body: `
      <div class="section"><div class="group">
        <div class="row"><input class="field" name="name" placeholder="Name, as on the box" autocomplete="off" value="${esc(existing?.name || '')}"></div>
      </div></div>
      <div>
        <div class="section"><div class="group">
          <div class="row"><div class="row-main">Adult dose</div><input class="field right" name="dose" placeholder="Optional" autocomplete="off" value="${esc(existing?.default_dose || '')}" style="max-width:160px"></div>
        </div><div class="section-footer">Children's doses are saved for each child under Quick Dose on their page.</div></div>
        <div class="section"><div class="section-header">Timing</div><div class="group">
          <div class="row"><div class="row-main">Hours between doses</div><span class="stepper-val" data-iv></span>
            <div class="stepper"><button data-s="iv" data-d="-1">−</button><button data-s="iv" data-d="1">+</button></div></div>
          <div class="row"><div class="row-main">Max doses in 24h</div><span class="stepper-val" data-mx></span>
            <div class="stepper"><button data-s="mx" data-d="-1">−</button><button data-s="mx" data-d="1">+</button></div></div>
        </div><div class="section-footer">Copy these from the packet or leaflet. Set to “–” for no limit.</div></div>
      </div>
      ${existing ? deleteSection('Delete Medicine') : ''}`,
    onMount(sh, close) {
      const name = $('[name=name]', sh), done = $('[data-done]', sh);
      const paint = () => {
        $('[data-iv]', sh).textContent = interval ? `${interval}h` : '–';
        $('[data-mx]', sh).textContent = maxd || '–';
        done.disabled = !name.value.trim();
      };
      $$('[data-s]', sh).forEach((b) => b.addEventListener('click', () => {
        const d = +b.dataset.d;
        if (b.dataset.s === 'iv') interval = Math.max(0, Math.min(48, (interval || 0) + d)); else maxd = Math.max(0, Math.min(24, (maxd || 0) + d));
        paint();
      }));
      name.addEventListener('input', paint);
      paint();
      bindDelete(sh, close, { title: `Delete ${existing?.name}?`, message: 'It will be removed from the list. Past doses stay in the history.', action: async () => applyState(await api('DELETE', 'medicines/' + existing.id)) });
    },
    async onDone(sh) {
      const body = { name: $('[name=name]', sh).value, default_dose: $('[name=dose]', sh).value, min_interval_h: interval || null, max_per_24h: maxd || null };
      applyState(existing ? await api('PUT', 'medicines/' + existing.id, body) : await api('POST', 'medicines', body));
      render();
    },
  });
}

// ============ Webhook sheet ============
function webhookSheet(existing) {
  let format = existing?.format || 'json';
  openSheet({
    title: existing ? 'Edit Webhook' : 'New Webhook',
    done: existing ? 'Save' : 'Add',
    body: `
      <div class="section"><div class="group">
        <div class="row"><input class="field" name="name" placeholder="Name, e.g. Home Assistant" autocomplete="off" value="${esc(existing?.name || '')}"></div>
        <div class="row"><input class="field" name="url" type="url" inputmode="url" placeholder="https://…" autocomplete="off" autocapitalize="off" value="${esc(existing?.url || '')}"></div>
      </div></div>
      <div class="section"><div class="section-header">Format</div><div class="segmented" data-format>${WEBHOOK_FORMATS.map(([k, l]) => `<button data-f="${k}" class="${format === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="section-footer" data-format-help></div></div>
      <div class="section"><div class="group"><div class="row"><div class="row-main">Enabled</div><label class="switch"><input type="checkbox" name="enabled" ${existing?.enabled === 0 ? '' : 'checked'}><span></span></label></div>
        ${existing ? `<button class="row action" data-test-hook>Send Test</button>` : ''}</div></div>
      ${existing ? deleteSection('Delete Webhook') : ''}`,
    onMount(sh, close) {
      const help = { json: 'Sends JSON. Works with Home Assistant webhook triggers, Node-RED, n8n and others.', ntfy: 'Use your topic URL, e.g. https://ntfy.sh/your-secret-topic', discord: 'Use a Discord channel webhook URL.', slack: 'Use a Slack incoming webhook URL.' };
      const url = $('[name=url]', sh), done = $('[data-done]', sh);
      const paint = () => { $('[data-format-help]', sh).textContent = help[format]; done.disabled = !/^https?:\/\/.+/i.test(url.value.trim()); };
      $$('[data-format] button', sh).forEach((b) => b.addEventListener('click', () => { format = b.dataset.f; $$('[data-format] button', sh).forEach((x) => x.classList.toggle('on', x === b)); paint(); }));
      url.addEventListener('input', paint); paint();
      $('[data-test-hook]', sh)?.addEventListener('click', async () => {
        const r = await api('POST', `webhooks/${existing.id}/test`);
        toast(r.error ? r.error : r.status >= 200 && r.status < 300 ? 'Test sent' : `Failed (HTTP ${r.status})`, !!r.error || r.status >= 300);
      });
      bindDelete(sh, close, { title: 'Delete this webhook?', action: async () => applyState(await api('DELETE', 'webhooks/' + existing.id)) });
    },
    async onDone(sh) {
      const body = { name: $('[name=name]', sh).value, url: $('[name=url]', sh).value.trim(), format, enabled: $('[name=enabled]', sh).checked };
      applyState(existing ? await api('PUT', 'webhooks/' + existing.id, body) : await api('POST', 'webhooks', body));
      render();
    },
  });
}


// ============ Accounts: sign in, passkeys, account pages ============
const AUTH = { passkeys: false, offered: false, justSignedIn: false };
const b64uToBuf = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const bufToB64u = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function signedOut() {
  if (document.body.classList.contains('signed-out')) return;
  S.user = null; S.loaded = false;
  openSheets.forEach((close) => close());
  api('GET', 'auth/status')
    .then((st) => { AUTH.passkeys = st.passkeys && !!window.PublicKeyCredential; showSignIn(st.setupRequired); })
    .catch(() => showSignIn(false));
}

function showSignIn(setup) {
  document.body.classList.add('signed-out');
  $('#app').innerHTML = `
    <main class="page auth-page">
      <div class="auth-icon">${icon('thermo')}</div>
      <h1 class="auth-title">${setup ? 'Welcome' : 'NestHealth'}</h1>
      <p class="auth-sub">${setup ? 'Create the first account for this server. You can add the rest of the family afterwards.' : 'Sign in to see the family’s temperatures and medicines.'}</p>
      <form data-auth novalidate>
        <div class="section"><div class="group">
          ${setup ? `<div class="row"><input class="field" name="name" placeholder="Your name, e.g. Mum" autocomplete="name"></div>` : ''}
          <div class="row"><input class="field" name="email" type="email" inputmode="email" placeholder="Email" autocomplete="${setup ? 'email' : 'username webauthn'}" autocapitalize="off" spellcheck="false"></div>
          <div class="row"><input class="field" name="password" type="password" placeholder="Password" autocomplete="${setup ? 'new-password' : 'current-password'}"></div>
          ${setup ? `<div class="row"><input class="field" name="confirm" type="password" placeholder="Confirm password" autocomplete="new-password"></div>` : ''}
        </div>${setup ? '<div class="section-footer">Use at least 8 characters. A short phrase is easy to remember and hard to guess.</div>' : ''}</div>
        <p class="auth-error hidden" data-error role="alert"></p>
        <div class="auth-actions">
          <button class="btn-primary" type="submit">${setup ? 'Create Account' : 'Sign In'}</button>
          ${!setup && AUTH.passkeys ? `<button class="btn-secondary" type="button" data-passkey>${icon('key')}Sign In with a Passkey</button>` : ''}
        </div>
      </form>
    </main>`;
  const form = $('[data-auth]'), err = $('[data-error]');
  const fail = (msg) => { err.textContent = msg; err.classList.remove('hidden'); };
  const done = (r) => {
    document.body.classList.remove('signed-out');
    S.user = r.user; AUTH.justSignedIn = true; currentHash = null;
    refresh();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (setup && !f.name.trim()) return fail('Enter your name.');
    if (!f.email.trim() || !f.password) return fail('Enter your email and password.');
    if (setup && f.password !== f.confirm) return fail("The passwords don't match.");
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try { done(await api('POST', setup ? 'auth/setup' : 'auth/login', { name: f.name, email: f.email.trim(), password: f.password })); }
    catch (x) { fail(x.message); btn.disabled = false; }
  });
  $('[data-passkey]')?.addEventListener('click', async () => {
    try { done(await passkeySignIn()); }
    catch (x) { if (x.name !== 'NotAllowedError' && x.name !== 'AbortError') fail(x.message); }
  });
  setTimeout(() => $(setup ? '[name=name]' : '[name=email]')?.focus(), 100);
}

async function passkeySignIn() {
  const o = await api('POST', 'auth/passkey/login-options');
  const cred = await navigator.credentials.get({ publicKey: { challenge: b64uToBuf(o.challenge), rpId: o.rpId, timeout: o.timeout, userVerification: o.userVerification } });
  const r = cred.response;
  return api('POST', 'auth/passkey/login', { credential: {
    id: cred.id, type: cred.type,
    response: { clientDataJSON: bufToB64u(r.clientDataJSON), authenticatorData: bufToB64u(r.authenticatorData), signature: bufToB64u(r.signature), userHandle: r.userHandle ? bufToB64u(r.userHandle) : null },
  } });
}

async function passkeyCreate() {
  const o = await api('POST', 'auth/passkey/register-options');
  const cred = await navigator.credentials.create({ publicKey: {
    ...o, challenge: b64uToBuf(o.challenge), user: { ...o.user, id: b64uToBuf(o.user.id) },
    excludeCredentials: o.excludeCredentials.map((c) => ({ ...c, id: b64uToBuf(c.id) })),
  } });
  await api('POST', 'auth/passkey/register', { name: deviceName().replace(/^.*'s /, ''), credential: {
    id: cred.id, type: cred.type,
    response: { clientDataJSON: bufToB64u(cred.response.clientDataJSON), attestationObject: bufToB64u(cred.response.attestationObject) },
  } });
}

/** After signing in: force a new password if the account has a temporary one, then offer a passkey. */
function afterSignIn() {
  if (!S.user || $('.sheet')) return;
  if (S.user.must_change_password) return changePasswordSheet(true);
  if (AUTH.justSignedIn && AUTH.passkeys && !AUTH.offered && !store.get('pkNo:' + S.user.id, false)) {
    AUTH.offered = true;
    api('GET', 'auth/me').then((me) => { if (!me.passkeys.length) passkeyOfferSheet(); }).catch(() => {});
  }
  AUTH.justSignedIn = false;
}

function passkeyOfferSheet() {
  openSheet({
    title: '', done: null,
    body: `<div class="offer">
      <div class="offer-icon">${icon('key')}</div>
      <h2>Sign in faster next time</h2>
      <p>Create a passkey to sign in with Face ID, Touch ID or your screen lock instead of typing your password. Passkeys can't be guessed or phished.</p>
      <button class="btn-primary" data-create>Create Passkey</button>
      <button class="btn-plain" data-later>Not Now</button></div>`,
    onMount(sh, close) {
      $('[data-create]', sh).addEventListener('click', async () => {
        try { await passkeyCreate(); close(); toast('Passkey created'); }
        catch (x) { if (x.name !== 'NotAllowedError') toast(x.message, true); }
      });
      $('[data-later]', sh).addEventListener('click', () => { store.set('pkNo:' + S.user.id, true); close(); });
    },
  });
}

function changePasswordSheet(required = false) {
  openSheet({
    title: 'Change Password', done: 'Save', cancellable: !required,
    body: `${required ? `<p class="inline-note" style="padding-top:4px">You signed in with a temporary password. Choose your own password to continue.</p>` : ''}
      <div class="section"><div class="group">
        ${required ? '' : `<div class="row"><input class="field" name="current" type="password" placeholder="Current password" autocomplete="current-password"></div>`}
        <div class="row"><input class="field" name="password" type="password" placeholder="New password" autocomplete="new-password"></div>
        <div class="row"><input class="field" name="confirm" type="password" placeholder="Confirm new password" autocomplete="new-password"></div>
      </div><div class="section-footer">At least 8 characters. Your other devices will be signed out.</div></div>`,
    onMount(sh) { setTimeout(() => $('input', sh)?.focus(), 450); },
    async onDone(sh) {
      const v = (n) => $(`[name=${n}]`, sh)?.value || '';
      if (v('password').length < 8) throw new Error('Use at least 8 characters.');
      if (v('password') !== v('confirm')) throw new Error("The new passwords don't match.");
      const r = await api('POST', 'auth/password', { current: v('current'), password: v('password') });
      S.user = r.user;
      toast('Password changed');
      setTimeout(afterSignIn, 500);
    },
  });
}

function viewAccount() {
  const m = me();
  return {
    html: `${navBar({ title: 'Account', left: backBtn('#/settings', 'Settings') })}
      <main class="page">
        <div class="profile" style="padding-top:8px">${m ? avatar(m, 'lg') : `<div class="avatar lg" style="--c:var(--gray)">${icon('person')}</div>`}
          <h1>${esc(S.user.name)}</h1><div class="person-meta">${esc(S.user.email)}${S.user.is_admin ? ' · Admin' : ''}</div></div>
        <div data-account><p class="disclaimer">Loading…</p></div>
      </main>`,
    async onMount(root) {
      const box = $('[data-account]', root);
      const load = async () => {
        const a = await api('GET', 'auth/me');
        const pk = a.passkeys.map((p) => `<button class="row has-icon" data-pk="${esc(p.id)}"><div class="icon-tile" style="background:var(--teal)">${icon('key')}</div>
          <div class="row-main"><div class="row-title">${esc(p.name || 'Passkey')}</div><div class="row-sub">Added ${fmtDate(p.created_at)}${p.last_used ? ' · last used ' + fmtAgo(p.last_used).toLowerCase() : ''}</div></div></button>`).join('');
        const sessions = a.sessions.map((x) => `<button class="row has-icon" data-session="${x.id}" ${x.current ? 'disabled' : ''}><div class="icon-tile" style="background:var(--gray)">${icon('phone')}</div>
          <div class="row-main"><div class="row-title">${esc(x.device || 'Device')}</div><div class="row-sub">${x.current ? 'This device' : 'Active ' + fmtAgo(x.last_used).toLowerCase()}</div></div></button>`).join('');
        box.innerHTML = `
          <div class="section"><div class="group"><button class="row has-icon" data-password><div class="icon-tile" style="background:var(--gray)">${icon('lock')}</div>
            <div class="row-main">Change Password</div>${icon('chev', 'chev')}</button></div></div>
          <div class="section"><div class="section-header">Passkeys</div><div class="group">${pk}
            ${a.passkeysAvailable && window.PublicKeyCredential ? `<button class="row action" data-add-pk>${icon('plus')}Add a Passkey</button>` : ''}</div>
            <div class="section-footer">${a.passkeysAvailable ? 'Sign in with Face ID, Touch ID or your screen lock instead of your password. Tap a passkey to remove it.' : 'Passkeys need NestHealth to be opened over HTTPS using a domain name (for example with Tailscale or a reverse proxy). See the README.'}</div></div>
          <div class="section"><div class="section-header">Signed-in Devices</div><div class="group">${sessions}</div>
            <div class="section-footer">Tap a device to sign it out.</div></div>
          <div class="section"><div class="group"><button class="row destructive" data-signout>Sign Out</button></div></div>
          <div class="section"><div class="group"><button class="row destructive" data-delete-account>Delete Account…</button></div>
            <div class="section-footer">Deletes your sign-in, passkeys and signed-in devices. The family's records stay for the other accounts.</div></div>`;
        $('[data-password]', box).addEventListener('click', () => changePasswordSheet(false));
        $('[data-add-pk]', box)?.addEventListener('click', async () => {
          try { await passkeyCreate(); toast('Passkey added'); load(); } catch (x) { if (x.name !== 'NotAllowedError') toast(x.message, true); }
        });
        $$('[data-pk]', box).forEach((b) => b.addEventListener('click', async () => {
          const i = await alertDialog({ title: 'Remove this passkey?', message: 'You can still sign in with your password.', buttons: [{ label: 'Cancel' }, { label: 'Remove', role: 'destructive' }] });
          if (i === 1) { await api('DELETE', 'auth/passkeys/' + encodeURIComponent(b.dataset.pk)); load(); }
        }));
        $$('[data-session]', box).forEach((b) => b.addEventListener('click', async () => {
          const i = await alertDialog({ title: 'Sign out this device?', buttons: [{ label: 'Cancel' }, { label: 'Sign Out', role: 'destructive' }] });
          if (i === 1) { await api('DELETE', 'auth/sessions/' + b.dataset.session); load(); }
        }));
        $('[data-delete-account]', box).addEventListener('click', () => deleteAccountSheet());
        $('[data-signout]', box).addEventListener('click', async () => {
          const i = await alertDialog({ title: 'Sign out of NestHealth?', buttons: [{ label: 'Cancel' }, { label: 'Sign Out', role: 'destructive' }] });
          if (i !== 1) return;
          try { await disablePush(); } catch {}
          await api('POST', 'auth/logout').catch(() => {});
          location.hash = '#/'; location.reload();
        });
      };
      load().catch((e) => { box.innerHTML = `<p class="disclaimer">${esc(e.message)}</p>`; });
    },
  };
}

function viewAccounts() {
  return {
    html: `${navBar({ title: 'Family Accounts', left: backBtn('#/settings', 'Settings') })}
      <main class="page"><h1 class="large-title">Accounts</h1><div data-users><p class="disclaimer">Loading…</p></div></main>`,
    onMount(root) {
      const box = $('[data-users]', root);
      const draw = (users) => {
        box.innerHTML = `<div class="section"><div class="group">${users.map((u) => {
          const p = parent(u.parent_id);
          const tags = [u.is_admin ? 'Admin' : '', u.must_change_password ? 'Temporary password' : '', u.passkeys ? `${u.passkeys} passkey${u.passkeys > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
          return `<button class="row has-avatar" data-user="${u.id}" ${u.id === S.user.id ? 'disabled' : ''}>${p ? avatar(p) : `<div class="avatar" style="--c:var(--gray)">${icon('person')}</div>`}
            <div class="row-main"><div class="row-title">${esc(u.name)}${u.id === S.user.id ? ' (you)' : ''}</div><div class="row-sub">${esc(u.email)}${tags ? ' · ' + esc(tags) : ''}</div></div></button>`;
        }).join('')}<button class="row action" data-add-user>${icon('plus')}Add Account</button></div>
        <div class="section-footer">Each parent or carer gets their own sign-in. New accounts start with a temporary password that they change when they first sign in.</div></div>`;
        $('[data-add-user]', box).addEventListener('click', () => addAccountSheet(users, draw));
        $$('[data-user]', box).forEach((b) => b.addEventListener('click', async () => {
          const u = users.find((x) => x.id === +b.dataset.user);
          const i = await alertDialog({ title: u.name, message: u.email, buttons: [{ label: 'Reset Password' }, { label: 'Remove Account', role: 'destructive' }, { label: 'Cancel', role: 'primary' }] });
          if (i === 0) resetPasswordSheet(u, draw);
          if (i === 1) {
            const c = await alertDialog({ title: `Remove ${u.name}'s account?`, message: 'They will be signed out everywhere. Their records stay.', buttons: [{ label: 'Cancel' }, { label: 'Remove', role: 'destructive' }] });
            if (c === 1) draw(await api('DELETE', 'users/' + u.id));
          }
        }));
      };
      api('GET', 'users').then(draw).catch((e) => { box.innerHTML = `<p class="disclaimer">${esc(e.message)}</p>`; });
    },
  };
}

function deleteAccountSheet() {
  api('GET', 'users').then((users) => {
    const last = users.length === 1;
    openSheet({
      title: 'Delete Account', done: 'Delete',
      body: `<p class="inline-note" style="padding-top:4px">This permanently deletes your account (${esc(S.user.email)}), its passkeys and signed-in devices.</p>
        <div class="section"><div class="group"><div class="row"><input class="field" name="password" type="password" placeholder="Your password" autocomplete="current-password"></div>
        ${last ? `<div class="row"><div class="row-main"><div class="row-title">Also delete all family records</div><div class="row-sub wrap">You're the only account. Turn this on to erase every child, reading, dose and photo on this server.</div></div>
          <label class="switch"><input type="checkbox" name="erase"><span></span></label></div>` : ''}
        </div></div>`,
      async onDone(sh) {
        const r = await api('POST', 'auth/account/delete', { password: $('[name=password]', sh).value, eraseRecords: !!$('[name=erase]', sh)?.checked });
        toast(r.erased ? 'Account and records deleted' : 'Account deleted');
        setTimeout(() => { location.hash = '#/'; location.reload(); }, 900);
      },
    });
  }).catch((e) => toast(e.message, true));
}

const tempPassword = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; const r = crypto.getRandomValues(new Uint8Array(12)); return [...r].map((x) => a[x % a.length]).join('').replace(/(.{4})(?!$)/g, '$1-'); };

function addAccountSheet(users, draw) {
  const linked = new Set(users.map((u) => u.parent_id));
  const free = S.parents.filter((p) => !linked.has(p.id));
  openSheet({
    title: 'Add Account', done: 'Add',
    body: `<div class="section"><div class="group">
        <div class="row"><input class="field" name="name" placeholder="Name, e.g. Dad" autocomplete="off"></div>
        <div class="row"><input class="field" name="email" type="email" inputmode="email" placeholder="Email" autocapitalize="off" autocomplete="off"></div>
        ${free.length ? `<div class="row"><div class="row-main">Parent profile</div><select class="field" name="parent" style="flex:none"><option value="">New profile</option>${free.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>` : ''}
      </div></div>
      <div class="section"><div class="section-header">Temporary password</div><div class="group">
        <div class="row"><input class="field" name="password" value="${tempPassword()}" autocomplete="off" spellcheck="false" style="font-family:ui-monospace,monospace"></div>
      </div><div class="section-footer">Give them this password. They'll choose their own when they first sign in.</div></div>`,
    onMount(sh) {
      const name = $('[name=name]', sh), sel = $('[name=parent]', sh);
      sel?.addEventListener('change', () => { const p = parent(+sel.value); if (p && !name.value) name.value = p.name; });
      setTimeout(() => name.focus(), 450);
    },
    async onDone(sh) {
      const v = (n) => $(`[name=${n}]`, sh)?.value || '';
      draw(await api('POST', 'users', { name: v('name'), email: v('email'), password: v('password'), parent_id: +v('parent') || null }));
      toast('Account added');
    },
  });
}

function resetPasswordSheet(u, draw) {
  openSheet({
    title: 'Reset Password', done: 'Save',
    body: `<p class="inline-note" style="padding-top:4px">${esc(u.name)} will be signed out everywhere and asked to choose a new password when they next sign in.</p>
      <div class="section"><div class="group"><div class="row"><input class="field" name="password" value="${tempPassword()}" autocomplete="off" spellcheck="false" style="font-family:ui-monospace,monospace"></div></div></div>`,
    async onDone(sh) { draw(await api('POST', `users/${u.id}/password`, { password: $('[name=password]', sh).value })); toast('Password reset'); },
  });
}

// ============ Boot ============
async function refresh() {
  if (document.body.classList.contains('signed-out')) return;
  try { await loadAll(); await checkPush(); render(); afterSignIn(); maybeAskWho(); }
  catch (e) {
    if (document.body.classList.contains('signed-out')) return;
    if (!S.loaded) $('#app').innerHTML = `<div class="empty"><h2>Can't reach server</h2><p>${esc(e.message)}</p><button class="btn-primary" onclick="location.reload()">Try Again</button></div>`;
  }
}

async function start() {
  try {
    const st = await api('GET', 'auth/status');
    AUTH.passkeys = st.passkeys && !!window.PublicKeyCredential;
    if (!st.user) return showSignIn(st.setupRequired);
    S.user = st.user;
    refresh();
  } catch (e) {
    $('#app').innerHTML = `<div class="empty"><h2>Can't reach server</h2><p>${esc(e.message)}</p><button class="btn-primary" onclick="location.reload()">Try Again</button></div>`;
  }
}

{
  document.body.insertAdjacentHTML('beforeend', `<nav class="tabbar glass">${TABS.map(([h, l, ic]) => `<button class="tab" data-tab="${h}" data-go="${h}">${icon(ic)}<span>${l}</span></button>`).join('')}</nav>`);
  bindCommon(document.body);
  start();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  // Sync with other phones and keep countdowns current
  setInterval(() => { if (!document.hidden && !$('.sheet') && !$('.alert')) refresh(); }, 60000);
  window.addEventListener('resize', () => { const c = $('#chart'); const m = location.hash.match(/^#\/person\/(\d+)/); if (c && m) drawChart(c, +m[1]); });
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(() => {});
}
