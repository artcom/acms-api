FROM node:16.17-bullseye-slim AS builder

ARG JOBS=max

RUN apt update && apt install -y build-essential libssl-dev libpcre3 libkrb5-dev python3
COPY . /app
WORKDIR /app
RUN npm install --production

FROM node:16.17-bullseye-slim
COPY --from=builder /app /app
WORKDIR /app
CMD ["npm", "start"]
