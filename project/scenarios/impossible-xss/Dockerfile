FROM node:18

RUN apt-get update && apt-get install -y iproute2 python3

WORKDIR /app
COPY package.json .
RUN npm i

COPY app.js ./

USER node
CMD node app.js
