// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 M Hansford. See LICENSE.
// NestHealth – tiny zero-dependency server (Node >= 22.13, built-in SQLite)
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const Dosing = require('./public/dosing.js');
const { createVapidKeys, sendPush, sendWebhook } = require('./notify.js');
const Auth = require('./auth.js');
const APNs = require('./apns.js');

const PORT = Number(process.env.PORT || 8080);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PHOTO_DIR = path.join(DATA_DIR, 'photos');
const PUBLIC_DIR = path.join(__dirname, 'public');
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:family-health@example.com';
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // e.g. https://health.example.com (passkeys)
const SITE_URL = (process.env.SITE_URL || 'https://nesthealth.soam.uk').replace(/\/+$/, ''); // public website (privacy, support)
const SESSION_DAYS = 90;
const HOUR = 36e5, DAY = 864e5;

fs.mkdirSync(PHOTO_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'family-health.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#007AFF',
    emoji TEXT NOT NULL DEFAULT '', dob TEXT, weight_kg REAL, sort INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#5856D6',
    emoji TEXT NOT NULL DEFAULT '', photo TEXT, sort INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, default_dose TEXT NOT NULL DEFAULT '',
    min_interval_h REAL, max_per_24h INTEGER, archived INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('temp','med','note')),
    at INTEGER NOT NULL, temp_c REAL, method TEXT,
    medicine_id INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name TEXT, dose TEXT, note TEXT, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS entries_person_at ON entries(person_id, at);
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS push_subs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
    parent_id INTEGER REFERENCES parents(id) ON DELETE SET NULL, device TEXT, created_at INTEGER NOT NULL, last_status INTEGER
  );
  CREATE TABLE IF NOT EXISTS webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, format TEXT NOT NULL DEFAULT 'json',
    enabled INTEGER NOT NULL DEFAULT 1, last_status INTEGER
  );
  CREATE TABLE IF NOT EXISTS sent_notifications (key TEXT PRIMARY KEY, at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
    password_hash TEXT, parent_id INTEGER REFERENCES parents(id) ON DELETE SET NULL,
    is_admin INTEGER NOT NULL DEFAULT 0, must_change_password INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, token_hash TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, device TEXT,
    created_at INTEGER NOT NULL, last_used INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS person_doses (
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    dose TEXT NOT NULL,
    PRIMARY KEY (person_id, medicine_id)
  );
  CREATE TABLE IF NOT EXISTS apns_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT NOT NULL UNIQUE, environment TEXT NOT NULL DEFAULT 'production',
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER, device TEXT, created_at INTEGER NOT NULL, last_status INTEGER
  );
  CREATE TABLE IF NOT EXISTS passkeys (
    id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, jwk TEXT NOT NULL,
    alg INTEGER NOT NULL, sign_count INTEGER NOT NULL DEFAULT 0, name TEXT, created_at INTEGER NOT NULL, last_used INTEGER
  );
`);

// ---------- migrations ----------
const cols = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
const addCol = (t, c, def) => { if (!cols(t).includes(c)) db.exec(`ALTER TABLE ${t} ADD COLUMN ${c} ${def}`); };
addCol('people', 'photo', 'TEXT');
addCol('medicines', 'guide', 'TEXT');
addCol('entries', 'by_parent_id', 'INTEGER');
addCol('entries', 'by_name', 'TEXT');

const getSetting = (k, d = null) => { const r = db.prepare('SELECT value FROM settings WHERE key=?').get(k); return r ? r.value : d; };
const setSetting = (k, v) => db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, String(v));

// Seed starter medicines on a new install (parents can rename them and change the timings).
if (db.prepare('SELECT COUNT(*) AS n FROM medicines').get().n === 0) {
  const ins = db.prepare('INSERT INTO medicines (name, default_dose, min_interval_h, max_per_24h) VALUES (?,?,?,?)');
  for (const m of Dosing.STARTERS) ins.run(m.name, m.dose || '', m.interval, m.max);
}
// Earlier versions had built-in age-based dosing guides; doses now always come from the parent.
db.exec('UPDATE medicines SET guide = NULL WHERE guide IS NOT NULL');
if (!getSetting('vapid')) setSetting('vapid', JSON.stringify(createVapidKeys()));
const VAPID = JSON.parse(getSetting('vapid'));

const NOTIFY_DEFAULTS = { doseDue: true, doseGiven: true, fever: true, feverC: 38, checkH: 0 };
const notifySettings = () => ({ ...NOTIFY_DEFAULTS, ...JSON.parse(getSetting('notify', '{}')) });

// ---------- helpers ----------
const send = (res, status, body, headers = {}) => {
  const raw = typeof body === 'string' || Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': raw ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(raw ? body : JSON.stringify(body));
};

const readBody = (req, limit = 1e6) => new Promise((resolve, reject) => {
  const chunks = []; let size = 0;
  req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('Too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { const s = Buffer.concat(chunks).toString(); resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
  req.on('error', reject);
});

const str = (v, max = 200) => (v == null ? null : String(v).trim().slice(0, max) || null);
const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const fmtTime = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const fmtTemp = (c) => (getSetting('unit', 'C') === 'F' ? `${(c * 9 / 5 + 32).toFixed(1)}°F` : `${c.toFixed(1)}°C`);
const hashPin = (pin, salt = crypto.randomBytes(8).toString('hex')) => `${salt}:${crypto.scryptSync(String(pin), salt, 32).toString('hex')}`;
const checkPin = (pin) => { const h = getSetting('pin'); if (!h) return true; const [salt] = h.split(':'); return crypto.timingSafeEqual(Buffer.from(hashPin(pin, salt)), Buffer.from(h)); };

const getState = (user) => ({
  me: user ? publicUser(user) : null,
  people: db.prepare('SELECT * FROM people WHERE archived = 0 ORDER BY sort, id').all(),
  parents: db.prepare('SELECT * FROM parents ORDER BY sort, id').all(),
  medicines: db.prepare('SELECT * FROM medicines WHERE archived = 0 ORDER BY name COLLATE NOCASE').all(),
  personDoses: db.prepare('SELECT person_id, medicine_id, dose FROM person_doses').all(),
  settings: { unit: getSetting('unit', 'C'), notify: notifySettings(), hasPin: !!getSetting('pin') },
  webhooks: db.prepare('SELECT * FROM webhooks ORDER BY id').all(),
  devices: db.prepare('SELECT id, parent_id, device, created_at, last_status, endpoint FROM push_subs ORDER BY id').all(),
  vapidPublicKey: VAPID.publicKey,
  appPush: APNs.enabled(),
});

function entryFields(b) {
  const type = ['temp', 'med', 'note'].includes(b.type) ? b.type : null;
  if (!type) throw new Error('Invalid type');
  const byId = num(b.by_parent_id);
  const byParent = byId ? db.prepare('SELECT name FROM parents WHERE id=?').get(byId) : null;
  const f = {
    person_id: num(b.person_id), type, at: num(b.at) ?? Date.now(),
    temp_c: type === 'temp' ? num(b.temp_c) : null,
    method: type === 'temp' ? str(b.method, 30) : null,
    medicine_id: type === 'med' ? num(b.medicine_id) : null,
    medicine_name: type === 'med' ? str(b.medicine_name, 100) : null,
    dose: type === 'med' ? str(b.dose, 60) : null,
    note: str(b.note, 1000),
    by_parent_id: byParent ? byId : null,
    by_name: byParent ? byParent.name : null,
  };
  if (!f.person_id) throw new Error('person_id required');
  if (type === 'temp' && (f.temp_c == null || f.temp_c < 30 || f.temp_c > 45)) throw new Error('Temperature out of range');
  if (type === 'med' && !f.medicine_name) throw new Error('Medicine required');
  if (type === 'note' && !f.note) throw new Error('Note required');
  return f;
}
const ENTRY_COLS = ['person_id', 'type', 'at', 'temp_c', 'method', 'medicine_id', 'medicine_name', 'dose', 'note', 'by_parent_id', 'by_name'];

// ---------- photos ----------
function savePhoto(table, id, dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(dataUrl || '');
  if (!m) throw new Error('Unsupported image');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3e6) throw new Error('Image too large');
  const file = `${table}-${id}-${crypto.randomBytes(6).toString('hex')}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  fs.writeFileSync(path.join(PHOTO_DIR, file), buf);
  removePhoto(table, id);
  db.prepare(`UPDATE ${table} SET photo=? WHERE id=?`).run(file, id);
}
function removePhoto(table, id) {
  const row = db.prepare(`SELECT photo FROM ${table} WHERE id=?`).get(id);
  if (row && row.photo) fs.rm(path.join(PHOTO_DIR, path.basename(row.photo)), () => {});
  db.prepare(`UPDATE ${table} SET photo=NULL WHERE id=?`).run(id);
}

