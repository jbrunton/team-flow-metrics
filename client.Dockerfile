FROM node:14
WORKDIR "/app"

COPY package.json package-lock.json lerna.json ./
RUN npm ci

COPY client/package.json client/package-lock.json ./client/
COPY api/package.json api/package-lock.json ./api/
RUN npx lerna bootstrap --ci

COPY . .
CMD npx lerna run --stream --scope metrics-client serve
