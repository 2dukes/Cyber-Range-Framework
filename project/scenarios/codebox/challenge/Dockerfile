FROM node:18

RUN apt-get update && apt-get install -y iproute2 python3

WORKDIR /app
COPY package.json .
RUN npm i

COPY box.html web.js .//

USER node
CMD node web.js