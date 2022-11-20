FROM node:alpine

WORKDIR /usr/local/server
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN npm i
RUN npm install -g nodemon
CMD ["npm", "run", "dev"]