// ---------- notifications ----------
const markSent = (key) => db.prepare('INSERT OR IGNORE INTO sent_notifications (key, at) VALUES (?, ?)').run(key, Date.now()).changes === 1;

async function dispatch(ev, { onlyWebhook = null } = {}) {
  const results = [];
  if (!onlyWebhook) {
    for (const sub of db.prepare('SELECT * FROM push_subs').all()) {
      if (ev.excludeParent && sub.parent_id === ev.excludeParent) continue;
      try {
        const status = await sendPush(sub, { title: ev.title, body: ev.body, tag: ev.tag, url: ev.url || '/', urgent: ev.urgent }, VAPID, VAPID_SUBJECT);
        if (status === 404 || status === 410) db.prepare('DELETE FROM push_subs WHERE id=?').run(sub.id);
        else db.prepare('UPDATE push_subs SET last_status=? WHERE id=?').run(status, sub.id);
        results.push({ push: sub.device, status });
      } catch (e) { results.push({ push: sub.device, error: e.message }); }
    }
  }
  // iPhone app (APNs). Dose-due and recheck reminders are scheduled on the phone itself, so they're skipped here.
  if (!onlyWebhook && APNs.enabled() && !ev.localOnApp) {
    for (const d of db.prepare('SELECT * FROM apns_devices').all()) {
      if (ev.excludeParent && d.parent_id === ev.excludeParent) continue;
      const r = await APNs.send(d, { title: ev.title, body: ev.body, tag: ev.tag, urgent: ev.urgent, personId: ev.personId });
      if (r.status === 410 || (r.status === 400 && /BadDeviceToken|DeviceTokenNotForTopic/.test(r.reason))) db.prepare('DELETE FROM apns_devices WHERE id=?').run(d.id);
      else db.prepare('UPDATE apns_devices SET last_status=? WHERE id=?').run(r.status, d.id);
      results.push({ app: d.device || 'iPhone', status: r.status, ...(r.reason ? { reason: r.reason } : {}) });
    }
  }
  const hooks = onlyWebhook ? [onlyWebhook] : db.prepare('SELECT * FROM webhooks WHERE enabled=1').all();
  for (const hook of hooks) {
    try {
      const status = await sendWebhook(hook, ev);
      db.prepare('UPDATE webhooks SET last_status=? WHERE id=?').run(status, hook.id);
      results.push({ webhook: hook.name, status });
    } catch (e) {
      db.prepare('UPDATE webhooks SET last_status=? WHERE id=?').run(0, hook.id);
      results.push({ webhook: hook.name, error: e.message });
    }
  }
  if (results.length) console.log(`[notify] ${ev.event}: ${ev.title} →`, JSON.stringify(results));
  return results;
}

const medDef = (id) => (id ? db.prepare('SELECT * FROM medicines WHERE id=?').get(id) : null);
const personById = (id) => db.prepare('SELECT * FROM people WHERE id=?').get(id);
const dosesOf = (pid, e) => (e.medicine_id
  ? db.prepare("SELECT * FROM entries WHERE person_id=? AND type='med' AND medicine_id=? AND at>=?").all(pid, e.medicine_id, Date.now() - 2 * DAY)
  : db.prepare("SELECT * FROM entries WHERE person_id=? AND type='med' AND medicine_id IS NULL AND lower(medicine_name)=lower(?) AND at>=?").all(pid, e.medicine_name, Date.now() - 2 * DAY));

