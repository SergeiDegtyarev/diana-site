FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173 3001

CMD ["npm", "run", "dev"]
