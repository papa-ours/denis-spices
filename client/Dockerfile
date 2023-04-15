FROM node:16-alpine3.16

RUN mkdir -p /usr/src/client
WORKDIR /usr/src/client

COPY package*.json /usr/src/client/

RUN npm install -g ionic
RUN npm install --legacy-peer-deps

COPY ./ /usr/src/client/

RUN npm run-script build

EXPOSE 3000

CMD [ "node", "server.js" ]