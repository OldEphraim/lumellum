FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npx tsc --noEmit

EXPOSE 3000

CMD ["node", "--import", "tsx/esm", "src/index.ts"]
