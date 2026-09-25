// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 M Hansford. See LICENSE.
// Apple Push Notification service (APNs) sender for the iPhone app, using token (.p8 key) auth over HTTP/2.
'use strict';
const fs = require('node:fs');
const http2 = require('node:http2');
const crypto = require('node:crypto');

const cfg = {
  keyFile: process.env.APNS_KEY_FILE || '',
  keyId: process.env.APNS_KEY_ID || '',
  teamId: process.env.APPLE_TEAM_ID || process.env.APNS_TEAM_ID || '',
  bundleId: process.env.APPLE_BUNDLE_ID || 'com.mhansford.familyhealth',
  // Overrides for testing against a mock server.
  hosts: { production: process.env.APNS_HOST || 'https://api.push.apple.com', development: process.env.APNS_SANDBOX_HOST || 'https://api.sandbox.push.apple.com' },
};

let key = null;
try { if (cfg.keyFile) key = crypto.createPrivateKey(fs.readFileSync(cfg.keyFile)); }
catch (e) { console.error(`[apns] Couldn't read APNS_KEY_FILE (${cfg.keyFile}): ${e.message}`); }

const enabled = () => !!(key && cfg.keyId && cfg.teamId);

let jwt = { token: '', at: 0 };
function authToken() {
  // Apple accepts a token for up to an hour; refresh every 50 minutes.
  if (Date.now() - jwt.at < 50 * 60e3) return jwt.token;
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = `${enc({ alg: 'ES256', kid: cfg.keyId })}.${enc({ iss: cfg.teamId, iat })}`;
  const sig = crypto.sign('sha256', Buffer.from(unsigned), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  jwt = { token: `${unsigned}.${sig}`, at: Date.now() };
  return jwt.token;
}

const sessions = {};
function session(env) {
  const host = cfg.hosts[env] || cfg.hosts.production;
  let s = sessions[host];
  if (!s || s.closed || s.destroyed) {
    s = sessions[host] = http2.connect(host);
    s.on('error', () => { delete sessions[host]; });
    s.on('goaway', () => { delete sessions[host]; });
    s.setTimeout(10 * 60e3, () => s.close());
  }
  return s;
}

/**
 * Sends one notification. Returns { status, reason }. Status 410, or 400 with BadDeviceToken,
 * means the token is no longer valid and should be removed.
 */
function send(device, message) {
  const payload = JSON.stringify({
    aps: {
      alert: { title: message.title, body: message.body },
      sound: 'default',
      'thread-id': message.tag || 'family-health',
      'content-available': 1, // lets the app refresh its dose reminders in the background
      'interruption-level': message.urgent ? 'time-sensitive' : 'active',
    },
    personId: message.personId || null,
  });
  return new Promise((resolve) => {
    let req;
    const headers = {
      ':method': 'POST',
      ':path': `/3/device/${device.token}`,
      authorization: `bearer ${authToken()}`,
      'apns-topic': cfg.bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    };
    if (message.tag) headers['apns-collapse-id'] = message.tag.slice(0, 64);
    try {
      req = session(device.environment).request(headers);
    } catch (e) { return resolve({ status: 0, reason: e.message }); }
    let status = 0, body = '';
    req.setTimeout(10000, () => { req.close(); resolve({ status: 0, reason: 'timeout' }); });
    req.on('response', (h) => { status = h[':status']; });
    req.on('data', (d) => { body += d; });
    req.on('end', () => {
      let reason = '';
      try { reason = JSON.parse(body).reason || ''; } catch {}
      resolve({ status, reason });
    });
    req.on('error', (e) => resolve({ status: 0, reason: e.message }));
    req.end(payload);
  });
}

module.exports = { enabled, send, config: cfg };
