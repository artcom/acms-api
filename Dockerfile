FROM node:14.19-buster
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
