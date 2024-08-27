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
COPY --from=builder /app/views ./views

EXPOSE 8080
CMD [ "node", "dist/src/server.js" ]