function onNewEntry(e) {
  if (e.at < Date.now() - HOUR) return; // back-filled records don't notify
  const n = notifySettings();
  const p = personById(e.person_id);
  const by = e.by_name ? ` by ${e.by_name}` : '';
  if (e.type === 'med' && n.doseGiven) {
    const med = medDef(e.medicine_id);
    const st = Dosing.doseStatus(dosesOf(p.id, e), Dosing.rulesFor(med));
    const next = st.nextAt ? ` Next dose from ${fmtTime(st.nextAt)}.` : '';
    dispatch({ event: 'dose_given', person: p.name, title: `${p.name} had ${e.medicine_name}`, body: `${e.dose ? e.dose + ' ' : ''}given at ${fmtTime(e.at)}${by}.${next}`, tag: `dose-${p.id}`, url: `/#/person/${p.id}`, personId: p.id, excludeParent: e.by_parent_id, data: { entry: e } });
  }
  if (e.type === 'temp' && n.fever && e.temp_c >= n.feverC) {
    const high = e.temp_c >= 39;
    dispatch({ event: 'fever', person: p.name, title: `${p.name}: ${fmtTemp(e.temp_c)}${high ? ' – high fever' : ''}`, body: `Measured at ${fmtTime(e.at)}${by}.`, tag: `temp-${p.id}`, url: `/#/person/${p.id}`, personId: p.id, urgent: high, excludeParent: e.by_parent_id, data: { entry: e } });
  }
}

function tick() {
  const n = notifySettings(), now = Date.now(), WINDOW = 30 * 60e3;
  for (const p of db.prepare('SELECT * FROM people WHERE archived=0').all()) {
    if (n.doseDue) {
      const latest = new Map();
      for (const e of db.prepare("SELECT * FROM entries WHERE person_id=? AND type='med' AND at>=? ORDER BY at DESC").all(p.id, now - DAY)) {
        const k = e.medicine_id ? 'id' + e.medicine_id : 'n' + e.medicine_name.toLowerCase();
        if (!latest.has(k)) latest.set(k, e);
      }
      for (const e of latest.values()) {
        const med = medDef(e.medicine_id);
        const rules = Dosing.rulesFor(med);
        if (!rules.interval && !rules.max) continue;
        const st = Dosing.doseStatus(dosesOf(p.id, e), rules, now);
        if (st.nextAt && st.nextAt <= now && now - st.nextAt < WINDOW && markSent(`due:${st.last.id}`)) {
          const saved = med && db.prepare('SELECT dose FROM person_doses WHERE person_id=? AND medicine_id=?').get(p.id, med.id);
          const dose = saved ? ` (usual dose ${saved.dose})` : st.last.dose ? ` (last dose ${st.last.dose})` : '';
          dispatch({ event: 'dose_due', person: p.name, title: `${p.name} can have ${e.medicine_name} again`, body: `Last given at ${fmtTime(st.last.at)}${st.last.by_name ? ' by ' + st.last.by_name : ''}. ${st.count24} dose${st.count24 === 1 ? '' : 's'} in the last 24h${dose}.`, tag: `due-${p.id}-${e.medicine_id || 0}`, url: `/#/person/${p.id}`, personId: p.id, localOnApp: true });
        }
      }
    }
    if (n.checkH > 0) {
      const t = db.prepare("SELECT * FROM entries WHERE person_id=? AND type='temp' ORDER BY at DESC LIMIT 1").get(p.id);
      const due = t && t.at + n.checkH * HOUR;
      if (t && t.temp_c >= n.feverC && due <= now && now - due < WINDOW && markSent(`check:${t.id}`)) {
        dispatch({ event: 'check_temp', person: p.name, title: `Time to check ${p.name}'s temperature`, body: `Last reading ${fmtTemp(t.temp_c)} at ${fmtTime(t.at)}.`, tag: `check-${p.id}`, url: `/#/person/${p.id}`, personId: p.id, localOnApp: true });
      }
    }
  }
  db.prepare('DELETE FROM sent_notifications WHERE at < ?').run(now - 7 * DAY);
}
setInterval(() => { try { tick(); } catch (e) { console.error('[tick]', e); } }, 30e3);

