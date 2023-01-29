FROM node:alpine

WORKDIR /home/node
RUN mkdir -p /home/node/node_modules/.vite
RUN chown -R node:node ./
USER node
COPY package.json ./
RUN npm i && npm cache clean --force
COPY ./ /home/node/
CMD ["npm", "run", "dev"]