// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 M Hansford. See LICENSE.
// Accounts: password hashing, sessions and passkeys (WebAuthn) with no dependencies.
'use strict';
const crypto = require('node:crypto');

const b64u = (b) => Buffer.from(b).toString('base64url');
const fromB64u = (s) => Buffer.from(String(s || ''), 'base64url');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest();

// ---------- passwords (scrypt) ----------
const SCRYPT = { N: 16384, r: 8, p: 1 };
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return `scrypt$${b64u(salt)}$${b64u(crypto.scryptSync(password, salt, 64, SCRYPT))}`;
}
function verifyPassword(password, stored) {
  if (!stored) { crypto.scryptSync(String(password), 'no-user', 64, SCRYPT); return false; } // same work either way
  const [, salt, hash] = stored.split('$');
  const expected = fromB64u(hash);
  const actual = crypto.scryptSync(String(password), fromB64u(salt), 64, SCRYPT);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// ---------- session tokens ----------
const newToken = () => b64u(crypto.randomBytes(32));
const tokenHash = (t) => sha256(String(t)).toString('hex');

// ---------- minimal CBOR decoder (enough for WebAuthn) ----------
function cborDecode(buf) {
  let pos = 0;
  const len = (ai) => {
    if (ai < 24) return ai;
    if (ai === 24) return buf[pos++];
    if (ai === 25) { const v = buf.readUInt16BE(pos); pos += 2; return v; }
    if (ai === 26) { const v = buf.readUInt32BE(pos); pos += 4; return v; }
    if (ai === 27) { const v = Number(buf.readBigUInt64BE(pos)); pos += 8; return v; }
    throw new Error('Unsupported CBOR length');
  };
  const item = () => {
    const b = buf[pos++], major = b >> 5, ai = b & 31;
    switch (major) {
      case 0: return len(ai);
      case 1: return -1 - len(ai);
      case 2: { const n = len(ai); const v = buf.subarray(pos, pos + n); pos += n; return v; }
      case 3: { const n = len(ai); const v = buf.toString('utf8', pos, pos + n); pos += n; return v; }
      case 4: { const n = len(ai); const a = []; for (let i = 0; i < n; i++) a.push(item()); return a; }
      case 5: { const n = len(ai); const m = new Map(); for (let i = 0; i < n; i++) { const k = item(); m.set(k, item()); } return m; }
      case 7:
        if (ai === 20) return false;
        if (ai === 21) return true;
        if (ai === 22 || ai === 23) return null;
        throw new Error('Unsupported CBOR value');
      default: throw new Error('Unsupported CBOR type');
    }
  };
  const value = item();
  return { value, length: pos };
}

// ---------- WebAuthn ----------
function parseAuthData(buf) {
  if (buf.length < 37) throw new Error('Invalid passkey data');
  const out = { rpIdHash: buf.subarray(0, 32), flags: buf[32], signCount: buf.readUInt32BE(33) };
  if (out.flags & 0x40) { // attested credential data present
    const idLen = buf.readUInt16BE(53);
    out.credId = buf.subarray(55, 55 + idLen);
    out.cose = cborDecode(buf.subarray(55 + idLen)).value;
  }
  return out;
}

function coseToJwk(m) {
  const kty = m.get(1), alg = m.get(3);
  if (kty === 2 && m.get(-1) === 1) return { alg, jwk: { kty: 'EC', crv: 'P-256', x: b64u(m.get(-2)), y: b64u(m.get(-3)) } };
  if (kty === 3) return { alg, jwk: { kty: 'RSA', n: b64u(m.get(-1)), e: b64u(m.get(-2)) } };
  if (kty === 1 && m.get(-1) === 6) return { alg, jwk: { kty: 'OKP', crv: 'Ed25519', x: b64u(m.get(-2)) } };
  throw new Error('This passkey type is not supported');
}

const challenges = new Map(); // challenge -> { type, userId, expires }
function newChallenge(type, userId = null) {
  const now = Date.now();
  for (const [k, v] of challenges) if (v.expires < now) challenges.delete(k);
  const c = b64u(crypto.randomBytes(32));
  challenges.set(c, { type, userId, expires: now + 5 * 60e3 });
  return c;
}
function takeChallenge(c, type) {
  const v = challenges.get(c);
  challenges.delete(c);
  if (!v || v.type !== type || v.expires < Date.now()) throw new Error('The passkey request expired. Please try again.');
  return v;
}

function checkClientData(raw, type, origin) {
  let cd;
  try { cd = JSON.parse(raw.toString('utf8')); } catch { throw new Error('Invalid passkey response'); }
  if (cd.type !== type) throw new Error('Invalid passkey response');
  const ch = takeChallenge(cd.challenge, type === 'webauthn.create' ? 'reg' : 'auth');
  if (cd.origin !== origin) throw new Error(`Passkey was created for a different address (${cd.origin})`);
  return ch;
}

/** Verifies a navigator.credentials.create() response. Returns the credential to store. */
function verifyRegistration({ credential, origin, rpId }) {
  const r = credential && credential.response;
  if (!r) throw new Error('Invalid passkey response');
  const ch = checkClientData(fromB64u(r.clientDataJSON), 'webauthn.create', origin);
  const att = cborDecode(fromB64u(r.attestationObject)).value;
  const auth = parseAuthData(att.get('authData'));
  if (!auth.rpIdHash.equals(sha256(rpId))) throw new Error('Passkey is for a different site');
  if (!(auth.flags & 0x01)) throw new Error('Passkey did not confirm user presence');
  if (!auth.credId) throw new Error('Passkey response had no credential');
  const { alg, jwk } = coseToJwk(auth.cose);
  crypto.createPublicKey({ key: jwk, format: 'jwk' }); // make sure it's a usable key
  return { userId: ch.userId, id: b64u(auth.credId), jwk: JSON.stringify(jwk), alg, signCount: auth.signCount };
}

/** Verifies a navigator.credentials.get() response against a stored passkey. Returns the new sign count. */
function verifyAssertion({ credential, origin, rpId, stored }) {
  const r = credential && credential.response;
  if (!r) throw new Error('Invalid passkey response');
  const clientData = fromB64u(r.clientDataJSON);
  checkClientData(clientData, 'webauthn.get', origin);
  const authData = fromB64u(r.authenticatorData);
  const auth = parseAuthData(authData);
  if (!auth.rpIdHash.equals(sha256(rpId))) throw new Error('Passkey is for a different site');
  if (!(auth.flags & 0x01)) throw new Error('Passkey did not confirm user presence');
  const key = crypto.createPublicKey({ key: JSON.parse(stored.jwk), format: 'jwk' });
  const ok = crypto.verify(stored.alg === -8 ? null : 'sha256', Buffer.concat([authData, sha256(clientData)]), key, fromB64u(r.signature));
  if (!ok) throw new Error('Passkey signature is not valid');
  if (auth.signCount && stored.sign_count && auth.signCount <= stored.sign_count) throw new Error('This passkey may have been copied. Remove it and create a new one.');
  return auth.signCount;
}

module.exports = {
  b64u, fromB64u, hashPassword, verifyPassword, newToken, tokenHash,
  newChallenge, verifyRegistration, verifyAssertion, cborDecode,
};
