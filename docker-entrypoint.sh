#!/bin/sh
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 M Hansford. See LICENSE.
#
# Runs the server as PUID:PGID (default 1000:1000, the image's `node` user). On Unraid use 99:100.
# When the container starts as root, the data folder is handed to that user first, so bind mounts
# such as /mnt/user/appdata/nesthealth work. If the container is started with --user, it just runs.
set -e
DATA_DIR="${DATA_DIR:-/data}"

if [ "$(id -u)" = "0" ]; then
  PUID="${PUID:-1000}"
  PGID="${PGID:-1000}"
  mkdir -p "$DATA_DIR"
  if [ "$(stat -c %u:%g "$DATA_DIR")" != "$PUID:$PGID" ]; then
    echo "[nesthealth] Giving $DATA_DIR to $PUID:$PGID"
    chown -R "$PUID:$PGID" "$DATA_DIR"
  fi
  exec su-exec "$PUID:$PGID" "$@"
fi

exec "$@"
