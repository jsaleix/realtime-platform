FROM node:alpine

WORKDIR /home/node
RUN chown node:node ./
USER node
COPY package.json package-lock.json* ./
RUN npm i && npm cache clean --force
COPY ./ /home/node/
CMD ["npm", "run", "dev"]