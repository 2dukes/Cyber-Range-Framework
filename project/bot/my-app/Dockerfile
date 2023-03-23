FROM node:lts-alpine

ARG api

RUN apk update \
    && apk upgrade \
    && apk add --no-cache python3

WORKDIR /frontend
COPY ./package*.json ./
RUN npm install -s
COPY . .
RUN echo "REACT_APP_API=${api}" > .env

EXPOSE 3000
ENTRYPOINT ["npm", "start"]