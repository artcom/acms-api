FROM node:14.7-buster
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