// ---------- demo data ----------
function loadDemo() {
  if (db.prepare('SELECT COUNT(*) AS n FROM people').get().n) throw new Error('Demo data can only be added when there are no people yet');
  const now = Date.now();
  const yearsAgo = (y, m = 0) => { const d = new Date(); d.setFullYear(d.getFullYear() - y); d.setMonth(d.getMonth() - m); return d.toISOString().slice(0, 10); };
  const par = db.prepare('INSERT INTO parents (name, color, emoji, sort) VALUES (?,?,?,?)');
  const mum = Number(par.run('Mum', '#AF52DE', '', 1).lastInsertRowid);
  const dad = Number(par.run('Dad', '#30B0C7', '', 2).lastInsertRowid);
  const ppl = db.prepare('INSERT INTO people (name, color, emoji, dob, weight_kg, sort) VALUES (?,?,?,?,?,?)');
  const ella = Number(ppl.run('Ella', '#FF2D55', '🦄', yearsAgo(4, 3), 16, 1).lastInsertRowid);
  const sam = Number(ppl.run('Sam', '#007AFF', '', yearsAgo(7, 1), 23, 2).lastInsertRowid);
  const leo = Number(ppl.run('Leo', '#34C759', '🦖', yearsAgo(1, 6), 11, 3).lastInsertRowid);
  const med = (name) => db.prepare('SELECT id, name FROM medicines WHERE name=? AND archived=0').get(name)
    || { id: Number(db.prepare('INSERT INTO medicines (name, default_dose, min_interval_h, max_per_24h) VALUES (?,?,?,?)').run(name, '', name.includes('ibuprofen') ? 6 : 4, name.includes('ibuprofen') ? 3 : 4).lastInsertRowid), name };
  const ins = db.prepare(`INSERT INTO entries (${ENTRY_COLS.join(',')}, created_at) VALUES (${ENTRY_COLS.map(() => '?').join(',')}, ?)`);
  const add = (o) => ins.run(...ENTRY_COLS.map((c) => o[c] ?? null), now);
  const who = (id) => ({ by_parent_id: id, by_name: id === mum ? 'Mum' : 'Dad' });
  [[20, 37.4], [16, 38.1], [12, 38.9], [9, 39.3], [7, 38.6], [4, 38.2], [1.5, 38.7]].forEach(([h, t], i) => add({ person_id: ella, type: 'temp', at: now - h * HOUR, temp_c: t, method: 'ear', ...who(i % 2 ? dad : mum) }));
  const cal = med("Children's paracetamol"), nur = med("Children's ibuprofen");
  // Sample "usual doses" as a parent would copy them from their own bottles.
  const pd = db.prepare('INSERT OR REPLACE INTO person_doses (person_id, medicine_id, dose) VALUES (?,?,?)');
  pd.run(ella, cal.id, '10 ml'); pd.run(ella, nur.id, '7.5 ml'); pd.run(leo, cal.id, '5 ml'); pd.run(sam, cal.id, '5 ml');
  add({ person_id: ella, type: 'med', at: now - 9 * HOUR, medicine_id: cal.id, medicine_name: cal.name, dose: '10 ml', ...who(mum) });
  add({ person_id: ella, type: 'med', at: now - 5 * HOUR, medicine_id: nur.id, medicine_name: nur.name, dose: '7.5 ml', ...who(dad) });
  add({ person_id: ella, type: 'med', at: now - 2 * HOUR, medicine_id: cal.id, medicine_name: cal.name, dose: '10 ml', ...who(mum) });
  add({ person_id: ella, type: 'note', at: now - 3 * HOUR, note: 'Drank 150 ml of juice, very sleepy', ...who(dad) });
  add({ person_id: sam, type: 'temp', at: now - 26 * HOUR, temp_c: 36.9, method: 'mouth', ...who(mum) });
  add({ person_id: leo, type: 'temp', at: now - 3 * HOUR, temp_c: 37.8, method: 'armpit', ...who(dad) });
}

const csvCell = (v) => { if (v == null) return ''; const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

// ---------- accounts ----------
const userCount = () => db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, parent_id: u.parent_id, is_admin: !!u.is_admin, must_change_password: !!u.must_change_password });
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
const passwordProblem = (p) => (typeof p !== 'string' || p.length < 8 ? 'Password must be at least 8 characters' : p.length > 200 ? 'Password is too long' : null);

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/** The address the browser used, e.g. https://health.example.com (passkeys are tied to it). */
function requestOrigin(req) {
  if (PUBLIC_URL) return PUBLIC_URL;
  const proto = String(req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')).split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  return `${proto}://${host}`;
}
function passkeysAllowed(origin) {
  const u = new URL(origin);
  const isIp = /^[\d.]+$/.test(u.hostname) || u.hostname.includes(':');
  return (u.protocol === 'https:' || u.hostname === 'localhost') && !isIp;
}

/** Finds the signed-in user from a Bearer token (iPhone app) or session cookie (web app). */
function authenticate(req) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  const token = bearer || parseCookies(req).fh_session;
  if (!token) return null;
  const row = db.prepare('SELECT s.id AS session_id, s.last_used, u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?').get(Auth.tokenHash(token));
  if (!row) return null;
  const now = Date.now();
  if (row.last_used < now - SESSION_DAYS * 86400e3) { db.prepare('DELETE FROM sessions WHERE id=?').run(row.session_id); return null; }
  if (row.last_used < now - 3600e3) db.prepare('UPDATE sessions SET last_used=? WHERE id=?').run(now, row.session_id);
  return { user: row, sessionId: row.session_id, viaCookie: !bearer };
}

