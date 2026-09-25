# NestHealth server

A small home server that lets every parent's phone share the same NestHealth records. It also includes a web app that works in any browser and can be added to an iPhone or Android Home Screen.

Full documentation: **https://nesthealth.soam.uk/docs**

## Quick start (Docker)

```bash
docker compose up -d --build
```

Then open `http://<this-computer's-address>:8080` and create the first account. That account is the admin, and it can add the rest of the family under **Settings → Family Accounts**.

In the NestHealth iPhone app, choose **Share with the family**, enter the same address and sign in.

## Without Docker

You need Node.js 22.13 or newer (24 is recommended). The server has no dependencies.

```bash
node server.js
```

Records are stored in `./data`. Set `DATA_DIR` to keep them somewhere else.

## Backups

```bash
docker run --rm -v nesthealth-data:/data -v "$PWD":/backup alpine tar czf /backup/nesthealth-backup.tgz -C /data .
```

## Updating

Download the new version, replace these files (your records live in the `nesthealth-data` volume, not here), then run `docker compose up -d --build` again.

## Licence

Copyright (C) 2026 M Hansford. This server and its web app are free software, licensed under the GNU Affero General Public License v3.0 or later: see `LICENSE`. If you modify them and let other people use your version over a network, you must offer them your modified source code. The licence doesn't cover the NestHealth name or icon, so please rename forks.

---
NestHealth is a logbook, not medical advice, and it doesn't calculate doses. Always follow your medicine's label, and contact your GP or NHS 111 if you're worried.
