// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 M Hansford. See LICENSE.
/* Medicine timing helpers, shared by the app and the server.
 * The app never calculates doses. Parents record the dose from their own medicine's label,
 * and set the minimum time between doses and the daily maximum from the leaflet. */
(function (root) {
  /** Starter medicines for a new install (timings from typical UK labels; parents can change them). */
  const STARTERS = [
    { name: "Children's paracetamol", interval: 4, max: 4 },
    { name: "Children's ibuprofen", interval: 6, max: 3 },
    { name: 'Paracetamol (adult)', interval: 4, max: 4, dose: '1–2 × 500 mg tablets' },
    { name: 'Ibuprofen (adult)', interval: 4, max: 3, dose: '1–2 × 200 mg tablets' },
  ];

  function ageMonths(dob, now) {
    if (!dob) return null;
    const b = new Date(dob), n = now ? new Date(now) : new Date();
    if (Number.isNaN(b.getTime())) return null;
    let m = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
    if (n.getDate() < b.getDate()) m--;
    return m;
  }

  /** Timing rules for a medicine, as set by the parent. */
  function rulesFor(med) {
    return { interval: (med && med.min_interval_h) || null, max: (med && med.max_per_24h) || null };
  }

  /** Dose timing status from a list of that person's doses of this medicine (any order). */
  function doseStatus(doses, rules, now) {
    now = now || Date.now();
    const DAY = 864e5;
    const sorted = doses.filter((e) => e.at <= now).sort((a, b) => b.at - a.at);
    const last = sorted[0];
    const in24 = sorted.filter((e) => e.at > now - DAY);
    let nextAt = null, reason = '';
    if (last && rules.interval) { nextAt = last.at + rules.interval * 36e5; reason = 'interval'; }
    if (rules.max && in24.length >= rules.max) {
      const t = in24[rules.max - 1].at + DAY;
      if (!nextAt || t > nextAt) { nextAt = t; reason = 'max'; }
    }
    return { last, count24: in24.length, nextAt, ready: !nextAt || nextAt <= now, reason };
  }

  const api = { STARTERS, rulesFor, doseStatus, ageMonths };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Dosing = api;
})(typeof self !== 'undefined' ? self : this);