function startSession(req, res, user, device) {
  const token = Auth.newToken();
  const now = Date.now();
  db.prepare('INSERT INTO sessions (token_hash, user_id, device, created_at, last_used) VALUES (?,?,?,?,?)')
    .run(Auth.tokenHash(token), user.id, str(device, 80) || deviceFromAgent(req.headers['user-agent']), now, now);
  const secure = requestOrigin(req).startsWith('https:') ? '; Secure' : '';
  res.setHeader('Set-Cookie', `fh_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
  return { token, user: publicUser(user) };
}
function deviceFromAgent(ua = '') {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return browser ? `${browser} on ${os}` : os;
}

// Slow down guessing: 8 failures per account (or 30 per network address) in 15 minutes.
const failures = new Map();
function rateLimited(key, max = 8) {
  const f = failures.get(key);
  return f && f.count >= max && Date.now() - f.first < 15 * 60e3;
}
function noteFailure(key) {
  const f = failures.get(key);
  if (!f || Date.now() - f.first > 15 * 60e3) failures.set(key, { count: 1, first: Date.now() });
  else f.count++;
}

/** Links a new account to an existing parent profile with the same name, or creates one. */
function parentFor(name) {
  const existing = db.prepare('SELECT p.id FROM parents p LEFT JOIN users u ON u.parent_id = p.id WHERE u.id IS NULL AND p.name = ? COLLATE NOCASE').get(name);
  if (existing) return existing.id;
  const sort = db.prepare('SELECT COALESCE(MAX(sort),0)+1 AS s FROM parents').get().s;
  const colors = ['#AF52DE', '#30B0C7', '#5856D6', '#FF9500', '#34C759'];
  return Number(db.prepare('INSERT INTO parents (name, color, emoji, sort) VALUES (?,?,?,?)').run(name, colors[(sort - 1) % colors.length], '', sort).lastInsertRowid);
}

function createUser({ name, email, password, isAdmin = false, mustChange = false, parentId = null }) {
  name = str(name, 60); email = str(email, 200);
  if (!name) throw new Error('Name required');
  if (!validEmail(email)) throw new Error('Enter a valid email address');
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new Error('An account with that email already exists');
  const pid = parentId && db.prepare('SELECT 1 FROM parents WHERE id=?').get(parentId) ? parentId : parentFor(name);
  const id = Number(db.prepare('INSERT INTO users (email, name, password_hash, parent_id, is_admin, must_change_password, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(email, name, Auth.hashPassword(password), pid, isAdmin ? 1 : 0, mustChange ? 1 : 0, Date.now()).lastInsertRowid);
  return db.prepare('SELECT * FROM users WHERE id=?').get(id);
}

/** Removes every family record and photo (used when the last account is deleted and asks for it). */
function eraseAllRecords() {
  for (const t of ['entries', 'person_doses', 'people', 'parents', 'webhooks', 'push_subs', 'apns_devices', 'sent_notifications']) db.exec(`DELETE FROM ${t}`);
  db.exec("DELETE FROM settings WHERE key IN ('pin','notify','unit')");
  for (const f of fs.readdirSync(PHOTO_DIR)) fs.rm(path.join(PHOTO_DIR, f), () => {});
}

// Optional: create the first admin from environment variables (handy for headless installs).
if (userCount() === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  createUser({ name: process.env.ADMIN_NAME || 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, isAdmin: true });
  console.log(`Created admin account ${process.env.ADMIN_EMAIL}`);
}

async function authApi(req, res, url) {
  const route = url.pathname.slice('/api/auth/'.length);
  const m = req.method;
  const origin = requestOrigin(req);
  const rpId = new URL(origin).hostname;
  const passkeys = passkeysAllowed(origin);
  const body = m === 'GET' || m === 'DELETE' ? {} : await readBody(req);
  const ip = req.socket.remoteAddress || '';

  if (route === 'status' && m === 'GET') {
    const a = authenticate(req);
    return send(res, 200, { setupRequired: userCount() === 0, user: a ? publicUser(a.user) : null, passkeys });
  }

  if (route === 'setup' && m === 'POST') {
    if (userCount() > 0) return send(res, 403, { error: 'This server already has an account. Please sign in.' });
    try {
      const user = createUser({ ...body, isAdmin: true });
      return send(res, 200, startSession(req, res, user, body.device));
    } catch (e) { return send(res, 400, { error: e.message }); }
  }

  if (route === 'login' && m === 'POST') {
    const email = str(body.email, 200) || '';
    const key = `${ip}|${email.toLowerCase()}`;
    if (rateLimited(key) || rateLimited(ip, 30)) return send(res, 429, { error: 'Too many attempts. Please wait 15 minutes and try again.' });
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!Auth.verifyPassword(String(body.password || ''), user && user.password_hash)) {
      noteFailure(key); noteFailure(ip);
      return send(res, 401, { error: 'Email or password is incorrect' });
    }
    failures.delete(key);
    return send(res, 200, startSession(req, res, user, body.device));
  }

  if (route === 'passkey/login-options' && m === 'POST') {
    if (!passkeys) return send(res, 400, { error: 'Passkeys need the app to be opened over HTTPS with a domain name.' });
    return send(res, 200, { challenge: Auth.newChallenge('auth'), rpId, timeout: 120000, userVerification: 'preferred' });
  }
  if (route === 'passkey/login' && m === 'POST') {
    if (rateLimited(ip, 30)) return send(res, 429, { error: 'Too many attempts. Please wait 15 minutes and try again.' });
    const cred = body.credential || {};
    const stored = db.prepare('SELECT * FROM passkeys WHERE id = ?').get(String(cred.id || ''));
    try {
      if (!stored) throw new Error("This passkey isn't registered on this server");
      const count = Auth.verifyAssertion({ credential: cred, origin, rpId, stored });
      db.prepare('UPDATE passkeys SET sign_count=?, last_used=? WHERE id=?').run(count, Date.now(), stored.id);
      const user = db.prepare('SELECT * FROM users WHERE id=?').get(stored.user_id);
      return send(res, 200, startSession(req, res, user, body.device));
    } catch (e) { noteFailure(ip); return send(res, 401, { error: e.message }); }
  }

  // Everything below needs a signed-in user
  const a = authenticate(req);
  if (!a) return send(res, 401, { error: 'Please sign in' });
  if (a.viaCookie && m !== 'GET' && req.headers['x-requested-with'] !== 'fetch') return send(res, 403, { error: 'Missing request header' });
  const user = a.user;

  if (route === 'logout' && m === 'POST') {
    db.prepare('DELETE FROM sessions WHERE id=?').run(a.sessionId);
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'fh_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
  }
  if (route === 'account/delete' && m === 'POST') {
    if (!Auth.verifyPassword(String(body.password || ''), user.password_hash)) return send(res, 403, { error: 'Password is incorrect' });
    const others = db.prepare('SELECT * FROM users WHERE id<>? ORDER BY id').all(user.id);
    if (user.is_admin && others.length && !others.some((o) => o.is_admin)) {
      db.prepare('UPDATE users SET is_admin=1 WHERE id=?').run(others[0].id); // someone must be able to manage accounts
    }
    db.prepare('DELETE FROM users WHERE id=?').run(user.id); // sessions, passkeys and push devices go with it
    if (!others.length && body.eraseRecords) eraseAllRecords();
    return send(res, 200, { ok: true, erased: !others.length && !!body.eraseRecords }, { 'Set-Cookie': 'fh_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
  }
  if (route === 'me' && m === 'GET') {
    return send(res, 200, {
      user: publicUser(user),
      passkeys: db.prepare('SELECT id, name, created_at, last_used FROM passkeys WHERE user_id=? ORDER BY created_at').all(user.id),
      sessions: db.prepare('SELECT id, device, created_at, last_used FROM sessions WHERE user_id=? ORDER BY last_used DESC').all(user.id)
        .map((s) => ({ ...s, current: s.id === a.sessionId })),
      passkeysAvailable: passkeys,
    });
  }
  if (route === 'password' && m === 'POST') {
    if (!user.must_change_password && !Auth.verifyPassword(String(body.current || ''), user.password_hash)) return send(res, 403, { error: 'Current password is incorrect' });
    const problem = passwordProblem(body.password);
    if (problem) return send(res, 400, { error: problem });
    db.prepare('UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?').run(Auth.hashPassword(body.password), user.id);
    db.prepare('DELETE FROM sessions WHERE user_id=? AND id<>?').run(user.id, a.sessionId); // sign out other devices
    return send(res, 200, { user: publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(user.id)) });
  }
  if (route === 'passkey/register-options' && m === 'POST') {
    if (!passkeys) return send(res, 400, { error: 'Passkeys need the app to be opened over HTTPS with a domain name.' });
    return send(res, 200, {
      challenge: Auth.newChallenge('reg', user.id),
      rp: { name: 'NestHealth', id: rpId },
      user: { id: Auth.b64u(Buffer.from(`user-${user.id}`)), name: user.email, displayName: user.name },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -8 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
      excludeCredentials: db.prepare('SELECT id FROM passkeys WHERE user_id=?').all(user.id).map((p) => ({ type: 'public-key', id: p.id })),
      attestation: 'none',
      timeout: 120000,
    });
  }
  if (route === 'passkey/register' && m === 'POST') {
    try {
      const c = Auth.verifyRegistration({ credential: body.credential, origin, rpId });
      if (c.userId !== user.id) throw new Error('Passkey request was for a different account');
      db.prepare('INSERT INTO passkeys (id, user_id, jwk, alg, sign_count, name, created_at) VALUES (?,?,?,?,?,?,?)')
        .run(c.id, user.id, c.jwk, c.alg, c.signCount, str(body.name, 80) || 'Passkey', Date.now());
      return send(res, 200, { ok: true });
    } catch (e) { return send(res, 400, { error: e.message }); }
  }
  const pk = route.match(/^passkeys\/(.+)$/);
  if (pk && m === 'DELETE') {
    db.prepare('DELETE FROM passkeys WHERE id=? AND user_id=?').run(decodeURIComponent(pk[1]), user.id);
    return send(res, 200, { ok: true });
  }
  const ss = route.match(/^sessions\/(\d+)$/);
  if (ss && m === 'DELETE') {
    db.prepare('DELETE FROM sessions WHERE id=? AND user_id=?').run(Number(ss[1]), user.id);
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'Not found' });
}

/** Family accounts, managed by an admin. */
async function usersApi(req, res, url) {
  const me = req.user;
  const id = Number(url.pathname.split('/')[3]) || null;
  const sub = url.pathname.split('/')[4];
  const list = () => db.prepare(`SELECT u.id, u.email, u.name, u.parent_id, u.is_admin, u.must_change_password,
    (SELECT COUNT(*) FROM passkeys p WHERE p.user_id=u.id) AS passkeys,
    (SELECT MAX(last_used) FROM sessions s WHERE s.user_id=u.id) AS last_active FROM users u ORDER BY u.id`).all()
    .map((u) => ({ ...u, is_admin: !!u.is_admin, must_change_password: !!u.must_change_password }));
  if (req.method === 'GET') return send(res, 200, list());
  if (!me.is_admin) return send(res, 403, { error: 'Only an admin can manage family accounts' });
  const body = req.method === 'DELETE' ? {} : await readBody(req);
  if (req.method === 'POST' && !id) {
    try { createUser({ ...body, parentId: num(body.parent_id), isAdmin: !!body.is_admin, mustChange: true }); }
    catch (e) { return send(res, 400, { error: e.message }); }
    return send(res, 200, list());
  }
  if (req.method === 'POST' && id && sub === 'password') {
    const problem = passwordProblem(body.password);
    if (problem) return send(res, 400, { error: problem });
    db.prepare('UPDATE users SET password_hash=?, must_change_password=1 WHERE id=?').run(Auth.hashPassword(body.password), id);
    db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
    return send(res, 200, list());
  }
  if (req.method === 'DELETE' && id) {
    if (id === me.id) return send(res, 400, { error: "You can't remove your own account" });
    db.prepare('DELETE FROM users WHERE id=?').run(id);
    return send(res, 200, list());
  }
  return send(res, 404, { error: 'Not found' });
}

// ---------- API ----------
async function api(req, res, url) {
  const [resource, idStr, sub] = url.pathname.split('/').filter(Boolean).slice(1);
  const id = idStr && /^\d+$/.test(idStr) ? Number(idStr) : null;
  const m = req.method;
  const ok = () => send(res, 200, getState(req.user));

  if (resource === 'state' && m === 'GET') return ok();

  if (resource === 'settings' && m === 'PUT') {
    const b = await readBody(req);
    if (b.unit === 'C' || b.unit === 'F') setSetting('unit', b.unit);
    if (b.notify && typeof b.notify === 'object') {
      const cur = notifySettings(), nx = b.notify;
      const clean = {
        doseDue: nx.doseDue ?? cur.doseDue, doseGiven: nx.doseGiven ?? cur.doseGiven, fever: nx.fever ?? cur.fever,
        feverC: Math.min(41, Math.max(37, num(nx.feverC) ?? cur.feverC)), checkH: Math.min(12, Math.max(0, num(nx.checkH) ?? cur.checkH)),
      };
      setSetting('notify', JSON.stringify(clean));
    }
    return ok();
  }

  if (resource === 'pin') {
    const b = await readBody(req);
    if (idStr === 'verify' && m === 'POST') return send(res, 200, { ok: checkPin(b.pin || '') });
    if (m === 'PUT') {
      if (!checkPin(b.current || '')) return send(res, 403, { error: 'Current passcode is incorrect' });
      if (!b.pin) db.prepare("DELETE FROM settings WHERE key='pin'").run();
      else if (/^\d{4}$/.test(b.pin)) setSetting('pin', hashPin(b.pin));
      else return send(res, 400, { error: 'Passcode must be 4 digits' });
      return ok();
    }
  }

  if ((resource === 'people' || resource === 'parents') && sub === 'photo' && id) {
    if (m === 'POST') {
      try { savePhoto(resource, id, (await readBody(req, 5e6)).data); } catch (e) { return send(res, 400, { error: e.message }); }
    } else if (m === 'DELETE') removePhoto(resource, id);
    return ok();
  }

  // A child's usual dose of a medicine, copied by the parent from the label (used by Quick Dose).
  if (resource === 'people' && sub === 'doses' && id && m === 'PUT') {
    const b = await readBody(req);
    const medId = num(b.medicine_id);
    if (!medId || !db.prepare('SELECT 1 FROM medicines WHERE id=?').get(medId)) return send(res, 400, { error: 'Medicine not found' });
    const dose = str(b.dose, 60);
    if (dose) db.prepare('INSERT INTO person_doses (person_id, medicine_id, dose) VALUES (?,?,?) ON CONFLICT(person_id, medicine_id) DO UPDATE SET dose=excluded.dose').run(id, medId, dose);
    else db.prepare('DELETE FROM person_doses WHERE person_id=? AND medicine_id=?').run(id, medId);
    return ok();
  }

  if (resource === 'people') {
    if (m === 'POST' || m === 'PUT') {
      const b = await readBody(req);
      const name = str(b.name, 60);
      if (!name) return send(res, 400, { error: 'Name required' });
      const vals = [name, str(b.color, 20) || '#007AFF', str(b.emoji, 16) || '', str(b.dob, 10), num(b.weight_kg)];
      let newId = id;
      if (m === 'POST') {
        const sort = db.prepare('SELECT COALESCE(MAX(sort),0)+1 AS s FROM people').get().s;
        newId = Number(db.prepare('INSERT INTO people (name, color, emoji, dob, weight_kg, sort) VALUES (?,?,?,?,?,?)').run(...vals, sort).lastInsertRowid);
      } else db.prepare('UPDATE people SET name=?, color=?, emoji=?, dob=?, weight_kg=? WHERE id=?').run(...vals, id);
      return send(res, 200, { ...getState(req.user), id: newId });
    }
    if (m === 'DELETE' && id) { removePhoto('people', id); db.prepare('DELETE FROM people WHERE id=?').run(id); return ok(); }
  }

  if (resource === 'parents') {
    if (m === 'POST' || m === 'PUT') {
      const b = await readBody(req);
      const name = str(b.name, 40);
      if (!name) return send(res, 400, { error: 'Name required' });
      const vals = [name, str(b.color, 20) || '#5856D6', str(b.emoji, 16) || ''];
      let newId = id;
      if (m === 'POST') {
        const sort = db.prepare('SELECT COALESCE(MAX(sort),0)+1 AS s FROM parents').get().s;
        newId = Number(db.prepare('INSERT INTO parents (name, color, emoji, sort) VALUES (?,?,?,?)').run(...vals, sort).lastInsertRowid);
      } else db.prepare('UPDATE parents SET name=?, color=?, emoji=? WHERE id=?').run(...vals, id);
      return send(res, 200, { ...getState(req.user), id: newId });
    }
    if (m === 'DELETE' && id) { removePhoto('parents', id); db.prepare('DELETE FROM parents WHERE id=?').run(id); return ok(); }
  }

  if (resource === 'medicines') {
    if (m === 'POST' || m === 'PUT') {
      const b = await readBody(req);
      const name = str(b.name, 100);
      if (!name) return send(res, 400, { error: 'Name required' });
      const vals = [name, str(b.default_dose, 60) || '', num(b.min_interval_h), num(b.max_per_24h)];
      if (m === 'POST') db.prepare('INSERT INTO medicines (name, default_dose, min_interval_h, max_per_24h) VALUES (?,?,?,?)').run(...vals);
      else db.prepare('UPDATE medicines SET name=?, default_dose=?, min_interval_h=?, max_per_24h=? WHERE id=?').run(...vals, id);
      return ok();
    }
    if (m === 'DELETE' && id) { db.prepare('UPDATE medicines SET archived=1 WHERE id=?').run(id); return ok(); } // keeps history
  }

  if (resource === 'entries') {
    if (m === 'GET') {
      const days = Math.min(Number(url.searchParams.get('days') || 30), 3650);
      return send(res, 200, db.prepare('SELECT * FROM entries WHERE at>=? ORDER BY at DESC').all(Date.now() - days * DAY));
    }
    if (m === 'POST' || m === 'PUT') {
      let f;
      try { const b = await readBody(req); f = entryFields({ ...b, by_parent_id: "by_parent_id" in b ? b.by_parent_id : req.user.parent_id }); } catch (e) { return send(res, 400, { error: e.message }); }
      const vals = ENTRY_COLS.map((c) => f[c]);
      if (m === 'POST') {
        const r = db.prepare(`INSERT INTO entries (${ENTRY_COLS.join(',')}, created_at) VALUES (${ENTRY_COLS.map(() => '?').join(',')}, ?)`).run(...vals, Date.now());
        const e = db.prepare('SELECT * FROM entries WHERE id=?').get(r.lastInsertRowid);
        onNewEntry(e);
        return send(res, 200, e);
      }
      db.prepare(`UPDATE entries SET ${ENTRY_COLS.map((c) => c + '=?').join(',')} WHERE id=?`).run(...vals, id);
      return send(res, 200, db.prepare('SELECT * FROM entries WHERE id=?').get(id));
    }
    if (m === 'DELETE' && id) { db.prepare('DELETE FROM entries WHERE id=?').run(id); return send(res, 200, { ok: true }); }
  }

  if (resource === 'push' && (idStr === 'apns' || idStr === 'apns-remove') && m === 'POST') {
    const b = await readBody(req);
    const token = String(b.token || '').toLowerCase();
    if (!/^[0-9a-f]{32,200}$/.test(token)) return send(res, 400, { error: 'Invalid device token' });
    if (idStr === 'apns-remove') { db.prepare('DELETE FROM apns_devices WHERE token=?').run(token); return send(res, 200, { ok: true }); }
    db.prepare(`INSERT INTO apns_devices (token, environment, session_id, user_id, parent_id, device, created_at) VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(token) DO UPDATE SET environment=excluded.environment, session_id=excluded.session_id, user_id=excluded.user_id, parent_id=excluded.parent_id, device=excluded.device`)
      .run(token, b.environment === 'development' ? 'development' : 'production', req.sessionId, req.user.id, req.user.parent_id, str(b.device, 60) || 'iPhone', Date.now());
    return send(res, 200, { ok: true, enabled: APNs.enabled() });
  }

  if (resource === 'push') {
    const b = await readBody(req);
    if (idStr === 'subscribe' && m === 'POST') {
      const s = b.subscription || {};
      if (!s.endpoint || !s.keys || !s.keys.p256dh || !s.keys.auth) return send(res, 400, { error: 'Invalid subscription' });
      db.prepare(`INSERT INTO push_subs (endpoint, p256dh, auth, parent_id, device, created_at) VALUES (?,?,?,?,?,?)
        ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, parent_id=excluded.parent_id, device=excluded.device`)
        .run(s.endpoint, s.keys.p256dh, s.keys.auth, num(b.parent_id), str(b.device, 60) || 'Device', Date.now());
      return ok();
    }
    if (idStr === 'unsubscribe' && m === 'POST') {
      if (b.endpoint) db.prepare('DELETE FROM push_subs WHERE endpoint=?').run(b.endpoint);
      if (b.id) db.prepare('DELETE FROM push_subs WHERE id=?').run(num(b.id));
      return ok();
    }
  }

  if (resource === 'webhooks') {
    if (sub === 'test' && id && m === 'POST') {
      const hook = db.prepare('SELECT * FROM webhooks WHERE id=?').get(id);
      const [r] = await dispatch({ event: 'test', title: 'NestHealth test', body: 'Webhook notifications are working.' }, { onlyWebhook: hook });
      return send(res, 200, r);
    }
    if (m === 'POST' || m === 'PUT') {
      const b = await readBody(req);
      const u = str(b.url, 500);
      if (!u || !/^https?:\/\//i.test(u)) return send(res, 400, { error: 'Enter a URL starting with http:// or https://' });
      const vals = [str(b.name, 60) || new URL(u).hostname, u, ['json', 'ntfy', 'discord', 'slack'].includes(b.format) ? b.format : 'json', b.enabled === false ? 0 : 1];
      if (m === 'POST') db.prepare('INSERT INTO webhooks (name, url, format, enabled) VALUES (?,?,?,?)').run(...vals);
      else db.prepare('UPDATE webhooks SET name=?, url=?, format=?, enabled=? WHERE id=?').run(...vals, id);
      return ok();
    }
    if (m === 'DELETE' && id) { db.prepare('DELETE FROM webhooks WHERE id=?').run(id); return ok(); }
  }

  if (resource === 'notify' && idStr === 'test' && m === 'POST') {
    const results = await dispatch({ event: 'test', title: 'NestHealth', body: 'Test notification – everything is working.' });
    return send(res, 200, { results });
  }

  if (resource === 'demo' && m === 'POST') {
    try { loadDemo(); } catch (e) { return send(res, 400, { error: e.message }); }
    return ok();
  }

  if (resource === 'export.csv' && m === 'GET') {
    const rows = db.prepare('SELECT e.*, p.name AS person FROM entries e JOIN people p ON p.id = e.person_id ORDER BY e.at').all();
    const head = ['time', 'person', 'type', 'temp_c', 'method', 'medicine', 'dose', 'note', 'logged_by'];
    const lines = rows.map((r) => [new Date(r.at).toISOString(), r.person, r.type, r.temp_c, r.method, r.medicine_name, r.dose, r.note, r.by_name].map(csvCell).join(','));
    return send(res, 200, [head.join(','), ...lines].join('\n'), {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="nesthealth-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
  }

  return send(res, 404, { error: 'Not found' });
}

// ---------- static ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

function serveFile(res, file, cache) {
  fs.readFile(file, (err, buf) => {
    // Missing files like /privacy.html get a real 404; only extensionless paths fall back to the app.
    if (err && path.extname(file)) return send(res, 404, 'Not found');
    if (err) return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, html) => (e2 ? send(res, 404, 'Not found') : send(res, 200, html, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' })));
    send(res, 200, buf, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': cache });
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/healthz') return send(res, 200, 'ok');
    // The privacy policy and support pages live on the public website, not on the family's server.
    const legal = url.pathname.match(/^\/(privacy|support)(\.html)?$/);
    if (legal) { res.writeHead(301, { Location: `${SITE_URL}/${legal[1]}` }); return res.end(); }
    if (url.pathname === '/.well-known/apple-app-site-association') {
      const cfg = APNs.config;
      if (!cfg.teamId) return send(res, 404, { error: 'Set APPLE_TEAM_ID to enable passkeys in the iPhone app' });
      return send(res, 200, { webcredentials: { apps: [`${cfg.teamId}.${cfg.bundleId}`] } });
    }
    if (url.pathname.startsWith('/api/auth/')) return await authApi(req, res, url);
    // Everything else under /api and /photos needs a signed-in user.
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/photos/')) {
      const a = authenticate(req);
      if (!a) return send(res, 401, { error: 'Please sign in', setupRequired: userCount() === 0 });
      if (a.viaCookie && req.method !== 'GET' && req.method !== 'HEAD' && req.headers['x-requested-with'] !== 'fetch') {
        return send(res, 403, { error: 'Missing request header' });
      }
      req.user = a.user;
      req.sessionId = a.sessionId;
      if (url.pathname.startsWith('/api/users')) return await usersApi(req, res, url);
      if (url.pathname.startsWith('/api/')) return await api(req, res, url);
      const photo = path.join(PHOTO_DIR, path.basename(url.pathname));
      return fs.readFile(photo, (err, buf) => (err ? send(res, 404, 'Not found')
        : send(res, 200, buf, { 'Content-Type': MIME[path.extname(photo)] || 'application/octet-stream', 'Cache-Control': 'private, max-age=31536000, immutable' })));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    const p = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const file = path.normalize(path.join(PUBLIC_DIR, p));
    if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden');
    return serveFile(res, file, file.endsWith('.png') ? 'public, max-age=604800' : 'no-cache');
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Server error' });
  }
}).listen(PORT, () => console.log(`NestHealth listening on :${PORT} (data: ${DATA_DIR})`));

const shutdown = () => { try { db.close(); } catch {} process.exit(0); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
