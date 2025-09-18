# FROM node:20

# RUN apt-get update && apt-get install -y python3 make g++

# WORKDIR /app

# CMD ["npm", "run", "dev"]

# production Dockerfile : 
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files

COPY . .

RUN npm rebuild better-sqlite3

EXPOSE 3000

CMD ["node", "src/server.js"]