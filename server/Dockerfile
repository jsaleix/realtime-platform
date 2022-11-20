FROM node:alpine

WORKDIR /usr/local/server
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN npm i
CMD ["node", "index.js"]