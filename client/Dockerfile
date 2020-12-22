FROM node:lts-alpine
WORKDIR "/app"

RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
CMD npm run serve -- --port 5001
