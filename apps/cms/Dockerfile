FROM node:22-slim

WORKDIR /opt/app

# python3/make/g++ are a safety net for better-sqlite3's native build step in case no
# prebuilt binary matches this image's platform.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 1337

CMD ["npm", "run", "start"]
