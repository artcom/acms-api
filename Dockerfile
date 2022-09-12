FROM node:14.19-buster

ARG JOBS=max

RUN apt update && apt full-upgrade -y

COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
