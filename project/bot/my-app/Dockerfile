FROM node:lts-alpine

WORKDIR /frontend
COPY ./package*.json ./
RUN npm install -s
COPY . .

EXPOSE 3000
ENTRYPOINT ["npm", "start"]