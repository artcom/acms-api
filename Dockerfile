FROM node:18.12-bullseye-slim AS builder

ARG JOBS=max

RUN apt update && apt install -y build-essential libssl-dev libpcre3 libkrb5-dev python3
COPY . /app
WORKDIR /app
RUN npm install --omit=dev

FROM node:18.12-bullseye-slim
ENV PORT=3000

RUN apt update && apt install -y curl dumb-init

COPY --from=builder /app /app
WORKDIR /app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT}/.health
