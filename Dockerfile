FROM node:14.19-buster

ARG JOBS=max

COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
