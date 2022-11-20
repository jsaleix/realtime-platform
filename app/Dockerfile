FROM node:alpine

WORKDIR /home/node
COPY package.json ./
COPY ./ ./
RUN npm i
CMD ["npm", "run", "dev"]