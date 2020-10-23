FROM node:alpine
WORKDIR "/app"

RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./
RUN npm install

COPY . .
CMD npm run serve -- --port 5001
