// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 M Hansford. See LICENSE.
// Notifications: Web Push (VAPID + RFC 8291 aes128gcm, no dependencies) and webhooks.
'use strict';
const crypto = require('node:crypto');

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const fromB64u = (s) => Buffer.from(s, 'base64url');

// ---------- VAPID ----------
function createVapidKeys() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = publicKey.export({ format: 'jwk' });
  return {
    privateJwk: privateKey.export({ format: 'jwk' }),
    publicKey: b64u(Buffer.concat([Buffer.from([4]), fromB64u(jwk.x), fromB64u(jwk.y)])),
  };
}

function vapidHeader(endpoint, vapid, subject) {
  const aud = new URL(endpoint).origin;
  const header = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = b64u(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject }));
  const key = crypto.createPrivateKey({ key: vapid.privateJwk, format: 'jwk' });
  const sig = crypto.sign('sha256', Buffer.from(`${header}.${claims}`), { key, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${header}.${claims}.${b64u(sig)}, k=${vapid.publicKey}`;
}

// ---------- RFC 8291 payload encryption ----------
function encrypt(payload, p256dh, auth) {
  const uaPublic = fromB64u(p256dh);
  const authSecret = fromB64u(auth);
  const ecdh = crypto.createECDH('prime256v1');
  const asPublic = ecdh.generateKeys();
  const shared = ecdh.computeSecret(uaPublic);
  const salt = crypto.randomBytes(16);
  const hkdf = (ikm, s, info, len) => Buffer.from(crypto.hkdfSync('sha256', ikm, s, info, len));

  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic]);
  const ikm = hkdf(shared, authSecret, keyInfo, 32);
  const cek = hkdf(ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = hkdf(ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12);

  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, body]);
}

async function sendPush(sub, message, vapid, subject) {
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: vapidHeader(sub.endpoint, vapid, subject),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '43200',
      Urgency: message.urgent ? 'high' : 'normal',
    },
    body: encrypt(JSON.stringify(message), sub.p256dh, sub.auth),
    signal: AbortSignal.timeout(10000),
  });
  return res.status;
}

// ---------- Webhooks ----------
// HTTP headers must be Latin-1; use RFC 2047 encoding for anything else (supported by ntfy).
const headerSafe = (s) => (/^[\x20-\xff]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s).toString('base64')}?=`);

async function sendWebhook(hook, ev) {
  let headers = { 'Content-Type': 'application/json' }, body;
  switch (hook.format) {
    case 'ntfy':
      headers = {
        'Content-Type': 'text/plain; charset=utf-8',
        Title: headerSafe(ev.title),
        Tags: { dose_due: 'pill', dose_given: 'pill', fever: 'thermometer', check_temp: 'thermometer' }[ev.event] || 'bell',
        Priority: ev.urgent ? '4' : '3',
      };
      body = ev.body;
      break;
    case 'discord': body = JSON.stringify({ content: `**${ev.title}**\n${ev.body}` }); break;
    case 'slack': body = JSON.stringify({ text: `*${ev.title}*\n${ev.body}` }); break;
    default:
      body = JSON.stringify({ event: ev.event, title: ev.title, message: ev.body, person: ev.person || null, time: new Date().toISOString(), data: ev.data || {} });
  }
  const res = await fetch(hook.url, { method: 'POST', headers, body, signal: AbortSignal.timeout(10000) });
  return res.status;
}

module.exports = { createVapidKeys, sendPush, sendWebhook, encrypt };
