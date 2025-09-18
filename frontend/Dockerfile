# #development dockerfile: 
# FROM node:20 AS build

# WORKDIR /app

# CMD ["npm", "run", "dev"]

# production dockerfile : 

# --- Stage 1: Build the frontend container (only build stage, is discarded when nginx gets running) ---

FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


# --- Stage 2: Export built files to NGINX (runtime container, it copies only the compiled files (nginx/html/*)) ---

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
