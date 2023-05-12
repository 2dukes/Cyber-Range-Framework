FROM node:lts-alpine

WORKDIR /app
COPY ./package*.json ./
RUN npm install -s
COPY . .

COPY .env .
RUN sed -i 's/^/REACT_APP_/' .env

EXPOSE 3000
ENTRYPOINT ["npm", "start"]