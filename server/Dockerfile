FROM node:alpine

WORKDIR /usr/local/server
COPY package.json ./
COPY ./ ./
RUN npm i
CMD ["npm", "run", "dev"]