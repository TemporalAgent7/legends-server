FROM node:lts-alpine

WORKDIR /usr/src/site

COPY . .

RUN npm ci && npm prune --production

ENV NODE_ENV=production

ENTRYPOINT [ "node", "src/index.js" ]