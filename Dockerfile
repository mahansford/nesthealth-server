FROM node:24-alpine
LABEL org.opencontainers.image.title="NestHealth server" \
      org.opencontainers.image.description="Self-hosted server and web app for NestHealth, a family fever and medicine log" \
      org.opencontainers.image.source="https://github.com/mahansford/nesthealth-server" \
      org.opencontainers.image.url="https://nesthealth.soam.uk/server" \
      org.opencontainers.image.licenses="AGPL-3.0-or-later"
ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    NODE_NO_WARNINGS=1
RUN apk add --no-cache tzdata
WORKDIR /app
COPY server.js notify.js auth.js apns.js LICENSE ./
COPY public ./public
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server.js"]
