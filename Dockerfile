# Stage 1: Install dependencies only when needed
FROM node:20-alpine AS DEPENDENCIES

LABEL maintainer="Santanu Biswas <<dev.sbiswas7991@gmail.com>>"

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS BUILDER

WORKDIR /app

COPY . .
COPY --from=DEPENDENCIES /app/node_modules ./node_modules

RUN yarn build

# Stage 3: Run the application
FROM nginx:alpine-slim AS RUNNER

WORKDIR /usr/share/nginx/html

COPY --from=BUILDER /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=BUILDER /app/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]