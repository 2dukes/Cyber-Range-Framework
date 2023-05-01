FROM node:lts-alpine

WORKDIR /app
COPY ./package*.json ./
RUN npm install -s
COPY . .

# COPY .env /app/.env

EXPOSE 8000
ENTRYPOINT ["npm", "start"]