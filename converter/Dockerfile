# https://www.emmanuelgautier.com/blog/snippets/typescript-dockerfile
FROM node as builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

ENV NODE_ENV production
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm ci --production

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/src/app.js" ]
