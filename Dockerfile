# syntax=docker/dockerfile:1.21

FROM node:24-alpine
WORKDIR /usr/src/youapp-api
COPY . .
RUN npm install
RUN npm run build
CMD npm run start
